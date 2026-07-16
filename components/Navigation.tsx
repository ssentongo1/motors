"use client";

import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { path: "/", label: "Home", icon: "M3 12L12 3L21 12L19 12M19 12V19H5V12H19Z" },
    { path: "/shop", label: "Shop", icon: "M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" },
    { path: "/blog", label: "Blog", icon: "M19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20Z M3 8H21 M7 12H9 M7 16H9 M13 12H17 M13 16H17" },
    { path: "/favorites", label: "Saved", icon: "M12 21L10.55 19.7C5.4 15.1 2 12.1 2 8.5C2 5.4 4.4 3 7.5 3C9.3 3 11 3.9 12 5.3C13 3.9 14.7 3 16.5 3C19.6 3 22 5.4 22 8.5C22 12.1 18.6 15.1 13.45 19.7L12 21Z" },
    { path: "/about", label: "About", icon: "M12 11.5C13.933 11.5 15.5 9.933 15.5 8C15.5 6.067 13.933 4.5 12 4.5C10.067 4.5 8.5 6.067 8.5 8C8.5 9.933 10.067 11.5 12 11.5ZM12 13.5C9.33 13.5 4 15.17 4 17.5V19H20V17.5C20 15.17 14.67 13.5 12 13.5Z" },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#0a0a0a",
      borderTop: "1px solid #1a1a1a",
      padding: "10px 20px 22px 20px",
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center"
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                flex: 1
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isActive ? "#ffd700" : "#666666"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: "all 0.2s ease"
                }}
              >
                <path d={item.icon} />
              </svg>
              <span style={{
                fontSize: "10px",
                letterSpacing: "0.5px",
                color: isActive ? "#ffd700" : "#666666",
                fontWeight: isActive ? "500" : "400"
              }}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}