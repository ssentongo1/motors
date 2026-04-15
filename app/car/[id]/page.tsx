"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_usd: number;
  price_ugx: number;
  mileage: number;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  color: string;
  condition: string;
  description: string;
  features: string[];
  images: string[];
  video_url: string;
  status: string;
}

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function CarDetail() {
  const params = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCar();
    fetchReviews();
  }, []);

  async function fetchCar() {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!error && data) {
      setCar(data);
    }
    setLoading(false);
  }

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("car_id", params.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) {
      alert("Please fill in all fields");
      return;
    }
    
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      car_id: params.id,
      customer_name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });

    if (error) {
      alert("Error submitting review: " + error.message);
    } else {
      alert("Review submitted! Thank you for your feedback.");
      setReviewForm({ name: "", rating: 5, comment: "" });
      setShowReviewForm(false);
      fetchReviews();
    }
    setSubmitting(false);
  }

  const openWhatsApp = () => {
    if (!car) return;
    const message = `Hello, I'm interested in the ${car.brand} ${car.model} (${car.year})\n\nPrice: UGX ${car.price_ugx?.toLocaleString()} ($${car.price_usd?.toLocaleString()} USD)\n\nView listing: ${window.location.href}\n\nIs this vehicle still available?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/256123456789?text=${encodedMessage}`, "_blank");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: "40px", height: "40px", border: "2px solid #1a1a1a", borderTopColor: "#ffd700", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ color: "#888888" }}>Car not found</p>
      </div>
    );
  }

  const displayThumbnails = showAllImages ? car.images || [] : (car.images?.slice(0, 4) || []);
  const hiddenImagesCount = (car.images?.length || 0) - 4;
  const displayFeatures = showAllFeatures ? car.features || [] : (car.features?.slice(0, 6) || []);
  const hiddenFeaturesCount = (car.features?.length || 0) - 6;

  return (
    <div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
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
        .feature-tag { padding: 6px 14px; background: #111; border: 1px solid #222; border-radius: 20px; font-size: 12px; color: #ccc; }
        .show-more-features { display: inline-block; padding: 6px 14px; background: transparent; border: 1px solid #ffd700; border-radius: 20px; font-size: 12px; color: #ffd700; cursor: pointer; margin-top: 4px; }
        .show-more-features:hover { background: rgba(255,215,0,0.1); }
        
        .action-buttons { display: flex; gap: 12px; margin-top: 20px; margin-bottom: 32px; }
        @media (max-width: 640px) { .action-buttons { flex-direction: column; gap: 10px; } }
        
        .btn-primary { flex: 1; padding: 14px; background: #25D366; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-secondary { flex: 1; padding: 14px; background: #ffd700; border: none; border-radius: 10px; color: #000; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-secondary:hover { background: #e6c200; }
        .btn-disabled { flex: 1; padding: 14px; background: #2a2a2a; border: none; border-radius: 10px; color: #888; font-size: 14px; font-weight: 600; cursor: not-allowed; }
        
        .price-primary { color: #ffd700; font-size: 28px; font-weight: 700; }
        @media (max-width: 640px) { .price-primary { font-size: 24px; } }
        
        .review-card { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .stars { color: #ffd700; font-size: 18px; letter-spacing: 2px; }
        .review-form { background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 16px; padding: 20px; margin-top: 16px; }
        .review-input { width: 100%; padding: 12px; background: #111; border: 1px solid #222; border-radius: 8px; color: #fff; font-size: 14px; margin-bottom: 12px; }
        .review-input:focus { outline: none; border-color: #ffd700; }
        .rating-select { padding: 10px; background: #111; border: 1px solid #222; border-radius: 8px; color: #ffd700; font-size: 14px; margin-bottom: 12px; }
      `}</style>

      <div className="detail-container">
        {/* Left Column - Images */}
        <div>
          <img src={car.images?.[selectedImage] || "/placeholder.jpg"} alt={`${car.brand} ${car.model}`} className="main-image" />
          {car.images && car.images.length > 0 && (
            <div className="thumbnail-container">
              {displayThumbnails.map((img, idx) => (
                <img key={idx} src={img} className="thumbnail" style={{ borderColor: selectedImage === idx ? "#ffd700" : "transparent", opacity: selectedImage === idx ? 1 : 0.6 }} onClick={() => setSelectedImage(idx)} />
              ))}
              {!showAllImages && hiddenImagesCount > 0 && <div className="more-badge" onClick={() => setShowAllImages(true)}>+{hiddenImagesCount}</div>}
              {showAllImages && <div className="show-less-badge" onClick={() => setShowAllImages(false)}>−</div>}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div>
          <div style={{ marginBottom: "16px" }}>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: "600", marginBottom: "4px" }}>{car.brand} {car.model}</h1>
            <p style={{ color: "#666", fontSize: "13px" }}>{car.year}</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p className="price-primary">UGX {car.price_ugx?.toLocaleString()}</p>
            <p style={{ color: "#888", fontSize: "13px" }}>${car.price_usd?.toLocaleString()} USD</p>
          </div>

          <div className="specs-grid">
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Mileage</p><p style={{ fontSize: "13px", fontWeight: "500" }}>{car.mileage?.toLocaleString() || 0} mi</p></div>
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Transmission</p><p style={{ fontSize: "13px", fontWeight: "500" }}>{car.transmission}</p></div>
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Fuel Type</p><p style={{ fontSize: "13px", fontWeight: "500" }}>{car.fuel_type}</p></div>
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Engine</p><p style={{ fontSize: "13px", fontWeight: "500" }}>{car.engine_size || "N/A"}</p></div>
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Color</p><p style={{ fontSize: "13px", fontWeight: "500" }}>{car.color || "N/A"}</p></div>
            <div><p style={{ color: "#666", fontSize: "10px", marginBottom: "2px" }}>Condition</p><p style={{ fontSize: "13px", fontWeight: "500" }}>{car.condition}</p></div>
          </div>

          {car.description && (
            <div style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Overview</h3>
              <p style={{ color: "#ccc", fontSize: "12px", lineHeight: "1.5" }}>{car.description}</p>
            </div>
          )}

          {car.features && car.features.length > 0 && car.features[0] !== "" && (
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Key Features</h3>
              <div className="features-list">
                {displayFeatures.map((feature, idx) => <span key={idx} className="feature-tag">{feature}</span>)}
              </div>
              {!showAllFeatures && hiddenFeaturesCount > 0 && <button className="show-more-features" onClick={() => setShowAllFeatures(true)}>+ Show {hiddenFeaturesCount} more</button>}
              {showAllFeatures && <button className="show-more-features" onClick={() => setShowAllFeatures(false)}>− Show less</button>}
            </div>
          )}

          {car.video_url && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Video Walkthrough</h3>
              <video src={car.video_url} controls style={{ width: "100%", borderRadius: "12px" }} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {car.status === "Sold" ? (
              <button className="btn-disabled">SOLD OUT</button>
            ) : (
              <button className="btn-primary" onClick={openWhatsApp}>💬 INQUIRE ON WhatsApp</button>
            )}
            <button className="btn-secondary" onClick={() => setShowReviewForm(!showReviewForm)}>⭐ WRITE REVIEW</button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="review-form">
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Share Your Experience</h3>
              <form onSubmit={submitReview}>
                <input type="text" placeholder="Your Name *" value={reviewForm.name} onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})} className="review-input" required />
                <select value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})} className="rating-select">
                  <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                  <option value="4">⭐⭐⭐⭐ - Very Good</option>
                  <option value="3">⭐⭐⭐ - Good</option>
                  <option value="2">⭐⭐ - Fair</option>
                  <option value="1">⭐ - Poor</option>
                </select>
                <textarea rows={3} placeholder="Your Review *" value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} className="review-input" required />
                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="submit" disabled={submitting} style={{ padding: "10px 20px", background: "#ffd700", border: "none", borderRadius: "8px", color: "#000", fontWeight: "600", cursor: "pointer" }}>{submitting ? "Submitting..." : "Submit Review"}</button>
                  <button type="button" onClick={() => setShowReviewForm(false)} style={{ padding: "10px 20px", background: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#888", cursor: "pointer" }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Customer Reviews ({reviews.length})</h3>
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "600" }}>{review.customer_name}</span>
                    <div className="stars">{"⭐".repeat(review.rating)}</div>
                  </div>
                  <p style={{ color: "#ccc", fontSize: "13px", lineHeight: "1.5" }}>{review.comment}</p>
                  <p style={{ color: "#666", fontSize: "10px", marginTop: "8px" }}>{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}