import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import tenantApi from "../tenantApi";
import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";

export default function TenantInvoice({ isExpanded, setIsExpanded }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        tenantApi.get(`/invoices/${id}/`)
            .then((res) => { if (res.data.success) setInvoice(res.data.invoice); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const Field = ({ label, value }) => (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value || "—"}</span>
        </div>
    );

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <TenantSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Invoice #{id}</h1><p>Detailed rent invoice</p></div>
                    <button className="btn btn-outline" onClick={() => navigate("/tenant/rent-history")}>Back to Rent History</button>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : !invoice ? (
                    <div className="card"><div className="card-body text-center text-gray-500 py-12">Invoice not found.</div></div>
                ) : (
                    <div className="card max-w-lg">
                        <div className="card-header"><h3>Invoice Details</h3></div>
                        <div className="card-body">
                            <Field label="Tenant" value={invoice.tenantName} />
                            <Field label="Phone" value={invoice.phoneNumber} />
                            <Field label="Property" value={invoice.propertyName} />
                            <Field label="Room / Bed" value={`${invoice.roomNo} / ${invoice.bedLabel}`} />
                            <Field label="Month" value={invoice.month} />
                            <Field label="Rent" value={`₹${invoice.rent}`} />
                            <Field label="Delay Charges" value={invoice.delayCharges ? `₹${invoice.delayCharges}` : "₹0"} />
                            <Field label="Total" value={`₹${(parseFloat(invoice.rent || 0) + parseFloat(invoice.delayCharges || 0)).toFixed(2)}`} />
                            <Field label="Status" value={invoice.rentStatus} />
                            <Field label="Transfer Type" value={invoice.transferType} />
                            <Field label="UTR Number" value={invoice.utrNumber} />
                            <Field label="Transfer Date" value={invoice.transferredDate} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
