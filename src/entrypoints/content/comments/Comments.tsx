import { useEffect, useState } from "react";
import {
  ArrowBigUp,
  X,
  Search,
  Moon,
  Sun,
  MessageCircle,
  Award,
  Bot,
  Sparkles,
  Send,
} from "lucide-react";

import { RedditCommentData } from "@/entrypoints/scripts/scrape";
import { trpc } from "@/lib/trpc/trpcClient";
import LLMInterface from "@/entrypoints/content/common/LLMInterface";

interface CommentsProps {
  onRemove: () => void;
  comments: RedditCommentData[];
}

const Comments = ({ onRemove, comments }: CommentsProps) => {
  const [searchParam, setSearchParam] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLLMInterface, setShowLLMInterface] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [showAISearch, setShowAISearch] = useState(false);
  const [aiQuery, setAIQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFilteredComments, setAIFilteredComments] = useState<
    RedditCommentData[]
  >([]);
  const [isAIActive, setIsAIActive] = useState(false);

  useEffect(() => {
    const HandleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLLMInterface) {
          handleBackFromLLM();
        } else if (showAISearch) {
          handleClearAISearch();
        } else {
          onRemove();
        }
      }
    };
    window.addEventListener("keydown", HandleEsc);
    return () => window.removeEventListener("keydown", HandleEsc);
  }, [onRemove, showAISearch, showLLMInterface]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchParam);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchParam]);

  const handleLLMToggle = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowLLMInterface(true);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackFromLLM = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowLLMInterface(false);
      setIsTransitioning(false);
    }, 300);
  };

  const toggleAISearch = () => {
    if (showAISearch) {
      handleClearAISearch();
    } else {
      setShowAISearch(true);
    }
  };

  const handleClearAISearch = () => {
    setShowAISearch(false);
    setAIQuery("");
    setAIFilteredComments([]);
    setIsAIActive(false);
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAnalyzing(true);
    try {
      const filtered = await trpc.analyzeComments.mutate({
        comments,
        query: aiQuery,
      });
      setAIFilteredComments(filtered ?? []);
      setIsAIActive(true);
      setShowAISearch(false);
    } catch (error) {
      console.error("AI Comment search failed:", error);
      setAIFilteredComments([]);
      setIsAIActive(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAIKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAISearch();
    }
  };

  const displayComments = (() => {
    if (isAIActive) return aiFilteredComments;
    const searchLower = debouncedSearch.toLowerCase();
    if (!searchLower) return comments;
    return comments.filter(
      (comment) =>
        comment.body.toLowerCase().includes(searchLower) ||
        comment.meta.author.toLowerCase().includes(searchLower) ||
        comment.meta.subreddit.toLowerCase().includes(searchLower) ||
        (comment.meta.authorFlair ?? "").toLowerCase().includes(searchLower),
    );
  })();

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

  if (showLLMInterface) {
    return (
      <div className="relative w-[640px] h-[85vh] overflow-hidden">
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            isTransitioning ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <LLMInterface
            onRemove={handleBackFromLLM}
            comments={comments}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[640px] h-[85vh] overflow-hidden">
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
          isTransitioning ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div
          className={`${themeClasses.bg} rounded-lg shadow-2xl w-full h-full overflow-hidden flex flex-col transition-colors duration-300`}
        >
          {/* Header */}
          <div
            className={`${
              isDarkMode
                ? "bg-[#242422] border-[#3a3835]"
                : "bg-[#f0ede6] border-[#e8e6e0]"
            } border-b-[0.5px] p-6 flex justify-between items-center shrink-0 transition-colors duration-300`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${
                  isDarkMode
                    ? "bg-[#1c1c1c] border-[#3a3835]"
                    : "bg-[#ffffff] border-[#e8e6e0]"
                } border-[0.5px] rounded-md shadow-sm flex items-center justify-center`}
              >
                <img
                  src={reddixIcon}
                  alt="Reddix"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <h2
                  className={`text-lg font-serif ${themeClasses.text} tracking-tight`}
                >
                  {isAIActive ? "AI Filtered Comments" : "Curated Comments"}
                </h2>
                <p
                  className={`text-xs ${themeClasses.textMuted} font-medium tracking-wide uppercase`}
                >
                  {displayComments.length}{" "}
                  {isAIActive ? `matches for "${aiQuery}"` : "entries indexed"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAIActive && (
                <button
                  onClick={handleClearAISearch}
                  className={`text-xs ${themeClasses.textMuted} ${themeClasses.hover} border-[0.5px] ${themeClasses.border} px-2 py-1 rounded-md flex items-center gap-1`}
                >
                  <X className="w-3 h-3" />
                  Clear AI Filter
                </button>
              )}

              <button
                onClick={handleLLMToggle}
                className={`rounded-md p-2 ${themeClasses.hover} ${themeClasses.text} transition-all duration-200 group`}
                title="AI Assistant"
              >
                <img
                  src={reddixIcon}
                  alt="Reddix AI"
                  className="w-4 h-4 object-contain group-hover:scale-110 transition-transform duration-200"
                />
              </button>

              <button
                onClick={toggleDarkMode}
                className={`rounded-md p-2 ${themeClasses.hover} ${themeClasses.text} transition-all duration-200`}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <div
                className={`w-[0.5px] h-4 ${
                  isDarkMode ? "bg-[#3a3835]" : "bg-[#e8e6e0]"
                } mx-1`}
              />

              <button
                onClick={onRemove}
                className={`rounded-md p-2 ${themeClasses.hover} ${themeClasses.text} transition-all duration-200`}
              >
                <X className="w-4 h-4" />
              </button>
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
                placeholder="Search by content, author, or flair..."
                value={searchParam}
                onChange={(e) => setSearchParam(e.target.value)}
                disabled={isAIActive}
                className={`w-full pl-10 pr-4 py-2.5 ${themeClasses.inputBg} border-[0.5px] ${themeClasses.border} rounded-md
									text-sm ${themeClasses.text} ${themeClasses.placeholder} font-serif
									focus:outline-none focus:ring-2 ${themeClasses.ring} focus:border-[#e6b885]
									transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>

            <button
              onClick={toggleAISearch}
              className={`mt-3 w-full ${themeClasses.accentBg} ${themeClasses.accent} border-[0.5px] ${themeClasses.border}
								px-3 py-2 rounded-md text-sm font-serif flex items-center justify-center gap-2
								hover:border-[#b8956a]/50 transition-all duration-300 group`}
            >
              <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              Smart AI Filter
            </button>

            {isAIActive && (
              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-xs ${themeClasses.textMuted} font-serif italic`}
                >
                  AI filter active
                </span>
                <button
                  className={`text-xs ${themeClasses.copper} hover:text-[#e6b885] transition-colors duration-200`}
                  onClick={handleClearAISearch}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* AI Search Panel */}
          {showAISearch && (
            <div
              className={`${themeClasses.surface} border-b-[0.5px] ${themeClasses.border} p-4 shrink-0`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={aiQuery}
                    onChange={(e) => setAIQuery(e.target.value)}
                    onKeyDown={handleAIKeyPress}
                    placeholder="Ask AI to find relevant comments..."
                    rows={2}
                    className={`w-full p-3 ${themeClasses.inputBg} border-[0.5px] ${themeClasses.border} rounded-md
											text-sm ${themeClasses.text} ${themeClasses.placeholder} font-serif
											focus:outline-none focus:ring-2 ${themeClasses.ring} focus:border-[#e6b885]
											transition-all duration-200 resize-none`}
                    disabled={isAnalyzing}
                  />
                </div>
                <button
                  onClick={handleAISearch}
                  disabled={!aiQuery.trim() || isAnalyzing}
                  className={`px-4 py-3 ${themeClasses.copper} ${themeClasses.copperBg} border-[0.5px] ${themeClasses.border} rounded-md transition-all duration-200 disabled:opacity-50`}
                >
                  {isAnalyzing ? (
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setShowAISearch(false)}
                  className={`p-2 rounded-md ${themeClasses.hover} ${themeClasses.text}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-3 ${themeClasses.bg} transition-colors duration-300`}
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div
                  className={`w-8 h-8 rounded-full border-2 ${
                    isDarkMode
                      ? "border-[#3a3835] border-t-[#9aaa8e]"
                      : "border-[#e8e6e0] border-t-[#7a8471]"
                  } animate-spin`}
                />
                <span
                  className={`text-sm ${themeClasses.textMuted} font-serif italic`}
                >
                  AI is filtering comments...
                </span>
              </div>
            ) : displayComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div
                  className={`w-12 h-12 ${
                    isDarkMode
                      ? "bg-[#242422] border-[#3a3835]"
                      : "bg-[#ffffff] border-[#e8e6e0]"
                  } border-[0.5px] rounded-full flex items-center justify-center mb-3`}
                >
                  <Search className={`w-5 h-5 ${themeClasses.textMuted}`} />
                </div>
                <p className={`${themeClasses.text} font-serif text-base`}>
                  No comments found
                </p>
                <p className={`text-sm ${themeClasses.textMuted} mt-1 italic`}>
                  Adjust your search terms
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayComments.map((comment, index) => (
                  <article
                    key={comment.id}
                    className={`group ${themeClasses.surface} rounded-md p-4 border-[0.5px] ${
                      isAIActive ? "border-[#b8956a]/30" : themeClasses.border
                    } shadow-sm hover:shadow-md hover:border-[#b8956a]/50 transition-all duration-300 ease-out`}
                    style={{
                      animationDelay: `${index * 40}ms`,
                      animation: "fadeIn 0.4s ease-out forwards",
                    }}
                  >
                    {isAIActive && (
                      <div className="flex items-center gap-1 mb-2">
                        <Sparkles
                          className={`w-3 h-3 ${themeClasses.accent}`}
                        />
                        <span
                          className={`text-xs ${themeClasses.accent} font-serif`}
                        >
                          AI Match
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold tracking-wider ${themeClasses.accentBg} ${themeClasses.accent} border-[0.5px] ${themeClasses.border}`}
                        >
                          r/{comment.meta.subreddit}
                        </span>
                        {comment.meta.authorFlair && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium ${themeClasses.copperBg} ${themeClasses.copper} border-[0.5px] ${themeClasses.border}`}
                          >
                            {comment.meta.authorFlair}
                          </span>
                        )}
                      </div>

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

                    <p
                      className={`text-sm font-serif ${themeClasses.text} leading-relaxed mb-3`}
                    >
                      {comment.body}
                    </p>

                    <div
                      className={`flex items-center justify-between pt-3 border-t-[0.5px] ${themeClasses.border}`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        {comment.links.avatarUrl ? (
                          <img
                            src={comment.links.avatarUrl}
                            alt={comment.meta.author}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-full ${
                              isDarkMode ? "bg-[#3a3835]" : "bg-[#f0ede6]"
                            } flex items-center justify-center`}
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
        </div>
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
