import z from "zod";
import { AIProcedures, publicProcedures, router } from "./init";
import { RedditPostSchema } from "../schemas";
import { LLMService } from "../AIService";

const llm = new LLMService()
export const appRouter = router({
	health: publicProcedures.query(() => "hello"),
	post: publicProcedures.query(() => "Post Handler called"),
	// insights: publicProcedures.query(() => {
	// 	return "HOla"
	// })
	analyzePosts: AIProcedures.input(z.object({ posts: z.array(RedditPostSchema), query: z.string().optional() })).mutation(({ input }) => {
		llm.analyzePosts(input.posts, input.query)
	})
})

export type AppRouter = typeof appRouter
