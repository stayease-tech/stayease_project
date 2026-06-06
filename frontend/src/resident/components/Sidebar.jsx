// Copyright Aravind Adari
import Sidebar from "../../shared/Sidebar";
import { ShieldCheck, CreditCard, MessageSquare } from "lucide-react";

/**
 * ResidentSidebar — resident portal navigation sidebar.
 * Reads KYC and lease status from localStorage to determine which nav items
 * are visible; fully onboarded residents see rent history, payments, maintenance
 * requests, and lease, while pending residents see only onboarding steps.
 *
 * @returns {React.ReactElement}
 */
export default function ResidentSidebar() {
    const { kycPending, leaseCompleted } = (() => {
        try {
            const data = JSON.parse(localStorage.getItem("residentData") || "{}");
            return {
                kycPending: data.kycApprovalStatus !== "Approved",
                leaseCompleted: data.leaseCompleted === true,
            };
        } catch { return { kycPending: true, leaseCompleted: false }; }
    })();

    const fullyOnboarded = !kycPending && leaseCompleted;

    const menuItems = [
        ...(kycPending ? [{ name: "KYC Documents", icon: <ShieldCheck size={18} />, link: "/resident/kyc" }] : []),
        ...(fullyOnboarded ? [
            { name: "Rent History", icon: <CreditCard size={18} />, link: "/resident/rent-history" },
            { name: "Maintenance Requests", icon: <MessageSquare size={18} />, link: "/resident/complaints" },
            { name: "Payments", icon: <CreditCard size={18} />, link: "/resident/payments" },
        ] : []),
    ];

    return <Sidebar menuItems={menuItems} />;
}
