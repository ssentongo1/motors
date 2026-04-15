"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    description: "",
    stock: "",
    condition: "New",
    features: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 9) {
      alert("Maximum 9 images allowed");
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

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
      const featuresArray = formData.features.split(",").map(f => f.trim()).filter(f => f);
      const productId = crypto.randomUUID();
      const imageUrls = [];
      for (let i = 0; i < images.length; i++) {
        const ext = images[i].name.split(".").pop();
        const url = await uploadToSupabase(images[i], `products/${productId}/image_${i + 1}.${ext}`);
        imageUrls.push(url);
      }
      const productData = {
        id: productId,
        name: formData.name,
        brand: formData.brand || null,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description || null,
        stock: parseInt(formData.stock) || 0,
        condition: formData.condition,
        features: featuresArray,
        images: imageUrls,
        status: parseInt(formData.stock) > 0 ? "In Stock" : "Out of Stock",
      };
      const { error } = await supabase.from("shop_products").insert([productData]);
      if (error) throw error;
      alert("Product added successfully!");
      router.push("/admin/shop");
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
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>Add New Product</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>Fill in all details about the product</p>
          </div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ff3b30", borderRadius: "8px", color: "#ff3b30", cursor: "pointer" }}>Logout</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Product Name *</label><input type="text" name="name" required value={formData.name} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Brand</label><input type="text" name="brand" placeholder="e.g., Bosch, Sony" value={formData.brand} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Category *</label><input type="text" name="category" required placeholder="e.g., Accessories, Parts" value={formData.category} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Price (USD) *</label><input type="number" name="price" required step="0.01" value={formData.price} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Stock Quantity *</label><input type="number" name="stock" required value={formData.stock} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Condition</label><select name="condition" value={formData.condition} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }}><option value="New">New</option><option value="Like New">Like New</option><option value="Refurbished">Refurbished</option></select></div>
          </div>

          <div style={{ marginTop: "20px" }}><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Description</label><textarea name="description" rows={4} value={formData.description} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff", resize: "vertical" }} /></div>
          <div style={{ marginTop: "20px" }}><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Features (comma separated)</label><input type="text" name="features" placeholder="Durable, Waterproof, 1 Year Warranty" value={formData.features} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>

          {/* Images Upload */}
          <div style={{ marginTop: "24px" }}>
            <label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Product Images (up to 9) - Drag to reorder</label>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} />
            <p style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>{images.length} / 9 images selected</p>
            {images.length > 0 && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                {images.map((img, idx) => (
                  <div key={idx} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd} style={{ position: "relative", cursor: "grab", opacity: draggedIndex === idx ? 0.5 : 1 }}>
                    <img src={URL.createObjectURL(img)} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                    <div style={{ position: "absolute", top: "4px", left: "4px", background: "rgba(0,0,0,0.7)", borderRadius: "4px", padding: "2px 6px", fontSize: "11px", color: "#ffd700" }}>{idx + 1}</div>
                    <button type="button" onClick={() => removeImage(idx)} style={{ position: "absolute", top: "-8px", right: "-8px", width: "24px", height: "24px", background: "#ff3b30", border: "none", borderRadius: "50%", color: "white", cursor: "pointer" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: "32px" }}>
            <button type="submit" disabled={loading} style={{ padding: "14px 32px", background: loading ? "#666" : "#ffd700", border: "none", borderRadius: "8px", color: "#000", fontSize: "14px", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Adding..." : "Add Product"}</button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}