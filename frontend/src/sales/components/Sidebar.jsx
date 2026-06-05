// Copyright Aravind Adari
import { LiaBedSolid } from "react-icons/lia";
import { MdLeaderboard, MdPersonAdd } from "react-icons/md";
import { FaFileContract, FaFilePdf } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";
import { HiShieldCheck } from "react-icons/hi2";
import SharedSidebar from "../../shared/Sidebar";

const menuItems = [
    { name: "View Beds", icon: <LiaBedSolid />, link: "/sales/sales-beds-table" },
    { name: "Add Resident", icon: <MdPersonAdd />, link: "/sales/sales-resident-form/new" },
    { name: "Agreements", icon: <FaFileContract />, link: "/sales/sales-agreement-pdf", disabled: true },
    { name: "Download PDF", icon: <FaFilePdf />, link: "/sales/sales-download-pdf", disabled: true },
    { name: "Track Rent", icon: <TbReportMoney />, link: "/sales/sales-track-rent", disabled: true },
    { name: "Leads", icon: <MdLeaderboard />, link: "/sales/sales-leads-table" },
    { name: "KYC Management", icon: <HiShieldCheck />, link: "/sales/sales-kyc-management" },
];

export default function Sidebar() {
    return <SharedSidebar menuItems={menuItems} />;
}
