"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
  condition: string;
  features: string[];
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!error && data) {
      setProduct(data);
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

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ color: "#888888" }}>Product not found</p>
      </div>
    );
  }

  const displayThumbnails = showAllImages ? product.images || [] : (product.images?.slice(0, 4) || []);
  const hiddenImagesCount = (product.images?.length || 0) - 4;
  const displayFeatures = showAllFeatures ? product.features || [] : (product.features?.slice(0, 6) || []);
  const hiddenFeaturesCount = (product.features?.length || 0) - 6;

  return (
    <div>
      <style>{`
        .detail-container { display: grid; gap: 24px; width: 100%; overflow-x: hidden; }
        @media (max-width: 768px) { .detail-container { grid-template-columns: 1fr; gap: 20px; } }
        @media (min-width: 769px) { .detail-container { grid-template-columns: 1fr 1fr; gap: 32px; } }
        .main-image { width: 100%; aspect-ratio: 16/11; object-fit: cover; border-radius: 16px; background: #111; }
        .thumbnail-container { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .thumbnail { width: calc(25% - 6px); max-width: 80px; aspect-ratio: 1/1; object-fit: cover; border-radius: 10px; cursor: pointer; border: 2px solid transparent; }
        .thumbnail:hover { border-color: #ffd700; }
        .more-badge, .show-less-badge { width: calc(25% - 6px); max-width: 80px; aspect-ratio: 1/1; background: #1a1a1a; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #ffd700; border: 1px solid #333; cursor: pointer; }
        .more-badge:hover, .show-less-badge:hover { background: #ffd700; color: #000; }
        .specs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px; background: #0a0a0a; border-radius: 16px; border: 1px solid #1a1a1a; margin-bottom: 20px; }
        .features-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .feature-tag { padding: 6px 14px; background: #111111; border: 1px solid #222222; border-radius: 20px; font-size: 12px; color: #ccc; }
        .show-more-features { display: inline-block; padding: 6px 14px; background: transparent; border: 1px solid #ffd700; border-radius: 20px; font-size: 12px; color: #ffd700; cursor: pointer; margin-top: 4px; }
        .show-more-features:hover { background: rgba(255,215,0,0.1); }
        .action-buttons { display: flex; gap: 12px; margin-top: 20px; }
        @media (max-width: 640px) { .action-buttons { flex-direction: column; gap: 10px; } }
        .btn-primary { flex: 1; padding: 14px; background: #ffd700; border: none; border-radius: 10px; color: #000; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-primary:hover { background: #e6c200; }
        .btn-secondary { flex: 1; padding: 14px; background: transparent; border: 1px solid #ffd700; border-radius: 10px; color: #ffd700; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-secondary:hover { background: rgba(255,215,0,0.1); }
        .btn-disabled { flex: 1; padding: 14px; background: #2a2a2a; border: none; border-radius: 10px; color: #888; font-size: 14px; font-weight: 600; cursor: not-allowed; }
        .price-primary { color: #ffd700; font-size: 28px; font-weight: 700; }
        @media (max-width: 640px) { .price-primary { font-size: 24px; } }
      `}</style>

      <div className="detail-container">
        <div>
          <img src={product.images?.[selectedImage] || "/placeholder.jpg"} alt={product.name} className="main-image" />
          {product.images && product.images.length > 0 && (
            <div className="thumbnail-container">
              {displayThumbnails.map((img, idx) => (
                <img key={idx} src={img} className="thumbnail" style={{ borderColor: selectedImage === idx ? "#ffd700" : "transparent", opacity: selectedImage === idx ? 1 : 0.6 }} onClick={() => setSelectedImage(idx)} />
              ))}
              {!showAllImages && hiddenImagesCount > 0 && <div className="more-badge" onClick={() => setShowAllImages(true)}>+{hiddenImagesCount}</div>}
              {showAllImages && <div className="show-less-badge" onClick={() => setShowAllImages(false)}>−</div>}
            </div>
          )}
        </div>

        <div>
          <div style={{ marginBottom: "16px" }}>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: "600", marginBottom: "4px" }}>{product.name}</h1>
            {product.brand && <p style={{ color: "#666666", fontSize: "13px" }}>{product.brand}</p>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p className="price-primary">${product.price}</p>
          </div>

          <div className="specs-grid">
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Category</p><p style={{ fontSize: "13px", fontWeight: "500" }}>{product.category}</p></div>
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Condition</p><p style={{ fontSize: "13px", fontWeight: "500" }}>{product.condition}</p></div>
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Stock Status</p><p style={{ fontSize: "13px", fontWeight: "500", color: product.stock > 0 ? "#00c853" : "#ff3b30" }}>{product.stock > 0 ? "In Stock" : "Out of Stock"}</p></div>
          </div>

          {product.description && (
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Description</h3>
              <p style={{ color: "#ccc", fontSize: "12px", lineHeight: "1.5" }}>{product.description}</p>
            </div>
          )}

          {product.features && product.features.length > 0 && product.features[0] !== "" && (
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Key Features</h3>
              <div className="features-list">
                {displayFeatures.map((feature, idx) => <span key={idx} className="feature-tag">{feature}</span>)}
              </div>
              {!showAllFeatures && hiddenFeaturesCount > 0 && <button className="show-more-features" onClick={() => setShowAllFeatures(true)}>+ Show {hiddenFeaturesCount} more</button>}
              {showAllFeatures && <button className="show-more-features" onClick={() => setShowAllFeatures(false)}>− Show less</button>}
            </div>
          )}

          <div className="action-buttons">
            {product.stock === 0 ? <button className="btn-disabled">OUT OF STOCK</button> : <button className="btn-primary">ADD TO CART</button>}
            <button className="btn-secondary">INQUIRE</button>
          </div>
        </div>
      </div>
    </div>
  );
}