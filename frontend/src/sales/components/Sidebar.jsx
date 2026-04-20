import { LiaBedSolid } from "react-icons/lia";
import { MdLeaderboard, MdOutlineStickyNote2, MdPersonAdd } from "react-icons/md";
import { FaFileContract, FaFilePdf } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";
import SharedSidebar from "../../shared/Sidebar";

const menuItems = [
    { name: "View Beds", icon: <LiaBedSolid />, link: "/sales/sales-beds-table" },
    { name: "Add Resident", icon: <MdPersonAdd />, link: "/sales/sales-tenant-form/new", disabled: true },
    { name: "Agreements", icon: <FaFileContract />, link: "/sales/sales-agreement-pdf", disabled: true },
    { name: "Download PDF", icon: <FaFilePdf />, link: "/sales/sales-download-pdf", disabled: true },
    { name: "Track Rent", icon: <TbReportMoney />, link: "/sales/sales-track-rent", disabled: true },
    { name: "Leads", icon: <MdLeaderboard />, link: "/sales/sales-leads-table" },
    { name: "Raise Expense", icon: <MdOutlineStickyNote2 />, link: "/sales/sales-expense-form" },
];

export default function Sidebar({ toggleSidebar, isExpanded }) {
    return <SharedSidebar toggleSidebar={toggleSidebar} isExpanded={isExpanded} menuItems={menuItems} />;
}
