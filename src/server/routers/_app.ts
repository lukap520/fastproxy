import { createTRPCRouter } from "@/server/trpc";
import { authRouter } from "./auth";
import { billingRouter } from "./billing";
import { proxyRouter } from "./proxy";
import { adminRouter } from "./admin";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    billing: billingRouter,
    proxy: proxyRouter,
    admin: adminRouter,
});

export type AppRouter = typeof appRouter;

