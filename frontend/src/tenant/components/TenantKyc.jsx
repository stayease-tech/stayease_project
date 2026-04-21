import { useState, useEffect } from "react";
import tenantApi from "../tenantApi";
import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";
import { ShieldCheck, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function TenantKyc({ isExpanded, setIsExpanded }) {
    const [kyc, setKyc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchKyc = () => {
        tenantApi.get("/kyc/status/")
            .then((res) => { if (res.data.success) setKyc(res.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(fetchKyc, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData(e.target);
        try {
            const res = await tenantApi.post("/kyc/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                skipGlobalErrorToast: true,
            });
            if (res.data.success) {
                toast.success("Documents uploaded successfully!");
                fetchKyc();
            } else {
                toast.error(res.data.message || "Upload failed.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed.");
        }
        setUploading(false);
    };

    const statusColor = {
        Approved: "text-green-600 bg-green-50 border-green-200",
        Rejected: "text-red-600 bg-red-50 border-red-200",
        Pending: "text-amber-600 bg-amber-50 border-amber-200",
    };

    const StatusIcon = kyc?.kycApprovalStatus === "Approved" ? CheckCircle
        : kyc?.kycApprovalStatus === "Rejected" ? AlertCircle
        : ShieldCheck;

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <TenantSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>KYC Verification</h1><p>Upload and manage your identity documents</p></div>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : (
                    <>
                        {/* Status Badge */}
                        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${statusColor[kyc?.kycApprovalStatus] || statusColor.Pending}`}>
                            <StatusIcon size={24} />
                            <div>
                                <p className="font-semibold">KYC Status: {kyc?.kycApprovalStatus || "Pending"}</p>
                                {kyc?.kycApprovedBy && <p className="text-xs mt-0.5">Approved by: {kyc.kycApprovedBy} on {kyc.kycApprovalDate?.split("T")[0]}</p>}
                                {kyc?.kycRejectionReason && <p className="text-xs mt-0.5">Reason: {kyc.kycRejectionReason}</p>}
                            </div>
                        </div>

                        {/* Current Documents */}
                        <div className="card mb-6">
                            <div className="card-header"><h3>Current Documents</h3></div>
                            <div className="card-body">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <DocCard label="Aadhaar" number={kyc?.aadharNumber} frontUrl={kyc?.aadharFrontCopy} backUrl={kyc?.aadharBackCopy} />
                                    <DocCard label="PAN" number={kyc?.panNumber} frontUrl={kyc?.panFrontCopy} backUrl={kyc?.panBackCopy} />
                                    <DocCard label={kyc?.studentEmployeeIdType || "Student/Employee ID"} number={kyc?.studentEmployeeIdNumber} frontUrl={kyc?.studentEmployeeIdCopy} />
                                </div>
                            </div>
                        </div>

                        {/* Upload Form */}
                        <div className="card">
                                <div className="card-header"><h3>Upload Documents</h3></div>
                                <div className="card-body">
                                    <form onSubmit={handleUpload} className="space-y-6">
                                        <fieldset className="border border-gray-200 rounded-lg p-4">
                                            <legend className="text-sm font-semibold text-gray-700 px-2">Aadhaar Card (Required)</legend>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Aadhaar Number</label>
                                                    <input name="aadharNumber" className="form-input" placeholder="XXXX XXXX XXXX" defaultValue={kyc?.aadharNumber || ""} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Front Copy</label>
                                                    <input name="aadharFrontCopy" type="file" accept="image/*,.pdf" className="form-input text-xs" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Back Copy</label>
                                                    <input name="aadharBackCopy" type="file" accept="image/*,.pdf" className="form-input text-xs" />
                                                </div>
                                            </div>
                                        </fieldset>

                                        <fieldset className="border border-gray-200 rounded-lg p-4">
                                            <legend className="text-sm font-semibold text-gray-700 px-2">PAN Card (Optional)</legend>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">PAN Number</label>
                                                    <input name="panNumber" className="form-input" placeholder="ABCDE1234F" defaultValue={kyc?.panNumber || ""} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Front Copy</label>
                                                    <input name="panFrontCopy" type="file" accept="image/*,.pdf" className="form-input text-xs" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Back Copy</label>
                                                    <input name="panBackCopy" type="file" accept="image/*,.pdf" className="form-input text-xs" />
                                                </div>
                                            </div>
                                        </fieldset>

                                        <div className="flex items-center gap-3 my-2">
                                            <div className="flex-1 border-t border-gray-200" />
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">OR</span>
                                            <div className="flex-1 border-t border-gray-200" />
                                        </div>

                                        <fieldset className="border border-gray-200 rounded-lg p-4">
                                            <legend className="text-sm font-semibold text-gray-700 px-2">Student/Employee ID (Optional)</legend>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">ID Type</label>
                                                    <select name="studentEmployeeIdType" className="form-input" defaultValue={kyc?.studentEmployeeIdType || ""}>
                                                        <option value="">Select type</option>
                                                        <option value="Student ID">Student ID</option>
                                                        <option value="Employee ID">Employee ID</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">ID Number</label>
                                                    <input name="studentEmployeeIdNumber" className="form-input" defaultValue={kyc?.studentEmployeeIdNumber || ""} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">ID Copy</label>
                                                    <input name="studentEmployeeIdCopy" type="file" accept="image/*,.pdf" className="form-input text-xs" />
                                                </div>
                                            </div>
                                        </fieldset>

                                        <button className="btn btn-primary flex items-center gap-2" type="submit" disabled={uploading}>
                                            <Upload size={16} />
                                            {uploading ? "Uploading..." : "Upload Documents"}
                                        </button>
                                    </form>
                                </div>
                            </div>

                    </>
                )}
            </div>
        </div>
    );
}

function DocCard({ label, number, frontUrl, backUrl }) {
    return (
        <div className="border border-gray-200 rounded-lg p-3">
            <p className="font-semibold text-sm text-gray-800 mb-1">{label}</p>
            <p className="text-xs text-gray-500 mb-2">{number || "Not provided"}</p>
            <div className="flex gap-2 text-xs">
                {frontUrl && <a href={frontUrl} target="_blank" rel="noreferrer" className="text-[#D4A017] hover:underline">Front</a>}
                {backUrl && <a href={backUrl} target="_blank" rel="noreferrer" className="text-[#D4A017] hover:underline">Back</a>}
                {!frontUrl && !backUrl && <span className="text-gray-400">No documents uploaded</span>}
            </div>
        </div>
    );
}
