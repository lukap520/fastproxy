const BASE = "https://maskify.su/api/reseller/v2";
const API_KEY = process.env.MASKIFY_API_KEY ?? "73BV9WhHSG7mX32JLbm7K3ipxD9R7kubbF5Ixb3xcT2bq17zcjbPSZxR1X8tzdpO";

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
    console.error(`[MSKF] ${method} ${path} → HTTP ${res.status}`);

    let data: Record<string, unknown>;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`MSKF [${res.status}] non-JSON response: ${text.slice(0, 400)}`);
    }

    if (!res.ok) {
        const msg =
            (data.message as string | undefined) ??
            ((data.error as Record<string, unknown> | undefined)?.message as string | undefined) ??
            text.slice(0, 200);
        throw new Error(`MSKF [${res.status}]: ${msg}`);
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
            gb: gbAmount,
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
