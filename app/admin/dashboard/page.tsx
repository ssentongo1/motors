"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AdminGuard from "@/components/AdminGuard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Stats {
  totalCars: number;
  totalProducts: number;
  totalBlogPosts: number;
  totalInquiries: number;
  availableCars: number;
  soldCars: number;
  lowStockProducts: number;
  totalDeals: number;
  activeDeals: number;
  totalRevenue: number;
  outstandingBalance: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCars: 0,
    totalProducts: 0,
    totalBlogPosts: 0,
    totalInquiries: 0,
    availableCars: 0,
    soldCars: 0,
    lowStockProducts: 0,
    totalDeals: 0,
    activeDeals: 0,
    totalRevenue: 0,
    outstandingBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentCars, setRecentCars] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [recentDeals, setRecentDeals] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      const [carsCount, availableCount, soldCount, productsCount, lowStockCount, blogCount, inquiriesCount, dealsData] = await Promise.all([
        supabase.from("cars").select("*", { count: "exact", head: true }),
        supabase.from("cars").select("*", { count: "exact", head: true }).eq("status", "Available"),
        supabase.from("cars").select("*", { count: "exact", head: true }).eq("status", "Sold"),
        supabase.from("shop_products").select("*", { count: "exact", head: true }),
        supabase.from("shop_products").select("*", { count: "exact", head: true }).lt("stock", 10),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("inquiries").select("*", { count: "exact", head: true }),
        supabase.from("deals").select("*"),
      ]);

      const deals = dealsData.data || [];
      const activeDeals = deals.filter((d: any) => d.status === "active").length;
      const totalRevenue = deals.reduce((sum: number, d: any) => sum + (d.sale_price || 0), 0);
      const outstandingBalance = deals.reduce((sum: number, d: any) => sum + (d.remaining_balance || 0), 0);

      setStats({
        totalCars: carsCount.count || 0,
        totalProducts: productsCount.count || 0,
        totalBlogPosts: blogCount.count || 0,
        totalInquiries: inquiriesCount.count || 0,
        availableCars: availableCount.count || 0,
        soldCars: soldCount.count || 0,
        lowStockProducts: lowStockCount.count || 0,
        totalDeals: deals.length,
        activeDeals: activeDeals,
        totalRevenue: totalRevenue,
        outstandingBalance: outstandingBalance,
      });

      await Promise.all([
        fetchRecentCars(),
        fetchRecentInquiries(),
        fetchRecentDeals()
      ]);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentCars() {
    const { data } = await supabase
      .from("cars")
      .select("id, brand, model, year, price_usd, status")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRecentCars(data);
  }

  async function fetchRecentInquiries() {
    const { data } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRecentInquiries(data);
  }

  async function fetchRecentDeals() {
    const { data } = await supabase
      .from("deals")
      .select(`*, cars (brand, model)`)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRecentDeals(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

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
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .stat-card:hover {
            border-color: #ffd700;
            transform: translateY(-2px);
          }
          .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #ffd700;
          }
          .stat-label {
            font-size: 12px;
            color: #888;
            margin-top: 8px;
          }
          .stat-sub {
            font-size: 10px;
            color: #666;
            margin-top: 6px;
          }
          .section-card {
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 16px;
            padding: 20px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #fff;
          }
          .recent-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #1a1a1a;
            flex-wrap: wrap;
            gap: 8px;
          }
          .recent-item:last-child { border-bottom: none; }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 500;
          }
          .status-available { background: #00c853; color: white; }
          .status-sold { background: #ff3b30; color: white; }
          .status-active { background: #2196f3; color: white; }
          .status-new { background: #ff6600; color: white; }
          .quick-action {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: #111;
            border: 1px solid #1a1a1a;
            border-radius: 12px;
            color: #fff;
            text-decoration: none;
            transition: all 0.2s ease;
          }
          .quick-action:hover { border-color: #ffd700; background: #161616; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          @media (min-width: 640px) {
            .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
          }
          @media (min-width: 1024px) {
            .stats-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
          }
          .stat-link { text-decoration: none; display: block; }
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
          .logout-btn:hover { background: rgba(255,59,48,0.1); }
        `}</style>

        <div style={{ padding: "0 16px" }}>
          {/* Header with Logout */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "6px", letterSpacing: "-0.5px" }}>Dashboard</h1>
              <p style={{ color: "#888", fontSize: "13px" }}>Welcome back. Here's an overview of your business.</p>
            </div>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <a href="/admin/cars" className="stat-link">
              <div className="stat-card">
                <div className="stat-value">{stats.totalCars}</div>
                <div className="stat-label">Total Cars</div>
                <div className="stat-sub">{stats.availableCars} available · {stats.soldCars} sold</div>
              </div>
            </a>
            <a href="/admin/shop" className="stat-link">
              <div className="stat-card">
                <div className="stat-value">{stats.totalProducts}</div>
                <div className="stat-label">Shop Products</div>
                {stats.lowStockProducts > 0 && <div className="stat-sub" style={{ color: "#ff6600" }}>{stats.lowStockProducts} low stock</div>}
              </div>
            </a>
            <a href="/admin/blog" className="stat-link">
              <div className="stat-card">
                <div className="stat-value">{stats.totalBlogPosts}</div>
                <div className="stat-label">Blog Posts</div>
              </div>
            </a>
            <a href="/admin/inquiries" className="stat-link">
              <div className="stat-card">
                <div className="stat-value">{stats.totalInquiries}</div>
                <div className="stat-label">Inquiries</div>
              </div>
            </a>
            <a href="/admin/deals" className="stat-link">
              <div className="stat-card">
                <div className="stat-value">{stats.totalDeals}</div>
                <div className="stat-label">Deals</div>
                <div className="stat-sub">{stats.activeDeals} active</div>
              </div>
            </a>
          </div>

          {/* Financial Stats */}
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${stats.outstandingBalance.toLocaleString()}</div>
              <div className="stat-label">Outstanding Balance</div>
            </div>
          </div>

          {/* Three Column Layout */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            {/* Recent Cars */}
            <div className="section-card">
              <h3 className="section-title">Recent Vehicles</h3>
              {recentCars.length === 0 ? (
                <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>No vehicles added yet</p>
              ) : (
                recentCars.map((car) => (
                  <div key={car.id} className="recent-item">
                    <div>
                      <div style={{ fontWeight: 500 }}>{car.brand} {car.model}</div>
                      <div style={{ fontSize: "11px", color: "#666" }}>{car.year} · ${car.price_usd?.toLocaleString()}</div>
                    </div>
                    <span className={`status-badge ${car.status === "Available" ? "status-available" : "status-sold"}`}>
                      {car.status || "Available"}
                    </span>
                  </div>
                ))
              )}
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <a href="/admin/cars" style={{ color: "#ffd700", fontSize: "12px", textDecoration: "none" }}>View All →</a>
              </div>
            </div>

            {/* Recent Deals */}
            <div className="section-card">
              <h3 className="section-title">Recent Deals</h3>
              {recentDeals.length === 0 ? (
                <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>No deals recorded yet</p>
              ) : (
                recentDeals.map((deal) => (
                  <div key={deal.id} className="recent-item">
                    <div>
                      <div style={{ fontWeight: 500 }}>{deal.cars?.brand} {deal.cars?.model}</div>
                      <div style={{ fontSize: "11px", color: "#666" }}>{deal.buyer_name} · ${deal.sale_price?.toLocaleString()}</div>
                    </div>
                    <span className={`status-badge status-${deal.status}`}>
                      {deal.status === "active" ? "Active" : deal.status}
                    </span>
                  </div>
                ))
              )}
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <a href="/admin/deals" style={{ color: "#ffd700", fontSize: "12px", textDecoration: "none" }}>View All →</a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card">
              <h3 className="section-title">Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a href="/admin/cars/new" className="quick-action">
                  <div style={{ width: 32, height: 32, background: "#1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>🚗</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Add New Car</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>Add a vehicle to inventory</div>
                  </div>
                </a>
                <a href="/admin/deals/new" className="quick-action">
                  <div style={{ width: 32, height: 32, background: "#1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>📋</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Record New Deal</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>Track sales and loans</div>
                  </div>
                </a>
                <a href="/admin/shop/new" className="quick-action">
                  <div style={{ width: 32, height: 32, background: "#1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>🛒</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Add New Product</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>Add accessories or parts</div>
                  </div>
                </a>
                <a href="/admin/blog/new" className="quick-action">
                  <div style={{ width: 32, height: 32, background: "#1a1a1a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>📝</div>
                  <div>
                    <div style={{ fontWeight: 500 }}>Write Blog Post</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>Share news and updates</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className="section-card">
            <h3 className="section-title">Recent Inquiries</h3>
            {stats.totalInquiries === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>No customer inquiries yet</p>
            ) : (
              <div style={{ overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", color: "#888" }}>Customer</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", color: "#888" }}>Message</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", color: "#888" }}>Date</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "11px", color: "#888" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.map((inquiry) => (
                      <tr key={inquiry.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                        <td style={{ padding: "12px", fontSize: "12px", fontWeight: 500 }}>{inquiry.customer_name}</td>
                        <td style={{ padding: "12px", fontSize: "12px", color: "#ccc" }}>{inquiry.message?.substring(0, 40)}...</td>
                        <td style={{ padding: "12px", fontSize: "11px", color: "#666" }}>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: "12px" }}>
                          <span className="status-badge status-new">{inquiry.status || "new"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <a href="/admin/inquiries" style={{ color: "#ffd700", fontSize: "12px", textDecoration: "none" }}>View All →</a>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}