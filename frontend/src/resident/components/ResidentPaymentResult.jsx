// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export default function ResidentPaymentResult() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const status = params.get("status");
    const txnid = params.get("txnid");
    const amount = params.get("amount");
    const type = params.get("type");
    const isSuccess = status === "success";
    const isMandate = type === "mandate";

    return (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
                {isSuccess ? (
                    <CheckCircle size={56} className="mx-auto mb-4 text-green-500" />
                ) : (
                    <XCircle size={56} className="mx-auto mb-4 text-red-500" />
                )}

                <h1 className="text-xl font-semibold text-gray-800 mb-2">
                    {isMandate
                        ? (isSuccess ? "Auto-Pay Setup Successful" : "Auto-Pay Setup Failed")
                        : (isSuccess ? "Payment Successful" : "Payment Failed")}
                </h1>

                <p className="text-sm text-gray-500 mb-6">
                    {isMandate
                        ? (isSuccess
                            ? "Your auto-pay mandate has been registered successfully. Monthly rent will be deducted automatically."
                            : "Auto-pay setup could not be completed. Please try again or pay manually.")
                        : (isSuccess
                            ? "Your rent payment was processed successfully. Your rent history has been updated."
                            : "Your payment could not be completed. No amount has been deducted. Please try again.")}
                </p>

                {isSuccess && amount && (
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-6 text-left">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-semibold text-gray-800">₹{amount}</span>
                        </div>
                        {txnid && (
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500">Transaction ID</span>
                                <span className="font-mono text-xs text-gray-700">{txnid}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate("/resident/payments")}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        {isSuccess ? "Back to Payments" : "Try Again"}
                    </button>
                    <button
                        onClick={() => navigate("/resident/dashboard")}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
