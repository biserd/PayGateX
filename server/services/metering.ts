import { IStorage } from "../storage";
import { v4 as uuidv4 } from 'uuid';
import { InsertUsageRecord, InsertFreeTierUsage } from "@shared/schema";

export interface MeteringService {
  recordUsage(record: Omit<InsertUsageRecord, 'id' | 'createdAt'>): Promise<string>;
  checkFreeTier(orgId: string, endpointId: string, payerAddress: string): Promise<boolean>;
  incrementFreeTierUsage(orgId: string, endpointId: string, payerAddress: string): Promise<void>;
}

export class DatabaseMeteringService implements MeteringService {
  constructor(private storage: IStorage) {}

  async recordUsage(record: Omit<InsertUsageRecord, 'id' | 'createdAt'>): Promise<string> {
    // Ensure idempotency - check if requestId already exists
    const existingRecord = await this.storage.getUsageRecordByRequestId(record.requestId);
    if (existingRecord) {
      return existingRecord.id;
    }

    // Create new usage record
    const usageRecord = await this.storage.createUsageRecord({
      ...record,
      createdAt: new Date()
    });

    return usageRecord.id;
  }

  async checkFreeTier(orgId: string, endpointId: string, payerAddress: string): Promise<boolean> {
    const org = await this.storage.getOrganization(orgId);
    if (!org) {
      return false;
    }

    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(now.getDate() - org.freeTierPeriodDays);

    // Get current usage for this payer in the current period
    const currentUsage = await this.storage.getFreeTierUsage(
      orgId,
      endpointId,
      payerAddress,
      periodStart,
      now
    );

    // Check if under limit
    const totalUsage = currentUsage?.requestCount || 0;
    return totalUsage < org.freeTierLimit;
  }

  async incrementFreeTierUsage(orgId: string, endpointId: string, payerAddress: string): Promise<void> {
    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(now.getDate() - 30); // Default 30-day period
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 30);

    // Try to find existing usage record for this period
    let usage = await this.storage.getFreeTierUsage(
      orgId,
      endpointId,
      payerAddress,
      periodStart,
      periodEnd
    );

    if (usage) {
      // Update existing record
      await this.storage.updateFreeTierUsage(usage.id, {
        requestCount: usage.requestCount + 1,
        updatedAt: now
      });
    } else {
      // Create new usage record
      await this.storage.createFreeTierUsage({
        orgId,
        endpointId,
        payerAddress,
        periodStart,
        periodEnd,
        requestCount: 1,
        createdAt: now,
        updatedAt: now
      });
    }
  }
}

export interface UsageMetrics {
  totalRequests: number;
  paidRequests: number;
  freeRequests: number;
  totalRevenue: number;
  averageLatency: number;
  successRate: number;
  conversionRate: number; // 402 -> paid conversion
}

export class UsageAnalytics {
  constructor(private storage: IStorage) {}

  async getUsageMetrics(
    orgId: string,
    endpointId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<UsageMetrics> {
    const records = await this.storage.getUsageRecords({
      orgId,
      endpointId,
      startDate,
      endDate
    });

    const totalRequests = records.length;
    const paidRequests = records.filter(r => r.status === 'paid').length;
    const freeRequests = records.filter(r => r.isFreeRequest).length;
    const totalRevenue = records
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + parseFloat(r.price), 0);
    
    const successfulRequests = records.filter(r => 
      r.responseStatus && r.responseStatus >= 200 && r.responseStatus < 300
    );
    
    const averageLatency = successfulRequests.length > 0
      ? successfulRequests.reduce((sum, r) => sum + (r.latencyMs || 0), 0) / successfulRequests.length
      : 0;

    const successRate = totalRequests > 0 
      ? (successfulRequests.length / totalRequests) * 100 
      : 0;

    // Conversion rate: how many unpaid requests became paid
    const unpaidRequests = records.filter(r => r.status === 'unpaid').length;
    const conversionRate = (unpaidRequests + paidRequests) > 0 
      ? (paidRequests / (unpaidRequests + paidRequests)) * 100 
      : 0;

    return {
      totalRequests,
      paidRequests,
      freeRequests,
      totalRevenue,
      averageLatency: Math.round(averageLatency),
      successRate: Math.round(successRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }

  async getTimeSeriesData(
    orgId: string,
    metric: 'requests' | 'revenue' | 'latency',
    granularity: 'hour' | 'day' | 'week' = 'day',
    days: number = 30
  ): Promise<Array<{ timestamp: string; value: number }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const records = await this.storage.getUsageRecords({
      orgId,
      startDate,
      endDate
    });

    // Group records by time period
    const groups = new Map<string, any[]>();
    
    records.forEach(record => {
      if (!record.createdAt) return;
      
      const date = new Date(record.createdAt);
      let key: string;
      
      switch (granularity) {
        case 'hour':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    });

    // Calculate metric values
    const result: Array<{ timestamp: string; value: number }> = [];
    
    for (const [timestamp, records] of groups.entries()) {
      let value: number;
      
      switch (metric) {
        case 'requests':
          value = records.length;
          break;
        case 'revenue':
          value = records
            .filter(r => r.status === 'paid')
            .reduce((sum, r) => sum + parseFloat(r.price), 0);
          break;
        case 'latency':
          const latencies = records
            .filter(r => r.latencyMs)
            .map(r => r.latencyMs);
          value = latencies.length > 0 
            ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length 
            : 0;
          break;
        default:
          value = 0;
      }
      
      result.push({ timestamp, value });
    }

    // Sort by timestamp and fill gaps
    result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return result;
  }
}

// Helper function to generate idempotent request IDs
export function generateRequestId(
  endpointId: string,
  payerAddress: string,
  timestamp: number,
  nonce?: string
): string {
  const data = `${endpointId}-${payerAddress}-${timestamp}-${nonce || ''}`;
  // In production, use a proper hash function
  return uuidv4();
}