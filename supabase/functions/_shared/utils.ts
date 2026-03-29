// supabase/functions/_shared/utils.ts

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Throttling
export async function fetchWithThrottle<T>(
    items: T[],
    fetchFn: (item: T) => Promise<any>,
    delayMs: number = 2000
): Promise<{ success: any[]; failed: T[] }> {
    const success = [];
    const failed = [];

    for (const item of items) {
        try {
            const result = await fetchFn(item);
            success.push(result);
        } catch (err) {
            failed.push(item);
            console.error(`Failed for item:`, item, err);
        }
        await sleep(delayMs);
    }

    return { success, failed };
}

// Retry with Exponential Backoff
interface RetryOptions {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: any) => boolean;
}

export async function fetchWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        baseDelayMs = 2000,
        maxDelayMs = 60_000,
        shouldRetry = (err: any) => {
            const msg = String(err?.message || err).toLowerCase();
            return msg.includes('429') ||
                msg.includes('2005') ||
                msg.includes('7002') ||
                msg.includes('timeout') ||
                msg.includes('500') ||
                msg.includes('503');
        },
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err;
            if (attempt === maxAttempts || !shouldRetry(err)) throw err;

            const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
            console.warn(`Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`, err.message);
            await sleep(delay);
        }
    }

    throw lastError;
}

// Cache Logic
export async function getOrFetchWithCache<T>(
    supabase: any,
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttlMinutes = 60
): Promise<T> {
    const { data: cached } = await supabase
        .from('solar_cache')
        .select('data, updated_at')
        .eq('cache_key', cacheKey)
        .single();

    if (cached) {
        const ageMin = (Date.now() - new Date(cached.updated_at).getTime()) / 60_000;
        if (ageMin < ttlMinutes) {
            console.log(`[CACHE HIT] Key: ${cacheKey}`);
            return cached.data as T;
        }
        console.log(`[CACHE EXPIRED] Key: ${cacheKey}`);
    }

    const freshData = await fetchFn();

    await supabase.from('solar_cache').upsert({
        cache_key: cacheKey,
        data: freshData,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'cache_key' });

    return freshData;
}
