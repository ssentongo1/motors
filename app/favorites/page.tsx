"use client";

import { useEffect, useState } from "react";
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

export default function FavoritesPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const session = localStorage.getItem("motors_session_id") || crypto.randomUUID();
    setSessionId(session);
    fetchFavorites(session);
  }, []);

  async function fetchFavorites(session: string) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("car_id")
      .eq("session_id", session);

    if (favorites && favorites.length > 0) {
      const carIds = favorites.map(f => f.car_id);
      const { data: carsData } = await supabase
        .from("cars")
        .select("*")
        .in("id", carIds);
      
      setCars(carsData || []);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ color: "#888888" }}>Loading saved vehicles...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "600", marginBottom: "8px" }}>Saved Vehicles</h1>
        <p style={{ color: "#888888" }}>Cars you've marked as favorites</p>
      </div>

      {cars.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px", background: "#0a0a0a", borderRadius: "20px", border: "1px solid #1a1a1a" }}>
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "28px"
        }}>
          {cars.map((car) => (
            <div
              key={car.id}
              onClick={() => router.push(`/car/${car.id}`)}
              style={{
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                borderRadius: "20px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              <div style={{ height: "200px", background: "#111111" }}>
                {car.images && car.images[0] ? (
                  <img
                    src={car.images[0]}
                    alt={car.model}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#444" }}>
                    No image
                  </div>
                )}
              </div>
              <div style={{ padding: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                  {car.brand} {car.model}
                </h3>
                <p style={{ color: "#666666", fontSize: "13px", marginBottom: "12px" }}>{car.year}</p>
                <p style={{ color: "#ffd700", fontSize: "20px", fontWeight: "700" }}>
                  ${car.price_usd?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}