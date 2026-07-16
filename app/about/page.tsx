"use client";

import { useState } from "react";
import {
  Award,
  Shield,
  Truck,
  ThumbsUp,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle,
  Globe,
  ShoppingBag,
  Car,
  Sparkles,
  Users,
} from "lucide-react";

export default function AboutPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div suppressHydrationWarning>
      <style>{`
        .about-section {
          margin-bottom: 48px;
        }
        .about-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
          color: #ffffff;
        }
        .about-title span {
          color: #ffd700;
        }
        .about-text {
          color: #cccccc;
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin: 32px 0;
        }
        .info-card {
          background: #0a0a0a;
          border: 1px solid #1a1a1a;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        .info-card:hover {
          border-color: #ffd700;
          transform: translateY(-4px);
        }
        .info-icon {
          margin-bottom: 16px;
        }
        .info-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #ffd700;
        }
        .info-detail {
          color: #888888;
          font-size: 14px;
          line-height: 1.5;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #1a1a1a;
        }
        .contact-item:last-child {
          border-bottom: none;
        }
        .contact-icon {
          width: 40px;
          height: 40px;
          background: #111111;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffd700;
        }
        .contact-text {
          flex: 1;
        }
        .contact-label {
          font-size: 12px;
          color: #666666;
          margin-bottom: 2px;
        }
        .contact-value {
          font-size: 14px;
          color: #ffffff;
          font-weight: 500;
        }
        .contact-link {
          color: #ffd700;
          text-decoration: none;
        }
        .contact-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .about-title {
            font-size: 24px;
          }
          .about-text {
            font-size: 14px;
            line-height: 1.6;
          }
          .info-card {
            padding: 20px;
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div className="about-section" suppressHydrationWarning>
        <h1 className="about-title" suppressHydrationWarning>
          About <span>Kapyaata</span>
        </h1>
        <p className="about-text" suppressHydrationWarning>
          Welcome to <strong>Kapyaata</strong>, your trusted partner in the automotive industry across East Africa. 
          We specialize in providing premium vehicles, genuine spare parts, and top-quality car accessories 
          sourced from around the world.
        </p>
        <p className="about-text" suppressHydrationWarning>
          Whether you're looking for a brand-new luxury car, a reliable used vehicle, or need help importing 
          your dream car from any part of the globe, Kapyaata is here to make it happen. We serve customers 
          across Uganda, Kenya, Tanzania, Rwanda, and the entire East African region.
        </p>
      </div>

      {/* Mission Section */}
      <div className="about-section" suppressHydrationWarning>
        <h2 className="about-title" style={{ fontSize: "22px" }} suppressHydrationWarning>
          Our <span>Mission</span>
        </h2>
        <p className="about-text" suppressHydrationWarning>
          To connect East Africans with the world's finest vehicles, parts, and accessories through a 
          seamless, transparent, and customer-first experience. We're redefining how people buy cars 
          and auto products in the region.
        </p>
      </div>

      {/* What We Offer */}
      <div className="about-section" suppressHydrationWarning>
        <h2 className="about-title" style={{ fontSize: "22px" }} suppressHydrationWarning>
          What <span>We Offer</span>
        </h2>
        <div className="info-grid" suppressHydrationWarning>
          <div className="info-card" suppressHydrationWarning>
            <div className="info-icon" suppressHydrationWarning>
              <Car size={32} color="#ffd700" />
            </div>
            <h3 className="info-title" suppressHydrationWarning>New & Used Cars</h3>
            <p className="info-detail" suppressHydrationWarning>
              Premium brand-new and quality-tested used vehicles sourced from trusted dealers worldwide.
            </p>
          </div>
          <div className="info-card" suppressHydrationWarning>
            <div className="info-icon" suppressHydrationWarning>
              <Globe size={32} color="#ffd700" />
            </div>
            <h3 className="info-title" suppressHydrationWarning>Car Importation</h3>
            <p className="info-detail" suppressHydrationWarning>
              We help you import any car from any country with full logistics, customs clearance, and delivery.
            </p>
          </div>
          <div className="info-card" suppressHydrationWarning>
            <div className="info-icon" suppressHydrationWarning>
              <ShoppingBag size={32} color="#ffd700" />
            </div>
            <h3 className="info-title" suppressHydrationWarning>Spare Parts</h3>
            <p className="info-detail" suppressHydrationWarning>
              Genuine spare parts for all makes and models, sourced from manufacturers across the globe.
            </p>
          </div>
          <div className="info-card" suppressHydrationWarning>
            <div className="info-icon" suppressHydrationWarning>
              <Sparkles size={32} color="#ffd700" />
            </div>
            <h3 className="info-title" suppressHydrationWarning>Car Accessories</h3>
            <p className="info-detail" suppressHydrationWarning>
              Premium accessories from international brands to customize your vehicle to perfection.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="about-section" suppressHydrationWarning>
        <h2 className="about-title" style={{ fontSize: "22px" }} suppressHydrationWarning>
          Why Choose <span>Kapyaata</span>
        </h2>
        <div className="info-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }} suppressHydrationWarning>
          <div className="info-card" suppressHydrationWarning>
            <div className="info-icon" suppressHydrationWarning>
              <Award size={32} color="#ffd700" />
            </div>
            <h3 className="info-title" suppressHydrationWarning>Trusted & Certified</h3>
            <p className="info-detail" suppressHydrationWarning>
              Serving East Africa with integrity and excellence for over 1 year.
            </p>
          </div>
          <div className="info-card" suppressHydrationWarning>
            <div className="info-icon" suppressHydrationWarning>
              <Shield size={32} color="#ffd700" />
            </div>
            <h3 className="info-title" suppressHydrationWarning>Secure Transactions</h3>
            <p className="info-detail" suppressHydrationWarning>
              All your transactions are protected with industry-leading security standards.
            </p>
          </div>
          <div className="info-card" suppressHydrationWarning>
            <div className="info-icon" suppressHydrationWarning>
              <Users size={32} color="#ffd700" />
            </div>
            <h3 className="info-title" suppressHydrationWarning>Customer First</h3>
            <p className="info-detail" suppressHydrationWarning>
              We put our customers at the heart of everything we do. Your satisfaction is our priority.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="about-section" suppressHydrationWarning>
        <h2 className="about-title" style={{ fontSize: "22px" }} suppressHydrationWarning>
          Contact <span>Us</span>
        </h2>
        
        <div className="info-grid" style={{ gridTemplateColumns: "1fr 1fr" }} suppressHydrationWarning>
          <div className="info-card" suppressHydrationWarning>
            <h3 className="info-title" style={{ fontSize: "16px", marginBottom: "16px" }} suppressHydrationWarning>Get in Touch</h3>
            
            <div className="contact-item" suppressHydrationWarning>
              <div className="contact-icon" suppressHydrationWarning>
                <MapPin size={20} />
              </div>
              <div className="contact-text" suppressHydrationWarning>
                <div className="contact-label" suppressHydrationWarning>Address</div>
                <div className="contact-value" suppressHydrationWarning>Kampala, Uganda</div>
              </div>
            </div>
            
            <div className="contact-item" suppressHydrationWarning>
              <div className="contact-icon" suppressHydrationWarning>
                <Phone size={20} />
              </div>
              <div className="contact-text" suppressHydrationWarning>
                <div className="contact-label" suppressHydrationWarning>Phone</div>
                <div className="contact-value" suppressHydrationWarning>
                  <a href="tel:+256123456789" className="contact-link" suppressHydrationWarning>+256 123 456 789</a>
                </div>
              </div>
            </div>
            
            <div className="contact-item" suppressHydrationWarning>
              <div className="contact-icon" suppressHydrationWarning>
                <Mail size={20} />
              </div>
              <div className="contact-text" suppressHydrationWarning>
                <div className="contact-label" suppressHydrationWarning>Email</div>
                <div className="contact-value" suppressHydrationWarning>
                  <a href="mailto:info@kapyaata.com" className="contact-link" suppressHydrationWarning>info@kapyaata.com</a>
                </div>
              </div>
            </div>
            
            <div className="contact-item" suppressHydrationWarning>
              <div className="contact-icon" suppressHydrationWarning>
                <MessageCircle size={20} />
              </div>
              <div className="contact-text" suppressHydrationWarning>
                <div className="contact-label" suppressHydrationWarning>WhatsApp</div>
                <div className="contact-value" suppressHydrationWarning>
                  <a href="https://wa.me/256123456789" target="_blank" className="contact-link" rel="noopener noreferrer" suppressHydrationWarning>+256 123 456 789</a>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card" suppressHydrationWarning>
            <h3 className="info-title" style={{ fontSize: "16px", marginBottom: "16px" }} suppressHydrationWarning>Business Hours</h3>
            
            <div className="contact-item" suppressHydrationWarning>
              <div className="contact-icon" suppressHydrationWarning>
                <Clock size={20} />
              </div>
              <div className="contact-text" suppressHydrationWarning>
                <div className="contact-label" suppressHydrationWarning>Monday - Friday</div>
                <div className="contact-value" suppressHydrationWarning>9:00 AM - 8:00 PM</div>
              </div>
            </div>
            
            <div className="contact-item" suppressHydrationWarning>
              <div className="contact-icon" suppressHydrationWarning>
                <Clock size={20} />
              </div>
              <div className="contact-text" suppressHydrationWarning>
                <div className="contact-label" suppressHydrationWarning>Saturday</div>
                <div className="contact-value" suppressHydrationWarning>10:00 AM - 6:00 PM</div>
              </div>
            </div>
            
            <div className="contact-item" suppressHydrationWarning>
              <div className="contact-icon" suppressHydrationWarning>
                <Clock size={20} />
              </div>
              <div className="contact-text" suppressHydrationWarning>
                <div className="contact-label" suppressHydrationWarning>Sunday</div>
                <div className="contact-value" suppressHydrationWarning>11:00 AM - 4:00 PM</div>
              </div>
            </div>
            
            <div className="contact-item" suppressHydrationWarning>
              <div className="contact-icon" suppressHydrationWarning>
                <MessageCircle size={20} />
              </div>
              <div className="contact-text" suppressHydrationWarning>
                <div className="contact-label" suppressHydrationWarning>Support</div>
                <div className="contact-value" suppressHydrationWarning>24/7 Online Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp & Call Buttons */}
      <div suppressHydrationWarning style={{ 
        display: "flex", 
        gap: "16px", 
        flexWrap: "wrap",
        marginTop: "32px",
        paddingTop: "32px",
        borderTop: "1px solid #1a1a1a"
      }}>
        <a
          href="https://wa.me/256123456789"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "14px 24px",
            background: "#25D366",
            border: "none",
            borderRadius: "12px",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            textAlign: "center",
            textDecoration: "none",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          suppressHydrationWarning
        >
          <MessageCircle size={20} /> Chat on WhatsApp
        </a>
        <a
          href="tel:+256123456789"
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "14px 24px",
            background: "#ffd700",
            border: "none",
            borderRadius: "12px",
            color: "#000000",
            fontSize: "14px",
            fontWeight: "600",
            textAlign: "center",
            textDecoration: "none",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#e6c200"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#ffd700"}
          suppressHydrationWarning
        >
          <Phone size={20} /> Call Us Now
        </a>
      </div>
    </div>
  );
}