// Copyright Aravind Adari
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import Navbar from "./Navbar";
import { useSidebar } from "./SidebarContext";
import {
    LayoutDashboard, Users, FileText, Building2,
    TrendingUp, ClipboardList, BedDouble, Wrench,
    DollarSign, UserCheck, Package, PieChart
} from "lucide-react";

// ── Shared components ──────────────────────────
function StatCard({ icon: Icon, label, value, color, onClick }) {
    return (
        <div
            className={`stat-card ${onClick ? "cursor-pointer" : ""}`}
            onClick={onClick}
        >
            <div
                className="stat-icon"
                style={{ background: color + "20", color }}
            >
                <Icon size={22} />
            </div>
            <div className="stat-value">{value ?? "—"}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

function QuickAction({ label, onClick }) {
    return (
        <button className="btn btn-outline" onClick={onClick}>
            {label}
        </button>
    );
}

// ── Main router ────────────────────────────────
export default function Dashboard() {
    const { userType } = useAuth();

    switch (userType) {
        case "admin":
            return <AdminDashboard />;
        case "accounts":
            return <AccountsDashboard />;
        case "operations":
            return <OperationsDashboard />;
        case "sales":
            return <SalesDashboard />;
        case "supply":
            return <SupplyDashboard />;
        default:
            return <FallbackDashboard />;
    }
}

// ── ACCOUNTS ───────────────────────────────────
function AccountsDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ vendors: null, expenses: null, beds: null, liabilities: null, rawdatafiles: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            axios.get("/accounts/get-vendor-data/"),
            axios.get("/accounts/get-expense-data/"),
            axios.get("/accounts/get-beds-data/"),
            axios.get("/accounts/get-liability-data/"),
            axios.get("/accounts/get-rawdata-file/"),
        ]).then(([vendors, expenses, beds, liabilities, rawfiles]) => {
            setStats({
                vendors: vendors.status === "fulfilled" ? vendors.value.data?.vendor_table?.length ?? 0 : null,
                expenses: expenses.status === "fulfilled" ? expenses.value.data?.expense_table?.length ?? 0 : null,
                beds: beds.status === "fulfilled" ? beds.value.data?.beds_table?.length ?? 0 : null,
                liabilities: liabilities.status === "fulfilled" ? liabilities.value.data?.liability_data?.length ?? 0 : null,
                rawdatafiles: rawfiles.status === "fulfilled" ? rawfiles.value.data?.rawdata_files?.length ?? 0 : null,
            });
        }).finally(() => setLoading(false));
    }, []);

    return (
        <DashPage>
            <div className="page-header">
                <div>
                    <h1>Accounts Dashboard</h1>
                    <p>Overview of accounts &amp; finance</p>
                </div>
            </div>

            {loading ? <Loader /> : (
                <>
                    <div className="stats-grid">
                        <StatCard icon={Users} label="Total Vendors" value={stats.vendors} color="#D4A017" onClick={() => navigate("/accounts/accounts-vendor-table")} />
                        <StatCard icon={DollarSign} label="Expense Records" value={stats.expenses} color="#10B981" onClick={() => navigate("/accounts/accounts-expense-table")} />
                        <StatCard icon={BedDouble} label="Beds Tracked" value={stats.beds} color="#F59E0B" onClick={() => navigate("/accounts/accounts-beds-table")} />
                        <StatCard icon={FileText} label="Liabilities" value={stats.liabilities} color="#EF4444" onClick={() => navigate("/accounts/accounts-liability-table")} />
                        <StatCard icon={ClipboardList} label="Rawdata Files" value={stats.rawdatafiles} color="#3B82F6" onClick={() => navigate("/accounts/accounts-rawdatafile-table")} />
                    </div>

                    <div className="card">
                        <div className="card-header"><h3>Quick Actions</h3></div>
                        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                            <QuickAction label="View Vendors" onClick={() => navigate("/accounts/accounts-vendor-table")} />
                            <QuickAction label="View Expenses" onClick={() => navigate("/accounts/accounts-expense-table")} />
                            <QuickAction label="View Rawdata" onClick={() => navigate("/accounts/accounts-rawdatafile-table")} />
                            <QuickAction label="View Other Files" onClick={() => navigate("/accounts/accounts-otherfiles-table")} />
                            <QuickAction label="View Liabilities" onClick={() => navigate("/accounts/accounts-liability-table")} />
                        </div>
                    </div>
                </>
            )}
        </DashPage>
    );
}

