import { FiMenu } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { LayoutDashboard } from "lucide-react";

/**
 * Sidebar — collapsible navigation sidebar shared across all portal dashboards.
 * Highlights the active route and renders a dashboard shortcut at the top.
 *
 * @param {object} props
 * @param {Function} props.toggleSidebar - Callback to toggle expanded/collapsed state.
 * @param {boolean} props.isExpanded - Whether the sidebar is currently expanded.
 * @param {Array<{name: string, link: string, icon: React.ReactNode, disabled?: boolean}>} props.menuItems - Navigation items to render.
 * @returns {React.ReactElement}
 */
export default function Sidebar({ toggleSidebar, isExpanded, menuItems }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { userType, DEFAULT_ROUTES } = useAuth();

    const dashboardLink = DEFAULT_ROUTES?.[userType] || "/login";

    return (
        <div
            className={`min-h-screen bg-[#0A0A0A] border-r border-neutral-800 text-neutral-400 flex flex-col duration-300 fixed z-[100] left-0 top-0 ${isExpanded ? "w-64" : "w-16"}`}
        >
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-4 py-5 border-b border-neutral-800/50">
                <button onClick={toggleSidebar} className="text-xl text-neutral-500 hover:text-white transition-colors p-1">
                    {isExpanded ? <FaArrowLeft /> : <FiMenu />}
                </button>
                {isExpanded && (
                    <span
                        className="text-[#D4A017] font-bold text-base tracking-tight cursor-pointer"
                        onClick={() => navigate(dashboardLink)}
                    >
                        StayEase
                    </span>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-2 overflow-y-auto">
                <ul className="space-y-1">
                    {/* Dashboard link */}
                    <li>
                        <Link
                            to={dashboardLink}
                            className={`flex items-center gap-2.5 rounded-lg transition-all duration-200 ${
                                isExpanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                            } ${
                                location.pathname === dashboardLink
                                    ? "bg-[#D4A017] text-black font-medium shadow-lg shadow-[#D4A017]/30"
                                    : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                            }`}
                        >
                            <span className="text-lg flex-shrink-0"><LayoutDashboard size={18} /></span>
                            {isExpanded && <span className="text-sm">Dashboard</span>}
                        </Link>
                    </li>
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname === item.link;
                        const isDisabled = item.disabled;
                        return (
                            <li key={index}>
                                {isDisabled ? (
                                    <span
                                        className={`flex items-center gap-2.5 rounded-lg transition-all duration-200 opacity-40 cursor-not-allowed ${
                                            isExpanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                                        } text-neutral-500`}
                                        title="Coming soon"
                                    >
                                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                                        {isExpanded && <span className="text-sm">{item.name}</span>}
                                    </span>
                                ) : (
                                    <Link
                                        to={item.link}
                                        className={`flex items-center gap-2.5 rounded-lg transition-all duration-200 ${
                                            isExpanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                                        } ${
                                            isActive
                                                ? "bg-[#D4A017] text-black font-medium shadow-lg shadow-[#D4A017]/30"
                                                : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                                        }`}
                                    >
                                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                                        {isExpanded && <span className="text-sm">{item.name}</span>}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
