"use client";

import { useState } from "react";

export default function AboutPage() {
  return (
    <div>
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
          font-size: 32px;
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
          font-size: 20px;
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
        }
      `}</style>

      {/* Hero Section */}
      <div className="about-section">
        <h1 className="about-title">
          About <span>Motors</span>
        </h1>
        <p className="about-text">
          Founded in 2024, Motors has established itself as a premier destination for luxury and 
          performance vehicles. Our commitment to excellence, transparency, and customer satisfaction 
          sets us apart in the automotive industry.
        </p>
        <p className="about-text">
          We believe that buying a car should be an exciting and seamless experience. That's why 
          we've built a platform that combines cutting-edge technology with genuine expertise, 
          offering you access to the finest vehicles from around the world.
        </p>
      </div>

      {/* Mission & Values */}
      <div className="about-section">
        <h2 className="about-title" style={{ fontSize: "22px" }}>
          Our <span>Mission</span>
        </h2>
        <p className="about-text">
          To provide an unparalleled car buying experience by offering premium vehicles, 
          transparent pricing, and exceptional service. We strive to connect car enthusiasts 
          with their dream cars while maintaining the highest standards of integrity and professionalism.
        </p>
      </div>

      {/* Key Information Grid */}
      <div className="info-grid">
        <div className="info-card">
          <div className="info-icon">🏆</div>
          <h3 className="info-title">Quality Assurance</h3>
          <p className="info-detail">Every vehicle undergoes rigorous inspection to ensure it meets our premium standards before being listed.</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🔒</div>
          <h3 className="info-title">Secure Transactions</h3>
          <p className="info-detail">Your security is our priority. All transactions are protected with industry-standard encryption.</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🚚</div>
          <h3 className="info-title">Worldwide Delivery</h3>
          <p className="info-detail">We offer secure shipping options to deliver your vehicle anywhere in the world.</p>
        </div>
        <div className="info-card">
          <div className="info-icon">💯</div>
          <h3 className="info-title">Satisfaction Guaranteed</h3>
          <p className="info-detail">Our team is dedicated to ensuring you drive away with complete peace of mind.</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="about-section">
        <h2 className="about-title" style={{ fontSize: "22px" }}>
          Contact <span>Us</span>
        </h2>
        
        <div className="info-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Left Column - Contact Details */}
          <div className="info-card">
            <h3 className="info-title" style={{ fontSize: "16px", marginBottom: "16px" }}>Get in Touch</h3>
            
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div className="contact-text">
                <div className="contact-label">Address</div>
                <div className="contact-value">123 Premium Drive, Kampala, Uganda</div>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div className="contact-text">
                <div className="contact-label">Phone</div>
                <div className="contact-value">
                  <a href="tel:+256123456789" className="contact-link">+256 123 456 789</a>
                </div>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">✉️</div>
              <div className="contact-text">
                <div className="contact-label">Email</div>
                <div className="contact-value">
                  <a href="mailto:info@motors.com" className="contact-link">info@motors.com</a>
                </div>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">💬</div>
              <div className="contact-text">
                <div className="contact-label">WhatsApp</div>
                <div className="contact-value">
                  <a href="https://wa.me/256123456789" target="_blank" className="contact-link">+256 123 456 789</a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Hours */}
          <div className="info-card">
            <h3 className="info-title" style={{ fontSize: "16px", marginBottom: "16px" }}>Business Hours</h3>
            
            <div className="contact-item">
              <div className="contact-text">
                <div className="contact-label">Monday - Friday</div>
                <div className="contact-value">9:00 AM - 8:00 PM</div>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-text">
                <div className="contact-label">Saturday</div>
                <div className="contact-value">10:00 AM - 6:00 PM</div>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-text">
                <div className="contact-label">Sunday</div>
                <div className="contact-value">11:00 AM - 4:00 PM</div>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-text">
                <div className="contact-label">Support</div>
                <div className="contact-value">24/7 Online Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp & Call Buttons */}
      <div style={{ 
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
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
          💬 Chat on WhatsApp
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
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#e6c200"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#ffd700"}
        >
          📞 Call Us Now
        </a>
      </div>
    </div>
  );
}