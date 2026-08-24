"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useAuth } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  Loader2,
  Users,
  Target,
  CheckCircle,
  PlayCircle,
  BookOpen,
  MonitorPlay,
  Infinity as InfinityIcon,
  Star,
  Globe,
  Award,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  ThumbsUp,
  Lock,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_APP_URL;

const CURRICULUM_FALLBACK = [
  {
    section: "Getting Started",
    lessons: [
      { title: "Course Introduction", duration: "5:20", preview: true },
      { title: "Setting Up Your Environment", duration: "12:40", preview: false },
    ],
  },
  {
    section: "Core Concepts",
    lessons: [
      { title: "Fundamentals Deep Dive", duration: "22:10", preview: false },
      { title: "Hands-on Practice", duration: "18:35", preview: false },
      { title: "Common Pitfalls", duration: "9:50", preview: false },
    ],
  },
  {
    section: "Building the Project",
    lessons: [
      { title: "Project Setup", duration: "14:00", preview: false },
      { title: "Feature Implementation", duration: "31:15", preview: false },
      { title: "Testing & Debugging", duration: "16:45", preview: false },
    ],
  },
];

const REVIEWS_FALLBACK = [
  {
    name: "Priya Sharma",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Really well structured course. The instructor explains concepts clearly and the projects are practical, not just theory.",
    helpful: 24,
  },
  {
    name: "Rahul Verma",
    rating: 5,
    date: "1 month ago",
    comment:
      "Best course I've taken on this topic. Went from confused to confident in a couple of weeks.",
    helpful: 18,
  },
  {
    name: "Ananya Singh",
    rating: 4,
    date: "1 month ago",
    comment:
      "Solid content overall. Would love a bit more depth in the advanced sections, but great value.",
    helpful: 9,
  },
];

