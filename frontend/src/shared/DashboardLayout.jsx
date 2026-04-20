import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout({ children, menuItems }) {
    const isMdOrLarger = () => window.innerWidth >= 768;

    const [isExpanded, setIsExpanded] = useState(() => {
        if (typeof window !== "undefined" && isMdOrLarger()) {
            return JSON.parse(sessionStorage.getItem("isExpanded")) ?? false;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== "undefined" && isMdOrLarger()) {
            sessionStorage.setItem("isExpanded", JSON.stringify(isExpanded));
        }
    }, [isExpanded]);

    const toggleSidebar = () => setIsExpanded(!isExpanded);

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar toggleSidebar={toggleSidebar} isExpanded={isExpanded} menuItems={menuItems} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'}`}>
                {children}
            </div>
        </div>
    );
}

export default DashboardLayout;
