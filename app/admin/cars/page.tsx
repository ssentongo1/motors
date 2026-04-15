"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

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
  condition: string;
  status: string;
  images: string[];
  created_at: string;
  is_featured: boolean;
  is_urgent: boolean;
}

export default function AdminCars() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCars();
  }, []);

  async function fetchCars() {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCars(data);
    }
    setLoading(false);
  }

  async function deleteCar(id: string) {
    if (!confirm("Are you sure you want to delete this car? This action cannot be undone.")) return;

    try {
      const car = cars.find(c => c.id === id);
      if (car?.images && car.images.length > 0) {
        const paths = car.images.map(img => {
          const urlParts = img.split("/");
          const carId = urlParts[urlParts.length - 2];
          const fileName = urlParts[urlParts.length - 1];
          return `cars/${carId}/${fileName}`;
        });
        for (const path of paths) {
          await supabase.storage.from("car-media").remove([path]);
        }
      }

      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
      
      alert("Car deleted successfully!");
      fetchCars();
    } catch (err: any) {
      alert("Error deleting: " + err.message);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "Available" ? "Sold" : "Available";
    const { error } = await supabase
      .from("cars")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      fetchCars();
    }
  }

  async function toggleFeatured(id: string, currentFeatured: boolean) {
    const { error } = await supabase
      .from("cars")
      .update({ is_featured: !currentFeatured })
      .eq("id", id);
    
    if (error) {
      alert("Error updating featured status: " + error.message);
    } else {
      fetchCars();
    }
  }

  async function toggleUrgent(id: string, currentUrgent: boolean) {
    const { error } = await supabase
      .from("cars")
      .update({ is_urgent: !currentUrgent })
      .eq("id", id);
    
    if (error) {
      alert("Error updating urgent status: " + error.message);
    } else {
      fetchCars();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  const filteredCars = cars.filter(car => 
    car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const paginatedCars = filteredCars.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          .status-available {
            background: #00c853;
            color: white;
          }
          .status-sold {
            background: #ff3b30;
            color: white;
          }
          .featured-active {
            background: #ffd700;
            color: #000;
          }
          .featured-inactive {
            background: #1a1a1a;
            color: #888;
          }
          .urgent-active {
            background: #ff6600;
            color: white;
          }
          .urgent-inactive {
            background: #1a1a1a;
            color: #888;
          }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>Manage Cars</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>View, edit, or remove vehicles from inventory</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <a
              href="/admin/cars/new"
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
              + Add New Car
            </a>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by brand or model..."
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

        {paginatedCars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#0a0a0a", borderRadius: "12px", border: "1px solid #1a1a1a" }}>
            <p style={{ color: "#888888", marginBottom: "16px" }}>No cars found.</p>
            <a href="/admin/cars/new" style={{ padding: "10px 20px", background: "#ffd700", borderRadius: "8px", color: "#000", textDecoration: "none" }}>Add Your First Car</a>
          </div>
        ) : (
          <>
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a", background: "#050505" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Image</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Brand / Model</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Year</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Price (USD)</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Price (UGX)</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Status</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Featured</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Urgent</th>
                    <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "#888888", fontWeight: "500" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCars.map((car) => (
                    <tr key={car.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <td style={{ padding: "16px" }}>
                        {car.images && car.images.length > 0 ? (
                          <img
                            src={car.images[0]}
                            alt={car.model}
                            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ width: "60px", height: "60px", background: "#1a1a1a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#666666" }}>
                            No img
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", fontWeight: "500" }}>
                        {car.brand} {car.model}
                        <div style={{ fontSize: "11px", color: "#666666", marginTop: "4px" }}>
                          {car.transmission} • {car.fuel_type}
                        </div>
                       </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#cccccc" }}>{car.year}</td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#ffd700", fontWeight: "500" }}>${car.price_usd?.toLocaleString()}</td>
                      <td style={{ padding: "16px", fontSize: "13px", color: "#888888" }}>UGX {car.price_ugx?.toLocaleString()}</td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => toggleStatus(car.id, car.status)}
                          className={`status-badge ${car.status === "Available" ? "status-available" : "status-sold"}`}
                          style={{ cursor: "pointer" }}
                        >
                          {car.status || "Available"}
                        </button>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => toggleFeatured(car.id, car.is_featured || false)}
                          className={car.is_featured ? "featured-active" : "featured-inactive"}
                          style={{ padding: "6px 14px", border: "none", borderRadius: "20px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                        >
                          {car.is_featured ? "★ Featured" : "☆"}
                        </button>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => toggleUrgent(car.id, car.is_urgent || false)}
                          className={car.is_urgent ? "urgent-active" : "urgent-inactive"}
                          style={{ padding: "6px 14px", border: "none", borderRadius: "20px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                        >
                          {car.is_urgent ? "⚠ Urgent" : "○"}
                        </button>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => router.push(`/admin/cars/edit/${car.id}`)}
                            style={{ padding: "6px 12px", background: "transparent", border: "1px solid #ffd700", borderRadius: "6px", color: "#ffd700", fontSize: "12px", cursor: "pointer" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCar(car.id)}
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