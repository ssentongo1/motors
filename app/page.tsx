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
  condition: string;
  is_featured: boolean;
  is_urgent: boolean;
}

export default function Home() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    maxMileage: "",
    transmission: "",
    fuelType: "",
  });

  const [inquiryForm, setInquiryForm] = useState({
    customer_name: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    let storedSession = localStorage.getItem("motors_session_id");
    if (!storedSession) {
      storedSession = crypto.randomUUID();
      localStorage.setItem("motors_session_id", storedSession);
    }
    setSessionId(storedSession);
    
    Promise.all([
      fetchCars(),
      fetchFavorites(storedSession)
    ]);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cars, searchQuery, filters]);

  async function fetchCars() {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("status", "Available")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setCars(data);
    }
    setLoading(false);
  }

  async function fetchFavorites(session: string) {
    const { data } = await supabase
      .from("favorites")
      .select("car_id")
      .eq("session_id", session);
    
    if (data) {
      setFavorites(new Set(data.map(f => f.car_id)));
    }
  }

  async function toggleFavorite(carId: string, e: React.MouseEvent) {
    e.stopPropagation();
    
    if (favorites.has(carId)) {
      await supabase
        .from("favorites")
        .delete()
        .eq("car_id", carId)
        .eq("session_id", sessionId);
      
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(carId);
        return newSet;
      });
    } else {
      await supabase
        .from("favorites")
        .insert({ car_id: carId, session_id: sessionId });
      
      setFavorites(prev => new Set(prev).add(carId));
    }
  }

  async function submitInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryForm.customer_name || !inquiryForm.phone || !inquiryForm.message) {
      alert("Please fill in all required fields");
      return;
    }
    
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      customer_name: inquiryForm.customer_name,
      phone: inquiryForm.phone,
      email: "",
      message: inquiryForm.message,
    });

    if (error) {
      alert("Error sending message: " + error.message);
    } else {
      alert("Message sent successfully! We'll contact you via WhatsApp or call within 24 hours.");
      setInquiryForm({ customer_name: "", phone: "", message: "" });
      setShowInquiryForm(false);
    }
    setSubmitting(false);
  }

  function applyFilters() {
    let filtered = [...cars];
    
    if (searchQuery) {
      filtered = filtered.filter(car => 
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filters.minYear) {
      filtered = filtered.filter(car => car.year >= parseInt(filters.minYear));
    }
    if (filters.maxYear) {
      filtered = filtered.filter(car => car.year <= parseInt(filters.maxYear));
    }
    if (filters.minPrice) {
      filtered = filtered.filter(car => car.price_usd >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(car => car.price_usd <= parseInt(filters.maxPrice));
    }
    if (filters.maxMileage) {
      filtered = filtered.filter(car => car.mileage <= parseInt(filters.maxMileage));
    }
    if (filters.transmission) {
      filtered = filtered.filter(car => car.transmission === filters.transmission);
    }
    if (filters.fuelType) {
      filtered = filtered.filter(car => car.fuel_type === filters.fuelType);
    }
    
    setFilteredCars(filtered);
  }

  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  }

  function clearFilters() {
    setFilters({
      minYear: "",
      maxYear: "",
      minPrice: "",
      maxPrice: "",
      maxMileage: "",
      transmission: "",
      fuelType: "",
    });
    setSearchQuery("");
  }

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
        
        .motors-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
        }
        
        .motors-card:hover {
          border-color: #ffd700;
          transform: translateY(-4px);
        }
        
        .motors-card-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .motors-card:hover .motors-card-image {
          transform: scale(1.05);
        }
        
        .cars-grid {
          display: grid;
          gap: 24px;
        }
        
        @media (max-width: 640px) {
          .cars-grid { grid-template-columns: 1fr; gap: 20px; }
          .motors-card-image { height: 220px; }
        }
        @media (min-width: 641px) and (max-width: 1023px) {
          .cars-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .motors-card-image { height: 220px; }
        }
        @media (min-width: 1024px) {
          .cars-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; }
          .motors-card-image { height: 260px; }
        }
        @media (min-width: 1440px) {
          .cars-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; }
        }
        
        .badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        
        .favorite-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .favorite-btn:hover {
          background: rgba(0,0,0,0.8);
          transform: scale(1.05);
        }
        
        .price-ugx {
          color: #ffd700;
          font-size: 20px;
          font-weight: 700;
        }
        
        .price-usd {
          color: #888888;
          font-size: 11px;
        }
        
        @media (max-width: 640px) {
          .price-ugx { font-size: 18px; }
          .price-usd { font-size: 10px; }
        }
        
        .filter-panel {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
        }
        
        .filter-group {
          margin-bottom: 16px;
        }
        
        .filter-label {
          display: block;
          font-size: 12px;
          color: #888;
          margin-bottom: 6px;
        }
        
        .filter-input {
          width: 100%;
          padding: 10px 12px;
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
        }
        
        .filter-input:focus {
          outline: none;
          border-color: #ffd700;
        }
        
        .filter-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .floating-btn {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 56px;
          height: 56px;
          background: #25D366;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          z-index: 100;
        }
        
        .floating-btn:hover {
          transform: scale(1.05);
          background: #20b859;
        }
        
        @media (min-width: 768px) {
          .floating-btn {
            bottom: 100px;
            right: 30px;
            width: 60px;
            height: 60px;
          }
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
          max-width: 450px;
          max-height: 85vh;
          overflow-y: auto;
          padding: 24px;
          padding-bottom: 40px;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #1a1a1a;
        }
        
        .modal-title {
          font-size: 20px;
          font-weight: 600;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-btn:hover {
          color: #fff;
        }
        
        .inquiry-input {
          width: 100%;
          padding: 14px;
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }
        
        .inquiry-input:focus {
          outline: none;
          border-color: #ffd700;
        }
        
        .inquiry-textarea {
          width: 100%;
          padding: 14px;
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          resize: vertical;
          font-family: inherit;
          box-sizing: border-box;
          margin-bottom: 16px;
        }
        
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #25D366;
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          margin-bottom: 8px;
        }
        
        .submit-btn:hover {
          background: #20b859;
        }
        
        .submit-btn:disabled {
          background: #666;
          cursor: not-allowed;
        }
        
        .field-note {
          font-size: 11px;
          color: #666;
          margin-top: -12px;
          margin-bottom: 16px;
          padding-left: 4px;
        }
      `}</style>

      {/* Floating Button */}
      <button className="floating-btn" onClick={() => setShowInquiryForm(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01" />
          <path d="M12 10h.01" />
          <path d="M16 10h.01" />
        </svg>
      </button>

      {/* Inquiry Modal */}
      {showInquiryForm && (
        <div className="modal-overlay" onClick={() => setShowInquiryForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Request Information</h2>
              <button className="close-btn" onClick={() => setShowInquiryForm(false)}>×</button>
            </div>
            <form onSubmit={submitInquiry}>
              <input
                type="text"
                placeholder="Your Full Name *"
                className="inquiry-input"
                value={inquiryForm.customer_name}
                onChange={(e) => setInquiryForm({...inquiryForm, customer_name: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="WhatsApp Number * (with country code)"
                className="inquiry-input"
                value={inquiryForm.phone}
                onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
                required
              />
              <div className="field-note">We'll contact you on WhatsApp or call</div>
              <textarea
                rows={4}
                placeholder="Your Message *"
                className="inquiry-textarea"
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                required
              />
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Logo - Dan Auto Premium */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px"
        }}>
          {/* Premium Icon Box with D */}
          <div style={{ 
            width: "70px", 
            height: "70px", 
            background: "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(255,215,0,0.25)"
          }}>
            <span style={{ 
              fontSize: "38px", 
              fontWeight: "700", 
              color: "#000",
              letterSpacing: "-1px"
            }}>D</span>
          </div>
          
          {/* Brand Name */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px"
          }}>
            <span style={{ 
              fontSize: "20px", 
              fontWeight: "700", 
              color: "#ffd700",
              letterSpacing: "1px"
            }}>DAN AUTO</span>
            <span style={{ 
              fontSize: "9px", 
              color: "#888888",
              letterSpacing: "2px",
              textTransform: "uppercase"
            }}>Premium Motors</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: "600", marginBottom: "12px", letterSpacing: "-0.5px" }}>
          Find Your <span style={{ color: "#ffd700" }}>Dream Car</span>
        </h1>
        <p style={{ color: "#888888", fontSize: "clamp(13px, 3vw, 15px)" }}>
          {filteredCars.length} premium vehicles available
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            placeholder="Search by brand or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "14px 20px",
              background: "#111111",
              border: "1px solid #222222",
              borderRadius: "40px",
              color: "#ffffff",
              fontSize: "14px",
              outline: "none"
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#ffd700"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#222222"}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "14px 20px",
              background: showFilters ? "#ffd700" : "#111",
              border: "1px solid #222",
              borderRadius: "40px",
              color: showFilters ? "#000" : "#fff",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Min Year</label>
              <input type="number" name="minYear" placeholder="e.g., 2020" value={filters.minYear} onChange={handleFilterChange} className="filter-input" />
            </div>
            <div className="filter-group">
              <label className="filter-label">Max Year</label>
              <input type="number" name="maxYear" placeholder="e.g., 2025" value={filters.maxYear} onChange={handleFilterChange} className="filter-input" />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Min Price (USD)</label>
              <input type="number" name="minPrice" placeholder="e.g., 50000" value={filters.minPrice} onChange={handleFilterChange} className="filter-input" />
            </div>
            <div className="filter-group">
              <label className="filter-label">Max Price (USD)</label>
              <input type="number" name="maxPrice" placeholder="e.g., 200000" value={filters.maxPrice} onChange={handleFilterChange} className="filter-input" />
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Max Mileage (miles)</label>
            <input type="number" name="maxMileage" placeholder="e.g., 50000" value={filters.maxMileage} onChange={handleFilterChange} className="filter-input" />
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Transmission</label>
              <select name="transmission" value={filters.transmission} onChange={handleFilterChange} className="filter-input">
                <option value="">All</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Fuel Type</label>
              <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange} className="filter-input">
                <option value="">All</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          
          <button onClick={clearFilters} style={{ marginTop: "12px", padding: "8px 16px", background: "transparent", border: "1px solid #ffd700", borderRadius: "8px", color: "#ffd700", cursor: "pointer", fontSize: "12px" }}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Cars Grid */}
      {filteredCars.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#0a0a0a", borderRadius: "24px" }}>
          <p style={{ color: "#888888" }}>No vehicles match your filters</p>
          <button onClick={clearFilters} style={{ marginTop: "16px", padding: "8px 20px", background: "#ffd700", border: "none", borderRadius: "8px", color: "#000", cursor: "pointer" }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="cars-grid">
          {filteredCars.map((car) => (
            <div key={car.id} className="motors-card" onClick={() => router.push(`/car/${car.id}`)}>
              <div style={{ position: "relative" }}>
                <img 
                  src={car.images?.[0] || "/placeholder.jpg"} 
                  alt={`${car.brand} ${car.model}`} 
                  className="motors-card-image" 
                  loading="lazy"
                />
                
                <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {car.is_urgent && <span className="badge" style={{ background: "#ff6600", color: "white" }}>PRICE DROP</span>}
                  {car.is_featured && <span className="badge" style={{ background: "#ffd700", color: "#000" }}>FEATURED</span>}
                  {car.condition === "New" && <span className="badge" style={{ background: "#00c853", color: "white" }}>NEW</span>}
                </div>

                <button className="favorite-btn" onClick={(e) => toggleFavorite(car.id, e)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={favorites.has(car.id) ? "#ff3b30" : "none"} stroke={favorites.has(car.id) ? "#ff3b30" : "#fff"} strokeWidth="2">
                    <path d="M12 21L10.55 19.7C5.4 15.1 2 12.1 2 8.5C2 5.4 4.4 3 7.5 3C9.3 3 11 3.9 12 5.3C13 3.9 14.7 3 16.5 3C19.6 3 22 5.4 22 8.5C22 12.1 18.6 15.1 13.45 19.7L12 21Z" />
                  </svg>
                </button>

                {car.status === "Sold" && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.85)", color: "#ff3b30", padding: "8px", textAlign: "center", fontSize: "13px", fontWeight: "600" }}>
                    SOLD
                  </div>
                )}
              </div>

              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>{car.brand} {car.model}</h3>
                    <p style={{ color: "#666", fontSize: "12px" }}>{car.year}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p className="price-ugx">UGX {car.price_ugx?.toLocaleString()}</p>
                    <p className="price-usd">${car.price_usd?.toLocaleString()} USD</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "12px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #1a1a1a" }}>
                  <span style={{ color: "#888", fontSize: "11px" }}>📍 {car.mileage?.toLocaleString() || 0} mi</span>
                  <span style={{ color: "#888", fontSize: "11px" }}>⚙️ {car.transmission}</span>
                  <span style={{ color: "#888", fontSize: "11px" }}>⛽ {car.fuel_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}