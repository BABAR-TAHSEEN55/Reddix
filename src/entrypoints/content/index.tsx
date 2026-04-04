// Content should use custom css and not shadcn
import "../initial.css";

import Posts from "./posts/Posts";
import { CreateContentUI } from "./common";
import { extractRedditComments, extractRedditPosts } from "../scripts/scrape";
import { preloadComments, preloadPosts } from "../scripts/preload";

import { trpc } from "@/lib/trpc/trpcClient";
import Comments from "./comments/Comments";

type InsightType = "posts" | "comments";

type PayloadResponse = {
	type: "POST_INSIGHTS_CLICKED" | "COMMENT_INSIGHTS_CLICKED";
};

let uiInstance: any = null;

function showPreloadMask() {
	const existing = document.getElementById("reddix-preload-mask");
	if (existing) return existing;

	const mask = document.createElement("div");
	mask.id = "reddix-preload-mask";
	mask.innerHTML = `
		<div class="reddix-preload-card">
			<div class="reddix-preload-spinner"></div>
			<div class="reddix-preload-title">Loading more Reddit content...</div>
			<div class="reddix-preload-subtitle">Reddix is preparing a larger dataset for analysis</div>
		</div>
	`;

	Object.assign(mask.style, {
		position: "fixed",
		inset: "0",
		zIndex: "2147483647",
		background: "rgba(12, 12, 12, 0.28)",
		backdropFilter: "blur(6px)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		pointerEvents: "all",
	});

	const style = document.createElement("style");
	style.id = "reddix-preload-mask-style";
	style.textContent = `
		#reddix-preload-mask .reddix-preload-card {
			min-width: 320px;
			max-width: 420px;
			padding: 20px 22px;
			border-radius: 16px;
			background: rgba(28, 28, 28, 0.92);
			border: 1px solid rgba(184, 149, 106, 0.28);
			box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
			color: #f0ede6;
			font-family: Georgia, "Times New Roman", serif;
			text-align: center;
		}

		#reddix-preload-mask .reddix-preload-spinner {
			width: 28px;
			height: 28px;
			margin: 0 auto 14px;
			border-radius: 9999px;
			border: 3px solid rgba(240, 237, 230, 0.18);
			border-top-color: #b8956a;
			animation: reddix-preload-spin 0.8s linear infinite;
		}

		#reddix-preload-mask .reddix-preload-title {
			font-size: 18px;
			font-weight: 600;
			letter-spacing: 0.01em;
			margin-bottom: 6px;
		}

		#reddix-preload-mask .reddix-preload-subtitle {
			font-size: 13px;
			line-height: 1.5;
			color: #c7c2bb;
		}

		@keyframes reddix-preload-spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
		}
	`;

	if (!document.getElementById(style.id)) {
		document.head.appendChild(style);
	}

	document.body.appendChild(mask);
	return mask;
}

function hidePreloadMask() {
	document.getElementById("reddix-preload-mask")?.remove();
}

export default defineContentScript({
	matches: ["*://*/*"],
	cssInjectionMode: "ui",

	async main(ctx) {

		const listener = async (request: PayloadResponse) => {
			switch (request.type) {
				case "POST_INSIGHTS_CLICKED": {
					try {
						const health = await trpc.health.query();
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

		onMount: async (uiContainer, _shadow, shadowContainer) => {
			const preloadMask = showPreloadMask();

			try {
				if (type === "posts") {
					await preloadPosts({
						maxScrollSteps: 10,
						stepPx: 1400,
						settleMs: 700,
						idleRounds: 2,
						maxItems: 60,
						restoreScroll: true,
					});
				}

				if (type === "comments") {
					await preloadComments({
						maxScrollSteps: 8,
						stepPx: 1200,
						settleMs: 800,
						idleRounds: 2,
						maxItems: 80,
						restoreScroll: true,
					});
				}
			} finally {
				preloadMask.remove();
				hidePreloadMask();
			}

			CreateContentUI(uiContainer, shadowContainer, (root) => {
				const onRemove = () => {
					root.unmount();
					shadowContainer.remove();
					uiInstance = null;
				};

				const posts = extractRedditPosts();
				const comments = extractRedditComments();

				if (type === "posts") {
					return <Posts onRemove={onRemove} posts={posts} />;
				}

				if (type === "comments") {
					console.log("Comments insight clicked");

					return <Comments onRemove={onRemove} comments={comments} />;
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
