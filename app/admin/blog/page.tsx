"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BlogPost {
  id: string;
  title: string;
  cover_image: string;
  type: string;
  published_at: string;
}

export default function AdminBlog() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      fetchPosts();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <AdminGuard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ width: "40px", height: "40px", border: "2px solid #1a1a1a", borderTopColor: "#ffd700", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .logout-btn {
            padding: 8px 16px;
            background: transparent;
            border: 1px solid #ff3b30;
            border-radius: 8px;
            color: #ff3b30;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s ease;
          }
          .logout-btn:hover {
            background: rgba(255,59,48,0.1);
          }
          .type-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
          }
          .type-article {
            background: #ffd700;
            color: #000;
          }
          .type-video {
            background: #ff6600;
            color: white;
          }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>Manage Blog</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>Add, edit, or remove blog posts</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <a
              href="/admin/blog/new"
              style={{
                padding: "10px 20px",
                background: "#ffd700",
                border: "none",
                borderRadius: "8px",
                color: "#000000",
                fontSize: "13px",
                fontWeight: "500",
                textDecoration: "none"
              }}
            >
              + New Post
            </a>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "#111111",
            border: "1px solid #222222",
            borderRadius: "8px",
            color: "#ffffff",
            fontSize: "14px",
            marginBottom: "20px",
            outline: "none"
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "#ffd700"}
          onBlur={(e) => e.currentTarget.style.borderColor = "#222222"}
        />

        {paginatedPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#0a0a0a", borderRadius: "12px", border: "1px solid #1a1a1a" }}>
            <p style={{ color: "#888888", marginBottom: "16px" }}>No blog posts yet.</p>
            <a href="/admin/blog/new" style={{ padding: "10px 20px", background: "#ffd700", borderRadius: "8px", color: "#000", textDecoration: "none" }}>Create Your First Post</a>
          </div>
        ) : (
          <>
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a", background: "#050505" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Image</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Title</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Type</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Date</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPosts.map((post) => (
                    <tr key={post.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td style={{ padding: "16px" }}>
                        {post.cover_image ? (
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ width: "50px", height: "50px", background: "#1a1a1a", borderRadius: "8px" }} />
                        )}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", fontWeight: "500" }}>{post.title}</td>
                      <td style={{ padding: "16px" }}>
                        <span className={`type-badge ${post.type === "video" ? "type-video" : "type-article"}`}>
                          {post.type === "video" ? "VIDEO" : "ARTICLE"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "#888" }}>{new Date(post.published_at).toLocaleDateString()}</td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
                            style={{ padding: "6px 12px", background: "transparent", border: "1px solid #ffd700", borderRadius: "6px", color: "#ffd700", fontSize: "12px", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            style={{ padding: "6px 12px", background: "transparent", border: "1px solid #ff3b30", borderRadius: "6px", color: "#ff3b30", fontSize: "12px", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "8px 16px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: currentPage === 1 ? "#666" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  Previous
                </button>
                <span style={{ padding: "8px 16px", color: "#888" }}>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "8px 16px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: currentPage === totalPages ? "#666" : "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminGuard>
  );
}