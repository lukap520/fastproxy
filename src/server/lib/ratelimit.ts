interface RateLimitTracker {
    count: number;
    resetTime: number;
}

const loginTracker = new Map<string, RateLimitTracker>();
const registerTracker = new Map<string, RateLimitTracker>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    for (const [ip, tracker] of loginTracker.entries()) {
        if (now > tracker.resetTime) loginTracker.delete(ip);
    }
    for (const [ip, tracker] of registerTracker.entries()) {
        if (now > tracker.resetTime) registerTracker.delete(ip);
    }
}, CLEANUP_INTERVAL);

export function checkRateLimit(
    ip: string,
    type: "login" | "register",
    maxRequests: number,
    windowMs: number
): { success: boolean; msBeforeNext: number } {
    const trackerMap = type === "login" ? loginTracker : registerTracker;
    const now = Date.now();

    const current = trackerMap.get(ip);

    if (!current || now > current.resetTime) {
        trackerMap.set(ip, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { success: true, msBeforeNext: 0 };
    }

    if (current.count >= maxRequests) {
        return { success: false, msBeforeNext: current.resetTime - now };
    }

    current.count++;
    return { success: true, msBeforeNext: 0 };
}
