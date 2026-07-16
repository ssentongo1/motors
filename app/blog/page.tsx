"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BlogPost {
  id: string;
  title: string;
  cover_image: string;
  type: string;
  video_url: string;
  published_at: string;
}

// Skeleton Loader for Blog
function BlogCardSkeleton() {
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "20px", overflow: "hidden" }}>
      <div style={{ height: "200px", background: "#111", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "20px" }}>
        <div style={{ height: "14px", background: "#1a1a1a", borderRadius: "4px", marginBottom: "12px", width: "30%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: "20px", background: "#1a1a1a", borderRadius: "4px", marginBottom: "8px", width: "80%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: "14px", background: "#1a1a1a", borderRadius: "4px", width: "40%", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch blog posts with React Query
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div suppressHydrationWarning>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .blog-grid {
          display: grid;
          gap: 28px;
        }
        @media (max-width: 640px) {
          .blog-grid { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .blog-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (min-width: 1024px) {
          .blog-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        }
        
        .blog-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .blog-card:hover {
          border-color: #ffd700;
          transform: translateY(-4px);
        }
        .blog-card-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        .blog-card-content {
          padding: 20px;
        }
        .blog-type {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .blog-type.article { background: #ffd700; color: #000; }
        .blog-type.video { background: #ff6600; color: #fff; }
        .blog-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.3;
        }
        .blog-date {
          color: #666;
          font-size: 12px;
        }
        .pagination-btn {
          padding: 8px 16px;
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pagination-btn:hover:not(:disabled) {
          border-color: #ffd700;
          color: #ffd700;
        }
        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .pagination-active {
          background: #ffd700;
          color: #000;
          border-color: #ffd700;
        }
      `}</style>

      {/* Header */}
      <div suppressHydrationWarning style={{ marginBottom: "40px" }}>
        <h1 suppressHydrationWarning style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "600", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          News & <span style={{ color: "#ffd700" }}>Updates</span>
        </h1>
        <p suppressHydrationWarning style={{ color: "#888888", fontSize: "14px" }}>
          {!isLoading && `${posts.length} articles and videos`}
        </p>
      </div>

      {/* Blog Grid */}
      {isLoading ? (
        <div className="blog-grid" suppressHydrationWarning>
          {[...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)}
        </div>
      ) : paginatedPosts.length === 0 ? (
        <div suppressHydrationWarning style={{ textAlign: "center", padding: "80px 20px", background: "#0a0a0a", borderRadius: "24px" }}>
          <p style={{ color: "#888888" }}>No posts yet. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="blog-grid" suppressHydrationWarning>
            {paginatedPosts.map((post) => (
              <div
                key={post.id}
                className="blog-card"
                onClick={() => router.push(`/blog/${post.id}`)}
                suppressHydrationWarning
              >
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="blog-card-image"
                    loading="lazy"
                    suppressHydrationWarning
                  />
                )}
                <div className="blog-card-content" suppressHydrationWarning>
                  <span className={`blog-type ${post.type}`} suppressHydrationWarning>
                    {post.type === "video" ? "VIDEO" : "ARTICLE"}
                  </span>
                  <h3 className="blog-title" suppressHydrationWarning>{post.title}</h3>
                  <p className="blog-date" suppressHydrationWarning>
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div suppressHydrationWarning style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              gap: "12px", 
              marginTop: "32px",
              flexWrap: "wrap"
            }}>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                suppressHydrationWarning
              >
                Previous
              </button>
              
              <div suppressHydrationWarning style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? "pagination-active" : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                      suppressHydrationWarning
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span suppressHydrationWarning style={{ color: "#888", padding: "8px 8px" }}>...</span>
                )}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    suppressHydrationWarning
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                suppressHydrationWarning
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}