import { useState, useEffect } from "react";
import { 
    Menu, 
    Home, 
    Settings, 
    User, 
    Bell, 
    X, 
    ArrowLeft, 
    Building2, 
    Landmark,
    Shield,
    FileText,
    DollarSign,
    LifeBuoy
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

export default function Sidebar({ toggleSidebar, isExpanded }) {
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    // Check for mobile screen size
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            
            // On mobile, when sidebar is expanded, show overlay
            if (mobile && isExpanded) {
                setIsOverlayVisible(true);
                document.body.style.overflow = 'hidden';
            } else {
                setIsOverlayVisible(false);
                document.body.style.overflow = 'unset';
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => {
            window.removeEventListener('resize', checkScreenSize);
            document.body.style.overflow = 'unset';
        };
    }, [isExpanded]);

    const handleItemClick = () => {
        // Close sidebar on mobile when menu item is clicked
        if (isMobile && isExpanded) {
            toggleSidebar();
        }
    };

    const handleOverlayClick = () => {
        if (isMobile && isExpanded) {
            toggleSidebar();
        }
    };

    const menuItems = [
        { 
            name: "View Stats", 
            icon: <Home size={20} />, 
            link: "/partners/partners-home",
            description: "Overview & Analytics"
        },
        { 
            name: "Property Details", 
            icon: <Building2 size={20} />, 
            link: "/partners/partners-properties",
            description: "Manage your listings",
        },
        { 
            name: "Documents", 
            icon: <FileText size={20} />, 
            link: "/partners/partners-documents",
            description: "Contracts & files",
            disabled: true
        },
        { 
            name: "Rent", 
            icon: <DollarSign size={20} />, 
            link: "/partners/partners-rent",
            description: "Rental payments",
            disabled: true
        },
        { 
            name: "Update KYC", 
            icon: <Shield size={20} />, 
            link: "/partners/partners-kyc-details",
            description: "Verification status"
        },
        { 
            name: "Raise Ticket", 
            icon: <LifeBuoy size={20} />, 
            link: "/partners/partners-raise-ticket",
            description: "Get support",
            disabled: true
        },
    ];

    const MenuItem = ({ item, index }) => {
        const isActive = location.pathname === item.link;
        
        if (item.disabled) {
            return (
                <li key={index} className="relative z-10">
                    <span
                        onMouseEnter={() => setHoveredItem(index)}
                        onMouseLeave={() => setHoveredItem(null)}
                        title="Coming soon"
                        className={`
                            flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden cursor-not-allowed
                            ${(isExpanded || isMobile) ? "p-3 mx-2 space-x-3" : "p-3 mx-2 justify-center"}
                            opacity-40 text-neutral-500
                        `}
                    >
                        <div className="relative flex-shrink-0">
                            <span className="transition-transform duration-300">{item.icon}</span>
                        </div>
                        {(isExpanded || isMobile) && (
                            <div className="flex-1 min-w-0">
                                <span className="font-medium text-sm block truncate">{item.name}</span>
                            </div>
                        )}
                    </span>
                </li>
            );
        }

        return (
            <li key={index} className="relative z-10">
                <Link
                    to={item.link}
                    onClick={handleItemClick}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                        flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden
                        ${(isExpanded || isMobile) ? "p-3 mx-2 space-x-3" : "p-3 mx-2 justify-center"}
                        ${item.disabled
                            ? "opacity-40 cursor-not-allowed text-neutral-500"
                            : isActive 
                                ? "bg-[#D4A017] text-black font-medium shadow-lg shadow-[#D4A017]/30" 
                                : "hover:bg-white/[0.06] hover:text-white text-neutral-400"
                        }
                    `}
                >   
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                        <span className={`transition-transform duration-300 ${
                            isActive ? 'scale-110' : 'group-hover:scale-110'
                        }`}>
                            {item.icon}
                        </span>
                        {item.badge && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                {item.badge}
                            </span>
                        )}
                    </div>
                    
                    {/* Text */}
                    {(isExpanded || isMobile) && (
                        <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm block truncate">
                                {item.name}
                            </span>
                            {/* {!isActive && (
                                <span className="text-xs text-gray-400 block truncate hidden group-hover:block transition-opacity duration-300">
                                    {item.description}
                                </span>
                            )} */}
                        </div>
                    )}
                </Link>

                {/* Tooltip for collapsed state - Only show on desktop */}
                {!isMobile && !isExpanded && hoveredItem === index && (
                    <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-neutral-900 text-white px-3 py-2 rounded-lg shadow-xl z-50 whitespace-nowrap border border-neutral-700">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <div className="text-xs text-neutral-400">{item.description}</div>
                        {/* Arrow */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-900 rotate-45 border-l border-b border-neutral-700"></div>
                    </div>
                )}
            </li>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOverlayVisible && (
                <div
                    className="fixed inset-0 bg-black/50 z-[99] md:hidden"
                    onClick={handleOverlayClick}
                ></div>
            )}

            <div
                className={`
                    min-h-screen bg-[#0A0A0A]
                    border-r border-neutral-800 text-white 
                    transition-all duration-300 ease-in-out
                    fixed z-[100] left-0 top-0 shadow-2xl
                    ${isMobile 
                        ? isExpanded 
                            ? "w-64 translate-x-0" 
                            : "w-16 -translate-x-full md:translate-x-0"
                        : isExpanded 
                            ? "w-64" 
                            : "w-16"
                    }
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-neutral-800">
                    <div className="flex items-center justify-between">
                        {(isExpanded) && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-[#D4A017] rounded-lg flex items-center justify-center">
                                    <Building2 size={16} className="text-black" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-sm text-white">StayEase</h2>
                                    <p className="text-xs text-slate-400">Partner Portal</p>
                                </div>
                            </div>
                        )}
                        
                        <button 
                            onClick={toggleSidebar} 
                            className={`
                                p-2 rounded-lg transition-all duration-300 
                                hover:bg-neutral-800 hover:text-white text-neutral-400
                                ${(!isExpanded && !isMobile) && 'mx-auto'}
                            `}
                        >
                            {isMobile && isExpanded ? (
                                <X size={18} />
                            ) : isExpanded ? (
                                <ArrowLeft size={18} />
                            ) : (
                                <Menu size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 py-6">
                    <nav>
                        <ul className="space-y-2">
                            {menuItems.map((item, index) => (
                                <MenuItem key={index} item={item} index={index} />
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="absolute bottom-4 left-3 right-3">
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="#"
                                className="flex items-center space-x-3 px-3 py-3 rounded-xl 
                                    transition-all duration-200 group relative overflow-hidden
                                    hover:bg-[#D4A017]/10 hover:text-white text-neutral-400"
                            >
                                {/* Icon */}
                                <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                                    <Settings />
                                </span>
                                
                                {/* Text */}
                                {isExpanded && (
                                    <span className="text-sm font-medium transition-all duration-200">
                                        Settings
                                    </span>
                                )}

                                {/* Tooltip for collapsed state */}
                                {!isExpanded && (
                                    <div className="
                                        absolute left-full ml-2 px-3 py-2 bg-[#D4A017] text-black text-sm 
                                        rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 
                                        transition-opacity duration-200 whitespace-nowrap z-50
                                        shadow-lg
                                    ">
                                        Settings
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 
                                            border-4 border-transparent border-r-[#D4A017]" />
                                    </div>
                                )}
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4A017]/5 to-transparent pointer-events-none"></div>
            </div>
        </>
    );
}