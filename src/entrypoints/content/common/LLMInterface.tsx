import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import {
	Bot,
	X,
	Moon,
	Sun,
	ArrowLeft,
	Send,
	Sparkles,
	ScrollText,
	Smile,
	TrendingUp,
	LoaderCircle,
} from "lucide-react";
import { RedditCommentData, RedditPostData } from "@/entrypoints/scripts/scrape";
import { trpc } from "@/lib/trpc/trpcClient";

interface LLMInterfaceProps {
	onRemove: () => void;
	posts?: RedditPostData[];
	comments?: RedditCommentData[];
	isDarkMode?: boolean;
	onToggleDarkMode?: () => void;
}

const LLMInterface = ({
	onRemove,
	posts,
	comments,
	isDarkMode = false,
	onToggleDarkMode,
}: LLMInterfaceProps) => {
	const [query, setQuery] = useState("");
	const [response, setResponse] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isBootAnalyzing, setIsBootAnalyzing] = useState(true);
	const [conversationHistory, setConversationHistory] = useState<
		Array<{ role: "user" | "assistant"; content: string }>
	>([]);

	useEffect(() => {
		const HandleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onRemove();
			}
		};
		window.addEventListener("keydown", HandleEsc);
		return () => window.removeEventListener("keydown", HandleEsc);
	}, [onRemove]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setIsBootAnalyzing(false);
		}, 1200);

		return () => window.clearTimeout(timer);
	}, []);

	const handleSubmitQuery = async () => {
		if (!query.trim()) return;

		setIsLoading(true);

		// Add user message to history
		const userMessage = { role: "user" as const, content: query };
		const newHistory = [...conversationHistory, userMessage];
		setConversationHistory(newHistory);

		try {
			// Prefer comments if present (Comments.tsx also uses AI search over comments)
			const hasComments = Array.isArray(comments) && comments.length > 0;
			const hasPosts = Array.isArray(posts) && posts.length > 0;

			if (!hasComments && !hasPosts) return "No Posts or Comments data ";

			const llmResponse = hasComments
				? await trpc.chatAboutComments.mutate({
					comments: comments ?? [],
					query,
				})
				: await trpc.chatAboutPosts.mutate({
					posts: posts ?? [],
					query,
				});

			setResponse(llmResponse ?? "");
			setConversationHistory([
				...newHistory,
				{ role: "assistant" as const, content: llmResponse ?? "" },
			]);
		} catch (error) {
			console.error("Error calling LLM:", error);
			const errMsg =
				error instanceof Error
					? error.message
					: "Unknown error while calling LLM";
			setConversationHistory([
				...newHistory,
				{
					role: "assistant" as const,
					content: `I couldn't complete that request. ${errMsg}`,
				},
			]);
		} finally {
			setIsLoading(false);
			setQuery("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmitQuery();
		}
	};

	const themeClasses = isDarkMode
		? {
			bg: "bg-[#1c1c1c]",
			surface: "bg-[#242422]",
			text: "text-[#f0ede6]",
			textMuted: "text-[#a8a4a0]",
			border: "border-[#3a3835]",
			accent: "text-[#9aaa8e]",
			accentBg: "bg-[#2a2d28]",
			copper: "text-[#c9a87c]",
			copperBg: "bg-[#3d3226]",
			amber: "text-[#f0c98e]",
			inputBg: "bg-[#242422]",
			placeholder: "placeholder-[#6b6864]",
			hover: "hover:bg-[#2a2826]",
			ring: "focus:ring-[#7a8471]/30",
		}
		: {
			bg: "bg-[#f7f5f1]",
			surface: "bg-[#ffffff]",
			text: "text-[#1a1a1a]",
			textMuted: "text-[#6b6864]",
			border: "border-[#e8e6e0]",
			accent: "text-[#7a8471]",
			accentBg: "bg-[#f0f2ee]",
			copper: "text-[#b8956a]",
			copperBg: "bg-[#faf6f1]",
			amber: "text-[#d4a373]",
			inputBg: "bg-[#ffffff]",
			placeholder: "placeholder-[#a8a4a0]",
			hover: "hover:bg-[#faf9f7]",
			ring: "focus:ring-[#e6b885]/50",
		};

	const analyzingLabel =
		Array.isArray(comments) && comments.length > 0
			? `Analyzing ${comments.length} comments`
			: `Analyzing ${posts?.length} posts`;

	return (
		<div
			className={`${themeClasses.bg} rounded-lg shadow-2xl w-full h-full overflow-hidden flex flex-col min-h-0 transition-colors duration-300`}
		>
			{/* Header */}
			<div
				className={`${isDarkMode
					? "bg-[#242422] border-[#3a3835]"
					: "bg-[#f0ede6] border-[#e8e6e0]"
					} border-b-[0.5px] p-6 flex justify-between items-center shrink-0 transition-colors duration-300`}
			>
				<div className="flex items-center gap-3">
					<Button
						onClick={onRemove}
						variant="ghost"
						size="icon"
						className={`rounded-md ${themeClasses.hover} ${themeClasses.text} transition-all duration-200`}
						title="Back"
					>
						<ArrowLeft className="w-4 h-4" />
					</Button>

					<div
						className={`w-10 h-10 ${isDarkMode
							? "bg-[#1c1c1c] border-[#3a3835]"
							: "bg-[#ffffff] border-[#e8e6e0]"
							} border-[0.5px] rounded-md shadow-sm flex items-center justify-center`}
					>
						<Bot
							className={`w-5 h-5 ${isDarkMode ? "text-[#9aaa8e]" : "text-[#7a8471]"
								}`}
						/>
					</div>
					<div>
						<h2
							className={`text-lg font-serif ${themeClasses.text} tracking-tight`}
						>
							AI Assistant
						</h2>
						<p
							className={`text-xs ${themeClasses.textMuted} font-medium tracking-wide uppercase`}
						>
							{analyzingLabel}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{onToggleDarkMode && (
						<Button
							onClick={onToggleDarkMode}
							variant="ghost"
							size="icon"
							className={`rounded-md ${themeClasses.hover} ${themeClasses.text} transition-all duration-200`}
						>
							{isDarkMode ? (
								<Sun className="w-4 h-4" />
							) : (
								<Moon className="w-4 h-4" />
							)}
						</Button>
					)}

					<div
						className={`w-[0.5px] h-4 ${isDarkMode ? "bg-[#3a3835]" : "bg-[#e8e6e0]"
							} mx-1`}
					/>

					<Button
						onClick={onRemove}
						variant="ghost"
						size="icon"
						className={`rounded-md ${themeClasses.hover} ${themeClasses.text} transition-all duration-200`}
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
			</div>

			{/* Conversation Area */}
			<div
				className={`flex-1 flex flex-col min-h-0 ${themeClasses.bg} transition-colors duration-300`}
			>
				<div className={`flex-1 min-h-0 overflow-y-auto p-4 space-y-4`}>
					{isBootAnalyzing ? (
						<div className="flex flex-col items-center justify-center h-full text-center space-y-5 animate-[reddixFadeIn_0.35s_ease-out]">
							<div
								className={`relative w-20 h-20 ${isDarkMode
									? "bg-[#242422] border-[#3a3835]"
									: "bg-[#ffffff] border-[#e8e6e0]"
									} border-[0.5px] rounded-full flex items-center justify-center shadow-sm`}
							>
								<div className="absolute inset-0 rounded-full border border-[#b8956a]/30 animate-[reddixPulseRing_1.8s_ease-out_infinite]" />
								<div className="absolute inset-2 rounded-full border border-[#b8956a]/20 animate-[reddixPulseRing_1.8s_ease-out_0.2s_infinite]" />
								<LoaderCircle className={`w-8 h-8 ${themeClasses.accent} animate-spin`} />
							</div>
							<div className="space-y-2">
								<h3 className={`text-lg font-serif ${themeClasses.text}`}>
									Analyzing context
								</h3>
								<div className="flex items-center justify-center gap-1.5">
									<span className={`text-sm ${themeClasses.textMuted} font-serif italic`}>
										Preparing your AI workspace
									</span>
									<span className={`flex items-center gap-1 ${themeClasses.copper}`}>
										<span className="w-1.5 h-1.5 rounded-full bg-current animate-[reddixDot_1.2s_ease-in-out_infinite]" />
										<span className="w-1.5 h-1.5 rounded-full bg-current animate-[reddixDot_1.2s_ease-in-out_0.2s_infinite]" />
										<span className="w-1.5 h-1.5 rounded-full bg-current animate-[reddixDot_1.2s_ease-in-out_0.4s_infinite]" />
									</span>
								</div>
								<p className={`text-xs ${themeClasses.textMuted} max-w-md`}>
									Loading {Array.isArray(comments) && comments.length > 0
										? `${comments.length} comments`
										: `${posts?.length} posts`} for structured analysis.
								</p>
							</div>
						</div>
					) : conversationHistory.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-[reddixFadeIn_0.35s_ease-out]">
							<div
								className={`w-16 h-16 ${isDarkMode
									? "bg-[#242422] border-[#3a3835]"
									: "bg-[#ffffff] border-[#e8e6e0]"
									} border-[0.5px] rounded-full flex items-center justify-center`}
							>
								<Sparkles className={`w-8 h-8 ${themeClasses.accent}`} />
							</div>
							<div>
								<h3 className={`text-lg font-serif ${themeClasses.text} mb-2`}>
									AI Assistant Ready
								</h3>
								<p className={`text-sm ${themeClasses.textMuted} max-w-md`}>
									Ask me anything about the{" "}
									{Array.isArray(comments) && comments.length > 0
										? `${comments.length} Reddit comments`
										: `${posts?.length} Reddit posts`}
									. I can summarize, analyze sentiment, find patterns, or answer
									specific questions.
								</p>
							</div>
							<div className="flex flex-wrap gap-2 max-w-md">
								<button
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs ${themeClasses.accentBg} ${themeClasses.accent} rounded-md ${themeClasses.hover} transition-colors`}
									onClick={() =>
										setQuery("Summarize the main topics discussed")
									}
								>
									<ScrollText className="w-3.5 h-3.5" />
									<span>Summarize topics</span>
								</button>
								<button
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs ${themeClasses.accentBg} ${themeClasses.accent} rounded-md ${themeClasses.hover} transition-colors`}
									onClick={() => setQuery("What's the overall sentiment?")}
								>
									<Smile className="w-3.5 h-3.5" />
									<span>Analyze sentiment</span>
								</button>
								<button
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs ${themeClasses.accentBg} ${themeClasses.accent} rounded-md ${themeClasses.hover} transition-colors`}
									onClick={() => setQuery("Find trending topics")}
								>
									<TrendingUp className="w-3.5 h-3.5" />
									<span>Find trends</span>
								</button>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{conversationHistory.map((message, index) => (
								<div
									key={index}
									className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
										}`}
								>
									<div
										className={`max-w-[80%] p-3 rounded-lg ${message.role === "user"
											? `${themeClasses.copper} ${themeClasses.copperBg} ${themeClasses.border} border-[0.5px]`
											: `${themeClasses.surface} ${themeClasses.border} border-[0.5px] ${themeClasses.text}`
											}`}
									>
										<p className="text-sm font-serif leading-relaxed whitespace-pre-wrap break-words">
											{message.content}
										</p>
									</div>
								</div>
							))}

							{isLoading && (
								<div className="flex justify-start">
									<div
										className={`${themeClasses.surface} ${themeClasses.border} border-[0.5px] p-3 rounded-lg min-w-[220px] animate-[reddixFadeIn_0.25s_ease-out]`}
									>
										<div className="flex items-center gap-3">
											<div className="relative flex items-center justify-center w-8 h-8">
												<div className="absolute inset-0 rounded-full border border-[#b8956a]/25 animate-[reddixPulseRing_1.6s_ease-out_infinite]" />
												<LoaderCircle className={`w-4 h-4 ${themeClasses.accent} animate-spin`} />
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-1.5">
													<span
														className={`text-sm ${themeClasses.text} font-serif`}
													>
														Analyzing
													</span>
													<span className={`flex items-center gap-1 ${themeClasses.copper}`}>
														<span className="w-1.5 h-1.5 rounded-full bg-current animate-[reddixDot_1.2s_ease-in-out_infinite]" />
														<span className="w-1.5 h-1.5 rounded-full bg-current animate-[reddixDot_1.2s_ease-in-out_0.2s_infinite]" />
														<span className="w-1.5 h-1.5 rounded-full bg-current animate-[reddixDot_1.2s_ease-in-out_0.4s_infinite]" />
													</span>
												</div>
												<p
													className={`text-xs ${themeClasses.textMuted} font-serif italic mt-1`}
												>
													Generating a structured response
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Input Area */}
				<div
					className={`${themeClasses.surface} border-t-[0.5px] ${themeClasses.border} p-4 transition-colors duration-300`}
				>
					<div className="flex gap-3">
						<div className="flex-1 relative">
							<textarea
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder={
									Array.isArray(comments) && comments.length > 0
										? "Ask about these Reddit comments..."
										: "Ask about these Reddit posts..."
								}
								rows={2}
								className={`w-full p-3 ${themeClasses.inputBg} border-[0.5px] ${themeClasses.border} rounded-md
																									text-sm ${themeClasses.text} ${themeClasses.placeholder} font-serif
																									focus:outline-none focus:ring-2 ${themeClasses.ring} focus:border-[#e6b885]
																									transition-all duration-200 resize-none`}
								disabled={isLoading}
							/>
						</div>
						<Button
							onClick={handleSubmitQuery}
							disabled={!query.trim() || isLoading}
							className={`px-4 py-3 ${themeClasses.copper} ${themeClasses.copperBg} hover:bg-[#e6b885] hover:text-white border-[0.5px] ${themeClasses.border} rounded-md transition-all duration-200 disabled:opacity-50`}
						>
							{isLoading ? (
								<LoaderCircle className="w-4 h-4 animate-spin" />
							) : (
								<Send className="w-4 h-4" />
							)}
						</Button>
					</div>
				</div>
			</div>

			<style>{`
								.font-serif {
										font-family: "Georgia", "Times New Roman", serif;
								}

								@keyframes reddixFadeIn {
										from {
												opacity: 0;
												transform: translateY(8px);
										}
										to {
												opacity: 1;
												transform: translateY(0);
										}
								}

								@keyframes reddixPulseRing {
										0% {
												opacity: 0.15;
												transform: scale(0.92);
										}
										70% {
												opacity: 0.45;
												transform: scale(1.08);
										}
										100% {
												opacity: 0;
												transform: scale(1.16);
										}
								}

								@keyframes reddixDot {
										0%, 80%, 100% {
												opacity: 0.3;
												transform: translateY(0);
										}
										40% {
												opacity: 1;
												transform: translateY(-2px);
										}
								}
						`}</style>
		</div>
	);
};

export default LLMInterface;
