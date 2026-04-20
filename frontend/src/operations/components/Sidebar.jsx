import { LiaBedSolid } from "react-icons/lia";
import { GoChecklist } from "react-icons/go";
import { MdOutlineStickyNote2 } from "react-icons/md";
import { GiTicket } from "react-icons/gi";
import { FaFileContract, FaTruckMoving } from "react-icons/fa";
import { MdMoveToInbox, MdOutlineExitToApp } from "react-icons/md";
import { IoPersonSharp } from "react-icons/io5";
import { HiShieldCheck } from "react-icons/hi2";
import SharedSidebar from "../../shared/Sidebar";

const menuItems = [
    { name: "View Beds", icon: <LiaBedSolid />, link: "/operations/operations-beds-table" },
    { name: "Agreements", icon: <FaFileContract />, link: "/operations/operations-agreement-pdf", disabled: true },
    { name: "Complaints", icon: <GiTicket />, link: "/operations/operations-propertycomplaint-table" },
    { name: "KYC Management", icon: <HiShieldCheck />, link: "/operations/operations-kyc-management" },
    { name: "Vendor Mgmt", icon: <IoPersonSharp />, link: "/operations/operations-vendor-form" },
    { name: "Move-In", icon: <MdMoveToInbox />, link: "/operations/operations-checklistfeedback-table" },
    { name: "Checklist", icon: <GoChecklist />, link: "/operations/operations-checklistfeedback-table" },
    { name: "Move-Out", icon: <MdOutlineExitToApp />, link: "/operations/operations-checklistfeedback-table" },
    { name: "Expenses", icon: <MdOutlineStickyNote2 />, link: "/operations/operations-expense-table" },
];

export default function Sidebar({ toggleSidebar, isExpanded }) {
    return <SharedSidebar toggleSidebar={toggleSidebar} isExpanded={isExpanded} menuItems={menuItems} />;
}
