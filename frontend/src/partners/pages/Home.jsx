import { useNavigate } from "react-router-dom";
import { 
    Building2, 
    Shield, 
    Landmark, 
    User, 
    TrendingUp, 
    BarChart3,
    Receipt,
    Eye,
    FileText,
    IndianRupee,
    Clock,
    CheckCircle,
    AlertCircle,
    X,
    ArrowRight,
    Calendar
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";

function Home() {
    const navigate = useNavigate();

    // Mock recent expenses data (in real app, this would come from API)
    const recentExpenses = [
        {
            id: 1,
            propertyName: "Stayease Harmonia",
            category: "BGV Charges",
            amount: 1000,
            status: "Pending",
            priority: "P1",
            deadline: "4 Hours",
            receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/Stayease_Harmonia_Vendor_list_-_Sheet1.pdf",
            createdAt: "2025-06-11T12:04:36.110Z"
        },
        {
            id: 4,
            propertyName: "Stayease Aura",
            category: "Repairs",
            amount: 5000,
            status: "In Progress",
            priority: "P1",
            deadline: "2 Hours",
            receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/repair_invoice.pdf",
            createdAt: "2025-06-11T10:30:15.000Z"
        },
        {
            id: 5,
            propertyName: "Stayease Aura",
            category: "Electricity",
            amount: 8500,
            status: "Approved",
            priority: "P2",
            deadline: "24 Hours",
            receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/electricity_bill.pdf",
            createdAt: "2025-06-10T09:15:20.000Z"
        },
        {
            id: 2,
            propertyName: "Stayease Harmonia",
            category: "Field Staff",
            amount: 3000,
            status: "Pending",
            priority: "P3",
            deadline: "12 Hours",
            receipt: "https://local-machine-bucket.s3.amazonaws.com/documents/accounts-receipts/2025/06/11/Stayease_Harmonia_Vendor_list_-_Sheet1_nX0Esgx.pdf",
            createdAt: "2025-06-11T12:04:36.110Z"
        }
    ];

    const dashboardCards = [
        {
            title: "Total Properties",
            value: "2",
            icon: <Building2 size={24} />,
            path: "/partners/partners-properties",
            description: "Active listings",
            color: "from-[#D4A017] to-[#D4A017]",
            bgColor: "bg-gradient-to-br from-[#D4A017]/10 to-[#D4A017]/10",
            borderColor: "border-[#D4A017]/30",
            textColor: "text-[#D4A017]"
        },
        {
            title: "Recent Expenses",
            value: "₹17,500",
            icon: <Receipt size={24} />,
            path: "/partners/partners-expenses",
            description: "This month's total",
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-600/10",
            borderColor: "border-blue-500/30",
            textColor: "text-blue-500"
        },
        {
            title: "KYC Details",
            value: "Verified",
            icon: <Shield size={24} />,
            path: "/partners/partners-kyc-details",
            description: "Document status",
            color: "from-green-500 to-emerald-600",
            bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-600/10",
            borderColor: "border-green-500/30",
            textColor: "text-green-500"
        },
        {
            title: "Bank Details",
            value: "Active",
            icon: <Landmark size={24} />,
            path: "/partners/partners-bank-details",
            description: "Payment setup",
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-gradient-to-br from-purple-500/10 to-purple-600/10",
            borderColor: "border-purple-500/30",
            textColor: "text-purple-500"
        }
    ];

    const statsCards = [
        {
            title: "Monthly Revenue",
            value: "₹24,000",
            change: "+12%",
            icon: <TrendingUp size={20} />,
            positive: true
        },
        {
            title: "Occupancy Rate",
            value: "85%",
            change: "+5%",
            icon: <BarChart3 size={20} />,
            positive: true
        }
    ];

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Format date for recent expenses
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return "Today";
        if (diffDays === 2) return "Yesterday";
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status display
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

    return (
        <MainLayout 
            title="Welcome Back, Jibin!"
            description="Here's an overview of your property management dashboard"
        >
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {statsCards.map((stat, index) => (
                    <div 
                        key={index}
                        className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:border-[#D4A017]/30 hover:shadow-lg hover:shadow-[#D4A017]/10"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <div className="flex items-center mt-1">
                                    <span className={`text-sm font-medium ${
                                        stat.positive ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-gray-500 text-xs ml-1">vs last month</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg ${
                                stat.positive 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                            }`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                {dashboardCards.map((card, index) => (
                    <div 
                        key={index}
                        onClick={() => navigate(card.path)}
                        className={`
                            group cursor-pointer transition-all duration-300 
                            bg-gradient-to-br from-white to-gray-50 
                             border rounded-xl p-6
                            hover:scale-105 hover:shadow-2xl hover:-translate-y-1
                            ${card.borderColor} ${card.bgColor}
                            hover:border-[#D4A017]/50 hover:shadow-[#D4A017]/20
                            relative overflow-hidden
                        `}
                    >
                        {/* Background gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className={`
                                inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4
                                bg-gradient-to-br ${card.color} shadow-lg
                                group-hover:scale-110 transition-transform duration-300
                            `}>
                                <span className="text-gray-900">
                                    {card.icon}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#D4A017] transition-colors duration-300">
                                    {card.title}
                                </h3>
                                
                                <div className="flex items-center justify-between">
                                    <span className={`text-2xl font-bold ${card.textColor}`}>
                                        {card.value}
                                    </span>
                                </div>
                                
                                <p className="text-gray-500 text-sm group-hover:text-gray-600 transition-colors duration-300">
                                    {card.description}
                                </p>
                            </div>

                            {/* Hover indicator */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-2 h-2 bg-[#D4A017] rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Expenses Section - FIXED FOR MOBILE */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-1 h-6 bg-gradient-to-b from-[#D4A017] to-[#D4A017] rounded-full mr-3"></div>
                        Recent Expenses
                    </h2>
                    <button 
                        onClick={() => navigate("/partners/partners-expenses")}
                        className="flex items-center space-x-2 text-[#D4A017] hover:text-[#B8860B] transition-colors duration-300 group"
                    >
                        <span className="text-sm font-medium">View All</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-2xl overflow-hidden">
                    {recentExpenses.length > 0 ? (
                        <div className="divide-y divide-gray-700/30">
                            {recentExpenses.slice(0, 4).map((expense) => {
                                const statusDisplay = getStatusDisplay(expense.status);
                                return (
                                    <div 
                                        key={expense.id}
                                        className="p-4 hover:bg-gray-100/30 transition-colors duration-200 cursor-pointer group"
                                        onClick={() => navigate("/partners/partners-expenses")}
                                    >
                                        {/* Mobile Layout (< md) */}
                                        <div className="md:hidden">
                                            {/* Row 1: Property name and amount */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2 flex-1 min-w-0 mr-3">
                                                    <Building2 size={14} className="text-[#D4A017] flex-shrink-0" />
                                                    <span className="font-medium text-gray-900 truncate text-sm">{expense.propertyName}</span>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="font-bold text-[#D4A017] text-sm">{formatCurrency(expense.amount)}</p>
                                                </div>
                                            </div>

                                            {/* Row 2: Category and date */}
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm text-gray-500 truncate flex-1 min-w-0 mr-2">{expense.category}</p>
                                                <p className="text-xs text-gray-500 flex-shrink-0">{formatDate(expense.createdAt)}</p>
                                            </div>

                                            {/* Row 3: Status badges and receipt */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                    {/* Priority */}
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(expense.priority)}`}>
                                                        {expense.priority}
                                                    </span>

                                                    {/* Status */}
                                                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusDisplay.color}`}>
                                                        {statusDisplay.icon}
                                                        <span className="hidden xs:inline">{expense.status}</span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2 flex-shrink-0">
                                                    {/* Receipt indicator */}
                                                    {expense.receipt && (
                                                        <div className="p-1 bg-[#D4A017]/20 rounded">
                                                            <FileText size={12} className="text-[#D4A017]" />
                                                        </div>
                                                    )}

                                                    {/* View arrow */}
                                                    <ArrowRight size={14} className="text-gray-500 group-hover:text-[#D4A017] group-hover:translate-x-1 transition-all duration-300" />
                                                </div>
                                            </div>

                                            {/* Deadline if urgent */}
                                            {expense.priority === 'P1' && (
                                                <div className="mt-2 flex items-center space-x-1 text-xs text-red-400">
                                                    <Clock size={10} />
                                                    <span>Deadline: {expense.deadline}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Layout (≥ md) */}
                                        <div className="hidden md:block">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                    {/* Property & Category */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <Building2 size={14} className="text-[#D4A017] flex-shrink-0" />
                                                            <span className="font-medium text-gray-900 truncate">{expense.propertyName}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate">{expense.category}</p>
                                                    </div>

                                                    {/* Amount */}
                                                    <div className="text-right">
                                                        <p className="font-bold text-[#D4A017]">{formatCurrency(expense.amount)}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(expense.createdAt)}</p>
                                                    </div>
                                                </div>

                                                {/* Status & Actions */}
                                                <div className="flex items-center space-x-3 ml-4">
                                                    {/* Priority */}
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(expense.priority)}`}>
                                                        {expense.priority}
                                                    </span>

                                                    {/* Status */}
                                                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.color}`}>
                                                        {statusDisplay.icon}
                                                        <span>{expense.status}</span>
                                                    </span>

                                                    {/* Receipt indicator */}
                                                    {expense.receipt && (
                                                        <div className="p-1.5 bg-[#D4A017]/20 rounded-lg">
                                                            <FileText size={14} className="text-[#D4A017]" />
                                                        </div>
                                                    )}

                                                    {/* View arrow */}
                                                    <ArrowRight size={16} className="text-gray-500 group-hover:text-[#D4A017] group-hover:translate-x-1 transition-all duration-300" />
                                                </div>
                                            </div>

                                            {/* Deadline if urgent */}
                                            {expense.priority === 'P1' && (
                                                <div className="mt-2 flex items-center space-x-1 text-xs text-red-400">
                                                    <Clock size={12} />
                                                    <span>Deadline: {expense.deadline}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <Receipt size={32} className="text-gray-500 mx-auto mb-3" />
                            <p className="text-gray-500">No recent expenses</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#D4A017] to-[#D4A017] rounded-full mr-3"></div>
                    Quick Actions
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                        onClick={() => navigate("/partners/partners-properties")}
                        className="group p-4 bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-lg hover:border-[#D4A017]/30 transition-all duration-300 text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-[#D4A017]/20 rounded-lg group-hover:bg-[#D4A017]/30 transition-colors duration-300">
                                <Building2 size={16} className="text-[#D4A017]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-gray-900 font-medium truncate">View Properties</p>
                                <p className="text-gray-500 text-sm truncate">Manage listings</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate("/partners/partners-expenses")}
                        className="group p-4 bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-lg hover:border-blue-500/30 transition-all duration-300 text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors duration-300">
                                <Receipt size={16} className="text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-gray-900 font-medium truncate">Add Expense</p>
                                <p className="text-gray-500 text-sm truncate">Track new expense</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate("/partners/partners-kyc-details")}
                        className="group p-4 bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-lg hover:border-green-500/30 transition-all duration-300 text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors duration-300">
                                <Shield size={16} className="text-green-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-gray-900 font-medium truncate">Update KYC</p>
                                <p className="text-gray-500 text-sm truncate">Verify documents</p>
                            </div>
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate("/partners/partners-bank-details")}
                        className="group p-4 bg-gradient-to-br from-white to-gray-50  border border-gray-200 rounded-lg hover:border-purple-500/30 transition-all duration-300 text-left"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300">
                                <Landmark size={16} className="text-purple-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-gray-900 font-medium truncate">Payment Settings</p>
                                <p className="text-gray-500 text-sm truncate">Manage bank details</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}

export default Home;