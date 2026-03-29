// supabase/functions/_shared/circuitBreaker.ts

type CBState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
    private state: CBState = 'closed';
    private failures = 0;
    private lastFailureTime = 0;

    constructor(
        private readonly threshold = 5,
        private readonly resetTimeoutMs = 300_000 // 5 minutes
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
                this.state = 'half-open';
                console.log('[CIRCUIT BREAKER] Entering HALF-OPEN state');
            } else {
                throw new Error('Circuit breaker OPEN — provider API may be down');
            }
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (err) {
            this.onFailure();
            throw err;
        }
    }

    private onSuccess() {
        if (this.state === 'half-open') {
            console.log('[CIRCUIT BREAKER] Resetting to CLOSED state');
        }
        this.failures = 0;
        this.state = 'closed';
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.threshold) {
            this.state = 'open';
            console.error(`[CIRCUIT BREAKER] OPENED after ${this.failures} failures`);
        }
    }
}

// Global instance (shared per worker lifecycle)
export const apiCircuitBreaker = new CircuitBreaker();
