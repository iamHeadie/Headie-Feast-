import { useState, useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { restaurants, allItems } from "@/lib/data";

interface Suggestion {
  type: "restaurant" | "food";
  label: string;
  sublabel: string;
  restaurantName?: string;
}

interface SearchBarProps {
  onRestaurantClick?: (name: string) => void;
}

const TRENDING_TAGS = ["Turkey Spaghetti", "Jollof", "Shawarma"];

function getMatches(query: string): Suggestion[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return [];

  const seen = new Set<string>();
  const results: Suggestion[] = [];

  // Restaurant matches
  for (const r of restaurants) {
    if (r.name.toLowerCase().includes(lower) && !seen.has(r.name)) {
      seen.add(r.name);
      results.push({ type: "restaurant", label: r.name, sublabel: "Restaurant" });
    }
  }

  // Food item matches by name or tag
  for (const item of allItems) {
    const nameMatch = item.name.toLowerCase().includes(lower);
    const tagMatch = item.tags.some((t) => t.toLowerCase().includes(lower));
    if ((nameMatch || tagMatch) && !seen.has(item.name)) {
      seen.add(item.name);
      results.push({
        type: "food",
        label: item.name,
        sublabel: item.restaurant,
        restaurantName: item.restaurant,
      });
      if (results.length >= 6) break;
    }
  }

  return results.slice(0, 6);
}

export default function SearchBar({ onRestaurantClick }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const suggestions = trimmed ? getMatches(query) : [];
  const showDropdown = isFocused;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      inputRef.current?.blur();
      setIsFocused(false);
    }
  }

  function handleSuggestionClick(s: Suggestion) {
    if (s.type === "restaurant" && onRestaurantClick) {
      onRestaurantClick(s.label);
    } else if (s.type === "food" && s.restaurantName && onRestaurantClick) {
      onRestaurantClick(s.restaurantName);
    }
    setQuery(s.label);
    setIsFocused(false);
  }

  function handleTrendingClick(tag: string) {
    setQuery(tag);
    // Keep focus so suggestions show immediately
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      {/* Search input row */}
      <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-3">
        <Search size={16} className="text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search for something delicious..."
          enterKeyHint="search"
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {query ? (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        ) : null}
        <button
          aria-label="Filter results"
          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl overflow-hidden"
          >
            {!trimmed ? (
              /* ── Empty state: Trending in Malete ── */
              <div className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  🔥 Trending in Malete
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TAGS.map((tag) => (
                    <motion.button
                      key={tag}
                      whileTap={{ scale: 0.95 }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleTrendingClick(tag)}
                      className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full"
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              /* ── Suggestions list ── */
              <ul className="py-1">
                {suggestions.map((s, i) => (
                  <li key={`${s.type}-${s.label}-${i}`}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-secondary transition-colors"
                    >
                      <span className="text-base leading-none">
                        {s.type === "restaurant" ? "🍽️" : "🍴"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {s.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {s.sublabel}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              /* ── No results ── */
              <div className="px-4 py-5 text-center">
                <p className="text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
