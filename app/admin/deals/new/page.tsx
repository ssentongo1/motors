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
}

export default function NewDeal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isLoan, setIsLoan] = useState(false);
  
  const [formData, setFormData] = useState({
    car_id: "",
    buyer_name: "",
    buyer_phone: "",
    buyer_email: "",
    sale_price: "",
    payment_method: "cash",
    is_loan: false,
    loan_amount: "",
    down_payment: "",
    remaining_balance: "",
    monthly_payment: "",
    next_payment_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchCars();
  }, []);

  async function fetchCars() {
    const { data } = await supabase
      .from("cars")
      .select("id, brand, model, year, price_usd")
      .eq("status", "Available");
    
    if (data) setCars(data);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleCarSelect = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (car) {
      setSelectedCar(car);
      setFormData({ ...formData, car_id: carId, sale_price: car.price_usd.toString() });
    }
  };

  const calculateRemainingBalance = () => {
    const loan = parseFloat(formData.loan_amount) || 0;
    const down = parseFloat(formData.down_payment) || 0;
    const remaining = loan - down;
    setFormData({ ...formData, remaining_balance: remaining.toString() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dealData = {
        car_id: formData.car_id || null,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        buyer_email: formData.buyer_email || null,
        sale_price: parseFloat(formData.sale_price),
        payment_method: formData.payment_method,
        is_loan: isLoan,
        loan_amount: isLoan ? parseFloat(formData.loan_amount) : null,
        down_payment: isLoan ? parseFloat(formData.down_payment) : null,
        remaining_balance: isLoan ? parseFloat(formData.remaining_balance) : null,
        monthly_payment: isLoan ? parseFloat(formData.monthly_payment) : null,
        next_payment_date: isLoan ? formData.next_payment_date : null,
        notes: formData.notes || null,
        status: "active"
      };
      const { error } = await supabase.from("deals").insert([dealData]);
      if (error) throw error;
      alert("Deal created successfully!");
      router.push("/admin/deals");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <AdminGuard>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.5px" }}>New Deal</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>Record a car sale or loan agreement</p>
          </div>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ff3b30", borderRadius: "8px", color: "#ff3b30", cursor: "pointer" }}>Logout</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Select Car *</label><select name="car_id" required value={formData.car_id} onChange={(e) => handleCarSelect(e.target.value)} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }}><option value="">Select a car</option>{cars.map(car => (<option key={car.id} value={car.id}>{car.brand} {car.model} ({car.year}) - ${car.price_usd.toLocaleString()}</option>))}</select></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Buyer Name *</label><input type="text" name="buyer_name" required value={formData.buyer_name} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Buyer Phone *</label><input type="tel" name="buyer_phone" required value={formData.buyer_phone} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Buyer Email</label><input type="email" name="buyer_email" value={formData.buyer_email} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Sale Price *</label><input type="number" name="sale_price" required value={formData.sale_price} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
            <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Payment Method</label><select name="payment_method" value={formData.payment_method} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }}><option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="mobile_money">Mobile Money</option><option value="cheque">Cheque</option></select></div>
          </div>

          {/* Loan Section */}
          <div style={{ marginTop: "24px", padding: "16px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginBottom: "16px" }}>
              <input type="checkbox" name="is_loan" checked={isLoan} onChange={(e) => { setIsLoan(e.target.checked); setFormData({ ...formData, is_loan: e.target.checked }); }} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
              <span style={{ fontWeight: "500" }}>This is a loan/financing deal</span>
            </label>

            {isLoan && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Loan Amount</label><input type="number" name="loan_amount" value={formData.loan_amount} onChange={(e) => { handleChange(e); setTimeout(calculateRemainingBalance, 100); }} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
                <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Down Payment</label><input type="number" name="down_payment" value={formData.down_payment} onChange={(e) => { handleChange(e); setTimeout(calculateRemainingBalance, 100); }} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
                <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Remaining Balance</label><input type="number" name="remaining_balance" value={formData.remaining_balance} readOnly style={{ width: "100%", padding: "12px", background: "#1a1a1a", border: "1px solid #222", borderRadius: "8px", color: "#ffd700" }} /></div>
                <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Monthly Payment</label><input type="number" name="monthly_payment" value={formData.monthly_payment} onChange={handleChange} placeholder="0" style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
                <div><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Next Payment Date</label><input type="date" name="next_payment_date" value={formData.next_payment_date} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff" }} /></div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px" }}><label style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", display: "block" }}>Notes</label><textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#fff", resize: "vertical" }} /></div>

          <div style={{ marginTop: "32px" }}>
            <button type="submit" disabled={loading} style={{ padding: "14px 32px", background: loading ? "#666" : "#ffd700", border: "none", borderRadius: "8px", color: "#000", fontSize: "14px", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Creating..." : "Create Deal"}</button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}