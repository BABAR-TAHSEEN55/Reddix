import { createTRPCProxyClient } from "@trpc/client";
import { chromeLink } from "trpc-chrome/link";
import SuperJSON from "superjson";
import type { AppRouter } from "./router";

// One port, one client — shared for the lifetime of the content script
const port = chrome.runtime.connect({ name: "trpc" });

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [chromeLink({ port })],
	transformer: SuperJSON,
});
