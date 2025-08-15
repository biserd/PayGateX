import { IStorage } from "../storage";

export interface RevenueAnalytics {
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    requests: number;
  }>;
  totalRevenue: number;
  averageDailyRevenue: number;
  growthRate: number;
}

export interface RequestAnalytics {
  dailyRequests: Array<{
    date: string;
    totalRequests: number;
    paidRequests: number;
    successRate: number;
  }>;
  totalRequests: number;
  averageDailyRequests: number;
  paymentRate: number;
}

export interface EndpointAnalytics {
  endpointId: string;
  endpointPath: string;
  totalRequests: number;
  paidRequests: number;
  revenue: number;
  averageResponseTime: number;
  successRate: number;
  topUsers: Array<{
    address: string;
    requests: number;
    revenue: number;
  }>;
}

export class AnalyticsService {
  constructor(private storage: IStorage) {}

  /**
   * Get revenue analytics for a user over a specified period
   */
  async getRevenueAnalytics(userId: string, days: number = 30): Promise<RevenueAnalytics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Get user's transactions
      const transactions = await this.storage.getTransactionsByUserId(userId);
      const completedTransactions = transactions.filter(tx => 
        tx.status === "completed" && 
        tx.createdAt && 
        tx.createdAt >= startDate && 
        tx.createdAt <= endDate
      );

      // Generate daily revenue data
      const dailyRevenue = this.generateDailyData(
        completedTransactions,
        startDate,
        endDate,
        (txs) => ({
          revenue: txs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
          requests: txs.length
        })
      );

      const totalRevenue = dailyRevenue.reduce((sum, day) => sum + day.revenue, 0);
      const averageDailyRevenue = totalRevenue / days;

      // Calculate growth rate (comparing first half vs second half of period)
      const midPoint = Math.floor(days / 2);
      const firstHalfRevenue = dailyRevenue.slice(0, midPoint).reduce((sum, day) => sum + day.revenue, 0);
      const secondHalfRevenue = dailyRevenue.slice(midPoint).reduce((sum, day) => sum + day.revenue, 0);
      const growthRate = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

