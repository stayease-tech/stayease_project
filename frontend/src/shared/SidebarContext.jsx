// Copyright Aravind Adari
import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
    const [isExpanded, setIsExpanded] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem("sidebarExpanded")) ?? false; } catch { return false; }
    });

    useEffect(() => {
        sessionStorage.setItem("sidebarExpanded", JSON.stringify(isExpanded));
    }, [isExpanded]);

    const toggleSidebar = () => setIsExpanded(prev => !prev);

    return (
        <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const ctx = useContext(SidebarContext);
    if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider");
    return ctx;
}
