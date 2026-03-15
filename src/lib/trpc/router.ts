import z from "zod";
import { AIProcedures, publicProcedures, router } from "./init";
import { RedditCommentSchema, RedditPostSchema } from "../schemas";
import { LLMService } from "../AIService";

const llm = new LLMService();
export const appRouter = router({
	health: publicProcedures.query(() => "hello"),
	post: publicProcedures.query(() => "Post Handler called"),

	// Returns a filtered subset of posts (used by the Posts UI)
	analyzePosts: AIProcedures
		.input(z.object({ posts: z.array(RedditPostSchema), query: z.string() }))
		.mutation(({ input }) => {
			return llm.smartFilterPosts(input.posts, input.query);
		}),

	// Returns a natural-language response (used by LLMInterface chat UI)
	chatAboutPosts: AIProcedures
		.input(z.object({ posts: z.array(RedditPostSchema), query: z.string() }))
		.mutation(({ input }) => {
			return llm.analyzePosts(input.posts, input.query);
		}),

	// Returns a filtered subset of comments (used by the Comments UI)
	analyzeComments: AIProcedures
		.input(z.object({ comments: z.array(RedditCommentSchema), query: z.string() }))
		.mutation(({ input }) => {
			return llm.smartFilterComments(input.comments, input.query);
		}),

	// Returns a natural-language response about comments (used by a comment chat UI)
	chatAboutComments: AIProcedures
		.input(z.object({ comments: z.array(RedditCommentSchema), query: z.string() }))
		.mutation(({ input }) => {
			return llm.analyzeComments(input.comments, input.query);
		}),
});

export type AppRouter = typeof appRouter;
