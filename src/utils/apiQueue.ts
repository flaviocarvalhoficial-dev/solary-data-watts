type RequestTask<T> = () => Promise<T>;

interface QueueItem<T> {
    task: RequestTask<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    retries: number;
}

export class RequestQueue {
    private queue: QueueItem<any>[] = [];
    private processing = false;
    private maxRetries: number;
    private delayBetweenRequests: number;

    constructor(delay = 500, maxRetries = 2) {
        this.delayBetweenRequests = delay;
        this.maxRetries = maxRetries;
    }

    async add<T>(task: RequestTask<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject, retries: 0 });
            this.process();
        });
    }

    private async process() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift();
            if (!item) continue;

            try {
                const result = await item.task();
                item.resolve(result);
            } catch (error: any) {
                if (item.retries < this.maxRetries && this.shouldRetry(error)) {
                    item.retries++;
                    console.warn(`[QUEUE] Retrying task (${item.retries}/${this.maxRetries})...`);
                    this.queue.push(item); // Re-add to end of queue
                } else {
                    item.reject(error);
                }
            }

            if (this.queue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.delayBetweenRequests));
            }
        }

        this.processing = false;
    }

    private shouldRetry(error: any): boolean {
        // Specific APsystems codes that might resolve with a retry/delay
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('7002') || msg.includes('timeout') || msg.includes('network')) {
            return true;
        }
        return false;
    }
}

// Singleton for APsystems to ensure global rate limiting for this provider
export const apsSystemsQueue = new RequestQueue(600, 2);
