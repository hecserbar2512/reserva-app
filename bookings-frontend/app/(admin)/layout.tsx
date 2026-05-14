"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<string>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: string) => {
    // Remove all possible theme classes
    const classes = ["light-mode", "theme-pink", "theme-green", "theme-orange"];
    document.documentElement.classList.remove(...classes);
    
    // Add the new one if it's not dark (dark is default/empty)
    if (newTheme === "light") document.documentElement.classList.add("light-mode");
    if (newTheme === "pink") document.documentElement.classList.add("theme-pink");
    if (newTheme === "green") document.documentElement.classList.add("theme-green");
    if (newTheme === "orange") document.documentElement.classList.add("theme-orange");
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="admin-shell">
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "sidebar-overlay--active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="admin-main">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          theme={mounted ? theme : "dark"}
          onChangeTheme={changeTheme}
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}