import { useState, useEffect } from 'react';
import { 
    Receipt, 
    Eye, 
    Download, 
    Filter, 
    Search, 
    Plus, 
    Edit3,
    Trash2,
    FileText,
    IndianRupee,
    Calendar,
    User,
    Building2,
    AlertCircle,
    CheckCircle,
    Clock,
    ExternalLink,
    X
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";

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
    const [itemsPerPage] = useState(10);
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
                color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30', 
                icon: <Clock size={12} /> 
            },
            'Approved': { 
                color: 'text-green-400 bg-green-500/20 border-green-500/30', 
                icon: <CheckCircle size={12} /> 
            },
            'In Progress': { 
                color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', 
                icon: <AlertCircle size={12} /> 
            },
            'Rejected': { 
                color: 'text-red-400 bg-red-500/20 border-red-500/30', 
                icon: <X size={12} /> 
            }
        };
        
        return statusConfig[status] || statusConfig['Pending'];
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        const priorityColors = {
            'P1': 'text-red-400 bg-red-500/20 border-red-500/30',
            'P2': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
            'P3': 'text-green-400 bg-green-500/20 border-green-500/30'
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
            {/* Header Actions */}
            <div className="flex justify-end mb-6">
                <button className="px-6 py-3 bg-gradient-to-r from-[#D4A017] to-[#D4A017] hover:from-[#B8860B] hover:to-[#D4A017] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#D4A017]/25 flex items-center space-x-2">
                    <Plus size={18} />
                    <span>Add Expense</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="p-3 bg-[#D4A017]/20 rounded-lg">
                            <IndianRupee size={20} className="text-[#D4A017]" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <Clock size={20} className="text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Approved</p>
                            <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <CheckCircle size={20} className="text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 focus:outline-none transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Property Filter */}
                    <select
                        value={propertyFilter}
                        onChange={(e) => setPropertyFilter(e.target.value)}
                        className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 focus:outline-none transition-all duration-300"
                    >
                        <option value="all">All Properties</option>
                        {uniqueProperties.map(property => (
                            <option key={property} value={property}>{property}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 focus:outline-none transition-all duration-300"
                    >
                        <option value="all">All Status</option>
                        {uniqueStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 focus:outline-none transition-all duration-300"
                    >
                        <option value="all">All Priority</option>
                        {uniquePriorities.map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Property</th>
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Category</th>
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Amount</th>
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Vendor</th>
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Priority</th>
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Status</th>
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Deadline</th>
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Receipt</th>
                                <th className="text-left p-4 font-semibold text-[#D4A017]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedExpenses.map((expense) => {
                                const statusDisplay = getStatusDisplay(expense.status);
                                return (
                                    <tr key={expense.id} className="border-b border-gray-200/30 hover:bg-gray-100/30 transition-colors duration-200">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <Building2 size={16} className="text-[#D4A017]" />
                                                <span className="font-medium text-gray-900">{expense.propertyName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{expense.category}</div>
                                                <div className="text-sm text-gray-500">{expense.expenseType}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-[#D4A017]">{formatCurrency(expense.amount)}</span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <div className="text-gray-900">{expense.vendor || 'N/A'}</div>
                                                {expense.vendorType && (
                                                    <div className="text-sm text-gray-500">{expense.vendorType}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(expense.priority)}`}>
                                                <span>{expense.priority}</span>
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.color}`}>
                                                {statusDisplay.icon}
                                                <span>{expense.status}</span>
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-gray-900">{expense.deadline}</div>
                                        </td>
                                        <td className="p-4">
                                            {expense.receipt ? (
                                                <button
                                                    onClick={() => handleViewFile(expense.receipt, `${expense.category} - ${expense.propertyName}`)}
                                                    className="flex items-center space-x-1 px-3 py-1.5 bg-[#D4A017]/20 hover:bg-[#D4A017]/30 text-[#D4A017] rounded-lg transition-all duration-300 text-sm border border-[#D4A017]/30"
                                                >
                                                    <FileText size={14} />
                                                    <span>View</span>
                                                </button>
                                            ) : (
                                                <span className="text-gray-500 text-sm">No receipt</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setSelectedExpense(expense)}
                                                    className="p-2 bg-gray-100 hover:bg-[#D4A017]/20 text-gray-500 hover:text-[#D4A017] rounded-lg transition-all duration-300 border border-gray-200 hover:border-[#D4A017]/30"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button className="p-2 bg-gray-100 hover:bg-blue-500/20 text-gray-500 hover:text-blue-400 rounded-lg transition-all duration-300 border border-gray-200 hover:border-blue-500/30">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button className="p-2 bg-gray-100 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-all duration-300 border border-gray-200 hover:border-red-500/30">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 p-6 border-t border-gray-200">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-600 hover:text-[#D4A017] hover:border-[#D4A017]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    currentPage === index + 1
                                        ? 'bg-[#D4A017] text-white shadow-lg'
                                        : 'bg-white/50 border border-gray-200 text-gray-600 hover:text-[#D4A017] hover:border-[#D4A017]/30'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-600 hover:text-[#D4A017] hover:border-[#D4A017]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* File Viewer Modal */}
            {showFileViewer && selectedFile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <FileText size={20} className="text-[#D4A017]" />
                                <h3 className="text-lg font-bold text-gray-900">{selectedFile.name}</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <a
                                    href={selectedFile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 px-4 py-2 bg-[#D4A017]/20 hover:bg-[#D4A017]/30 text-[#D4A017] rounded-lg transition-all duration-300 border border-[#D4A017]/30"
                                >
                                    <ExternalLink size={16} />
                                    <span>Open in New Tab</span>
                                </a>
                                <button
                                    onClick={() => setShowFileViewer(false)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200/50 text-gray-500 hover:text-gray-900 rounded-lg transition-all duration-300"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* File Content */}
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
                    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Expense Details</h3>
                            <button
                                onClick={() => setSelectedExpense(null)}
                                className="p-2 bg-gray-100 hover:bg-gray-200/50 text-gray-500 hover:text-gray-900 rounded-lg transition-all duration-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Expense Details */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Property</label>
                                    <p className="text-gray-900">{selectedExpense.propertyName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Category</label>
                                    <p className="text-gray-900">{selectedExpense.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Amount</label>
                                    <p className="text-gray-900 font-bold">{formatCurrency(selectedExpense.amount)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Payment Type</label>
                                    <p className="text-gray-900">{selectedExpense.paymentType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Vendor</label>
                                    <p className="text-gray-900">{selectedExpense.vendor || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Priority</label>
                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedExpense.priority)}`}>
                                        <span>{selectedExpense.priority}</span>
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Status</label>
                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusDisplay(selectedExpense.status).color}`}>
                                        {getStatusDisplay(selectedExpense.status).icon}
                                        <span>{selectedExpense.status}</span>
                                    </span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Deadline</label>
                                    <p className="text-gray-900">{selectedExpense.deadline}</p>
                                </div>
                            </div>
                            
                            {selectedExpense.comments && (
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Comments</label>
                                    <p className="text-gray-900 bg-gray-100 rounded-lg p-3 border border-gray-200">
                                        {selectedExpense.comments}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Created At</label>
                                    <p className="text-gray-900">{formatDate(selectedExpense.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-1">Last Updated</label>
                                    <p className="text-gray-900">{formatDate(selectedExpense.updatedAt)}</p>
                                </div>
                            </div>

                            {selectedExpense.receipt && (
                                <div>
                                    <label className="text-sm font-medium text-[#D4A017] block mb-2">Receipt</label>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewFile(selectedExpense.receipt, `${selectedExpense.category} - ${selectedExpense.propertyName}`)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-[#D4A017]/20 hover:bg-[#D4A017]/30 text-[#D4A017] rounded-lg transition-all duration-300 border border-[#D4A017]/30"
                                        >
                                            <Eye size={16} />
                                            <span>View Receipt</span>
                                        </button>
                                        <a
                                            href={selectedExpense.receipt}
                                            download
                                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200/50 text-gray-600 hover:text-gray-900 rounded-lg transition-all duration-300 border border-gray-200"
                                        >
                                            <Download size={16} />
                                            <span>Download</span>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedExpense(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200/50 text-gray-600 hover:text-gray-900 rounded-lg transition-all duration-300 border border-gray-200"
                            >
                                Close
                            </button>
                            <button className="px-4 py-2 bg-gradient-to-r from-[#D4A017] to-[#D4A017] hover:from-[#B8860B] hover:to-[#D4A017] text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#D4A017]/25 flex items-center space-x-2">
                                <Edit3 size={16} />
                                <span>Edit Expense</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default Expenses;