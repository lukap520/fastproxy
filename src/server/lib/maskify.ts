const BASE = "https://maskify.su/api/reseller/v2";
const API_KEY = process.env.MASKIFY_API_KEY ?? "yjQiwDitrqS1WAL9A2oWJ3EAEMNylL0N3DQztFgU5kD3NLyUFzzFhnhHAeTlS02Z";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            "X-Reseller-API-Key": API_KEY,
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    const text = await res.text();

    let data: Record<string, unknown>;
    try {
        data = JSON.parse(text);
    } catch {
        if (res.status === 401 || res.status === 403) {
            throw new Error("Access denied. Please contact support with this code. (MSKF-401)");
        }
        throw new Error(`Unexpected response from upstream server. Please contact support with this code. (MSKF-${res.status || "UNKNOWN"})`);
    }

    if (!res.ok || !data.success) {
        throw new Error((data.message as string | undefined) ?? `Request failed. Please contact support with this code. (MSKF-${res.status || "UNKNOWN"})`);
    }

    return data as T;
}

export interface MaskifyAccount {
    success: boolean;
    balance: number;
    gb_available: number;
    total_allocated: number;
    cost_per_gb: number;
}

export interface MaskifySubuser {
    success: boolean;
    username: string;
    email: string;
    allocated_gb: number;
    gb_used: number;
    created_at: number;
}

export interface MaskifyCreateSubuserResponse {
    success: boolean;
    username: string;
    password: string;
    email: string;
    allocated_gb: number;
}

export interface MaskifyPatchSubuserResponse {
    success: boolean;
    username: string;
    allocated_gb: number;
    gb_used: number;
}

export const maskify = {
    getAccount: () => req<MaskifyAccount>("GET", "/account"),

    createSubuser: (email: string, gbAmount: number) =>
        req<MaskifyCreateSubuserResponse>("POST", "/subusers", {
            email,
            gb_amount: gbAmount,
        }),

    getSubuser: (username: string) =>
        req<MaskifySubuser>("GET", `/subusers/${username}`),

    addGb: (username: string, addGb: number) =>
        req<MaskifyPatchSubuserResponse>("PATCH", `/subusers/${username}`, {
            add_gb: addGb,
        }),

    deleteSubuser: (username: string) =>
        req<{ success: boolean; message: string }>("DELETE", `/subusers/${username}`),
};
