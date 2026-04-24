import { useState, useEffect } from "react";
import residentApi from "../residentApi";
import Navbar from "../../shared/Navbar";
import residentSidebar from "./Sidebar";
import { CreditCard, CheckCircle, XCircle, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";

export default function residentPayments({ isExpanded, setIsExpanded }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState(null);
    const [mandate, setMandate] = useState(null);
    const [mandateLoading, setMandateLoading] = useState(true);
    const [settingUpSI, setSettingUpSI] = useState(false);
    const [cancellingMandate, setCancellingMandate] = useState(false);

    useEffect(() => {
        residentApi.get("/rent-history/")
            .then(res => { if (res.data.success) setRecords(res.data.rentRecords); })
            .catch(console.error)
            .finally(() => setLoading(false));

        residentApi.get("/payments/mandate/status/")
            .then(res => {
                if (res.data.success && res.data.hasMandate) setMandate(res.data.mandate);
            })
            .catch(console.error)
            .finally(() => setMandateLoading(false));
    }, []);

    const pendingRecords = records.filter(r => r.rentStatus !== "Received");
    const paidRecords = records.filter(r => r.rentStatus === "Received");

    const handlePay = async (record) => {
        setPayingId(record.id);
        try {
            const res = await residentApi.post("/payments/payu/init/", {
                amount: record.rent,
                rentId: record.id,
                productInfo: `Rent - ${record.month}`,
            });
            if (!res.data.success) { setPayingId(null); return; }

            const { payuBaseUrl, paymentData } = res.data;
            const form = document.createElement("form");
            form.method = "POST";
            form.action = payuBaseUrl;
            Object.entries(paymentData).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value ?? "";
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        } catch {
            setPayingId(null);
        }
    };

    const handleSetupAutoPay = async () => {
        setSettingUpSI(true);
        try {
            const res = await residentApi.post("/payments/payu/si-consent/");
            if (!res.data.success) { setSettingUpSI(false); return; }

            const { payuBaseUrl, paymentData } = res.data;
            const form = document.createElement("form");
            form.method = "POST";
            form.action = payuBaseUrl;
            Object.entries(paymentData).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value ?? "";
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        } catch {
            setSettingUpSI(false);
        }
    };

    const handleCancelMandate = async () => {
        if (!confirm("Are you sure you want to cancel auto-pay? You will need to pay rent manually each month.")) return;
        setCancellingMandate(true);
        try {
            const res = await residentApi.post("/payments/mandate/cancel/");
            if (res.data.success) setMandate(null);
        } catch { /* handled by interceptor */ }
        setCancellingMandate(false);
    };

    const statusBadge = (s) => {
        const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border";
        if (s === "Received") return `${base} bg-green-50 text-green-700 border-green-200`;
        return `${base} bg-red-50 text-red-700 border-red-200`;
    };

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <residentSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Payments</h1><p>Pay rent online securely</p></div>
                </div>

                {/* Auto-Pay Mandate Section */}
                {!mandateLoading && (
                    <div className="card mb-6">
                        <div className="card-header">
                            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <RefreshCw size={16} /> Auto-Pay (Recurring)
                            </h2>
                        </div>
                        <div className="card-body">
                            {mandate && mandate.status === "active" ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheck size={20} className="text-green-500" />
                                            <span className="font-semibold text-green-700">Auto-Pay Active</span>
                                        </div>
                                        <div className="text-sm text-gray-500 space-y-0.5">
                                            <p>Amount: <span className="font-medium text-gray-700">₹{mandate.billingAmount}/month</span></p>
                                            <p>Period: {mandate.startDate} to {mandate.endDate}</p>
                                            {mandate.nextChargeDate && <p>Next charge: <span className="font-medium text-gray-700">{mandate.nextChargeDate}</span></p>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCancelMandate}
                                        disabled={cancellingMandate}
                                        className="text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                                    >
                                        <ShieldOff size={14} />
                                        {cancellingMandate ? "Cancelling..." : "Cancel Auto-Pay"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Set up automatic monthly rent payments for the duration of your lease.
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Your card will be charged automatically each month. You can cancel anytime as per RBI guidelines.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSetupAutoPay}
                                        disabled={settingUpSI}
                                        className="btn-primary text-sm px-5 py-2 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {settingUpSI ? (
                                            <><div className="spinner-sm"></div> Redirecting...</>
                                        ) : (
                                            <><RefreshCw size={14} /> Set up Auto-Pay</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : (
                    <>
                        {/* Pending Payments */}
                        <div className="card mb-6">
                            <div className="card-header">
                                <h2 className="text-base font-semibold text-gray-800">Pending Payments</h2>
                            </div>
                            {pendingRecords.length === 0 ? (
                                <div className="card-body text-center py-12">
                                    <CheckCircle size={44} className="mx-auto mb-3 text-green-400" />
                                    <p className="text-gray-600 font-medium">All rents are paid</p>
                                    <p className="text-sm text-gray-400 mt-1">No pending payments.</p>
                                </div>
                            ) : (
                                <div className="card-body p-0">
                                    <div className="overflow-x-auto">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Month</th>
                                                    <th>Rent</th>
                                                    <th>Delay Charges</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingRecords.map(r => (
                                                    <tr key={r.id}>
                                                        <td className="font-medium">{r.month}</td>
                                                        <td>₹{r.rent}</td>
                                                        <td>{r.delayCharges ? `₹${r.delayCharges}` : "—"}</td>
                                                        <td>
                                                            <span className={statusBadge(r.rentStatus)}>
                                                                <XCircle size={12} /> {r.rentStatus}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                onClick={() => handlePay(r)}
                                                                disabled={!!payingId}
                                                                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                                                            >
                                                                {payingId === r.id ? (
                                                                    <><div className="spinner-sm"></div> Redirecting...</>
                                                                ) : (
                                                                    <><CreditCard size={14} /> Pay ₹{r.rent}</>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        {paidRecords.length > 0 && (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="text-base font-semibold text-gray-800">Payment History</h2>
                                </div>
                                <div className="card-body p-0">
                                    <div className="overflow-x-auto">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Month</th>
                                                    <th>Rent</th>
                                                    <th>Transfer Type</th>
                                                    <th>UTR / Txn ID</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paidRecords.map(r => (
                                                    <tr key={r.id}>
                                                        <td className="font-medium">{r.month}</td>
                                                        <td>₹{r.rent}</td>
                                                        <td>{r.transferType || "—"}</td>
                                                        <td className="text-xs font-mono">{r.utrNumber || "—"}</td>
                                                        <td>{r.transferredDate || "—"}</td>
                                                        <td>
                                                            <span className={statusBadge(r.rentStatus)}>
                                                                <CheckCircle size={12} /> {r.rentStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
