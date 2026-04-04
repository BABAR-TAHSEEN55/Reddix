import { Button } from "@/components/ui/button";
import { RedditPostData } from "@/entrypoints/scripts/scrape";
import { useEffect, useState } from "react";

import { BotIcon, MessageSquareIcon, Scroll } from "lucide-react";

import {
  MessageCircle,
  ArrowBigUp,
  X,
  ExternalLink,
  Search,
  Moon,
  Sun,
  Bot,
  ArrowLeft,
  Sparkles,
  Send,
  Zap,
  Filter,
} from "lucide-react";
import LLMInterface from "../common/LLMInterface";
import { trpc } from "@/lib/trpc/trpcClient";

interface PostProps {
  onRemove: () => void;
  posts: RedditPostData[];
}

const Posts = ({ onRemove, posts }: PostProps) => {
  const [searchParam, setSearchParam] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLLMInterface, setShowLLMInterface] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const [aiQuery, setAIQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFilteredPosts, setAIFilteredPosts] = useState<RedditPostData[]>([]);
  const [isAIActive, setIsAIActive] = useState(false);

  // const LLMServiceProvider = new LLMService();

  useEffect(() => {
    const HandleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLLMInterface) {
          handleBackToPosts();
        } else if (showAISearch) {
          handleClearAISearch();
        } else {
          onRemove();
        }
      }
    };
    window.addEventListener("keydown", HandleEsc);
    return () => window.removeEventListener("keydown", HandleEsc);
  }, [onRemove, showLLMInterface, showAISearch]);

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

  const handleBackToPosts = () => {
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
    setAIFilteredPosts([]);
    setIsAIActive(false);
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;

    setIsAnalyzing(true);
    try {
      const filteredPosts = await trpc.analyzePosts.mutate({
        posts,
        query: aiQuery,
      });
      setAIFilteredPosts(filteredPosts ?? []);
      setIsAIActive(true);
      setShowAISearch(false);
    } catch (error) {
      console.error("AI Search failed:", error);
      setAIFilteredPosts([]);
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

  const handleQuickAIQuery = (query: string) => {
    setAIQuery(query);
    setTimeout(() => handleAISearch(), 100);
  };

  // Determine which posts to show
  const displayPosts = (() => {
    if (isAIActive) {
      return aiFilteredPosts;
    }

    // Regular search filtering
    if (debouncedSearch) {
      return posts.filter((post) => {
        const searchLower = debouncedSearch.toLowerCase();
        return (
          post.title.toLowerCase().includes(searchLower) ||
          post.meta.subreddit.toLowerCase().includes(searchLower) ||
          post.meta.author.toLowerCase().includes(searchLower)
        );
      });
    }

    return posts;
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
        aiGlow: "shadow-[#9aaa8e]/20",
        aiActive: "border-[#9aaa8e] bg-[#2a2d28]",
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
        aiGlow: "shadow-[#7a8471]/20",
        aiActive: "border-[#7a8471] bg-[#f0f2ee]",
      };

  // If showing LLM Interface, render it
  if (showLLMInterface) {
    return (
      <div className="relative w-[640px] h-[85vh] overflow-hidden">
        <div
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            isTransitioning ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <LLMInterface
            onRemove={handleBackToPosts}
            posts={posts}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        </div>
      </div>
    );
  }

  console.log("this is the format of display", displayPosts);
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
            className={`${isDarkMode ? "bg-[#242421] border-[#3a3835]" : "bg-[#f0ede6] border-[#e8e6e0]"} border-b-[0.5px] p-6 flex justify-between items-center shrink-0 transition-colors duration-300`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${isDarkMode ? "bg-[#1c1c1c] border-[#3a3835]" : "bg-[#ffffff] border-[#e8e6e0]"} border-[0.5px] rounded-md shadow-sm flex items-center justify-center`}
              >
                <span
                  className={`text-lg ${isDarkMode ? "text-[#9aaa8e]" : "text-[#7a8471]"}`}
                >
                  {isAIActive ? <BotIcon className="w-5 h-5" /> : <Scroll />}
                </span>
              </div>
              <div>
                <h2
                  className={`text-lg font-serif ${themeClasses.text} tracking-tight`}
                >
                  {isAIActive ? "AI Filtered Posts" : "Curated Posts"}
                </h2>
                <p
                  className={`text-xs ${themeClasses.textMuted} font-medium tracking-wide uppercase`}
                >
                  {displayPosts.length}{" "}
                  {isAIActive ? `matches for "${aiQuery}"` : "entries indexed"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAIActive && (
                <Button
                  onClick={handleClearAISearch}
                  variant="outline"
                  size="sm"
                  className={`text-xs ${themeClasses.textMuted} ${themeClasses.hover} border-[0.5px] ${themeClasses.border}`}
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear AI Filter
                </Button>
              )}

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

              <Button
                onClick={handleLLMToggle}
                variant="ghost"
                size="icon"
                className={`rounded-md ${themeClasses.hover} ${themeClasses.text} transition-all duration-200 group`}
                title="Open AI Assistant"
              >
                <Bot className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
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

          {/* Search Section */}
          <div className="relative overflow-hidden">
            {/* Regular Search Bar */}
            <div
              className={`${themeClasses.surface} border-b-[0.5px] ${themeClasses.border} transition-all duration-500 ease-in-out ${
                showAISearch
                  ? "-translate-x-full opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <div className="p-4 space-y-3">
                <div className="relative group">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${themeClasses.textMuted} group-focus-within:text-[#b8956a] transition-colors duration-200`}
                  />
                  <input
                    type="text"
                    placeholder="Search by title, author, or subreddit..."
                    value={searchParam}
                    onChange={(e) => setSearchParam(e.target.value)}
                    disabled={isAIActive}
                    className={`w-full pl-10 pr-4 py-2.5 ${themeClasses.inputBg} border-[0.5px] ${themeClasses.border} rounded-md
                             text-sm ${themeClasses.text} ${themeClasses.placeholder} font-serif
                             focus:outline-none focus:ring-2 ${themeClasses.ring} focus:border-[#e6b885]
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>

                <Button
                  onClick={toggleAISearch}
                  variant="outline"
                  size="sm"
                  className={`w-full ${isAIActive ? themeClasses.aiActive : themeClasses.accentBg} ${themeClasses.accent} border-[0.5px]
                           ${isAIActive ? "border-[#b8956a]" : themeClasses.border}
                           hover:bg-gradient-to-r hover:from-[#e6b885]/20 hover:to-[#7a8471]/20
                           hover:border-[#b8956a]/50 hover:shadow-lg hover:${themeClasses.aiGlow}
                           transition-all duration-300 group`}
                >
                  <Filter className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  <span className="font-serif text-sm">Smart AI Filter</span>
                  <Zap className="w-3 h-3 ml-auto group-hover:text-[#b8956a] transition-colors duration-200" />
                </Button>
              </div>
            </div>

            {/* AI Search Panel */}
            <div
              className={`absolute inset-0 ${themeClasses.surface} border-b-[0.5px] ${themeClasses.border}
                         transition-all duration-500 ease-in-out ${
                           showAISearch
                             ? "translate-x-0 opacity-100"
                             : "translate-x-full opacity-0"
                         }`}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full ${themeClasses.accentBg} flex items-center justify-center`}
                    >
                      <Filter className={`w-3 h-3 ${themeClasses.accent}`} />
                    </div>
                    <span
                      className={`text-sm font-serif ${themeClasses.text} font-medium`}
                    >
                      Smart Post Filter
                    </span>
                  </div>
                  <Button
                    onClick={toggleAISearch}
                    variant="ghost"
                    size="sm"
                    className={`${themeClasses.textMuted} ${themeClasses.hover} transition-all duration-200`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>

                <div className="relative group">
                  <Bot
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${themeClasses.accent} transition-colors duration-200`}
                  />
                  <input
                    type="text"
                    placeholder="e.g., 'posts about python', 'negative opinions', 'popular posts'..."
                    value={aiQuery}
                    onChange={(e) => setAIQuery(e.target.value)}
                    onKeyPress={handleAIKeyPress}
                    className={`w-full pl-10 pr-12 py-2.5 ${themeClasses.inputBg} border-[0.5px] ${themeClasses.border} rounded-md
                             text-sm ${themeClasses.text} ${themeClasses.placeholder} font-serif
                             focus:outline-none focus:ring-2 focus:ring-[#b8956a]/30 focus:border-[#b8956a]
                             transition-all duration-200`}
                    disabled={isAnalyzing}
                  />
                  <Button
                    onClick={handleAISearch}
                    disabled={!aiQuery.trim() || isAnalyzing}
                    variant="ghost"
                    size="sm"
                    className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 ${themeClasses.copper}
                             hover:bg-[#e6b885]/20 disabled:opacity-50 transition-all duration-200`}
                  >
                    {isAnalyzing ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => handleQuickAIQuery("programming languages")}
                    disabled={isAnalyzing}
                    className={`px-3 py-1.5 text-xs ${themeClasses.accentBg} ${themeClasses.accent}
                             rounded-full whitespace-nowrap ${themeClasses.hover} transition-colors duration-200 disabled:opacity-50`}
                  >
                    💻 Programming
                  </button>
                  <button
                    onClick={() => handleQuickAIQuery("negative opinions")}
                    disabled={isAnalyzing}
                    className={`px-3 py-1.5 text-xs ${themeClasses.accentBg} ${themeClasses.accent}
                             rounded-full whitespace-nowrap ${themeClasses.hover} transition-colors duration-200 disabled:opacity-50`}
                  >
                    👎 Critical
                  </button>
                  <button
                    onClick={() => handleQuickAIQuery("popular posts")}
                    disabled={isAnalyzing}
                    className={`px-3 py-1.5 text-xs ${themeClasses.accentBg} ${themeClasses.accent}
                             rounded-full whitespace-nowrap ${themeClasses.hover} transition-colors duration-200 disabled:opacity-50`}
                  >
                    🔥 Popular
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Filtered Posts */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-3 ${themeClasses.bg} ${isDarkMode ? "scrollbar-dark" : "scrollbar-light"} transition-colors duration-300`}
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? "border-[#3a3835] border-t-[#9aaa8e]" : "border-[#e8e6e0] border-t-[#7a8471]"} animate-spin`}
                  />
                </div>
                <span
                  className={`text-sm ${themeClasses.textMuted} font-serif italic`}
                >
                  AI is filtering posts...
                </span>
              </div>
            ) : displayPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div
                  className={`w-12 h-12 ${isDarkMode ? "bg-[#242422] border-[#3a3835]" : "bg-[#ffffff] border-[#e8e6e0]"} border-[0.5px] rounded-full flex items-center justify-center mb-3`}
                >
                  {isAIActive ? (
                    <Filter className={`w-5 h-5 ${themeClasses.textMuted}`} />
                  ) : (
                    <Search className={`w-5 h-5 ${themeClasses.textMuted}`} />
                  )}
                </div>
                <p className={`${themeClasses.text} font-serif text-base`}>
                  {isAIActive
                    ? `No posts match "${aiQuery}"`
                    : "No Posts found"}
                </p>
                <p className={`text-sm ${themeClasses.textMuted} mt-1 italic`}>
                  {isAIActive
                    ? "Try a different AI query"
                    : "Adjust your search terms"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayPosts.map((post, index) => (
                  <article
                    key={post.id}
                    className={`group ${themeClasses.surface} rounded-md p-4 border-[0.5px] ${
                      isAIActive ? "border-[#b8956a]/30" : themeClasses.border
                    } shadow-sm hover:shadow-md hover:border-[#b8956a]/50
                    transition-all duration-300 ease-out`}
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

                    {/* Rest of the post content remains the same */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold tracking-wider ${themeClasses.accentBg} ${themeClasses.accent} border-[0.5px] ${themeClasses.border}`}
                      >
                        {JSON.stringify(
                          console.log(
                            "Post meta breaking",
                            post.meta.subreddit,
                          ),
                        )}
                        r/{post.meta.subreddit}
                      </span>

                      <div className="flex items-center gap-3 text-xs font-medium">
                        <span className={`italic ${themeClasses.textMuted}`}>
                          {post.timeText}
                        </span>
                        <span
                          className={`flex items-center gap-1 ${themeClasses.copper} ${themeClasses.copperBg} px-2 py-0.5 rounded-sm border-[0.5px] ${themeClasses.border}`}
                        >
                          <ArrowBigUp className="w-3.5 h-3.5 fill-current" />
                          {post.stats.score.toLocaleString()}
                        </span>
                        <span
                          className={`flex items-center gap-1 ${themeClasses.accent} ${themeClasses.accentBg} px-2 py-0.5 rounded-sm border-[0.5px] ${themeClasses.border}`}
                        >
                          <MessageCircle className="w-3 h-3 fill-current" />
                          {post.stats.comments.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <h3
                      className={`text-base font-serif ${themeClasses.text} leading-snug mb-3 group-hover:text-[#b8956a] transition-colors duration-200`}
                    >
                      <a
                        href={`https://www.reddit.com${post.links.permalink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline decoration-[0.5px] underline-offset-4 decoration-[#b8956a]/50"
                      >
                        {post.title}
                      </a>
                    </h3>

                    <div
                      className={`flex items-center justify-between pt-3 border-t-[0.5px] ${themeClasses.border}`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-5 h-5 rounded-full ${isDarkMode ? "bg-[#3a3835]" : "bg-[#f0ede6]"} flex items-center justify-center`}
                        >
                          <span
                            className={`text-[10px] ${themeClasses.textMuted} font-serif`}
                          >
                            u
                          </span>
                        </div>
                        <span
                          className={`font-serif italic ${themeClasses.textMuted}`}
                        >
                          {post.meta.author}
                        </span>
                      </div>

                      <a
                        href={post.links.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs font-serif ${themeClasses.copper} hover:text-[#e6b885] transition-colors duration-200`}
                      >
                        <span className="tracking-wide">View Source</span>
                        <ExternalLink className="w-3 h-3" />
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

export default Posts;
