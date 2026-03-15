import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

type ContentUICallback = (root: ReactDOM.Root) => React.ReactNode;

export const CreateContentUI = (
	uiContainer: HTMLElement,
	shadowContainer: HTMLElement,
	callback: ContentUICallback,
): ReactDOM.Root => {
	const app = document.createElement("div");
	app.id = "extension-root";

	const overlayStyles: Partial<CSSStyleDeclaration> = {
		position: "fixed",
		top: "0",
		left: "0",
		right: "0",
		bottom: "0",
		width: "100vw",
		height: "100vh",
		zIndex: "2147483647",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		backdropFilter: "blur(4px)",
		pointerEvents: "auto",
	};

	Object.assign(app.style, overlayStyles);
	uiContainer.append(app);

	Object.assign(shadowContainer.style, {
		position: "fixed",
		inset: "0",
		width: "100vw",
		height: "100vh",
		zIndex: "2147483647",
	});

	console.log("ShadowContainer styled");

	const root = ReactDOM.createRoot(app);

	root.render(
		<React.StrictMode>
			<Toaster />
			{callback(root)}
		</React.StrictMode>,
	);

	return root;
};
