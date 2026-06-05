// Copyright Aravind Adari
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext";
import { useSidebar } from "./SidebarContext";

/**
 * Navbar — top navigation bar for all authenticated portal views.
 * Displays the brand logo, a user avatar dropdown, and auto-logs out at 23:59:59.
 *
 * @returns {React.ReactElement}
 */
export default function Navbar() {
    const navigate = useNavigate();
    const auth = useAuth();
    const { isExpanded } = useSidebar();

    const [open, setOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const dropdownRef = useRef(null);
    const logoutTimeoutRef = useRef();

    useEffect(() => {
        const schedulePreciseLogout = () => {
            const now = new Date();
            const logoutTime = new Date();
            logoutTime.setHours(23, 59, 59, 0);
            if (now >= logoutTime) logoutTime.setDate(logoutTime.getDate() + 1);
            const timeUntilLogout = logoutTime.getTime() - now.getTime();
            if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
            logoutTimeoutRef.current = setTimeout(() => {
                handleLogout();
                schedulePreciseLogout();
            }, timeUntilLogout);
        };
        schedulePreciseLogout();
        return () => { if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current); };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    /**
     * Calls the auth logout action and redirects to the appropriate login page.
     *
     * @returns {Promise<void>}
     */
    const handleLogout = async () => {
        setIsLoggingOut(true);
        const wasResident = auth.userType === 'resident';
        try { await auth.logout(); } catch (error) { console.error('Auto logout failed:', error); }
        finally { setIsLoggingOut(false); navigate(wasResident ? "/resident-login" : "/login"); }
    };

    const activityRoute = auth.userType ? `/${auth.userType}/${auth.userType}-user-activity-data` : "#";
    const dashboardRoute = auth.DEFAULT_ROUTES?.[auth.userType] || "/login";

    return (
        <nav className={`bg-[#0A0A0A] shadow-md fixed top-0 right-0 z-50 transition-all duration-300 ${isExpanded ? 'left-64' : 'left-16'}`}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate(dashboardRoute)}>
                        <img alt="StayEase" src="/static/img/brand_logo/stayEase-Logo.webp" className="h-10 w-auto object-contain" loading="lazy" />
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                            onClick={() => setOpen(!open)}
                        >
                            <div className="w-8 h-8 rounded-full bg-[#D4A017] text-black flex items-center justify-center text-sm font-semibold">
                                {(auth.user || 'U')[0]?.toUpperCase()}
                            </div>
                            {auth.userType && (
                                <span className="hidden sm:block text-sm font-medium text-neutral-300 capitalize">{auth.userType}</span>
                            )}
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900 truncate">{auth.user}</p>
                                    <p className="text-xs text-gray-500 capitalize">{auth.userType}</p>
                                </div>
                                <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    onClick={() => { navigate(activityRoute); setOpen(false); }}
                                >
                                    <FiUser size={14} /> Activity Stats
                                </button>
                                <hr className="my-1 border-gray-100" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    disabled={isLoggingOut}
                                >
                                    <FiLogOut size={14} /> {isLoggingOut ? "Logging Out..." : "Log Out"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
