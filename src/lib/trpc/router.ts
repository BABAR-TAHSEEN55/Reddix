import z from "zod";
import { AIProcedures, publicProcedures, router } from "./init";
import { RedditPostSchema } from "../schemas";
import { LLMService } from "../AIService";

const llm = new LLMService()
export const appRouter = router({
	health: publicProcedures.query(() => "hello"),
	post: publicProcedures.query(() => "Post Handler called"),
	analyzePosts: AIProcedures.input(z.object({ posts: z.array(RedditPostSchema), query: z.string() })).mutation(({ input }) => {
		return llm.smartFilterPosts(input.posts, input.query)
	})
})

export type AppRouter = typeof appRouter
