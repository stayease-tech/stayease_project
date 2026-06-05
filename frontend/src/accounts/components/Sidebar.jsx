// Copyright Aravind Adari
import { IoIosPerson } from "react-icons/io";
import { MdOutlineStickyNote2, MdCheckCircle, MdUploadFile, MdUpdate } from "react-icons/md";
import { FaRegFileAlt } from "react-icons/fa";
import { GiCoins } from "react-icons/gi";
import { PiHandDepositBold } from "react-icons/pi";
import { TbReportMoney } from "react-icons/tb";
import SharedSidebar from "../../shared/Sidebar";

const menuItems = [
    { name: "Add Vendor", icon: <IoIosPerson />, link: "/accounts/accounts-vendor-form" },
    { name: "Raise Expense", icon: <MdOutlineStickyNote2 />, link: "/accounts/accounts-expense-form" },
    { name: "Approve Expense", icon: <MdCheckCircle />, link: "/accounts/accounts-expense-table" },
    { name: "Fixed Expense", icon: <TbReportMoney />, link: "/accounts/accounts-fixed-expense", disabled: true },
    { name: "Upload Data", icon: <MdUploadFile />, link: "/accounts/accounts-rawdatafile-upload" },
    { name: "Update Status", icon: <MdUpdate />, link: "/accounts/accounts-update-status", disabled: true },
    { name: "Liability", icon: <PiHandDepositBold />, link: "/accounts/accounts-liability-table" },
];

export default function Sidebar() {
    return <SharedSidebar menuItems={menuItems} />;
}
