"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import superjson from "superjson";
import { ToastProvider } from "@/components/ui/Toast";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: (failureCount, error: unknown) => {
                    const trpcError = error as { data?: { code?: string } };
                    if (trpcError?.data?.code === "UNAUTHORIZED") return false;
                    return failureCount < 2;
                },
            },
        },
    });
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => makeQueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: "/api/trpc",
                    transformer: superjson,
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>{children}</ToastProvider>
            </QueryClientProvider>
        </trpc.Provider>
    );
}
