"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

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
  stock: number;
  images: string[];
  status: string;
  created_at: string;
}

export default function AdminShop() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    
    const { error } = await supabase.from("shop_products").delete().eq("id", id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      fetchProducts();
    }
  }

  async function toggleStatus(id: string, currentStock: number) {
    const newStock = currentStock > 0 ? 0 : 1;
    const newStatus = newStock > 0 ? "In Stock" : "Out of Stock";
    
    const { error } = await supabase
      .from("shop_products")
      .update({ stock: newStock, status: newStatus })
      .eq("id", id);
    
    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      fetchProducts();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 500;
          }
          .status-in-stock {
            background: #00c853;
            color: white;
          }
          .status-out-of-stock {
            background: #ff3b30;
            color: white;
          }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>Manage Shop</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>Add, edit, or remove products</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <a
              href="/admin/shop/new"
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
              + Add Product
            </a>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search products..."
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

        {paginatedProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#0a0a0a", borderRadius: "12px", border: "1px solid #1a1a1a" }}>
            <p style={{ color: "#888888", marginBottom: "16px" }}>No products found.</p>
            <a href="/admin/shop/new" style={{ padding: "10px 20px", background: "#ffd700", borderRadius: "8px", color: "#000", textDecoration: "none" }}>Add Your First Product</a>
          </div>
        ) : (
          <>
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a", background: "#050505" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Image</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Name</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Category</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Price</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Stock</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td style={{ padding: "16px" }}>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ width: "50px", height: "50px", background: "#1a1a1a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#666666" }}>
                            No img
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", fontWeight: "500" }}>
                        {product.name}
                        {product.brand && <div style={{ fontSize: "11px", color: "#666666", marginTop: "4px" }}>{product.brand}</div>}
                      </td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "#ffd700" }}>{product.category}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#ffd700", fontWeight: "500" }}>${product.price}</td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => toggleStatus(product.id, product.stock)}
                          className={`status-badge ${product.stock > 0 ? "status-in-stock" : "status-out-of-stock"}`}
                          style={{ cursor: "pointer" }}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </button>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => router.push(`/admin/shop/edit/${product.id}`)}
                            style={{ padding: "6px 12px", background: "transparent", border: "1px solid #ffd700", borderRadius: "6px", color: "#ffd700", fontSize: "12px", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
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