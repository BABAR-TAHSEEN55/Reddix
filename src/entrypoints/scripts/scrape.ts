
type MetaObject = {
	subreddit: string;
	author: string;
	timestamp: string;

	// [key: string]: string; // Any number of string
};
export interface RedditPostData {
	id: string;
	title: string;
	meta: {
		subreddit: string;
		author: string;
		timestamp: string;
	};

	stats: {
		score: number;
		comments: number;
	};
	links: {
		permalink: string;
		contentUrl: string;
	};
	timeText?: string;
}

export function extractRedditPosts(): RedditPostData[] {
	// Select the custom element tag seen in your HTML snippet
	const posts = document.querySelectorAll<HTMLElement>("shreddit-post");

	const results: RedditPostData[] = [];

	posts.forEach((post) => {
		// 1. Get core identification details
		const id = post.getAttribute("id") || "";
		const title = post.getAttribute("post-title")?.trim() || "";

		// 2. Extract metadata (Subreddit, Author, Creation time)
		const meta = {
			subreddit: post.getAttribute("subreddit-prefixed-name") || "",
			author: post.getAttribute("author") || "",
			timestamp: post.getAttribute("created-timestamp") || "",
		};
		const timeText = document
			.querySelector("shreddit-post time")
			?.textContent?.trim();

		// 3. Extract numerical stats (Score and Comments)
		const stats = {
			score: parseInt(post.getAttribute("score") || "0", 10),
			comments: parseInt(post.getAttribute("comment-count") || "0", 10),
		};

		// 4. Extract relevant URLs (The Reddit thread vs the external content)
		const links = {
			permalink: post.getAttribute("permalink") || "",
			contentUrl: post.getAttribute("content-href") || "",
		};

		results.push({
			id,
			title,
			meta,
			stats,
			links,
			timeText,
		});
	});

	return results;
}
export interface RedditCommentData {
	id: string;
	postId: string;
	body: string;
	meta: {
		author: string;
		subreddit: string;
		authorFlair: string;
		timestamp: string;
	};
	stats: {
		score: number;
		awardCount: number;
		depth: number;
	};
	links: {
		permalink: string;
		avatarUrl: string;
	};
	timeText?: string;
}
export interface RedditCommentData {
	id: string;
	postId: string;
	body: string;
	meta: {
		author: string;
		subreddit: string;
		authorFlair: string;
		timestamp: string;
	};
	stats: {
		score: number;
		awardCount: number;
		depth: number;
	};
	links: {
		permalink: string;
		avatarUrl: string;
	};
	timeText?: string;
}

export function extractRedditComments(): RedditCommentData[] {
	const comments = document.querySelectorAll<HTMLElement>("shreddit-comment");
	const results: RedditCommentData[] = [];

	comments.forEach((comment) => {
		// 1. Core identification
		const id = comment.getAttribute("thingid") || "";
		const postId = comment.getAttribute("postid") || "";

		// 2. Comment body — fetched by thingid via getElementById + innerText
		const commentContentDiv = document.getElementById(
			`${id}-post-rtjson-content`,
		);
		const body = commentContentDiv?.innerText?.trim() || "";

		// 3. Metadata (author, subreddit, flair, timestamp)
		const permalink = comment.getAttribute("permalink") || "";
		const subredditMatch = permalink.match(/^\/r\/([^/]+)\//);

		const meta = {
			author: comment.getAttribute("author") || "",
			subreddit: subredditMatch?.[1] || "",
			authorFlair:
				comment
					.querySelector<HTMLElement>("[aria-label^='Flair:']")
					?.textContent?.trim() || "",
			timestamp:
				comment
					.querySelector<HTMLTimeElement>("time")
					?.getAttribute("datetime") || "",
		};

		// 4. Stats (score, awards, nesting depth)
		const stats = {
			score: parseInt(comment.getAttribute("score") || "0", 10),
			awardCount: parseInt(comment.getAttribute("award-count") || "0", 10),
			depth: parseInt(comment.getAttribute("depth") || "0", 10),
		};

		// 5. Links (permalink + author avatar)
		const links = {
			permalink,
			avatarUrl:
				comment
					.querySelector<SVGImageElement>("image[href]")
					?.getAttribute("href") || "",
		};

		// 6. Human-readable time label (e.g. "32m ago")
		const timeText = comment
			.querySelector<HTMLTimeElement>("time")
			?.textContent?.trim();

		results.push({
			id,
			postId,
			body,
			meta,
			stats,
			links,
			timeText,
		});
	});

	return results;
}
const test = extractRedditComments();
console.log(test);
