"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

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
  images: string[];
  status: string;
}

// Skeleton Loader
function FavoriteCardSkeleton() {
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "20px", overflow: "hidden" }}>
      <div style={{ height: "200px", background: "#111", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "20px" }}>
        <div style={{ height: "20px", background: "#1a1a1a", borderRadius: "4px", marginBottom: "8px", width: "70%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: "14px", background: "#1a1a1a", borderRadius: "4px", marginBottom: "8px", width: "30%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: "20px", background: "#1a1a1a", borderRadius: "4px", width: "40%", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const session = localStorage.getItem("motors_session_id") || crypto.randomUUID();
    setSessionId(session);
  }, []);

  // Fetch favorite car IDs
  const { data: favoriteIds = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["favorites", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data } = await supabase
        .from("favorites")
        .select("car_id")
        .eq("session_id", sessionId);
      return data?.map(f => f.car_id) || [];
    },
    enabled: !!sessionId,
    staleTime: 60 * 1000, // 1 minute cache
  });

  // Fetch favorite cars
  const { data: cars = [], isLoading: isLoadingCars } = useQuery({
    queryKey: ["favorite_cars", favoriteIds],
    queryFn: async () => {
      if (favoriteIds.length === 0) return [];
      const { data } = await supabase
        .from("cars")
        .select("*")
        .in("id", favoriteIds);
      return data || [];
    },
    enabled: favoriteIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const isLoading = isLoadingFavorites || isLoadingCars;

  return (
    <div suppressHydrationWarning>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .fav-grid {
          display: grid;
          gap: 24px;
        }
        @media (max-width: 640px) {
          .fav-grid { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .fav-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (min-width: 1024px) {
          .fav-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        }
        @media (min-width: 1440px) {
          .fav-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; }
        }
        .fav-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .fav-card:hover {
          border-color: #ffd700;
          transform: translateY(-4px);
        }
        .fav-card-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        .fav-card-content {
          padding: 20px;
        }
        .fav-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .fav-year {
          color: #666;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .fav-price {
          color: #ffd700;
          font-size: 20px;
          font-weight: 700;
        }
      `}</style>

      {/* Header */}
      <div suppressHydrationWarning style={{ marginBottom: "32px" }}>
        <h1 suppressHydrationWarning style={{ fontSize: "32px", fontWeight: "600", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Saved Vehicles
        </h1>
        <p suppressHydrationWarning style={{ color: "#888888", fontSize: "14px" }}>
          {!isLoading && `${cars.length} cars in your favorites`}
        </p>
      </div>

      {/* Favorites Grid */}
      {isLoading ? (
        <div className="fav-grid" suppressHydrationWarning>
          {[...Array(4)].map((_, i) => <FavoriteCardSkeleton key={i} />)}
        </div>
      ) : cars.length === 0 ? (
        <div suppressHydrationWarning style={{ textAlign: "center", padding: "80px 20px", background: "#0a0a0a", borderRadius: "24px" }}>
          <p style={{ color: "#888888", marginBottom: "16px" }}>No saved vehicles yet</p>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "12px 24px",
              background: "#ffd700",
              border: "none",
              borderRadius: "8px",
              color: "#000000",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Browse Cars
          </button>
        </div>
      ) : (
        <div className="fav-grid" suppressHydrationWarning>
          {cars.map((car) => (
            <div
              key={car.id}
              className="fav-card"
              onClick={() => router.push(`/car/${car.id}`)}
              suppressHydrationWarning
            >
              <div style={{ position: "relative" }}>
                <img
                  src={car.images?.[0] || "/placeholder.jpg"}
                  alt={`${car.brand} ${car.model}`}
                  className="fav-card-image"
                  loading="lazy"
                  suppressHydrationWarning
                />
                {car.status === "Sold" && (
                  <div suppressHydrationWarning style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.85)",
                    color: "#ff3b30",
                    padding: "8px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}>
                    SOLD
                  </div>
                )}
              </div>
              <div className="fav-card-content" suppressHydrationWarning>
                <h3 className="fav-title" suppressHydrationWarning>{car.brand} {car.model}</h3>
                <p className="fav-year" suppressHydrationWarning>{car.year}</p>
                <p className="fav-price" suppressHydrationWarning>
                  UGX {car.price_ugx?.toLocaleString()}
                </p>
                <p style={{ color: "#888", fontSize: "11px", marginTop: "4px" }} suppressHydrationWarning>
                  ${car.price_usd?.toLocaleString()} USD
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}