// Content should use custom css and not shadcn
import "../initial.css";

import { createTRPCProxyClient } from "@trpc/client";
import { chromeLink } from "trpc-chrome/link";

import type { AppRouter } from "@/lib/trpc/router";

import Posts from "./posts/Posts";
import { CreateContentUI } from "./common";
import { extractRedditPosts } from "../scripts/scrape";
import SuperJSON from "superjson";

type InsightType = "posts" | "comments";

type PayloadResponse = {
	type: "POST_INSIGHTS_CLICKED" | "COMMENT_INSIGHTS_CLICKED";
};

let uiInstance: any = null;

export default defineContentScript({
	matches: ["*://*/*"],
	cssInjectionMode: "ui",

	async main(ctx) {
		// Open long-lived port to background
		const port = chrome.runtime.connect({ name: "trpc" });

		// tRPC client
		const client = createTRPCProxyClient<AppRouter>({
			links: [chromeLink({ port })], transformer: SuperJSON
		});

		const listener = async (request: PayloadResponse) => {
			switch (request.type) {
				case "POST_INSIGHTS_CLICKED": {
					try {
						const health = await client.health.query();
						console.log("[tRPC] health:", health);
					} catch (err) {
						console.error("[tRPC] health failed:", err);
					}

					// Toggle UI
					if (uiInstance) {
						uiInstance.remove();
						uiInstance = null;
						return;
					}

					uiInstance = await createUI(ctx, "posts");
					uiInstance.mount();
					break;
				}

				case "COMMENT_INSIGHTS_CLICKED": {
					if (uiInstance) {
						uiInstance.remove();
						uiInstance = null;
						return;
					}

					uiInstance = await createUI(ctx, "comments");
					uiInstance.mount();
					break;
				}

				default:
					console.warn("Unknown message received:", request);
			}
		};

		chrome.runtime.onMessage.addListener(listener);
	},
});

function createUI(ctx: any, type: InsightType) {
	return createShadowRootUi(ctx, {
		name: "post-insight-overlay",
		position: "inline",

		onMount: (uiContainer, _shadow, shadowContainer) => {
			CreateContentUI(uiContainer, shadowContainer, (root) => {
				const onRemove = () => {
					root.unmount();
					shadowContainer.remove();
					uiInstance = null;
				};

				const posts = extractRedditPosts();

				if (type === "posts") {
					return <Posts onRemove={onRemove} posts={posts} />;
				}

				if (type === "comments") {
					console.log("Comments insight clicked");
					// future component
					// return <Comments onRemove={onRemove} comments={comments} />
				}

				return null;
			});
		},

		onRemove: () => {
			console.log("UI removed");
			uiInstance = null;
		},
	});
}