const RATING_BREAKDOWN = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 15 },
  { stars: 3, pct: 5 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

const ALSO_BOUGHT_FALLBACK = [
  {
    id: "1",
    title: "Advanced Problem Solving Techniques",
    instructor: "Vikram Rao",
    price: 799,
    rating: 4.7,
    ratingCount: 892,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400",
  },
  {
    id: "2",
    title: "Complete Interview Preparation Guide",
    instructor: "Sneha Iyer",
    price: 999,
    rating: 4.8,
    ratingCount: 1540,
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400",
  },
  {
    id: "3",
    title: "Project-Based Learning Bootcamp",
    instructor: "Arjun Mehta",
    price: 1299,
    rating: 4.6,
    ratingCount: 634,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400",
  },
];

export default function CourseDetail() {
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Modal States
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "info" | "error">(
    "success",
  );
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const toggleSection = (idx: number) => {
    setOpenSections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const curriculum = course?.curriculum || CURRICULUM_FALLBACK;
  const reviews = course?.reviews || REVIEWS_FALLBACK;
  const relatedCourses = course?.relatedCourses || ALSO_BOUGHT_FALLBACK;
  const avgRating = course?.avgRating || 4.9;
  const ratingCount = course?.ratingCount || 1240;
  const totalLessons = curriculum.reduce(
    (sum: number, s: any) => sum + s.lessons.length,
    0,
  );

  const router = useRouter();
  const { user } = useAuth();

  const showModal = (
    title: string,
    message: string,
    type: "success" | "info" | "error",
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setShowEnrollModal(true);
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isEnrolled || isEnrolling) return;

    try {
      setIsEnrolling(true);
      const token = localStorage.getItem("token");
      const courseIdentifier = course._id || course.id; // Fallback for id

      const res = await fetch(`${API}/api/courses/enroll/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: courseIdentifier,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Enrollment failed");
      }

      setIsEnrolled(true);
      showModal(
        "Enrollment Successful!",
        "Welcome to the course! You can now start learning from your dashboard.",
        "success",
      );
    } catch (err: any) {
      showModal(
        "Enrollment Failed",
        err.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const FALLBACK_BANNER =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1920";

  function getYouTubeId(url?: string) {
    if (!url) return "";
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  }

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API}/api/courses/${courseId}/`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Course not found
        </h2>
        <Link href="/courses" className="text-indigo-600 hover:underline">
          Return to Courses
        </Link>
      </div>
    );
  }

  const videoId = getYouTubeId(course.youtube);
  const bannerImage = course.imageUrl || FALLBACK_BANNER;
  const price = course.price || course.stipend || "Free";
  const authorName = course.instructor || course.company || "Expert Instructor";
  const duration = course.duration || "Self-paced";
  const category = course.category || "General";

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ───────────────── Hero ───────────────── */}
      <section className="relative bg-slate-900 text-white pt-10 pb-28 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={bannerImage}
            alt="Course Background"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/80 to-slate-900" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6 sm:mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span>Back to Courses</span>
          </Link>

          <div className="max-w-3xl">
            <div className="mb-4">
              <span className="inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-600 text-white rounded-md">
                {category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300 mb-8">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <span className="text-white font-medium ml-1">{avgRating}</span>
                <span className="text-slate-300">({ratingCount.toLocaleString()} ratings)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Users size={15} className="text-indigo-400" />
                <span>Beginner to Advanced</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-indigo-400" />
                <span>{duration}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Globe size={15} className="text-indigo-400" />
                <span>English / Hindi</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-indigo-400">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">
                  Instructor
                </p>
                <p className="font-semibold text-white">{authorName}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Main Content ───────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 -mt-16 sm:-mt-20">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* ───── Left Column (Content) ───── */}
          <div className="lg:col-span-8 space-y-6">
            {/* What you'll learn */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <Target className="text-indigo-600" size={22} />
                What you&apos;ll learn
              </h2>
              <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                {[
                  "Build real-world projects from scratch",
                  "Understand complex concepts easily",
                  "Industry best practices & patterns",
                  "Prepare for technical interviews",
                  "Hands-on coding exercises",
                  "Lifetime of completion",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle
                      className="text-green-500 mt-0.5 shrink-0"
                      size={18}
                    />
                    <span className="text-slate-600 text-sm sm:text-[15px]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                  <MonitorPlay className="text-indigo-600" size={22} />
                  Course Content
                </h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                {curriculum.length} sections • {totalLessons} lectures •{" "}
                {duration} total
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                {curriculum.map((section: any, idx: number) => {
                  const isOpen = openSections.includes(idx);
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => toggleSection(idx)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {isOpen ? (
                            <ChevronUp
                              size={18}
                              className="text-slate-500 shrink-0"
                            />
                          ) : (
                            <ChevronDown
                              size={18}
                              className="text-slate-500 shrink-0"
                            />
                          )}
                          <span className="font-semibold text-slate-800 text-sm">
                            {section.section}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 shrink-0">
                          {section.lessons.length} lectures
                        </span>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100">
                          {section.lessons.map((lesson: any, lIdx: number) => (
                            <div
                              key={lIdx}
                              className="flex items-center justify-between px-5 py-3 pl-12 text-sm"
                            >
                              <div className="flex items-center gap-3 text-slate-600">
                                {lesson.preview ? (
                                  <PlayCircle
                                    size={15}
                                    className="text-indigo-500 shrink-0"
                                  />
                                ) : (
                                  <Lock
                                    size={13}
                                    className="text-slate-400 shrink-0"
                                  />
                                )}
                                <span
                                  className={
                                    lesson.preview
                                      ? "text-indigo-600 font-medium"
                                      : ""
                                  }
                                >
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-slate-400 text-xs shrink-0">
                                {lesson.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2.5">
                <BookOpen className="text-indigo-600" size={22} />
                Course Description
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-[15px] whitespace-pre-line">
                {course.description ||
                  "Detailed course description will be available soon."}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2.5">
                <Award className="text-indigo-600" size={22} />
                Prerequisites
              </h2>
              <ul className="space-y-3">
                {(
                  course.requirements ||
                  "A willingness to learn and a stable internet connection"
                )
                  .split("\n")
                  .map((req: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-slate-600 text-[15px]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                      {req.replace("•", "").trim()}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <Star className="text-indigo-600" size={22} />
                Student Reviews
              </h2>

              {/* Rating summary */}
              <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-slate-100">
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="text-5xl font-bold text-slate-900">
                    {avgRating}
                  </span>
                  <div className="flex text-amber-400 my-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {ratingCount.toLocaleString()} ratings
                  </span>
                </div>

                <div className="flex-1 space-y-2">
                  {RATING_BREAKDOWN.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-10 shrink-0">
                        {row.stars} star
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 shrink-0">
                        {row.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-6">
                {reviews.map((review: any, i: number) => (
                  <div
                    key={i}
                    className="pb-6 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-sm shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {review.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                size={11}
                                fill={
                                  i <= review.rating ? "currentColor" : "none"
                                }
                                className={
                                  i <= review.rating ? "" : "text-slate-300"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">
                            {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-2">
                      {review.comment}
                    </p>
                    <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                      <ThumbsUp size={13} />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ───── Right Column – Sticky Purchase Card ───── */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Video Preview */}
                <div className="relative aspect-video bg-slate-900">
                  {videoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                      className="w-full h-full absolute inset-0"
                      allowFullScreen
                      title="Course Preview"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                      <PlayCircle size={48} className="mb-2 opacity-40" />
                      <p className="text-sm font-medium">
                        No preview available
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="mb-5">
                    <h2 className="text-3xl font-bold text-slate-900">
                      {price === "Free" || price === "0" || price === 0
                        ? "Free"
                        : `₹${price}`}
                    </h2>
                    {price !== "Free" && price !== "0" && price !== 0 && (
                      <p className="text-sm text-slate-500 mt-1">
                        One-time payment • Lifetime access
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling || isEnrolled}
                    className={`w-full py-3.5 rounded-xl text-base font-semibold transition-all flex justify-center items-center gap-2 ${
                      isEnrolled
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-md shadow-indigo-200"
                    }`}
                  >
                    {isEnrolling && (
                      <Loader2 size={18} className="animate-spin" />
                    )}
                    {isEnrolled
                      ? "Already Enrolled"
                      : isEnrolling
                        ? "Processing..."
                        : "Enroll Now"}
                  </button>

                  <p className="text-center text-xs text-slate-500 mt-3">
                    Full lifetime access • 30-day money-back guarantee
                  </p>

                  <hr className="my-6 border-slate-100" />

                  <div className="space-y-3.5">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      This course includes:
                    </h3>
                    {[
                      {
                        icon: <MonitorPlay size={17} />,
                        text: `${duration} on-demand video`,
                      },
                      {
                        icon: <InfinityIcon size={17} />,
                        text: "Full lifetime access",
                      },
                      {
                        icon: <Globe size={17} />,
                        text: "Access on mobile and desktop",
                      },
                      {
                        icon: <Award size={17} />,
                        text: "Certificate of completion",
                      },
                    ].map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-slate-600"
                      >
                        <div className="text-slate-400">{feat.icon}</div>
                        <span className="text-sm">{feat.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────── Students Also Bought ───────────────── */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
            <ShoppingCart className="text-indigo-600" size={22} />
            Students Also Bought
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedCourses.map((rc: any) => (
              <Link
                key={rc.id}
                href={`/courses/${rc.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all"
              >
                <div className="relative aspect-video bg-slate-100">
                  <Image
                    src={rc.image}
                    alt={rc.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1.5 line-clamp-2">
                    {rc.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">
                    {rc.instructor}
                  </p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-amber-600 font-semibold text-sm">
                      {rc.rating}
                    </span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">
                      ({rc.ratingCount.toLocaleString()})
                    </span>
                  </div>
                  <p className="font-bold text-slate-900">₹{rc.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ───────────────── Enrollment Modal ───────────────── */}
      {showEnrollModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                      modalType === "success"
                        ? "bg-green-100 text-green-600"
                        : modalType === "error"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {modalType === "error" ? (
                      <AlertCircle size={22} />
                    ) : (
                      <CheckCircle size={22} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {modalTitle}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {modalMessage}
                </p>
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}