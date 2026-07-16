"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Image compression function
async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Compression failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export default function NewCar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);
  
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    price_usd: "",
    price_ugx: "",
    mileage: "",
    transmission: "",
    fuel_type: "",
    engine_size: "",
    color: "",
    condition: "Used",
    description: "",
    features: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 9) {
      alert("Maximum 9 images allowed");
      return;
    }
    
    setCompressing(true);
    try {
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file, 1200, 0.8))
      );
      setImages([...images, ...compressedFiles]);
    } catch (error) {
      alert("Error compressing images. Please try again.");
    } finally {
      setCompressing(false);
    }
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
      const carId = crypto.randomUUID();
      const imageUrls = [];
      for (let i = 0; i < images.length; i++) {
        const ext = "jpg"; // Always jpg after compression
        const url = await uploadToSupabase(images[i], `cars/${carId}/image_${i + 1}.${ext}`);
        imageUrls.push(url);
      }
      let videoUrl = null;
      if (video) {
        const ext = video.name.split(".").pop();
        videoUrl = await uploadToSupabase(video, `cars/${carId}/video.${ext}`);
      }
      const carData = {
        id: carId,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        price_usd: parseFloat(formData.price_usd),
        price_ugx: parseFloat(formData.price_ugx),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        engine_size: formData.engine_size || null,
        color: formData.color || null,
        condition: formData.condition,
        description: formData.description || null,
        features: featuresArray,
        images: imageUrls,
        video_url: videoUrl,
      };
      const { error } = await supabase.from("cars").insert([carData]);
      if (error) throw error;
      alert("Car added successfully!");
      router.push("/admin/cars");
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
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>Add New Car</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>Fill in all details about the vehicle</p>
          </div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ff3b30", borderRadius: "8px", color: "#ff3b30", cursor: "pointer" }}>Logout</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Brand *</label><input type="text" name="brand" required value={formData.brand} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Model *</label><input type="text" name="model" required value={formData.model} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Year *</label><input type="number" name="year" required value={formData.year} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Price (USD) *</label><input type="number" name="price_usd" required value={formData.price_usd} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Price (UGX) *</label><input type="number" name="price_ugx" required value={formData.price_ugx} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Mileage (miles)</label><input type="number" name="mileage" value={formData.mileage} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Transmission *</label><select name="transmission" required value={formData.transmission} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }}><option value="">Select</option><option value="Automatic">Automatic</option><option value="Manual">Manual</option><option value="Semi-Automatic">Semi-Automatic</option></select></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Fuel Type *</label><select name="fuel_type" required value={formData.fuel_type} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }}><option value="">Select</option><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option></select></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Engine Size</label><input type="text" name="engine_size" placeholder="e.g., 3.0L V6" value={formData.engine_size} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Color</label><input type="text" name="color" value={formData.color} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Condition *</label><select name="condition" value={formData.condition} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }}><option value="New">New</option><option value="Used">Used</option><option value="Certified Pre-Owned">Certified Pre-Owned</option></select></div>
          </div>

          <div style={{ marginTop: "20px" }}><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Description</label><textarea name="description" rows={4} value={formData.description} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff", resize: "vertical" }} /></div>
          <div style={{ marginTop: "20px" }}><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Features (comma separated)</label><input type="text" name="features" placeholder="ABS, Airbags, Sunroof, Backup Camera" value={formData.features} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>

          {/* Images Upload with Compression */}
          <div style={{ marginTop: "24px" }}>
            <label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>
              Images (up to 9) - Drag to reorder {compressing && <span style={{ color: "#ffd700" }}>⏳ Compressing...</span>}
            </label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageUpload} 
              disabled={compressing}
              style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} 
            />
            <p style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
              {images.length} / 9 images selected {images.length > 0 && `(Compressed to ~1200px width)`}
            </p>
            {images.length > 0 && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                {images.map((img, idx) => (
                  <div key={idx} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd} style={{ position: "relative", cursor: "grab", opacity: draggedIndex === idx ? 0.5 : 1 }}>
                    <img src={URL.createObjectURL(img)} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                    <div style={{ position: "absolute", top: "4px", left: "4px", background: "rgba(0,0,0,0.7)", borderRadius: "4px", padding: "2px 6px", fontSize: "11px", color: "#ffd700" }}>{idx + 1}</div>
                    <div style={{ position: "absolute", bottom: "4px", left: "4px", background: "rgba(0,0,0,0.5)", borderRadius: "4px", padding: "1px 6px", fontSize: "9px", color: "#888" }}>{(img.size / 1024).toFixed(0)}KB</div>
                    <button type="button" onClick={() => removeImage(idx)} style={{ position: "absolute", top: "-8px", right: "-8px", width: "24px", height: "24px", background: "#ff3b30", border: "none", borderRadius: "50%", color: "white", cursor: "pointer" }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <p style={{ color: "#666", fontSize: "11px", marginTop: "8px" }}>💡 Images are automatically compressed to ~1200px width for faster loading</p>
          </div>

          {/* Video Upload */}
          <div style={{ marginTop: "20px" }}>
            <label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Video (30 seconds max)</label>
            <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} />
            {video && <p style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>Selected: {video.name} ({(video.size / (1024 * 1024)).toFixed(2)} MB)</p>}
          </div>

          <div style={{ marginTop: "32px" }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ padding: "14px 32px", background: loading ? "#666" : "#ffd700", border: "none", borderRadius: "8px", color: "#000", fontSize: "14px", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Adding..." : "Add Car"}
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}