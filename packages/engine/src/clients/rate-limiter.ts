/**
 * Provider Token Bucket Rate Limiter
 * Enforces per-provider concurrency and minimum time intervals across all concurrent requests.
 * Prevents HTTP 429 Too Many Requests and quota overrun penalties.
 */
export class TokenBucket {
  private queue: Array<() => void> = [];
  private lastCall = 0;
  private activeWorkers = 0;

  constructor(
    public readonly name: string,
    public readonly minIntervalMs: number,
    public readonly maxConcurrency: number = 1
  ) {}

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.queue.length === 0 || this.activeWorkers >= this.maxConcurrency) return;

    const now = Date.now();
    const timeSinceLast = now - this.lastCall;

    if (timeSinceLast < this.minIntervalMs) {
      setTimeout(() => this.processQueue(), this.minIntervalMs - timeSinceLast);
      return;
    }

    this.activeWorkers++;
    this.lastCall = Date.now();
    const nextResolve = this.queue.shift();
    if (nextResolve) nextResolve();
  }

  release(): void {
    this.activeWorkers = Math.max(0, this.activeWorkers - 1);
    this.processQueue();
  }

  /**
   * Helper to execute a fetch block with automatic acquire & release
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

/**
 * Canonical Rate-Limiter Instances per Provider Plan:
 * 
 * 1. AstroWay Indie PRO: 50,000 credits/mo. Strict max 0.4-0.5 req/s (2,500ms delay, 1 worker).
 * 2. FreeAstroAPI Pro ($8/mo Entry/Pro): 50,000 req/mo. Max 4.0 req/s (250ms delay, 4 workers).
 * 3. VedAstro Unlimited ($1/mo): Max 1.5 req/s (600ms delay, 2 workers).
 * 4. Astrology-API.io (Free tier): Max 1.0 req/s (1,000ms delay, 1 worker).
 * 5. NASA JPL Horizons (Public): Max 2.0 req/s (500ms delay, 2 workers).
 * 6. HebCal (Public): Max 2.0 req/s (500ms delay, 2 workers).
 * 7. Kundali MCP (Remote Streamable): Max 2.0 req/s (500ms delay, 2 workers).
 */
export const providerBuckets = {
  astroway: new TokenBucket("AstroWay (Indie PRO)", 2500, 1),
  freeastro: new TokenBucket("FreeAstroAPI ($8/mo Pro)", 250, 4),
  vedastro: new TokenBucket("VedAstro ($1/mo Unlimited)", 600, 2),
  astrologyapi: new TokenBucket("Astrology-API.io (Free)", 1000, 1),
  nasa: new TokenBucket("NASA JPL Horizons", 500, 2),
  hebcal: new TokenBucket("HebCal", 500, 2),
  kundali: new TokenBucket("Kundali MCP", 500, 2),
};
