"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiSliders,
  FiX,
  FiStar,
  FiClock,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type ContentType = "all" | "internship" | "course";
type SortOption = "relevance" | "newest" | "rating" | "popular";
type Category = {
  id: string;
  name: string;
  icon: string;
};

interface SearchResult {
  id: string;
  type: "internship" | "course";
  title: string;
  company?: string;
  instructor?: string;
  thumbnail: string;
  rating: number;
  reviews: number;
  duration?: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  category: string;
  skills: string[];
  stipend?: string;
  price?: number;
  originalPrice?: number;
  description: string;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────
const mockResults: SearchResult[] = [
  {
    id: "1",
    type: "course",
    title: "Full-Stack Web Development Bootcamp 2026",
    instructor: "Angela Yu",
    thumbnail: "/course-thumb-1.jpg",
    rating: 4.7,
    reviews: 23500,
    duration: "12 weeks",
    level: "Beginner",
    category: "development",
    skills: ["React", "Node.js", "MongoDB"],
    price: 499,
    originalPrice: 3499,
    description: "Become a full-stack developer with this comprehensive bootcamp. Build 16+ projects.",
    createdAt: "2026-05-15T10:00:00Z",
  },
  {
    id: "2",
    type: "internship",
    title: "Frontend Developer Intern",
    company: "TechCorp",
    thumbnail: "/intern-thumb-1.jpg",
    rating: 4.4,
    reviews: 120,
    duration: "6 months",
    level: "Intermediate",
    category: "development",
    skills: ["React", "TypeScript", "CSS"],
    stipend: "₹25,000/month",
    description: "Work on live projects with a dynamic team. Remote friendly.",
    createdAt: "2026-06-10T10:00:00Z",
  },
  {
    id: "3",
    type: "course",
    title: "Machine Learning A-Z™: Hands-On Python & R",
    instructor: "Kirill Eremenko",
    thumbnail: "/course-thumb-2.jpg",
    rating: 4.6,
    reviews: 18000,
    duration: "8 weeks",
    level: "Intermediate",
    category: "data-science",
    skills: ["Python", "ML", "Deep Learning"],
    price: 599,
    originalPrice: 3999,
    description: "Learn Machine Learning using Python & R. Build models and deploy them.",
    createdAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "4",
    type: "internship",
    title: "Data Analyst Intern",
    company: "DataGenix",
    thumbnail: "/intern-thumb-2.jpg",
    rating: 4.8,
    reviews: 89,
    duration: "3 months",
    level: "Beginner",
    category: "data-science",
    skills: ["SQL", "Excel", "Tableau"],
    stipend: "₹20,000/month",
    description: "Analyze real-world datasets and deliver insights to stakeholders.",
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    id: "5",
    type: "course",
    title: "UI/UX Design Mastery: From Beginner to Pro",
    instructor: "Daniel Scott",
    thumbnail: "/course-thumb-3.jpg",
    rating: 4.9,
    reviews: 8700,
    duration: "6 weeks",
    level: "All Levels",
    category: "design",
    skills: ["Figma", "User Research", "Prototyping"],
    price: 449,
    originalPrice: 2499,
    description: "Master UI/UX design with Figma. Create stunning interfaces & prototypes.",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "6",
    type: "internship",
    title: "Graphic Design Intern",
    company: "CreativeMinds",
    thumbnail: "/intern-thumb-3.jpg",
    rating: 4.3,
    reviews: 45,
    duration: "4 months",
    level: "Intermediate",
    category: "design",
    skills: ["Photoshop", "Illustrator", "Branding"],
    stipend: "₹18,000/month",
    description: "Design marketing collateral for clients across industries.",
    createdAt: "2026-05-25T10:00:00Z",
  },
];

const categories: Category[] = [
  { id: "all", name: "All", icon: "🌟" },
  { id: "development", name: "Development", icon: "💻" },
  { id: "data-science", name: "Data Science", icon: "📊" },
  { id: "design", name: "Design", icon: "🎨" },
  { id: "business", name: "Business", icon: "📈" },
  { id: "marketing", name: "Marketing", icon: "📣" },
  { id: "personal-development", name: "Personal Development", icon: "🌱" },
];

const trendingSearches = [
  "React",
  "Full Stack",
  "Machine Learning",
  "UI/UX Design",
  "Data Science",
  "Python",
  "Digital Marketing",
  "Frontend Internship",
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const getSortFunction = (sort: SortOption) => {
  switch (sort) {
    case "newest":
      return (a: SearchResult, b: SearchResult) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    case "rating":
      return (a: SearchResult, b: SearchResult) => b.rating - a.rating;
    case "popular":
      return (a: SearchResult, b: SearchResult) => b.reviews - a.reviews;
    default:
      return undefined;
  }
};

function extractWeeks(duration: string): number {
  const match = duration.match(/(\d+)/);
  if (!match) return 0;
  let weeks = parseInt(match[0]);
  if (duration.toLowerCase().includes("month")) weeks *= 4;
  return weeks;
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";

  // Filter states
  const [typeFilter, setTypeFilter] = useState<ContentType>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [durationFilter, setDurationFilter] = useState<string[]>([]);

  // ── Listen for Navbar filter button ──
  useEffect(() => {
    const handleToggleFilters = () => {
      setShowFilters((prev) => !prev);
    };

    window.addEventListener("toggleFilters", handleToggleFilters);
    return () => {
      window.removeEventListener("toggleFilters", handleToggleFilters);
    };
  }, []);

  // ── Filtered & sorted results ──
  const results = useMemo(() => {
    let filtered = [...mockResults];

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.skills.some((s) => s.toLowerCase().includes(q)) ||
          item.description.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (levelFilter.length > 0) {
      filtered = filtered.filter((item) => levelFilter.includes(item.level));
    }

    if (priceFilter.length > 0) {
      filtered = filtered.filter((item) => {
        if (item.type !== "course") return true;
        if (priceFilter.includes("free") && item.price === 0) return true;
        if (priceFilter.includes("paid") && item.price && item.price > 0) return true;
        return false;
      });
    }

    if (durationFilter.length > 0) {
      filtered = filtered.filter((item) => {
        if (!item.duration) return true;
        const weeks = extractWeeks(item.duration);
        if (durationFilter.includes("short") && weeks <= 12) return true;
        if (durationFilter.includes("medium") && weeks > 12 && weeks <= 24) return true;
        if (durationFilter.includes("long") && weeks > 24) return true;
        return false;
      });
    }

    const sortFn = getSortFunction(sortBy);
    if (sortFn) filtered.sort(sortFn);

    return filtered;
  }, [query, typeFilter, selectedCategory, sortBy, levelFilter, priceFilter, durationFilter]);

  // ── Handlers ──
  const clearFilters = () => {
    setTypeFilter("all");
    setSelectedCategory("all");
    setLevelFilter([]);
    setPriceFilter([]);
    setDurationFilter([]);
    setSortBy("relevance");
  };

  const toggleLevelFilter = (level: string) => {
    setLevelFilter((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const togglePriceFilter = (price: string) => {
    setPriceFilter((prev) =>
      prev.includes(price) ? prev.filter((p) => p !== price) : [...prev, price]
    );
  };

  const toggleDurationFilter = (dur: string) => {
    setDurationFilter((prev) =>
      prev.includes(dur) ? prev.filter((d) => d !== dur) : [...prev, dur]
    );
  };

  const handleTrendingClick = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    levelFilter.length +
    priceFilter.length +
    durationFilter.length;

  // ── Shared Filter Panel (used in sidebar + mobile drawer) ──
  const FilterPanel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`space-y-6 ${isMobile ? "pb-8" : ""}`}>
      {/* Content Type */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Content Type</h3>
        <div className="space-y-2">
          {(["all", "course", "internship"] as const).map((type) => (
            <label key={type} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name={isMobile ? "mobileType" : "typeFilter"}
                checked={typeFilter === type}
                onChange={() => setTypeFilter(type)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {type === "all" ? "All" : type + "s"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Level</h3>
        <div className="space-y-2">
          {["Beginner", "Intermediate", "Advanced"].map((level) => (
            <label key={level} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={levelFilter.includes(level)}
                onChange={() => toggleLevelFilter(level)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={priceFilter.includes("free")}
              onChange={() => togglePriceFilter("free")}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Free</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={priceFilter.includes("paid")}
              onChange={() => togglePriceFilter("paid")}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Paid</span>
          </label>
        </div>
      </div>

      {/* Duration */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Duration</h3>
        <div className="space-y-2">
          {[
            { value: "short", label: "0-12 Weeks" },
            { value: "medium", label: "12-24 Weeks" },
            { value: "long", label: "24+ Weeks" },
          ].map((d) => (
            <label key={d.value} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={durationFilter.includes(d.value)}
                onChange={() => toggleDurationFilter(d.value)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-8">
          {/* ─── Desktop Sidebar Filters ─── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* ─── Main Content ─── */}
          <div className="flex-1 min-w-0">
            {/* Mobile: Categories + Filter Button */}
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop category bar + Sort */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm border-gray-200 rounded-md py-1 pl-2 pr-8 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Trending searches */}
            {!query &&
              results.length === mockResults.length &&
              activeFilterCount === 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Trending Searches
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTrendingClick(term)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Results count + Mobile Sort */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {results.length} result{results.length !== 1 ? "s" : ""}
                {query && ` for "${query}"`}
              </p>
              <div className="lg:hidden">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm border-gray-200 rounded-md py-1 pl-2 pr-8"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image
                  src="/empty-search.svg"
                  alt="No results"
                  width={200}
                  height={200}
                  className="mx-auto mb-4 opacity-50"
                />
                <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                <p className="text-gray-500 mt-1">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination placeholder */}
            {results.length > 6 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex gap-1">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${
                        page === 1
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Filter Drawer ─── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  {activeFilterCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                  aria-label="Close filters"
                >
                  <FiX size={22} />
                </button>
              </div>

              {/* Filter content */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <FilterPanel isMobile />
              </div>

              {/* Footer actions */}
              <div className="border-t px-5 py-4 flex gap-3 bg-white">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition"
                >
                  Show {results.length} results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ──────────────────────────────────────────────
// Result Card
// ──────────────────────────────────────────────
function ResultCard({ item }: { item: SearchResult }) {
  return (
    <Link
      href={item.type === "internship" ? `/internships/${item.id}` : `/course/${item.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-2 left-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              item.type === "course"
                ? "bg-purple-100 text-purple-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {item.type === "course" ? "Course" : "Internship"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-1">
          {item.title}
        </h3>
        {item.type === "course" && item.instructor && (
          <p className="text-xs text-gray-500 mb-1">{item.instructor}</p>
        )}
        {item.type === "internship" && item.company && (
          <p className="text-xs text-gray-500 mb-1">{item.company}</p>
        )}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-amber-500 font-bold text-sm">{item.rating}</span>
          <FiStar className="fill-amber-500 text-amber-500" size={14} />
          <span className="text-xs text-gray-500">({item.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          {item.duration && (
            <span className="flex items-center gap-1">
              <FiClock size={12} /> {item.duration}
            </span>
          )}
          <span>• {item.level}</span>
        </div>
        {item.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          {item.type === "course" ? (
            <div>
              {item.price === 0 ? (
                <span className="font-bold text-green-600">Free</span>
              ) : (
                <div>
                  <span className="font-bold text-gray-900">₹{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-400 line-through ml-1">
                      ₹{item.originalPrice}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            item.stipend && (
              <span className="font-medium text-emerald-600 text-sm">{item.stipend}</span>
            )
          )}
        </div>
      </div>
    </Link>
  );
}