// ── OPERATIONS ─────────────────────────────────
function OperationsDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ beds: null, complaints: null, expenses: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            axios.get("/sales/get-beds-data/"),
            axios.get("/operations/get-propertycomplaint-data/"),
            axios.get("/accounts/get-expense-data/"),
        ]).then(([beds, complaints, expenses]) => {
            setStats({
                beds: beds.status === "fulfilled" ? beds.value.data?.beds_table?.length ?? 0 : null,
                complaints: complaints.status === "fulfilled" ? complaints.value.data?.complaints_array?.length ?? 0 : null,
                expenses: expenses.status === "fulfilled" ? expenses.value.data?.expense_table?.length ?? 0 : null,
            });
        }).finally(() => setLoading(false));
    }, []);

    return (
        <DashPage>
            <div className="page-header">
                <div>
                    <h1>Operations Dashboard</h1>
                    <p>Property operations at a glance</p>
                </div>
            </div>

            {loading ? <Loader /> : (
                <>
                    <div className="stats-grid">
                        <StatCard icon={BedDouble} label="Total Beds" value={stats.beds} color="#D4A017" onClick={() => navigate("/operations/operations-beds-table")} />
                        <StatCard icon={Wrench} label="Property Complaints" value={stats.complaints} color="#EF4444" onClick={() => navigate("/operations/operations-propertycomplaint-table")} />
                        <StatCard icon={DollarSign} label="Expense Records" value={stats.expenses} color="#10B981" onClick={() => navigate("/operations/operations-expense-table")} />
                    </div>

                    <div className="card">
                        <div className="card-header"><h3>Quick Actions</h3></div>
                        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                            <QuickAction label="View Beds" onClick={() => navigate("/operations/operations-beds-table")} />
                            <QuickAction label="View Checklists" onClick={() => navigate("/operations/operations-checklistfeedback-table")} />
                            <QuickAction label="View Expenses" onClick={() => navigate("/operations/operations-expense-table")} />
                            <QuickAction label="View Complaints" onClick={() => navigate("/operations/operations-propertycomplaint-table")} />
                            <QuickAction label="View KYC Pending" onClick={() => navigate("/operations/operations-beds-table")} />
                        </div>
                    </div>
                </>
            )}
        </DashPage>
    );
}

// ── SALES ──────────────────────────────────────
function SalesDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ beds: null, leads: null, expenses: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            axios.get("/sales/get-beds-data/"),
            axios.get("/sales/get-leads-data/"),
            axios.get("/accounts/get-expense-data/"),
        ]).then(([beds, leads, expenses]) => {
            setStats({
                beds: beds.status === "fulfilled" ? beds.value.data?.beds_table?.length ?? 0 : null,
                leads: leads.status === "fulfilled" ? leads.value.data?.leads_table?.length ?? 0 : null,
                expenses: expenses.status === "fulfilled" ? expenses.value.data?.expense_table?.length ?? 0 : null,
            });
        }).finally(() => setLoading(false));
    }, []);

    return (
        <DashPage>
            <div className="page-header">
                <div>
                    <h1>Sales Dashboard</h1>
                    <p>Leads, beds &amp; revenue overview</p>
                </div>
            </div>

            {loading ? <Loader /> : (
                <>
                    <div className="stats-grid">
                        <StatCard icon={BedDouble} label="Total Beds" value={stats.beds} color="#D4A017" onClick={() => navigate("/sales/sales-beds-table")} />
                        <StatCard icon={TrendingUp} label="Active Leads" value={stats.leads} color="#F59E0B" onClick={() => navigate("/sales/sales-leads-table")} />
                        <StatCard icon={DollarSign} label="Expense Records" value={stats.expenses} color="#10B981" onClick={() => navigate("/sales/sales-expense-table")} />
                    </div>

                    <div className="card">
                        <div className="card-header"><h3>Quick Actions</h3></div>
                        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                            <QuickAction label="View Beds" onClick={() => navigate("/sales/sales-beds-table")} />
                            <QuickAction label="View Leads" onClick={() => navigate("/sales/sales-leads-table")} />
                            <QuickAction label="View Expenses" onClick={() => navigate("/sales/sales-expense-table")} />
                            <QuickAction label="View Documents" onClick={() => navigate("/sales/sales-document-table")} />
                        </div>
                    </div>
                </>
            )}
        </DashPage>
    );
}

