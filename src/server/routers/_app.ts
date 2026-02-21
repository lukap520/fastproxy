import { createTRPCRouter } from "@/server/trpc";
import { authRouter } from "./auth";
import { billingRouter } from "./billing";
import { proxyRouter } from "./proxy";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    billing: billingRouter,
    proxy: proxyRouter,
});

export type AppRouter = typeof appRouter;

