"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewBlogPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "article",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const uploadToSupabase = async (file: File, path: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    if (!response.ok) throw new Error((await response.json()).error);
    return (await response.json()).url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const postId = crypto.randomUUID();
      let coverImageUrl = null;
      let videoUrl = null;
      
      if (coverImage) {
        const ext = coverImage.name.split(".").pop();
        const path = `blog/${postId}/cover.${ext}`;
        coverImageUrl = await uploadToSupabase(coverImage, path);
      }

      if (videoFile && formData.type === "video") {
        const ext = videoFile.name.split(".").pop();
        const path = `blog/${postId}/video.${ext}`;
        videoUrl = await uploadToSupabase(videoFile, path);
      }

      const postData = {
        id: postId,
        title: formData.title,
        content: formData.content || "",
        type: formData.type,
        video_url: videoUrl,
        cover_image: coverImageUrl,
        published_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("blog_posts").insert([postData]);
      if (error) throw error;
      
      alert("Blog post published successfully!");
      router.push("/admin/blog");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <AdminGuard>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>New Blog Post</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>Share news, updates, or videos</p>
          </div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ff3b30", borderRadius: "8px", color: "#ff3b30", cursor: "pointer" }}>Logout</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Title *</label><input type="text" name="title" required value={formData.title} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Post Type *</label><select name="type" value={formData.type} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }}><option value="article">Article</option><option value="video">Video</option></select></div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} />
            {coverPreview && <img src={coverPreview} alt="Preview" style={{ marginTop: "12px", width: "200px", borderRadius: "8px" }} />}
          </div>

          {formData.type === "video" && (
            <div style={{ marginTop: "20px" }}>
              <label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Video File (MP4, MOV, etc.)</label>
              <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} />
              {videoPreview && <video src={videoPreview} controls style={{ marginTop: "12px", width: "100%", maxHeight: "200px", borderRadius: "8px" }} />}
              <p style={{ color: "#666", fontSize: "11px", marginTop: "4px" }}>Maximum file size: 50MB (recommended)</p>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Content *</label>
            <textarea name="content" rows={10} required value={formData.content} onChange={handleChange} placeholder="Write your blog post content here..." style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff", resize: "vertical" }} />
          </div>

          <div style={{ marginTop: "32px" }}>
            <button type="submit" disabled={loading} style={{ padding: "14px 32px", background: loading ? "#666" : "#ffd700", border: "none", borderRadius: "8px", color: "#000", fontSize: "14px", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Publishing..." : "Publish Post"}</button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}