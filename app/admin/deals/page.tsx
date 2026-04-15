"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Deal {
  id: string;
  car_id: string;
  buyer_name: string;
  buyer_phone: string;
  sale_price: number;
  is_loan: boolean;
  loan_amount: number;
  down_payment: number;
  remaining_balance: number;
  monthly_payment: number;
  next_payment_date: string;
  status: string;
  created_at: string;
  cars?: {
    brand: string;
    model: string;
    year: number;
  };
}

export default function AdminDeals() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    const { data, error } = await supabase
      .from("deals")
      .select(`*, cars (brand, model, year)`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDeals(data);
      const revenue = data.reduce((sum, deal) => sum + (deal.sale_price || 0), 0);
      const outstanding = data.reduce((sum, deal) => sum + (deal.remaining_balance || 0), 0);
      setTotalRevenue(revenue);
      setTotalOutstanding(outstanding);
    }
    setLoading(false);
  }

  async function deleteDeal(id: string) {
    if (!confirm("Delete this deal? This will also delete all payment records.")) return;
    
    const { error } = await supabase.from("deals").delete().eq("id", id);
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      fetchDeals();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  const filteredDeals = deals.filter(deal => {
    const matchesFilter = filter === "all" ? true : deal.status === filter;
    const matchesSearch = searchTerm === "" || 
      deal.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.cars?.brand && deal.cars.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deal.cars?.model && deal.cars.model.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const activeCount = deals.filter(d => d.status === "active").length;
  const completedCount = deals.filter(d => d.status === "completed").length;
  const defaultedCount = deals.filter(d => d.status === "defaulted").length;
  
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const paginatedDeals = filteredDeals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          .stat-card {
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 16px;
            padding: 20px;
          }
          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #ffd700;
          }
          .stat-label {
            font-size: 12px;
            color: #888;
            margin-top: 4px;
          }
          .deal-card {
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
            transition: all 0.2s ease;
          }
          .deal-card:hover {
            border-color: #ffd700;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }
          .status-active {
            background: #2196f3;
            color: white;
          }
          .status-completed {
            background: #00c853;
            color: white;
          }
          .status-defaulted {
            background: #ff3b30;
            color: white;
          }
          .filter-btn {
            padding: 8px 16px;
            background: #111;
            border: 1px solid #222;
            border-radius: 30px;
            color: #888;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .filter-btn.active {
            background: #ffd700;
            color: #000;
            border-color: #ffd700;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
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
        `}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>Deal Tracker</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>Track sales, loans, and payments</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <a href="/admin/deals/new" style={{ padding: "10px 20px", background: "#ffd700", borderRadius: "8px", color: "#000", textDecoration: "none", fontWeight: "500" }}>+ New Deal</a>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">${totalRevenue.toLocaleString()}</div><div className="stat-label">Total Revenue</div></div>
          <div className="stat-card"><div className="stat-value">${totalOutstanding.toLocaleString()}</div><div className="stat-label">Outstanding Balance</div></div>
          <div className="stat-card"><div className="stat-value">{activeCount}</div><div className="stat-label">Active Deals</div></div>
          <div className="stat-card"><div className="stat-value">{completedCount}</div><div className="stat-label">Completed</div></div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by buyer name, brand, or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "12px 16px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff", marginBottom: "20px", outline: "none" }}
          onFocus={(e) => e.currentTarget.style.borderColor = "#ffd700"}
          onBlur={(e) => e.currentTarget.style.borderColor = "#222222"}
        />

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All ({deals.length})</button>
          <button className={`filter-btn ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>Active ({activeCount})</button>
          <button className={`filter-btn ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>Completed ({completedCount})</button>
          <button className={`filter-btn ${filter === "defaulted" ? "active" : ""}`} onClick={() => setFilter("defaulted")}>Defaulted ({defaultedCount})</button>
        </div>

        {/* Deals List */}
        {paginatedDeals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#0a0a0a", borderRadius: "16px" }}>
            <p style={{ color: "#888888" }}>No deals found. Create your first deal.</p>
          </div>
        ) : (
          <>
            {paginatedDeals.map((deal) => (
              <div key={deal.id} className="deal-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{deal.cars?.brand} {deal.cars?.model} ({deal.cars?.year})</h3>
                    <p style={{ color: "#888", fontSize: "13px" }}>Buyer: {deal.buyer_name} · 📞 {deal.buyer_phone}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className={`status-badge status-${deal.status}`}>{deal.status === "active" ? "Active" : deal.status === "completed" ? "Completed" : "Defaulted"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #1a1a1a" }}>
                  <div><p style={{ color: "#666", fontSize: "11px" }}>Sale Price</p><p style={{ fontSize: "15px", fontWeight: "500", color: "#ffd700" }}>${deal.sale_price.toLocaleString()}</p></div>
                  {deal.is_loan && (
                    <>
                      <div><p style={{ color: "#666", fontSize: "11px" }}>Loan Amount</p><p style={{ fontSize: "15px", fontWeight: "500" }}>${deal.loan_amount?.toLocaleString()}</p></div>
                      <div><p style={{ color: "#666", fontSize: "11px" }}>Down Payment</p><p style={{ fontSize: "15px", fontWeight: "500" }}>${deal.down_payment?.toLocaleString()}</p></div>
                      <div><p style={{ color: "#666", fontSize: "11px" }}>Remaining</p><p style={{ fontSize: "15px", fontWeight: "500", color: "#ff6600" }}>${deal.remaining_balance?.toLocaleString()}</p></div>
                      <div><p style={{ color: "#666", fontSize: "11px" }}>Monthly Payment</p><p style={{ fontSize: "15px", fontWeight: "500" }}>${deal.monthly_payment?.toLocaleString()}</p></div>
                      {deal.next_payment_date && <div><p style={{ color: "#666", fontSize: "11px" }}>Next Payment</p><p style={{ fontSize: "15px", fontWeight: "500" }}>{new Date(deal.next_payment_date).toLocaleDateString()}</p></div>}
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button onClick={() => router.push(`/admin/deals/${deal.id}`)} style={{ padding: "8px 16px", background: "#ffd700", border: "none", borderRadius: "8px", color: "#000", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>View Details</button>
                  <button onClick={() => deleteDeal(deal.id)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ff3b30", borderRadius: "8px", color: "#ff3b30", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "8px 16px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: currentPage === 1 ? "#666" : "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>Previous</button>
                <span style={{ padding: "8px 16px", color: "#888" }}>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "8px 16px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: currentPage === totalPages ? "#666" : "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminGuard>
  );
}