"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

// Skeleton Loader for Shop
function ProductCardSkeleton() {
  return (
    <div suppressHydrationWarning style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "20px", overflow: "hidden" }}>
      <div suppressHydrationWarning style={{ height: "200px", background: "#111", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div suppressHydrationWarning style={{ padding: "16px" }}>
        <div suppressHydrationWarning style={{ height: "14px", background: "#1a1a1a", borderRadius: "4px", marginBottom: "8px", width: "40%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div suppressHydrationWarning style={{ height: "20px", background: "#1a1a1a", borderRadius: "4px", marginBottom: "8px", width: "70%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div suppressHydrationWarning style={{ height: "16px", background: "#1a1a1a", borderRadius: "4px", marginBottom: "16px", width: "50%", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div suppressHydrationWarning style={{ height: "40px", background: "#1a1a1a", borderRadius: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch products with React Query
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["shop_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Get unique categories
  const categories = ["All", ...new Set(allProducts.map(p => p.category))];
  
  // Filter products
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div suppressHydrationWarning>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
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
          height: 200px;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .product-card:hover .product-card-image {
          transform: scale(1.05);
        }
        .category-chip {
          padding: 6px 16px;
          background: #111;
          border: 1px solid #222;
          border-radius: 30px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #888;
        }
        .category-chip:hover, .category-chip.active {
          background: #ffd700;
          color: #000;
          border-color: #ffd700;
        }
        .pagination-btn {
          padding: 8px 16px;
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pagination-btn:hover:not(:disabled) {
          border-color: #ffd700;
          color: #ffd700;
        }
        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .pagination-active {
          background: #ffd700;
          color: #000;
          border-color: #ffd700;
        }
      `}</style>

      {/* Header */}
      <div suppressHydrationWarning style={{ marginBottom: "32px" }}>
        <h1 suppressHydrationWarning style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: "600", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Shop <span style={{ color: "#ffd700" }}>Accessories</span>
        </h1>
        <p suppressHydrationWarning style={{ color: "#888888", fontSize: "14px" }}>
          {!isLoading && `${filteredProducts.length} premium parts and accessories`}
        </p>
      </div>

      {/* Search & Filters */}
      <div suppressHydrationWarning style={{ marginBottom: "32px" }}>
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
            outline: "none",
            marginBottom: "16px"
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "#ffd700"}
          onBlur={(e) => e.currentTarget.style.borderColor = "#222222"}
        />
        
        <div suppressHydrationWarning style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="shop-grid" suppressHydrationWarning>
          {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div suppressHydrationWarning style={{ textAlign: "center", padding: "60px 20px", background: "#0a0a0a", borderRadius: "24px" }}>
          <p style={{ color: "#888888" }}>No products found</p>
        </div>
      ) : (
        <>
          <div className="shop-grid" suppressHydrationWarning>
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => router.push(`/shop/${product.id}`)}
                suppressHydrationWarning
              >
                <div suppressHydrationWarning style={{ position: "relative" }}>
                  <img
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    className="product-card-image"
                    loading="lazy"
                    suppressHydrationWarning
                  />
                  {product.stock === 0 && (
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
                      OUT OF STOCK
                    </div>
                  )}
                </div>
                <div suppressHydrationWarning style={{ padding: "16px" }}>
                  <div>
                    <span suppressHydrationWarning style={{ fontSize: "11px", color: "#ffd700", textTransform: "uppercase" }}>{product.category}</span>
                    <h3 suppressHydrationWarning style={{ fontSize: "16px", fontWeight: "600", marginTop: "4px", marginBottom: "4px" }}>{product.name}</h3>
                    {product.brand && <p suppressHydrationWarning style={{ color: "#666", fontSize: "12px", marginBottom: "8px" }}>{product.brand}</p>}
                    <p suppressHydrationWarning style={{ color: "#ffd700", fontSize: "18px", fontWeight: "700", marginTop: "8px" }}>
                      ${product.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div suppressHydrationWarning style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              gap: "12px", 
              marginTop: "32px",
              flexWrap: "wrap"
            }}>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                suppressHydrationWarning
              >
                Previous
              </button>
              
              <div suppressHydrationWarning style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? "pagination-active" : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                      suppressHydrationWarning
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span suppressHydrationWarning style={{ color: "#888", padding: "8px 8px" }}>...</span>
                )}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    suppressHydrationWarning
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                suppressHydrationWarning
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}