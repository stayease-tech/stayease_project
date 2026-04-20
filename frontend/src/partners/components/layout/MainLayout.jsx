import { useState, useEffect } from "react";
import Sidebar from "../global-components/Sidebar";
import Navbar from "../global-components/Navbar";

function MainLayout({ children, title, description }) {
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

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 transition-all duration-300">
                <Navbar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

                <div className={`
                    text-slate-800 transition-all duration-300
                    ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} 
                    pt-20 px-8 pb-8
                `}>
                    {/* Optional Header Section */}
                    {(title || description) && (
                        <div className="mb-8">
                            {title && (
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-gray-500 text-sm lg:text-base">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Page Content */}
                    {children}
                </div>
            </div>
        </div>
    );
}

export default MainLayout;