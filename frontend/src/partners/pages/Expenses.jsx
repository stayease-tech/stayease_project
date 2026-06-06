// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from 'react';
import {
    Eye,
    Download,
    Plus,
    Edit3,
    Trash2,
    FileText,
    IndianRupee,
    Building2,
    AlertCircle,
    CheckCircle,
    Clock,
    ExternalLink,
    X
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Pagination from "../../shared/Pagination";

// Mock data based on the CSV structure you provided
const mockExpenseData = [
    {
        id: 1,
        propertyName: "Stayease Harmonia",
        headOfExpense: "Owners",
        expenseType: "Operations",
        category: "BGV Charges",
        amount: 1000,
        paymentType: "Reimbursement",
        vendorType: "",
        vendor: "",
        priority: "P1",
        deadline: "4 Hours",
        status: "Pending",
        comments: "some comment",
        receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/Stayease_Harmonia_Vendor_list_-_Sheet1.pdf",
        createdAt: "2025-06-11T12:04:36.110Z",
        updatedAt: "2025-06-11T12:04:36.110Z"
    },
    {
        id: 2,
        propertyName: "Stayease Harmonia",
        headOfExpense: "Owners",
        expenseType: "Operations",
        category: "Field Staff",
        amount: 3000,
        paymentType: "Vendor",
        vendorType: "Registered",
        vendor: "E-1",
        priority: "P3",
        deadline: "12 Hours",
        status: "Pending",
        comments: "",
        receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/Stayease_Harmonia_Vendor_list_-_Sheet1_nX0Esgx.pdf",
        createdAt: "2025-06-11T12:04:36.110Z",
        updatedAt: "2025-06-11T12:04:36.110Z"
    },
    {
        id: 3,
        propertyName: "Stayease Harmonia",
        headOfExpense: "Owners",
        expenseType: "Operations",
        category: "Consumables",
        amount: 2000,
        paymentType: "Vendor",
        vendorType: "Registered",
        vendor: "W-9",
        priority: "P2",
        deadline: "8 Hours",
        status: "Approved",
        comments: "",
        receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/Stayease_Harmonia_Vendor_list_-_Sheet1_IUa0s0z.pdf",
        createdAt: "2025-06-11T12:04:36.110Z",
        updatedAt: "2025-06-11T12:04:36.110Z"
    },
    {
        id: 4,
        propertyName: "Stayease Aura",
        headOfExpense: "Facility",
        expenseType: "Maintenance",
        category: "Repairs",
        amount: 5000,
        paymentType: "Direct",
        vendorType: "Contractor",
        vendor: "Fix-It Solutions",
        priority: "P1",
        deadline: "2 Hours",
        status: "In Progress",
        comments: "Urgent plumbing repair needed",
        receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/repair_invoice.pdf",
        createdAt: "2025-06-11T10:30:15.000Z",
        updatedAt: "2025-06-11T11:45:22.000Z"
    },
    {
        id: 5,
        propertyName: "Stayease Aura",
        headOfExpense: "Admin",
        expenseType: "Utilities",
        category: "Electricity",
        amount: 8500,
        paymentType: "Direct",
        vendorType: "Utility",
        vendor: "BESCOM",
        priority: "P2",
        deadline: "24 Hours",
        status: "Approved",
        comments: "Monthly electricity bill payment",
        receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/electricity_bill.pdf",
        createdAt: "2025-06-10T09:15:20.000Z",
        updatedAt: "2025-06-11T14:20:30.000Z"
    }
];

function Expenses() {
    const [expenses, setExpenses] = useState(mockExpenseData);
    const [filteredExpenses, setFilteredExpenses] = useState(mockExpenseData);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [propertyFilter, setPropertyFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showFileViewer, setShowFileViewer] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Get unique values for filters
    const uniqueProperties = [...new Set(expenses.map(exp => exp.propertyName))];
    const uniqueStatuses = [...new Set(expenses.map(exp => exp.status))];
    const uniquePriorities = [...new Set(expenses.map(exp => exp.priority))];

    // Filter expenses based on search and filters
    useEffect(() => {
        let filtered = expenses.filter(expense => {
            const matchesSearch =
                expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (expense.vendor && expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
                expense.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (expense.comments && expense.comments.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
            const matchesPriority = priorityFilter === "all" || expense.priority === priorityFilter;
            const matchesProperty = propertyFilter === "all" || expense.propertyName === propertyFilter;

            return matchesSearch && matchesStatus && matchesPriority && matchesProperty;
        });

        setFilteredExpenses(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, priorityFilter, propertyFilter, expenses]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status color and icon
    const getStatusDisplay = (status) => {
        const statusConfig = {
            'Pending': {
                color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
                icon: <Clock size={12} />
            },
            'Approved': {
                color: 'text-green-600 bg-green-50 border-green-200',
                icon: <CheckCircle size={12} />
            },
            'In Progress': {
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                icon: <AlertCircle size={12} />
            },
            'Rejected': {
                color: 'text-red-600 bg-red-50 border-red-200',
                icon: <X size={12} />
            }
        };

        return statusConfig[status] || statusConfig['Pending'];
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        const priorityColors = {
            'P1': 'text-red-600 bg-red-50 border-red-200',
            'P2': 'text-yellow-600 bg-yellow-50 border-yellow-200',
            'P3': 'text-green-600 bg-green-50 border-green-200'
        };
        return priorityColors[priority] || priorityColors['P3'];
    };

    // Handle file viewing
    const handleViewFile = (receipt, expenseName) => {
        setSelectedFile({
            url: receipt,
            name: expenseName
        });
        setShowFileViewer(true);
    };

    // Calculate summary stats
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const pendingCount = filteredExpenses.filter(exp => exp.status === 'Pending').length;
    const approvedCount = filteredExpenses.filter(exp => exp.status === 'Approved').length;

    return (
        <MainLayout
            title="Expense Management"
            description="Track and manage property expenses and receipts"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="card flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-base font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="p-2 bg-[#D4A017]/10 rounded-lg">
                        <IndianRupee size={16} className="text-[#D4A017]" />
                    </div>
                </div>
                <div className="card flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Pending</p>
                        <p className="text-base font-bold text-gray-900">{pendingCount}</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded-lg">
                        <Clock size={16} className="text-yellow-500" />
                    </div>
                </div>
                <div className="card flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Approved</p>
                        <p className="text-base font-bold text-gray-900">{approvedCount}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle size={16} className="text-green-500" />
                    </div>
                </div>
            </div>

            {/* Page Header with filters */}
            <div className="page-header">
                <h1>Expenses</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={propertyFilter}
                        onChange={(e) => setPropertyFilter(e.target.value)}
                        className="form-input w-40 text-xs"
                    >
                        <option value="all">All Properties</option>
                        {uniqueProperties.map(property => (
                            <option key={property} value={property}>{property}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-input w-32 text-xs"
                    >
                        <option value="all">All Status</option>
                        {uniqueStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="form-input w-32 text-xs"
                    >
                        <option value="all">All Priority</option>
                        {uniquePriorities.map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input w-48 text-xs"
                    />
                    <button className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded hover:bg-[#B8860B] flex items-center gap-1">
                        <Plus size={14} />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Vendor</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Priority</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Deadline</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Receipt</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedExpenses.map((expense) => {
                                const statusDisplay = getStatusDisplay(expense.status);
                                return (
                                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="flex items-center gap-1">
                                                <Building2 size={12} className="text-[#D4A017] shrink-0" />
                                                <span className="max-w-[180px] truncate">{expense.propertyName}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="max-w-[180px] truncate font-medium">{expense.category}</div>
                                            <div className="text-gray-400">{expense.expenseType}</div>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 font-semibold text-[#D4A017]">
                                            {formatCurrency(expense.amount)}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="max-w-[180px] truncate">{expense.vendor || 'N/A'}</div>
                                            {expense.vendorType && (
                                                <div className="text-gray-400">{expense.vendorType}</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(expense.priority)}`}>
                                                {expense.priority}
                                            </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.color}`}>
                                                {statusDisplay.icon}
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{expense.deadline}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            {expense.receipt ? (
                                                <button
                                                    onClick={() => handleViewFile(expense.receipt, `${expense.category} - ${expense.propertyName}`)}
                                                    className="flex items-center gap-1 px-2 py-1 bg-[#D4A017]/10 hover:bg-[#D4A017]/20 text-[#D4A017] rounded border border-[#D4A017]/30 transition-colors"
                                                >
                                                    <FileText size={12} />
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">No receipt</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setSelectedExpense(expense)}
                                                    className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedExpenses.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-3 py-4 text-xs text-gray-400 text-center">No expenses found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {/* File Viewer Modal */}
            {showFileViewer && selectedFile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-[#D4A017]" />
                                <h3 className="text-sm font-bold text-gray-900">{selectedFile.name}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={selectedFile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A017]/10 hover:bg-[#D4A017]/20 text-[#D4A017] rounded-lg border border-[#D4A017]/30 text-xs transition-colors"
                                >
                                    <ExternalLink size={12} />
                                    Open in New Tab
                                </a>
                                <button
                                    onClick={() => setShowFileViewer(false)}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={selectedFile.url}
                                className="w-full h-full border-0"
                                title={selectedFile.name}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Expense Details Modal */}
            {selectedExpense && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900">Expense Details</h3>
                            <button
                                onClick={() => setSelectedExpense(null)}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Property</label>
                                    <p className="text-xs text-gray-900">{selectedExpense.propertyName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Category</label>
                                    <p className="text-xs text-gray-900">{selectedExpense.category}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Amount</label>
                                    <p className="text-xs text-gray-900 font-bold">{formatCurrency(selectedExpense.amount)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Payment Type</label>
                                    <p className="text-xs text-gray-900">{selectedExpense.paymentType}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Vendor</label>
                                    <p className="text-xs text-gray-900">{selectedExpense.vendor || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Priority</label>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(selectedExpense.priority)}`}>
                                        {selectedExpense.priority}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Status</label>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusDisplay(selectedExpense.status).color}`}>
                                        {getStatusDisplay(selectedExpense.status).icon}
                                        {selectedExpense.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Deadline</label>
                                    <p className="text-xs text-gray-900">{selectedExpense.deadline}</p>
                                </div>
                            </div>

                            {selectedExpense.comments && (
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Comments</label>
                                    <p className="text-xs text-gray-900 bg-gray-50 rounded-lg p-2 border border-gray-200">
                                        {selectedExpense.comments}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Created At</label>
                                    <p className="text-xs text-gray-900">{formatDate(selectedExpense.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-0.5">Last Updated</label>
                                    <p className="text-xs text-gray-900">{formatDate(selectedExpense.updatedAt)}</p>
                                </div>
                            </div>

                            {selectedExpense.receipt && (
                                <div>
                                    <label className="text-xs font-medium text-[#D4A017] block mb-1">Receipt</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewFile(selectedExpense.receipt, `${selectedExpense.category} - ${selectedExpense.propertyName}`)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-[#D4A017]/10 hover:bg-[#D4A017]/20 text-[#D4A017] rounded-lg border border-[#D4A017]/30 text-xs transition-colors"
                                        >
                                            <Eye size={12} />
                                            View Receipt
                                        </button>
                                        <a
                                            href={selectedExpense.receipt}
                                            download
                                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 text-xs transition-colors"
                                        >
                                            <Download size={12} />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedExpense(null)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 text-xs transition-colors"
                            >
                                Close
                            </button>
                            <button className="px-3 py-1.5 bg-[#D4A017] hover:bg-[#B8860B] text-white font-medium rounded-lg text-xs flex items-center gap-1 transition-colors">
                                <Edit3 size={12} />
                                Edit Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default Expenses;
