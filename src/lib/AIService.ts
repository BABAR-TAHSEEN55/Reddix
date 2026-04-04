import {
  RedditCommentData,
  RedditPostData,
} from "@/entrypoints/scripts/scrape";
import axios from "axios";
import { SYTEM_PROMPT } from "./prompt";

type StoredCredentials = {
  provider?: "groq";
  endpoint?: string;
  apiKey?: string;
  model?: string;
};

const CREDENTIALS_STORAGE_KEY = "reddix_credentials";
const DEFAULT_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function readCredentialsFromStorage(): Promise<StoredCredentials | null> {
  return new Promise((resolve) => {
    try {
      if (typeof chrome === "undefined" || !chrome.storage?.local) {
        resolve(null);
        return;
      }

      chrome.storage.local.get([CREDENTIALS_STORAGE_KEY], (result) => {
        if (chrome.runtime?.lastError) {
          console.error(
            "[Reddix AIService] storage read error:",
            chrome.runtime.lastError.message,
          );
          resolve(null);
          return;
        }
        resolve(
          (result?.[CREDENTIALS_STORAGE_KEY] as StoredCredentials) ?? null,
        );
      });
    } catch (error) {
      console.error("[Reddix AIService] storage read exception:", error);
      resolve(null);
    }
  });
}

async function resolveGroqConfig() {
  const saved = await readCredentialsFromStorage();

  const endpoint = saved?.endpoint?.trim() || DEFAULT_ENDPOINT;
  const model = saved?.model?.trim() || DEFAULT_MODEL;
  const apiKey = saved?.apiKey?.trim() || "";

  if (!apiKey) {
    throw new Error(
      "Missing Groq API key. Open the extension popup and save your credentials.",
    );
  }

  return { endpoint, model, apiKey };
}

export class LLMService {
  async analyzePosts(posts: RedditPostData[], query?: string) {
    const prompt = query
      ? [
          `You are an assistant analyzing Reddit posts.`,
          `Return the answer in clean Markdown with clear line breaks.`,
          `Rules:`,
          `- Use headings and bullet points.`,
          `- Put each point on its own line (no run-on paragraphs).`,
          `- Keep it concise and structured.`,
          `- If you cite a post, include: title, subreddit, author, and a short reason.`,
          `Task: Search and explain posts related to: "${query}"`,
          `Posts JSON: ${JSON.stringify(posts)}`,
        ].join("\n")
      : [
          `You are an assistant analyzing Reddit posts.`,
          `Return the answer in clean Markdown with clear line breaks.`,
          `Rules:`,
          `- Use headings and bullet points.`,
          `- Put each point on its own line (no run-on paragraphs).`,
          `- Keep it concise and structured.`,
          `- If you cite a post, include: title, subreddit, author, and a short reason.`,
          `Task: Summarize and provide insights for these Reddit posts.`,
          `Posts JSON: ${JSON.stringify(posts)}`,
        ].join("\n");

    console.log("This is the query", query);
    console.log("This is the prompt", prompt);
    return this.callLLM(prompt);
  }

  async analyzeComments(comments: RedditCommentData[], query?: string) {
    const prompt = query
      ? [
          `You are an assistant analyzing Reddit comments.`,
          `Return the answer in clean Markdown with clear line breaks.`,
          `Rules:`,
          `- Use headings and bullet points.`,
          `- Put each point on its own line (no run-on paragraphs).`,
          `- Keep it concise and structured.`,
          `- If you cite a comment, include: subreddit, author, a short quote from the body, and a short reason.`,
          `Task: Search and explain comments related to: "${query}"`,
          `Comments JSON: ${JSON.stringify(comments)}`,
        ].join("\n")
      : [
          `You are an assistant analyzing Reddit comments.`,
          `Return the answer in clean Markdown with clear line breaks.`,
          `Rules:`,
          `- Use headings and bullet points.`,
          `- Put each point on its own line (no run-on paragraphs).`,
          `- Keep it concise and structured.`,
          `- If you cite a comment, include: subreddit, author, a short quote from the body, and a short reason.`,
          `Task: Summarize and provide insights for these Reddit comments.`,
          `Comments JSON: ${JSON.stringify(comments)}`,
        ].join("\n");

    console.log("This is the query", query);
    console.log("This is the prompt", prompt);
    return this.callLLM(prompt);
  }

  private async callLLM(prompt: string) {
    try {
      const { endpoint, model, apiKey } = await resolveGroqConfig();

      const response = await axios.post(
        endpoint,
        {
          model,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      console.log(response.data.choices[0].message.content);
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

  async smartFilterComments(
    comments: RedditCommentData[],
    query: string,
  ): Promise<RedditCommentData[]> {
    console.log("Comments to filter:", comments);

    try {
      const prompt = [
        `You are filtering Reddit comments for relevance.`,
        `You MUST return ONLY a valid JSON array of integer indices.`,
        `No prose. No markdown. Example: [0,2,5]`,
        `Choose indices of comments most relevant to the query: "${query}".`,
        `Comments JSON: ${JSON.stringify(comments)}`,
      ].join("\n");

      const response = await this.callLLM(prompt);
      const indices = JSON.parse(response);

      const validIndices: number[] = Array.isArray(indices)
        ? indices.filter(
            (i: unknown): i is number =>
              typeof i === "number" &&
              Number.isInteger(i) &&
              i >= 0 &&
              i < comments.length,
          )
        : [];

      return validIndices.map((i) => comments[i]);
    } catch (error) {
      console.error("Smart filter comments error:", error);

      const q = query.toLowerCase();
      return comments.filter(
        (comment) =>
          comment.body.toLowerCase().includes(q) ||
          comment.meta.subreddit.toLowerCase().includes(q) ||
          comment.meta.author.toLowerCase().includes(q) ||
          comment.meta.authorFlair.toLowerCase().includes(q),
      );
    }
  }
}

// TODO: Different for summary of everything about all the topic that are beng disccuesed etc etc
