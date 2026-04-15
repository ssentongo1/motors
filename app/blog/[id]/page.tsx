"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BlogPost {
  id: string;
  title: string;
  cover_image: string;
  content: string;
  type: string;
  video_url: string;
  published_at: string;
}

export default function BlogDetail() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, []);

  async function fetchPost() {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!error && data) {
      setPost(data);
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

  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ color: "#888888" }}>Post not found</p>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .blog-detail-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .blog-detail-content p {
          color: #cccccc;
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 20px;
        }
        @media (max-width: 768px) {
          .blog-detail-content p {
            font-size: 14px;
            line-height: 1.6;
          }
        }
      `}</style>

      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "20px", marginBottom: "32px" }} />
      )}

      <div className="blog-detail-content">
        <div style={{ marginBottom: "24px" }}>
          <span style={{ display: "inline-block", padding: "4px 12px", background: post.type === "video" ? "#ff6600" : "#ffd700", borderRadius: "20px", fontSize: "11px", fontWeight: "600", color: post.type === "video" ? "#fff" : "#000", marginBottom: "16px" }}>
            {post.type === "video" ? "VIDEO" : "ARTICLE"}
          </span>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: "600", marginBottom: "12px", letterSpacing: "-0.5px" }}>
            {post.title}
          </h1>
          <p style={{ color: "#666666", fontSize: "14px" }}>
            {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {post.type === "video" && post.video_url && (
          <div style={{ marginBottom: "32px" }}>
            <video 
              src={post.video_url} 
              controls 
              style={{ width: "100%", borderRadius: "16px", maxHeight: "400px" }}
              poster={post.cover_image || undefined}
            />
          </div>
        )}

        <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br/>") }} />
      </div>
    </div>
  );
}