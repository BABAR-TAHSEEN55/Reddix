// export default defineBackground(() => {
//   console.log('Hello background!', { id: browser.runtime.id });
// });

import { appRouter } from "@/lib/trpc/router";
import { createChromeHandler } from "trpc-chrome/adapter";

function canUseChromeRuntime(): boolean {
	return (
		typeof chrome !== "undefined" &&
		!!chrome.runtime &&
		typeof chrome.runtime.onConnect?.addListener === "function" &&
		typeof chrome.runtime.onInstalled?.addListener === "function"
	);
}

export default defineBackground({
	main() {
		if (!canUseChromeRuntime()) return;

		createChromeHandler({
			router: appRouter,
			createContext: async () => ({}),
			onError(opts: { error: unknown; path?: string; type?: string }) {
				const { error, path, type } = opts;
				console.error("[tRPC-chrome error]", { path, type, error });
			},
		});

		chrome.runtime.onInstalled.addListener(() => {
			chrome.contextMenus.create({
				id: "post",
				title: "Post Insights",
				contexts: ["all"],
			});

			chrome.contextMenus.create({
				id: "Comments",
				title: "Comment Insights",
				contexts: ["all"],
			});
		});

		chrome.contextMenus.onClicked.addListener(async (info) => {
			if (info.menuItemId !== "post") return;
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			if (!tab?.id) return;
			await chrome.tabs.sendMessage(tab.id, { type: "POST_INSIGHTS_CLICKED" });

		});
	},
});
