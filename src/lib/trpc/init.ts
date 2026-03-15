
import { initTRPC } from '@trpc/server';
import superjson from "superjson"


const t = initTRPC.create({
	isServer: false,
	allowOutsideOfServer: true,
	transformer: superjson
})

export const router = t.router
export const publicProcedures = t.procedure
export const AIProcedures = t.procedure
