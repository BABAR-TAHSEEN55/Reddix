import { RedditCommentData, RedditPostData } from "@/entrypoints/scripts/scrape";
import axios from "axios";
import { SYTEM_PROMPT } from "./prompt";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API = process.env.GROQ_API;

export class LLMService {
	async analyzePosts(posts: RedditPostData[], query?: string) {
		const prompt = query
			? `Search and explain posts related to: "${query}"\n\nPosts: ${JSON.stringify(posts)}`
			: `Summarize and provide insights for these Reddit posts:\n\n${JSON.stringify(posts)}`;

		return this.callLLM(prompt);
	}

	private async callLLM(prompt: string) {
		try {
			if (!GROQ_API) {
				throw new Error("Missing GROQ_API in environment variables.");
			}

			const response = await axios.post(
				"https://api.groq.com/openai/v1/chat/completions",
				{
					model: "llama-3.3-70b-versatile",
					messages: [{ role: "user", content: prompt }],
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${GROQ_API}`,
					},
				},
			);

			return response.data.choices[0].message.content;
		} catch (err) {
			console.error("Groq API error:", err);
			throw err;
		}
	}

	async smartFilterPosts(
		posts: RedditPostData[],
		query: string,
	): Promise<RedditPostData[]> {
		console.log("Posts to filter:", posts);

		try {
			const prompt = SYTEM_PROMPT(query, posts);
			const response = await this.callLLM(prompt);
			const indices = JSON.parse(response);

			const validIndices: number[] = Array.isArray(indices)
				? indices.filter(
					(i: unknown): i is number =>
						typeof i === "number" &&
						Number.isInteger(i) &&
						i >= 0 &&
						i < posts.length,
				)
				: [];

			return validIndices.map((i) => posts[i]);
		} catch (error) {
			console.error("Smart filter error:", error);

			const q = query.toLowerCase();
			return posts.filter(
				(post) =>
					post.title.toLowerCase().includes(q) ||
					post.meta.subreddit.toLowerCase().includes(q) ||
					post.meta.author.toLowerCase().includes(q),
			);
		}
	}
}

//TODO: Different for summary of everything about all the topic that are beng disccuesed etc etc
