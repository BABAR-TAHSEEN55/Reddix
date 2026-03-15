import { RedditPostData } from "@/entrypoints/scripts/scrape";

export const SYTEM_PROMPT = (query: string, posts: RedditPostData[]) => {
	const prompt = `You are a smart post filter. Given a user query, return ONLY the indices of posts that match the query intent.

Posts data:
${JSON.stringify(posts, null, 2)}

User query: "${query}"

Instructions:
1. Understand the user's intent and find posts that relate to their query
2. Return ONLY a JSON array of numbers representing the indices of matching posts
3. If no posts match, return an empty array []
4. Do not include any explanation or extra text
5. Be intelligent about matching - understand synonyms, context, and related topics

Response format: [0, 2, 5] or []`;
	return prompt
}
