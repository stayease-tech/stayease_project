// Copyright Aravind Adari
import { LiaBedSolid } from 'react-icons/lia';
import { VscChecklist } from 'react-icons/vsc';
import { GoChecklist } from 'react-icons/go';
import { GiTicket } from 'react-icons/gi';
import { FaFileContract } from 'react-icons/fa';
import { MdMoveToInbox, MdOutlineExitToApp } from 'react-icons/md';
import { TbReportMoney } from 'react-icons/tb';
import SharedSidebar from '../../shared/Sidebar';

const menuItems = [
  {
    name: 'View Beds',
    icon: <LiaBedSolid />,
    link: '/operations/operations-beds-table',
  },
  {
    name: 'Checklist & Feedback',
    icon: <VscChecklist />,
    link: '/operations/operations-checklistfeedback-table',
  },
  {
    name: 'Complaints',
    icon: <GiTicket />,
    link: '/operations/operations-propertycomplaint-table',
  },
  {
    name: 'KYC Management',
    icon: <GoChecklist />,
    link: '/operations/operations-kyc-management',
  },
  {
    name: 'Expenses',
    icon: <TbReportMoney />,
    link: '/operations/operations-expense-table',
  },
  // { name: "Move-In", icon: <MdMoveToInbox />, link: "/operations/operations-checklistfeedback-table?type=movein" },
  // { name: "Move-Out", icon: <MdOutlineExitToApp />, link: "/operations/operations-checklistfeedback-table?type=moveout" },
];

export default function Sidebar() {
  return <SharedSidebar menuItems={menuItems} />;
}
