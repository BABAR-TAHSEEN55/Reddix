
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import {
	ArrowBigUp,
	X,
	Search,
	Moon,
	Sun,
	MessageCircle,
	Award,
} from "lucide-react";
import { RedditCommentData } from "@/entrypoints/scripts/scrape";

interface CommentsProps {
	onRemove: () => void;
	comments: RedditCommentData[];
}

const Comments = ({ onRemove, comments }: CommentsProps) => {
	const [searchParam, setSearchParam] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isDarkMode, setIsDarkMode] = useState(false);

	// Escape key to close
	useEffect(() => {
		const HandleEsc = (e: KeyboardEvent) => {
			if (e.key == "Escape") {
				onRemove();
			}
		};
		window.addEventListener("keydown", HandleEsc);
		return () => window.removeEventListener("keydown", HandleEsc);
	}, [onRemove]);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchParam);
		}, 150);
		return () => clearTimeout(timer);
	}, [searchParam]);

	// Filter across body, author, subreddit, flair
	const filteredComments = comments.filter((comment) => {
		const searchLower = debouncedSearch.toLowerCase();
		return (
			comment.body.toLowerCase().includes(searchLower) ||
			comment.meta.author.toLowerCase().includes(searchLower) ||
			comment.meta.subreddit.toLowerCase().includes(searchLower) ||
			comment.meta.authorFlair.toLowerCase().includes(searchLower)
		);
	});

	const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

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

	return (
		<div
			className={`${themeClasses.bg} rounded-lg shadow-2xl max-w-2xl w-[640px] h-[85vh] overflow-hidden flex flex-col transition-colors duration-300`}
		>
			{/* Header */}
			<div
				className={`${isDarkMode ? "bg-[#242422] border-[#3a3835]" : "bg-[#f0ede6] border-[#e8e6e0]"} border-b-[0.5px] p-6 flex justify-between items-center shrink-0 transition-colors duration-300`}
			>
				<div className="flex items-center gap-3">
					<div
						className={`w-10 h-10 ${isDarkMode ? "bg-[#1c1c1c] border-[#3a3835]" : "bg-[#ffffff] border-[#e8e6e0]"} border-[0.5px] rounded-md shadow-sm flex items-center justify-center`}
					>
						<MessageCircle
							className={`w-5 h-5 ${isDarkMode ? "text-[#9aaa8e]" : "text-[#7a8471]"}`}
						/>
					</div>
					<div>
						<h2
							className={`text-lg font-serif ${themeClasses.text} tracking-tight`}
						>
							Curated Comments
						</h2>
						<p
							className={`text-xs ${themeClasses.textMuted} font-medium tracking-wide uppercase`}
						>
							{filteredComments.length} entries indexed
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						onClick={toggleDarkMode}
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
					<div
						className={`w-[0.5px] h-4 ${isDarkMode ? "bg-[#3a3835]" : "bg-[#e8e6e0]"} mx-1`}
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

			{/* Search */}
			<div
				className={`${themeClasses.surface} border-b-[0.5px] ${themeClasses.border} p-4 shrink-0 transition-colors duration-300`}
			>
				<div className="relative group">
					<Search
						className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted} group-focus-within:text-[#b8956a] transition-colors duration-200`}
					/>
					<input
						type="text"
						placeholder="Search by content, scribe, or flair..."
						value={searchParam}
						onChange={(e) => setSearchParam(e.target.value)}
						className={`w-full pl-10 pr-4 py-2.5 ${themeClasses.inputBg} border-[0.5px] ${themeClasses.border} rounded-md
                     text-sm ${themeClasses.text} ${themeClasses.placeholder} font-serif
                     focus:outline-none focus:ring-2 ${themeClasses.ring} focus:border-[#e6b885]
                     transition-all duration-200`}
					/>
				</div>
			</div>

			{/* Content - Comment cards */}
			<div
				className={`flex-1 overflow-y-auto p-4 space-y-3 ${themeClasses.bg} ${isDarkMode ? "scrollbar-dark" : "scrollbar-light"} transition-colors duration-300`}
			>
				{filteredComments.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-64 text-center">
						<div
							className={`w-12 h-12 ${isDarkMode ? "bg-[#242422] border-[#3a3835]" : "bg-[#ffffff] border-[#e8e6e0]"} border-[0.5px] rounded-full flex items-center justify-center mb-3`}
						>
							<Search className={`w-5 h-5 ${themeClasses.textMuted}`} />
						</div>
						<p className={`${themeClasses.text} font-serif text-base`}>
							No Comments found
						</p>
						<p className={`text-sm ${themeClasses.textMuted} mt-1 italic`}>
							Adjust your search terms
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{filteredComments.map((comment, index) => (
							<article
								key={comment.id}
								className={`group ${themeClasses.surface} rounded-md p-4 border-[0.5px] ${themeClasses.border}
                         shadow-sm hover:shadow-md hover:border-[#b8956a]/50
                         transition-all duration-300 ease-out`}
								style={{
									animationDelay: `${index * 40}ms`,
									animation: "fadeIn 0.4s ease-out forwards",
								}}
							>
								{/* Metadata header */}
								<div className="flex items-center justify-between mb-3">
									{/* Left: subreddit + flair */}
									<div className="flex items-center gap-2">
										<span
											className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold tracking-wider ${themeClasses.accentBg} ${themeClasses.accent} border-[0.5px] ${themeClasses.border}`}
										>
											r/{comment.meta.subreddit}
										</span>
										{comment.meta.authorFlair && (
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium tracking-wide ${themeClasses.copperBg} ${themeClasses.copper} border-[0.5px] ${themeClasses.border}`}
											>
												{comment.meta.authorFlair}
											</span>
										)}
									</div>

									{/* Right: time + score + awards */}
									<div className="flex items-center gap-2 text-xs font-medium">
										<span className={`italic ${themeClasses.textMuted}`}>
											{comment.timeText}
										</span>

										<span
											className={`flex items-center gap-1 ${themeClasses.copper} ${themeClasses.copperBg} px-2 py-0.5 rounded-sm border-[0.5px] ${themeClasses.border}`}
										>
											<ArrowBigUp className="w-3.5 h-3.5 fill-current" />
											{comment.stats.score.toLocaleString()}
										</span>

										{comment.stats.awardCount > 0 && (
											<span
												className={`flex items-center gap-1 ${themeClasses.amber} ${themeClasses.copperBg} px-2 py-0.5 rounded-sm border-[0.5px] ${themeClasses.border}`}
											>
												<Award className="w-3 h-3 fill-current" />
												{comment.stats.awardCount}
											</span>
										)}
									</div>
								</div>

								{/* Comment body */}
								<p
									className={`text-sm font-serif ${themeClasses.text} leading-relaxed mb-3 group-hover:text-[#b8956a] transition-colors duration-200`}
								>
									{comment.body}
								</p>

								{/* Footer: author + depth + open thread link */}
								<div
									className={`flex items-center justify-between pt-3 border-t-[0.5px] ${themeClasses.border}`}
								>
									{/* Author + depth indicator */}
									<div className="flex items-center gap-2 text-xs">
										{comment.links.avatarUrl ? (
											<img
												src={comment.links.avatarUrl}
												alt={comment.meta.author}
												className="w-5 h-5 rounded-full object-cover"
											/>
										) : (
											<div
												className={`w-5 h-5 rounded-full ${isDarkMode ? "bg-[#3a3835]" : "bg-[#f0ede6]"} flex items-center justify-center`}
											>
												<span
													className={`text-[10px] ${themeClasses.textMuted} font-serif`}
												>
													u
												</span>
											</div>
										)}
										<span
											className={`font-serif italic ${themeClasses.textMuted}`}
										>
											{comment.meta.author}
										</span>
										{comment.stats.depth > 0 && (
											<span
												className={`text-[10px] ${themeClasses.textMuted} px-1.5 py-0.5 rounded-sm border-[0.5px] ${themeClasses.border}`}
											>
												depth {comment.stats.depth}
											</span>
										)}
									</div>

									{/* Open in thread */}
									<a
										href={`https://www.reddit.com${comment.links.permalink}`}
										target="_blank"
										rel="noopener noreferrer"
										className={`inline-flex items-center gap-1 text-xs font-serif ${themeClasses.copper} hover:text-[#e6b885] transition-colors duration-200`}
									>
										<span className="tracking-wide">View in Thread</span>
										<svg
											className="w-3 h-3"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											viewBox="0 0 24 24"
										>
											<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
											<polyline points="15 3 21 3 21 9" />
											<line x1="10" y1="14" x2="21" y2="3" />
										</svg>
									</a>
								</div>
							</article>
						))}
					</div>
				)}
			</div>

			<style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .font-serif {
          font-family: "Georgia", "Times New Roman", serif;
        }
      `}</style>
		</div>
	);
};

export default Comments;
