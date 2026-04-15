"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

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

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("shop_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        
        .shop-grid {
          display: grid;
          gap: 24px;
        }
        
        @media (max-width: 640px) {
          .shop-grid { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .shop-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        @media (min-width: 1024px) {
          .shop-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        }
        @media (min-width: 1440px) {
          .shop-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; }
        }
        
        .product-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .product-card:hover {
          border-color: #ffd700;
          transform: translateY(-4px);
        }
        .product-card-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .product-card:hover .product-card-image {
          transform: scale(1.05);
        }
        @media (max-width: 640px) {
          .product-card-image { height: 200px; }
        }
      `}</style>

      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "600", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Shop <span style={{ color: "#ffd700" }}>Accessories</span>
        </h1>
        <p style={{ color: "#888888", fontSize: "14px" }}>Premium parts and accessories for your vehicle</p>
      </div>

      <div style={{ maxWidth: "500px", marginBottom: "32px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 20px",
            background: "#111111",
            border: "1px solid #222222",
            borderRadius: "40px",
            color: "#ffffff",
            fontSize: "14px",
            outline: "none"
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "#ffd700"}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#0a0a0a", borderRadius: "24px" }}>
          <p style={{ color: "#888888" }}>No products found</p>
        </div>
      ) : (
        <div className="shop-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card" onClick={() => router.push(`/shop/${product.id}`)}>
              <div style={{ position: "relative" }}>
                <img src={product.images?.[0] || "/placeholder.jpg"} alt={product.name} className="product-card-image" />
                {product.stock === 0 && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.85)", color: "#ff3b30", padding: "8px", textAlign: "center", fontSize: "13px", fontWeight: "600" }}>
                    OUT OF STOCK
                  </div>
                )}
              </div>
              <div style={{ padding: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#ffd700", textTransform: "uppercase" }}>{product.category}</span>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", marginTop: "4px", marginBottom: "4px" }}>{product.name}</h3>
                  {product.brand && <p style={{ color: "#666", fontSize: "12px", marginBottom: "8px" }}>{product.brand}</p>}
                  <p className="price-ugx" style={{ color: "#ffd700", fontSize: "18px", fontWeight: "700", marginTop: "8px" }}>
                    ${product.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}