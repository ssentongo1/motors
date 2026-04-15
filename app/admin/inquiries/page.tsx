"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import AdminGuard from "@/components/AdminGuard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Inquiry {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInquiries(data);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("inquiries")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      fetchInquiries();
    }
  }

  async function deleteInquiry(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      fetchInquiries();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  const filteredInquiries = filter === "all" 
    ? inquiries 
    : inquiries.filter(i => i.status === filter);

  const unreadCount = inquiries.filter(i => i.status === "new" || !i.status).length;
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          .inquiry-card {
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
            transition: all 0.2s ease;
          }
          .inquiry-card:hover {
            border-color: #ffd700;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
          }
          .status-new {
            background: #ff6600;
            color: white;
          }
          .status-read {
            background: #00c853;
            color: white;
          }
          .status-replied {
            background: #2196f3;
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
          .whatsapp-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #25D366;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
          }
          .call-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #2196f3;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
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
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>Customer Inquiries</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>{unreadCount} unread · {inquiries.length} total messages</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All ({inquiries.length})</button>
          <button className={`filter-btn ${filter === "new" ? "active" : ""}`} onClick={() => setFilter("new")}>Unread ({unreadCount})</button>
          <button className={`filter-btn ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>Read</button>
          <button className={`filter-btn ${filter === "replied" ? "active" : ""}`} onClick={() => setFilter("replied")}>Replied</button>
        </div>

        {/* Inquiries List */}
        {paginatedInquiries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#0a0a0a", borderRadius: "16px" }}>
            <p style={{ color: "#888888" }}>No inquiries found</p>
          </div>
        ) : (
          <>
            {paginatedInquiries.map((inquiry) => (
              <div key={inquiry.id} className="inquiry-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{inquiry.customer_name}</h3>
                    <p style={{ color: "#888", fontSize: "12px" }}>{new Date(inquiry.created_at).toLocaleString()}</p>
                    <p style={{ color: "#ffd700", fontSize: "12px", marginTop: "4px" }}>📞 {inquiry.phone}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      value={inquiry.status || "new"}
                      onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                      style={{ padding: "6px 12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff", fontSize: "12px", cursor: "pointer" }}
                    >
                      <option value="new">📬 Unread</option>
                      <option value="read">📖 Read</option>
                      <option value="replied">✅ Replied</option>
                    </select>
                    <button onClick={() => deleteInquiry(inquiry.id)} style={{ padding: "6px 12px", background: "transparent", border: "1px solid #ff3b30", borderRadius: "8px", color: "#ff3b30", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{inquiry.message}</p>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid #1a1a1a" }}>
                  <a href={`https://wa.me/${inquiry.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${inquiry.customer_name},\n\nThank you for your inquiry. We received your message:\n"${inquiry.message.substring(0, 100)}"\n\nHow can we help you today?`)}`} target="_blank" className="whatsapp-link" rel="noopener noreferrer">💬 WhatsApp Reply</a>
                  <a href={`tel:${inquiry.phone}`} className="call-link">📞 Call Customer</a>
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