      return {
        dailyRevenue,
        totalRevenue,
        averageDailyRevenue,
        growthRate
      };
    } catch (error) {
      console.error("Revenue analytics error:", error);
      return {
        dailyRevenue: [],
        totalRevenue: 0,
        averageDailyRevenue: 0,
        growthRate: 0
      };
    }
  }

  /**
   * Get request analytics for a user over a specified period
   */
  async getRequestAnalytics(userId: string, days: number = 30): Promise<RequestAnalytics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Get user's transactions
      const transactions = await this.storage.getTransactionsByUserId(userId);
      const filteredTransactions = transactions.filter(tx => 
        tx.createdAt && 
        tx.createdAt >= startDate && 
        tx.createdAt <= endDate
      );

      // Generate daily request data
      const dailyRequests = this.generateDailyData(
        filteredTransactions,
        startDate,
        endDate,
        (txs) => {
          const totalRequests = txs.length;
          const paidRequests = txs.filter(tx => tx.status === "completed").length;
          const successRate = totalRequests > 0 ? (paidRequests / totalRequests) * 100 : 0;
          
          return {
            totalRequests,
            paidRequests,
            successRate
          };
        }
      );

      const totalRequests = dailyRequests.reduce((sum, day) => sum + day.totalRequests, 0);
      const totalPaidRequests = dailyRequests.reduce((sum, day) => sum + day.paidRequests, 0);
      const averageDailyRequests = totalRequests / days;
      const paymentRate = totalRequests > 0 ? (totalPaidRequests / totalRequests) * 100 : 0;

      return {
        dailyRequests,
        totalRequests,
        averageDailyRequests,
        paymentRate
      };
    } catch (error) {
      console.error("Request analytics error:", error);
      return {
        dailyRequests: [],
        totalRequests: 0,
        averageDailyRequests: 0,
        paymentRate: 0
      };
    }
  }

  /**
   * Get detailed analytics for a specific endpoint
   */
  async getEndpointAnalytics(endpointId: string, days: number = 30): Promise<EndpointAnalytics> {
    try {
      const endpoint = await this.storage.getApiEndpoint(endpointId);
      if (!endpoint) {
        throw new Error("Endpoint not found");
      }

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Get endpoint transactions
      const transactions = await this.storage.getTransactionsByEndpointId(endpointId);
      const filteredTransactions = transactions.filter(tx => 
        tx.createdAt && 
        tx.createdAt >= startDate && 
        tx.createdAt <= endDate
      );

      const totalRequests = filteredTransactions.length;
      const paidRequests = filteredTransactions.filter(tx => tx.status === "completed").length;
      const revenue = filteredTransactions
        .filter(tx => tx.status === "completed")
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      const successRate = totalRequests > 0 ? (paidRequests / totalRequests) * 100 : 0;

      // Calculate top users by requests
      const userStats = new Map<string, { requests: number; revenue: number }>();
      filteredTransactions.forEach(tx => {
        const existing = userStats.get(tx.payerAddress) || { requests: 0, revenue: 0 };
        existing.requests += 1;
        if (tx.status === "completed") {
          existing.revenue += parseFloat(tx.amount);
        }
        userStats.set(tx.payerAddress, existing);
      });

      const topUsers = Array.from(userStats.entries())
        .map(([address, stats]) => ({ address, ...stats }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10);

      // Mock average response time (in production, this would come from monitoring)
      const averageResponseTime = Math.floor(Math.random() * 1000) + 100;

      return {
        endpointId,
        endpointPath: endpoint.path,
        totalRequests,
        paidRequests,
        revenue,
        averageResponseTime,
        successRate,
        topUsers
      };
    } catch (error) {
      console.error("Endpoint analytics error:", error);
      return {
        endpointId,
        endpointPath: "unknown",
        totalRequests: 0,
        paidRequests: 0,
        revenue: 0,
        averageResponseTime: 0,
        successRate: 0,
        topUsers: []
      };
    }
  }

  /**
   * Get geographic distribution of requests
   */
  async getGeographicAnalytics(userId: string, days: number = 30): Promise<Array<{
    country: string;
    countryCode: string;
    requests: number;
    revenue: number;
  }>> {
    try {
      // In production, this would use GeoIP data from request logs
      // For now, return mock geographic data
      const mockCountries = [
        { country: "United States", countryCode: "US", requests: 45, revenue: 125.30 },
        { country: "Canada", countryCode: "CA", requests: 23, revenue: 67.50 },
        { country: "United Kingdom", countryCode: "GB", requests: 18, revenue: 45.20 },
        { country: "Germany", countryCode: "DE", requests: 15, revenue: 38.75 },
        { country: "France", countryCode: "FR", requests: 12, revenue: 29.40 }
      ];

      return mockCountries;
    } catch (error) {
      console.error("Geographic analytics error:", error);
      return [];
    }
  }

  /**
   * Generate time-series analytics data
   */
  async getTimeSeriesAnalytics(
    userId: string, 
    metric: "revenue" | "requests" | "unique_users",
    granularity: "hour" | "day" | "week" | "month",
    days: number = 30
  ): Promise<Array<{ timestamp: string; value: number }>> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // Get user's transactions
      const transactions = await this.storage.getTransactionsByUserId(userId);
      const filteredTransactions = transactions.filter(tx => 
        tx.createdAt && 
        tx.createdAt >= startDate && 
        tx.createdAt <= endDate
      );

      // Group by time period based on granularity
      const timeGroups = new Map<string, any[]>();
      
      filteredTransactions.forEach(tx => {
        if (!tx.createdAt) return;
        
        let timeKey: string;
        const date = new Date(tx.createdAt);
        
        switch (granularity) {
          case "hour":
            timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
            break;
          case "day":
            timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            timeKey = `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
            break;
          case "month":
            timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            timeKey = date.toISOString().split('T')[0];
        }
        
        if (!timeGroups.has(timeKey)) {
          timeGroups.set(timeKey, []);
        }
        timeGroups.get(timeKey)!.push(tx);
      });

      // Calculate metric values for each time period
      const result: Array<{ timestamp: string; value: number }> = [];
      
      for (const [timestamp, txs] of timeGroups.entries()) {
        let value: number;
        
        switch (metric) {
          case "revenue":
            value = txs
              .filter(tx => tx.status === "completed")
              .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
            break;
          case "requests":
            value = txs.length;
            break;
          case "unique_users":
            value = new Set(txs.map(tx => tx.payerAddress)).size;
            break;
          default:
            value = 0;
        }
        
        result.push({ timestamp, value });
      }

      // Sort by timestamp
      result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      
      return result;
    } catch (error) {
      console.error("Time series analytics error:", error);
      return [];
    }
  }

  /**
   * Helper method to generate daily data arrays
   */
  private generateDailyData<T>(
    transactions: any[],
    startDate: Date,
    endDate: Date,
    aggregator: (txs: any[]) => T
  ): Array<{ date: string } & T> {
    const result: Array<{ date: string } & T> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTransactions = transactions.filter(tx => 
        tx.createdAt && 
        tx.createdAt >= dayStart && 
        tx.createdAt <= dayEnd
      );

      const aggregatedData = aggregator(dayTransactions);
      result.push({ date: dateStr, ...aggregatedData });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }
}
