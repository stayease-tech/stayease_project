import Sidebar from "../../shared/Sidebar";
import {
    ShieldCheck, CreditCard, FileText,
    MessageSquare, Lock
} from "lucide-react";

const menuItems = [
    { name: "KYC Documents", icon: <ShieldCheck size={18} />, link: "/resident/kyc" },
    { name: "Rent History", icon: <CreditCard size={18} />, link: "/resident/rent-history" },
    { name: "Maintenance Requests", icon: <MessageSquare size={18} />, link: "/resident/complaints" },
    { name: "Lease Agreement", icon: <FileText size={18} />, link: "/resident/lease" },
    { name: "Payments", icon: <CreditCard size={18} />, link: "/resident/payments", disabled: true },
    { name: "Change Password", icon: <Lock size={18} />, link: "/resident/change-password" },
];

export default function residentSidebar({ isExpanded, toggleSidebar }) {
    return (
        <Sidebar
            isExpanded={isExpanded}
            toggleSidebar={toggleSidebar}
            menuItems={menuItems}
        />
    );
}