// ── SUPPLY ─────────────────────────────────────
function SupplyDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ owners: null, properties: null, rooms: null, expenses: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            axios.get("/supply/get-owner-data/"),
            axios.get("/supply/get-property-data/0/"),
            axios.get("/accounts/get-beds-data/"),
            axios.get("/accounts/get-expense-data/"),
        ]).then(([owners, properties, beds, expenses]) => {
            setStats({
                owners: owners.status === "fulfilled" ? owners.value.data?.supply_table?.length ?? 0 : null,
                properties: properties.status === "fulfilled" ? properties.value.data?.property_table?.length ?? 0 : null,
                rooms: beds.status === "fulfilled" ? beds.value.data?.beds_table?.length ?? 0 : null,
                expenses: expenses.status === "fulfilled" ? expenses.value.data?.expense_table?.length ?? 0 : null,
            });
        }).finally(() => setLoading(false));
    }, []);

    return (
        <DashPage>
            <div className="page-header">
                <div>
                    <h1>Supply Dashboard</h1>
                    <p>Owners, properties &amp; inventory</p>
                </div>
            </div>

            {loading ? <Loader /> : (
                <>
                    <div className="stats-grid">
                        <StatCard icon={UserCheck} label="Owners" value={stats.owners} color="#D4A017" onClick={() => navigate("/supply/supply-owner-table")} />
                        <StatCard icon={Building2} label="Properties" value={stats.properties} color="#10B981" onClick={() => navigate("/supply/supply-property-table")} />
                        <StatCard icon={Package} label="Rooms" value={stats.rooms} color="#F59E0B" onClick={() => navigate("/supply/supply-room-table")} />
                        <StatCard icon={DollarSign} label="Expense Records" value={stats.expenses} color="#EF4444" onClick={() => navigate("/supply/supply-expense-table")} />
                    </div>

                    <div className="card">
                        <div className="card-header"><h3>Quick Actions</h3></div>
                        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                            <QuickAction label="View Owners" onClick={() => navigate("/supply/supply-owner-table")} />
                            <QuickAction label="View Properties" onClick={() => navigate("/supply/supply-property-table")} />
                            <QuickAction label="View Rooms" onClick={() => navigate("/supply/supply-room-table")} />
                            <QuickAction label="View Expenses" onClick={() => navigate("/supply/supply-expense-table")} />
                        </div>
                    </div>
                </>
            )}
        </DashPage>
    );
}

