"use client";

import { useEffect, useState } from "react";
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

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: "40px", height: "40px", border: "2px solid #1a1a1a", borderTopColor: "#ffd700", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
      `}</style>

      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "600", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          News & <span style={{ color: "#ffd700" }}>Updates</span>
        </h1>
        <p style={{ color: "#888888", fontSize: "14px" }}>Latest automotive news, reviews, and videos</p>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#0a0a0a", borderRadius: "24px" }}>
          <p style={{ color: "#888888" }}>No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <div key={post.id} className="blog-card" onClick={() => router.push(`/blog/${post.id}`)}>
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="blog-card-image" />
              )}
              <div className="blog-card-content">
                <span className={`blog-type ${post.type}`}>{post.type === "video" ? "VIDEO" : "ARTICLE"}</span>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-date">{new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}