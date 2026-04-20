import { MdOutlineStickyNote2, MdPeople, MdSettings } from "react-icons/md";
import { FaRegBuilding } from "react-icons/fa";
import { LiaBedSolid } from "react-icons/lia";
import { GiTicket } from "react-icons/gi";
import { IoPersonSharp } from "react-icons/io5";
import SharedSidebar from "../../shared/Sidebar";

const menuItems = [
    { name: "Users", icon: <MdPeople />, link: "/admin/users", disabled: true },
    { name: "Properties", icon: <FaRegBuilding />, link: "/admin/properties", disabled: true },
    { name: "Beds Overview", icon: <LiaBedSolid />, link: "/admin/beds", disabled: true },
    { name: "All Expenses", icon: <MdOutlineStickyNote2 />, link: "/admin/expenses", disabled: true },
    { name: "Complaints", icon: <GiTicket />, link: "/admin/complaints", disabled: true },
    { name: "Vendors", icon: <IoPersonSharp />, link: "/admin/vendors", disabled: true },
    { name: "Settings", icon: <MdSettings />, link: "/admin/settings", disabled: true },
];

export default function Sidebar({ toggleSidebar, isExpanded }) {
    return <SharedSidebar toggleSidebar={toggleSidebar} isExpanded={isExpanded} menuItems={menuItems} />;
}