// ── ADMIN ──────────────────────────────────────
function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ vendors: null, expenses: null, beds: null, complaints: null, properties: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            axios.get("/accounts/get-vendor-data/"),
            axios.get("/accounts/get-expense-data/"),
            axios.get("/accounts/get-beds-data/"),
            axios.get("/operations/get-propertycomplaint-data/"),
            axios.get("/supply/get-property-data/0/"),
        ]).then(([vendors, expenses, beds, complaints, properties]) => {
            setStats({
                vendors: vendors.status === "fulfilled" ? vendors.value.data?.vendor_table?.length ?? 0 : null,
                expenses: expenses.status === "fulfilled" ? expenses.value.data?.expense_table?.length ?? 0 : null,
                beds: beds.status === "fulfilled" ? beds.value.data?.beds_table?.length ?? 0 : null,
                complaints: complaints.status === "fulfilled" ? complaints.value.data?.complaints_array?.length ?? 0 : null,
                properties: properties.status === "fulfilled" ? properties.value.data?.property_table?.length ?? 0 : null,
            });
        }).finally(() => setLoading(false));
    }, []);

    return (
        <DashPage>
            <div className="page-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>System-wide overview &amp; management</p>
                </div>
            </div>

            {loading ? <Loader /> : (
                <>
                    <div className="stats-grid">
                        <StatCard icon={Building2} label="Properties" value={stats.properties} color="#D4A017" />
                        <StatCard icon={BedDouble} label="Total Beds" value={stats.beds} color="#10B981" />
                        <StatCard icon={Users} label="Vendors" value={stats.vendors} color="#3B82F6" />
                        <StatCard icon={DollarSign} label="Expenses" value={stats.expenses} color="#F59E0B" />
                        <StatCard icon={Wrench} label="Complaints" value={stats.complaints} color="#EF4444" />
                    </div>

                    <div className="card">
                        <div className="card-header"><h3>Quick Navigation</h3></div>
                        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                            <QuickAction label="Accounts Portal" onClick={() => navigate("/accounts/dashboard")} />
                            <QuickAction label="Operations Portal" onClick={() => navigate("/operations/dashboard")} />
                            <QuickAction label="Sales Portal" onClick={() => navigate("/sales/dashboard")} />
                            <QuickAction label="Supply Portal" onClick={() => navigate("/supply/dashboard")} />
                        </div>
                    </div>
                </>
            )}
        </DashPage>
    );
}

// ── Fallback ───────────────────────────────────
function FallbackDashboard() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <div className="card" style={{ maxWidth: 400, textAlign: "center" }}>
                <div className="card-body">
                    <LayoutDashboard size={48} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-700">Welcome to StayEase</h2>
                    <p className="text-sm text-gray-500 mt-2">Your dashboard is loading...</p>
                    <button className="btn btn-primary mt-4" onClick={() => navigate("/login")}>Go to Login</button>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ────────────────────────────────────
function Loader() {
    return <div className="loading-center"><div className="spinner"></div></div>;
}

/** Lazily import the correct module sidebar */
function useModuleSidebar(module) {
    const [SidebarComp, setSidebarComp] = useState(null);
    useEffect(() => {
        let cancelled = false;
        const loaders = {
            admin: () => import("../admin/components/Sidebar"),
            accounts: () => import("../accounts/components/Sidebar"),
            operations: () => import("../operations/components/Sidebar"),
            sales: () => import("../sales/components/Sidebar"),
            supply: () => import("../supply/components/Sidebar"),
            resident: () => import("../resident/components/Sidebar"),
        };
        if (loaders[module]) {
            loaders[module]().then((mod) => { if (!cancelled) setSidebarComp(() => mod.default); });
        }
        return () => { cancelled = true; };
    }, [module]);
    return SidebarComp;
}

/**
 * DashPage — viewport-contained portal layout shell.
 * Reads sidebar state from SidebarContext. Auto-resolves the correct
 * module sidebar based on the authenticated user's type.
 * Export so table/form pages can reuse this shell.
 */
export function DashPage({ children }) {
    const { userType } = useAuth();
    const { isExpanded } = useSidebar();
    const Sidebar = useModuleSidebar(userType);

    return (
        <div className="bg-[#F5F5F0] h-screen overflow-hidden flex flex-col">
            {Sidebar && <Sidebar />}
            <Navbar />
            <div className={`flex flex-1 overflow-hidden transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <main className="flex-1 overflow-y-auto pt-20 px-6 lg:px-8 pb-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
