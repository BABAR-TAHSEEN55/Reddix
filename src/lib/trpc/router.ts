import { publicProcedures, router } from "./init";

export const appRouter = router({
	health: publicProcedures.query(() => "hello"),
	post: publicProcedures.query(() => "Post Handler called"),
	insights: publicProcedures.query(() => {
		return "HOla"
	})
})

export type AppRouter = typeof appRouter
