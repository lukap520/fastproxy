import { createTRPCRouter } from "@/server/trpc";
import { authRouter } from "./auth";
import { billingRouter } from "./billing";
import { adminRouter } from "./admin";
import { flashproxyRouter } from "./flashproxy";

export const appRouter = createTRPCRouter({
    auth: authRouter,
    billing: billingRouter,

    admin: adminRouter,
    flashproxy: flashproxyRouter,
});

export type AppRouter = typeof appRouter;

