import { createHmac, randomBytes } from 'crypto';
import type { IStorage } from '../storage';
import type { WebhookEndpoint } from '@shared/schema';

export interface WebhookEvent {
  id: string;
  type: string;
  createdAt: string;
  data: Record<string, any>;
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  attemptCount: number;
}

export class WebhookService {
  constructor(private storage: IStorage) {}

  generateSecret(): string {
    return randomBytes(32).toString('hex');
  }

  signPayload(payload: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  async deliverWebhook(
    webhook: WebhookEndpoint,
    event: WebhookEvent,
    retryCount: number = 0
  ): Promise<WebhookDeliveryResult> {
    const maxRetries = 3;
    const retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s

    try {
      const payload = JSON.stringify(event);
      const signature = this.signPayload(payload, webhook.secret);
      const timestamp = Date.now().toString();

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PayGate-Signature': signature,
          'X-PayGate-Timestamp': timestamp,
          'X-PayGate-Event-Type': event.type,
          'User-Agent': 'PayGate-Webhook/1.0'
        },
        body: payload,
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      if (response.ok) {
        // Success - update last delivery time
        await this.storage.updateWebhookEndpoint(webhook.id, {
          lastDelivery: new Date(),
          failureCount: 0
        });

        return {
          success: true,
          statusCode: response.status,
          attemptCount: retryCount + 1
        };
      } else {
        // Non-2xx status - retry if we haven't exhausted attempts
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelays[retryCount]));
          return this.deliverWebhook(webhook, event, retryCount + 1);
        }

        // Max retries reached - increment failure count
        await this.storage.updateWebhookEndpoint(webhook.id, {
          failureCount: (webhook.failureCount || 0) + 1
        });

        return {
          success: false,
          statusCode: response.status,
          error: `HTTP ${response.status}: ${await response.text()}`,
          attemptCount: retryCount + 1
        };
      }
    } catch (error) {
      // Network error or timeout - retry if we haven't exhausted attempts
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelays[retryCount]));
        return this.deliverWebhook(webhook, event, retryCount + 1);
      }

      // Max retries reached - increment failure count
      await this.storage.updateWebhookEndpoint(webhook.id, {
        failureCount: (webhook.failureCount || 0) + 1
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptCount: retryCount + 1
      };
    }
  }

  async broadcastEvent(orgId: string, eventType: string, data: Record<string, any>): Promise<void> {
    const webhooks = await this.storage.getWebhookEndpoints(orgId);
    
    // Filter active webhooks that are subscribed to this event type
    const subscribedWebhooks = webhooks.filter(w => 
      w.isActive && 
      Array.isArray(w.events) && 
      w.events.includes(eventType)
    );

    if (subscribedWebhooks.length === 0) {
      return;
    }

    const event: WebhookEvent = {
      id: randomBytes(16).toString('hex'),
      type: eventType,
      createdAt: new Date().toISOString(),
      data
    };

    // Deliver webhooks in parallel
    const deliveryPromises = subscribedWebhooks.map(webhook =>
      this.deliverWebhook(webhook, event).catch(error => {
        console.error(`Webhook delivery failed for ${webhook.id}:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          attemptCount: 1
        };
      })
    );

    await Promise.allSettled(deliveryPromises);
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.signPayload(payload, secret);
    return signature === expectedSignature;
  }
}
