import Sidebar from "../../shared/Sidebar";
import {
    Home, User, ShieldCheck, CreditCard, FileText,
    MessageSquare, Lock, Bell
} from "lucide-react";

const menuItems = [
    { name: "Profile", icon: <User size={18} />, link: "/tenant/tenant-profile" },
    { name: "KYC Documents", icon: <ShieldCheck size={18} />, link: "/tenant/tenant-kyc" },
    { name: "Rent History", icon: <CreditCard size={18} />, link: "/tenant/tenant-rent" },
    { name: "Complaints", icon: <MessageSquare size={18} />, link: "/tenant/tenant-complaints" },
    { name: "Lease Agreement", icon: <FileText size={18} />, link: "/tenant/tenant-lease" },
    { name: "Payments", icon: <CreditCard size={18} />, link: "/tenant/tenant-payments", disabled: true },
    { name: "Change Password", icon: <Lock size={18} />, link: "/tenant/tenant-change-password" },
];

export default function TenantSidebar({ isExpanded, toggleSidebar }) {
    return (
        <Sidebar
            isExpanded={isExpanded}
            toggleSidebar={toggleSidebar}
            menuItems={menuItems}
        />
    );
}
