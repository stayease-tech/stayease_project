import Sidebar from "../../shared/Sidebar";
import {
    ShieldCheck, CreditCard, FileText,
    MessageSquare, Lock
} from "lucide-react";

const menuItems = [
    { name: "KYC Documents", icon: <ShieldCheck size={18} />, link: "/tenant/kyc" },
    { name: "Rent History", icon: <CreditCard size={18} />, link: "/tenant/rent-history" },
    { name: "Maintenance Requests", icon: <MessageSquare size={18} />, link: "/tenant/complaints" },
    { name: "Lease Agreement", icon: <FileText size={18} />, link: "/tenant/lease" },
    { name: "Payments", icon: <CreditCard size={18} />, link: "/tenant/payments", disabled: true },
    { name: "Change Password", icon: <Lock size={18} />, link: "/tenant/change-password" },
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
