"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
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
  buyer_email: string;
  sale_price: number;
  payment_method: string;
  is_loan: boolean;
  loan_amount: number;
  down_payment: number;
  remaining_balance: number;
  monthly_payment: number;
  next_payment_date: string;
  status: string;
  notes: string;
  created_at: string;
  cars?: {
    brand: string;
    model: string;
    year: number;
    price_usd: number;
  };
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string;
  notes: string;
  created_at: string;
}

export default function DealDetail() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchDeal();
    fetchPayments();
  }, []);

  async function fetchDeal() {
    const { data, error } = await supabase
      .from("deals")
      .select(`*, cars (brand, model, year, price_usd)`)
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching deal:", error);
    } else {
      setDeal(data);
    }
    setLoading(false);
  }

  async function fetchPayments() {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("deal_id", params.id)
      .order("payment_date", { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    
    const amount = parseFloat(paymentForm.amount);
    const newRemainingBalance = (deal?.remaining_balance || 0) - amount;

    try {
      const { error: paymentError } = await supabase.from("payments").insert({
        deal_id: params.id,
        amount: amount,
        payment_date: paymentForm.payment_date,
        payment_method: paymentForm.payment_method,
        reference: paymentForm.reference || null,
        notes: paymentForm.notes || null,
      });

      if (paymentError) throw paymentError;

      const { error: updateError } = await supabase
        .from("deals")
        .update({ 
          remaining_balance: newRemainingBalance,
          status: newRemainingBalance <= 0 ? "completed" : "active"
        })
        .eq("id", params.id);

      if (updateError) throw updateError;

      alert("Payment recorded successfully!");
      setPaymentForm({
        amount: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "cash",
        reference: "",
        notes: "",
      });
      setShowPaymentForm(false);
      fetchDeal();
      fetchPayments();
    } catch (error: any) {
      alert("Error recording payment: " + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(newStatus: string) {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("deals")
      .update({ status: newStatus })
      .eq("id", params.id);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      fetchDeal();
    }
    setUpdatingStatus(false);
  }

  async function deletePayment(paymentId: string) {
    if (!confirm("Delete this payment record?")) return;
    
    const { error } = await supabase.from("payments").delete().eq("id", paymentId);
    if (error) {
      alert("Error deleting payment: " + error.message);
    } else {
      fetchDeal();
      fetchPayments();
    }
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

  if (!deal) {
    return (
      <AdminGuard>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "#888888" }}>Deal not found</p>
          <button onClick={() => router.push("/admin/deals")} style={{ marginTop: "16px", padding: "10px 20px", background: "#ffd700", border: "none", borderRadius: "8px", cursor: "pointer" }}>Back to Deals</button>
        </div>
      </AdminGuard>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminGuard>
      <div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .info-card {
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .info-label {
            font-size: 11px;
            color: #666;
            margin-bottom: 4px;
          }
          .info-value {
            font-size: 15px;
            font-weight: 500;
            color: #fff;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
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
          .payment-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #1a1a1a;
          }
          .payment-row:last-child {
            border-bottom: none;
          }
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }
          .modal-content {
            background: #0a0a0a;
            border: 1px solid #1a1a1a;
            border-radius: 24px;
            width: 100%;
            max-width: 500px;
            padding: 24px;
          }
          .payment-input {
            width: 100%;
            padding: 12px;
            background: #111;
            border: 1px solid #222;
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            margin-bottom: 16px;
            box-sizing: border-box;
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
            <button onClick={() => router.push("/admin/deals")} style={{ background: "none", border: "none", color: "#ffd700", cursor: "pointer", marginBottom: "8px", fontSize: "13px" }}>← Back to Deals</button>
            <h1 style={{ fontSize: "24px", fontWeight: "600", letterSpacing: "-0.5px" }}>Deal Details</h1>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <select value={deal.status} onChange={(e) => updateStatus(e.target.value)} disabled={updatingStatus} style={{ padding: "8px 16px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff", fontSize: "13px", cursor: "pointer" }}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="defaulted">Defaulted</option>
            </select>
            <button onClick={() => setShowPaymentForm(true)} style={{ padding: "8px 20px", background: "#ffd700", border: "none", borderRadius: "8px", color: "#000", fontWeight: "500", cursor: "pointer" }}>+ Record Payment</button>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        {/* Deal Information */}
        <div className="info-card">
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Deal Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div><div className="info-label">Vehicle</div><div className="info-value">{deal.cars?.brand} {deal.cars?.model} ({deal.cars?.year})</div></div>
            <div><div className="info-label">Buyer Name</div><div className="info-value">{deal.buyer_name}</div></div>
            <div><div className="info-label">Buyer Phone</div><div className="info-value">{deal.buyer_phone}</div></div>
            {deal.buyer_email && <div><div className="info-label">Buyer Email</div><div className="info-value">{deal.buyer_email}</div></div>}
            <div><div className="info-label">Sale Price</div><div className="info-value" style={{ color: "#ffd700" }}>${deal.sale_price.toLocaleString()}</div></div>
            <div><div className="info-label">Payment Method</div><div className="info-value">{deal.payment_method?.replace("_", " ").toUpperCase()}</div></div>
            <div><div className="info-label">Status</div><div className="info-value"><span className={`status-badge status-${deal.status}`}>{deal.status?.toUpperCase()}</span></div></div>
            <div><div className="info-label">Created Date</div><div className="info-value">{new Date(deal.created_at).toLocaleDateString()}</div></div>
          </div>
        </div>

        {/* Loan Information */}
        {deal.is_loan && (
          <div className="info-card">
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Loan Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div><div className="info-label">Loan Amount</div><div className="info-value">${deal.loan_amount?.toLocaleString()}</div></div>
              <div><div className="info-label">Down Payment</div><div className="info-value">${deal.down_payment?.toLocaleString()}</div></div>
              <div><div className="info-label">Remaining Balance</div><div className="info-value" style={{ color: "#ff6600" }}>${deal.remaining_balance?.toLocaleString()}</div></div>
              <div><div className="info-label">Total Paid</div><div className="info-value" style={{ color: "#00c853" }}>${totalPaid.toLocaleString()}</div></div>
              <div><div className="info-label">Monthly Payment</div><div className="info-value">${deal.monthly_payment?.toLocaleString()}</div></div>
              {deal.next_payment_date && <div><div className="info-label">Next Payment Due</div><div className="info-value">{new Date(deal.next_payment_date).toLocaleDateString()}</div></div>}
            </div>
          </div>
        )}

        {/* Notes */}
        {deal.notes && (
          <div className="info-card">
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Notes</h3>
            <p style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.5" }}>{deal.notes}</p>
          </div>
        )}

        {/* Payment History */}
        <div className="info-card">
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Payment History ({payments.length} payments)</h3>
          {payments.length === 0 ? (
            <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>No payments recorded yet</p>
          ) : (
            <div>
              {payments.map((payment) => (
                <div key={payment.id} className="payment-row">
                  <div><div style={{ fontWeight: "500" }}>${payment.amount.toLocaleString()}</div><div style={{ fontSize: "11px", color: "#666" }}>{new Date(payment.payment_date).toLocaleDateString()}</div></div>
                  <div><div style={{ fontSize: "12px", color: "#888" }}>{payment.payment_method?.replace("_", " ").toUpperCase()}</div>{payment.reference && <div style={{ fontSize: "10px", color: "#666" }}>Ref: {payment.reference}</div>}</div>
                  <button onClick={() => deletePayment(payment.id)} style={{ background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentForm && (
          <div className="modal-overlay" onClick={() => setShowPaymentForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600" }}>Record Payment</h2>
                <button onClick={() => setShowPaymentForm(false)} style={{ background: "none", border: "none", color: "#888", fontSize: "24px", cursor: "pointer" }}>×</button>
              </div>
              <form onSubmit={recordPayment}>
                <input type="number" placeholder="Amount *" className="payment-input" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} required />
                <input type="date" className="payment-input" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})} required />
                <select className="payment-input" value={paymentForm.payment_method} onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}><option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="mobile_money">Mobile Money</option><option value="cheque">Cheque</option></select>
                <input type="text" placeholder="Reference Number (optional)" className="payment-input" value={paymentForm.reference} onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})} />
                <textarea rows={2} placeholder="Notes (optional)" className="payment-input" value={paymentForm.notes} onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} />
                <button type="submit" disabled={submitting} style={{ width: "100%", padding: "14px", background: submitting ? "#666" : "#ffd700", border: "none", borderRadius: "8px", color: "#000", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer" }}>{submitting ? "Recording..." : "Record Payment"}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}