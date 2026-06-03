// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import residentApi from "../residentApi";
import Navbar from "../../shared/Navbar";
import ResidentSidebar from "./Sidebar";
import {
    CreditCard, CheckCircle, RefreshCw, AlertCircle,
    ShieldCheck, ShieldOff, IndianRupee, Calendar,
    Hash, CheckCircle2
} from "lucide-react";

/**
 * Dynamically loads the Razorpay checkout SDK script from CDN.
 * Resolves to `true` if the script loads successfully, `false` on error.
 *
 * @returns {Promise<boolean>}
 */
function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * residentPayments — displays pending dues, payment history, and auto-pay management.
 * Loads rent records and mandate status on mount; opens Razorpay for one-time or
 * subscription payments.
 *
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the sidebar is in expanded state.
 * @param {Function} props.setIsExpanded - Setter to toggle sidebar expanded state.
 * @returns {React.ReactElement}
 */
export default function residentPayments({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
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
            .then(res => { if (res.data.success && res.data.hasMandate) setMandate(res.data.mandate); })
            .catch(console.error)
            .finally(() => setMandateLoading(false));
    }, []);

    const pendingRecords = records.filter(r => r.rentStatus !== "Received");
    const paidRecords = records.filter(r => r.rentStatus === "Received");
    const totalDue = pendingRecords.reduce((sum, r) => sum + parseFloat(r.rent || 0) + parseFloat(r.delayCharges || 0), 0);

    /**
     * Initiates a Razorpay checkout for the given rent record.
     * Loads the SDK on demand, creates an order via the API, and opens the payment modal.
     * Navigates to the payment-result page on success or failure.
     *
     * @param {object} record - The pending rent record to pay.
     * @param {number} record.id - Rent record ID.
     * @param {string} record.month - Month label (e.g. "June 2026").
     * @param {string|number} record.rent - Rent amount.
     */
    const handlePay = async (record) => {
        setPayingId(record.id);
        const loaded = await loadRazorpay();
        if (!loaded) { setPayingId(null); return; }
        try {
            const res = await residentApi.post("/payments/init/", {
                amount: record.rent,
                rentId: record.id,
                productInfo: `Rent - ${record.month}`,
            });
            if (!res.data.success) { setPayingId(null); return; }

            const { orderId, keyId, amount, currency, prefill, notes } = res.data;
            const options = {
                key: keyId, amount, currency,
                order_id: orderId,
                name: "StayEase",
                description: `Rent - ${record.month}`,
                prefill, notes,
                theme: { color: "#D4A017" },
                handler: async (response) => {
                    try {
                        const v = await residentApi.post("/payments/verify/", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        navigate(v.data.success
                            ? "/resident/payment-result?status=success&txnid=" + response.razorpay_payment_id
                            : "/resident/payment-result?status=failed");
                    } catch { navigate("/resident/payment-result?status=failed"); }
                },
                modal: { ondismiss: () => setPayingId(null) }
            };
            new window.Razorpay(options).open();
        } catch { setPayingId(null); navigate("/resident/payment-result?status=failed"); }
    };

    /**
     * Initiates Razorpay subscription setup for monthly auto-pay.
     * Creates a subscription via the API and opens the Razorpay modal for mandate authorisation.
     * Navigates to the payment-result page on completion.
     */
    const handleSetupAutoPay = async () => {
        setSettingUpSI(true);
        const loaded = await loadRazorpay();
        if (!loaded) { setSettingUpSI(false); return; }
        try {
            const res = await residentApi.post("/payments/subscription/init/");
            if (!res.data.success) { setSettingUpSI(false); return; }
            const { subscriptionId, keyId, prefill } = res.data;
            const options = {
                key: keyId, subscription_id: subscriptionId,
                name: "StayEase", description: "Monthly Rent Auto-Pay",
                prefill, theme: { color: "#D4A017" },
                handler: async (response) => {
                    try {
                        const v = await residentApi.post("/payments/subscription/verify/", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        navigate(v.data.success
                            ? "/resident/payment-result?status=success&type=mandate"
                            : "/resident/payment-result?status=failed&type=mandate");
                    } catch { navigate("/resident/payment-result?status=failed&type=mandate"); }
                    setSettingUpSI(false);
                },
                modal: { ondismiss: () => setSettingUpSI(false) }
            };
            new window.Razorpay(options).open();
        } catch { setSettingUpSI(false); }
    };

    /**
     * Cancels the active auto-pay mandate after user confirmation.
     * Calls the cancel API and clears the local mandate state on success.
     */
    const handleCancelMandate = async () => {
        if (!confirm("Cancel auto-pay? You will need to pay rent manually each month.")) return;
        setCancellingMandate(true);
        try {
            const res = await residentApi.post("/payments/mandate/cancel/");
            if (res.data.success) setMandate(null);
        } catch { /* handled */ }
        setCancellingMandate(false);
    };

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <ResidentSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>

                <div className="page-header">
                    <div><h1>Payments</h1><p>Pay rent and manage auto-pay</p></div>
                </div>

                {/* Summary + Auto-Pay row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

                    {/* Total Due Card */}
                    <div className="card">
                        <div className="card-body flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <IndianRupee size={22} className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">Total Outstanding</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {loading ? "—" : totalDue > 0 ? `₹${totalDue.toLocaleString('en-IN')}` : "All paid"}
                                </p>
                                {!loading && pendingRecords.length > 0 && (
                                    <p className="text-xs text-red-500 mt-0.5">{pendingRecords.length} month{pendingRecords.length > 1 ? "s" : ""} pending</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Auto-Pay Card */}
                    {!mandateLoading && (
                        <div className="card">
                            <div className="card-body">
                                {mandate?.status === "active" ? (
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                                                <ShieldCheck size={20} className="text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-green-700">Auto-Pay Active</p>
                                                <p className="text-xs text-gray-500">₹{mandate.billingAmount}/month</p>
                                                {mandate.nextChargeDate && (
                                                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                        <Calendar size={11} /> Next: {mandate.nextChargeDate}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCancelMandate}
                                            disabled={cancellingMandate}
                                            className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors flex items-center gap-1.5 flex-shrink-0"
                                        >
                                            <ShieldOff size={13} /> {cancellingMandate ? "Cancelling..." : "Cancel"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <RefreshCw size={18} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">Auto-Pay</p>
                                                <p className="text-xs text-gray-400">Automatic monthly deduction</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSetupAutoPay}
                                            disabled={settingUpSI}
                                            className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5 flex-shrink-0"
                                        >
                                            {settingUpSI ? <><div className="spinner-sm"></div> Opening...</> : <><RefreshCw size={13} /> Set up</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : (
                    <>
                        {/* Pending Payments */}
                        <div className="card mb-6">
                            <div className="card-header">
                                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-500" /> Pending Payments
                                    {pendingRecords.length > 0 && (
                                        <span className="ml-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            {pendingRecords.length}
                                        </span>
                                    )}
                                </h2>
                            </div>
                            {pendingRecords.length === 0 ? (
                                <div className="card-body text-center py-10">
                                    <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
                                    <p className="font-medium text-gray-700">All rents are paid</p>
                                    <p className="text-sm text-gray-400 mt-1">No pending payments.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {pendingRecords.map(r => {
                                        const total = parseFloat(r.rent || 0) + parseFloat(r.delayCharges || 0);
                                        return (
                                            <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                                        <Calendar size={16} className="text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{r.month}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-gray-500">Rent ₹{r.rent}</span>
                                                            {r.delayCharges && parseFloat(r.delayCharges) > 0 && (
                                                                <span className="text-xs text-red-500">+ ₹{r.delayCharges} delay</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                                    <p className="text-base font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
                                                    <button
                                                        onClick={() => handlePay(r)}
                                                        disabled={!!payingId}
                                                        className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                                                    >
                                                        {payingId === r.id
                                                            ? <><div className="spinner-sm"></div> Processing...</>
                                                            : <><CreditCard size={13} /> Pay Now</>}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        {paidRecords.length > 0 && (
                            <div className="card">
                                <div className="card-header flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-500" /> Payment History
                                    </h2>
                                    <span className="text-xs text-gray-400 font-normal">{paidRecords.length} {paidRecords.length === 1 ? "record" : "records"}</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {paidRecords.map(r => {
                                        const total = (parseFloat(r.rent || 0) + parseFloat(r.delayCharges || 0));
                                        const hasDelay = r.delayCharges && parseFloat(r.delayCharges) > 0;
                                        return (
                                            <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 size={20} className="text-green-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-semibold text-gray-900">{r.month}</span>
                                                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">Paid</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                                        {r.transferredDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={11} /> {r.transferredDate}
                                                            </span>
                                                        )}
                                                        {r.transferType && (
                                                            <span className="flex items-center gap-1">
                                                                <CreditCard size={11} /> {r.transferType}
                                                            </span>
                                                        )}
                                                        {r.utrNumber && (
                                                            <span className="flex items-center gap-1 font-mono">
                                                                <Hash size={11} /> {r.utrNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-semibold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
                                                    {hasDelay ? (
                                                        <p className="text-xs text-gray-400">₹{r.rent} + ₹{r.delayCharges} delay</p>
                                                    ) : (
                                                        <p className="text-xs text-gray-400">Rent only</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
