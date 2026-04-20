import { IoPersonSharp } from "react-icons/io5";
import { FaRegBuilding } from "react-icons/fa";
import { MdOutlineStickyNote2, MdMeetingRoom } from "react-icons/md";
import { TbReportMoney } from "react-icons/tb";
import SharedSidebar from "../../shared/Sidebar";

const menuItems = [
    { name: "Owners", icon: <IoPersonSharp />, link: "/supply/supply-owner-table" },
    { name: "Properties", icon: <FaRegBuilding />, link: "/supply/supply-property-table" },
    { name: "Rooms", icon: <MdMeetingRoom />, link: "/supply/supply-room-table" },
    { name: "Raise Expense", icon: <MdOutlineStickyNote2 />, link: "/supply/supply-expense-form" },
    { name: "Track Expense", icon: <TbReportMoney />, link: "/supply/supply-expense-table" },
];

export default function Sidebar({ toggleSidebar, isExpanded }) {
    return <SharedSidebar toggleSidebar={toggleSidebar} isExpanded={isExpanded} menuItems={menuItems} />;
}
