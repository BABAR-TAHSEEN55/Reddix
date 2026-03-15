import z from "zod"
export const RedditPostSchema = z.object({
	id: z.string(),
	title: z.string(),
	meta: z.object({
		subreddit: z.string(),
		author: z.string(),
		timestamp: z.string(),
	}),
	stats: z.object({
		score: z.number(),
		comments: z.number(),
	}),
	links: z.object({
		permalink: z.string(),
		contentUrl: z.string(),
	}),
	timeText: z.string().optional(),
});

// Matching your exact RedditCommentData interface
export const RedditCommentSchema = z.object({
	id: z.string(),
	postId: z.string(),
	body: z.string(),
	meta: z.object({
		author: z.string(),
		subreddit: z.string(),
		authorFlair: z.string(),
		timestamp: z.string(),
	}),
	stats: z.object({
		score: z.number(),
		awardCount: z.number(),
		depth: z.number(),
	}),
	links: z.object({
		permalink: z.string(),
		avatarUrl: z.string(),
	}),
	timeText: z.string().optional(),
});
