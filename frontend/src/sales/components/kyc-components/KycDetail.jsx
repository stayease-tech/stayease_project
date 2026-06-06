import { useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Check, X, Eye, Upload, ShieldCheck } from "lucide-react";
import { DashPage } from "../../../shared/Dashboard";

export default function KycDetail() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();

    const resident = state?.resident;
    const filter = state?.filter || "Pending";

    const [rejectReason, setRejectReason] = useState("");
    const [processing, setProcessing] = useState(false);
    const [uploadingLease, setUploadingLease] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [currentResident, setCurrentResident] = useState(resident);
    const leaseInputRef = useRef(null);

    // If navigated directly without state, go back to list
    if (!resident) {
        navigate("/sales/sales-kyc-management", { replace: true });
        return null;
    }

    const handleApprove = async () => {
        if (!currentResident?.leaseAgreement) {
            setMsg({ text: "Please upload the lease agreement before approving KYC.", type: "error" });
            return;
        }
        setProcessing(true);
        try {
            const res = await axios.post(`/operations/kyc-approve/${id}/`);
            if (res.data.success) {
                setMsg({ text: res.data.message, type: "success" });
                setCurrentResident((r) => ({ ...r, kycApprovalStatus: "Approved" }));
            } else {
                setMsg({ text: res.data.message || "Failed to approve.", type: "error" });
            }
        } catch {
            setMsg({ text: "Failed to approve.", type: "error" });
        }
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setMsg({ text: "Please provide a rejection reason.", type: "error" });
            return;
        }
        setProcessing(true);
        try {
            const res = await axios.post(`/operations/kyc-reject/${id}/`, { reason: rejectReason });
            if (res.data.success) {
                setMsg({ text: res.data.message, type: "success" });
                setCurrentResident((r) => ({ ...r, kycApprovalStatus: "Rejected", kycRejectionReason: rejectReason }));
                setRejectReason("");
            } else {
                setMsg({ text: res.data.message || "Failed to reject.", type: "error" });
            }
        } catch {
            setMsg({ text: "Failed to reject.", type: "error" });
        }
        setProcessing(false);
    };

    const handleLeaseUpload = async (file) => {
        if (!file) return;
        if (!file.name.toLowerCase().endsWith(".pdf")) {
            setMsg({ text: "Only PDF files are allowed.", type: "error" });
            return;
        }
        setUploadingLease(true);
        const formData = new FormData();
        formData.append("leaseAgreement", file);
        try {
            const res = await axios.post(`/sales/upload-lease/${id}/`, formData);
            if (res.data.success) {
                setMsg({ text: res.data.message, type: "success" });
                setCurrentResident((r) => ({ ...r, leaseAgreement: res.data.leaseUrl || true }));
            } else {
                setMsg({ text: "Failed to upload lease agreement.", type: "error" });
            }
        } catch {
            setMsg({ text: "Failed to upload lease agreement.", type: "error" });
        }
        setUploadingLease(false);
        if (leaseInputRef.current) leaseInputRef.current.value = "";
    };

    const r = currentResident;
    const isPending  = r?.kycApprovalStatus === "Pending";
    const isApproved = r?.kycApprovalStatus === "Approved";
    const isRejected = r?.kycApprovalStatus === "Rejected";

    const statusStyle = {
        Approved: "bg-green-50 text-green-700 border-green-200",
        Rejected:  "bg-red-50 text-red-700 border-red-200",
        Pending:   "bg-amber-50 text-amber-700 border-amber-200",
    }[r?.kycApprovalStatus] || "bg-amber-50 text-amber-700 border-amber-200";

    return (
        <DashPage>
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/sales/sales-kyc-management")}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600" />
                    </button>
                    <div>
                        <h1>{r?.residentsName}</h1>
                        <p>{r?.propertyName} — Room {r?.roomNo}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyle}`}>
                    {r?.kycApprovalStatus}
                </span>
            </div>

            {msg.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm border ${msg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: docs + lease */}
                <div className="lg:col-span-2 space-y-4">
                {/* Resident info */}
                <div className="card">
                    <div className="card-header"><h3>Resident Information</h3></div>
                    <div className="card-body grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div><p className="text-xs text-gray-400 mb-0.5">Phone</p><p className="font-medium">{r?.phoneNumber}</p></div>
                        <div><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="font-medium truncate">{r?.email || "—"}</p></div>
                        <div><p className="text-xs text-gray-400 mb-0.5">Room</p><p className="font-medium">Room {r?.roomNo}</p></div>
                        <div><p className="text-xs text-gray-400 mb-0.5">Bed</p><p className="font-medium">{r?.bedLabel || "—"}</p></div>
                    </div>
                </div>

                {/* KYC Documents */}
                <div className="card">
                    <div className="card-header"><h3>KYC Documents</h3></div>
                    <div className="card-body grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <DocCard label="Aadhaar" number={r?.aadharNumber} frontUrl={r?.aadharFrontCopy} backUrl={r?.aadharBackCopy} />
                        <DocCard label="PAN" number={r?.panNumber} frontUrl={r?.panFrontCopy} backUrl={r?.panBackCopy} />
                        <DocCard label={r?.studentEmployeeIdType || "Student/Employee ID"} number={r?.studentEmployeeIdNumber} frontUrl={r?.studentEmployeeIdCopy} />
                    </div>
                </div>

                {/* Lease Agreement */}
                <div className="card">
                    <div className="card-header flex items-center justify-between">
                        <h3>Lease Agreement</h3>
                        <div>
                            <input
                                ref={leaseInputRef}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => handleLeaseUpload(e.target.files[0])}
                            />
                            <button
                                className="btn btn-outline text-xs flex items-center gap-1.5"
                                onClick={() => leaseInputRef.current?.click()}
                                disabled={uploadingLease}
                            >
                                <Upload size={13} />
                                {uploadingLease ? "Uploading…" : r?.leaseAgreement ? "Replace" : "Upload PDF"}
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        {r?.leaseAgreement ? (
                            <div className="flex items-center gap-3 text-sm">
                                <a href={r.leaseAgreement} target="_blank" rel="noreferrer"
                                    className="text-[#D4A017] hover:underline flex items-center gap-1.5">
                                    <Eye size={14} /> View PDF
                                </a>
                                {r?.leaseUploadedAt && (
                                    <span className="text-xs text-gray-400">
                                        Uploaded {r.leaseUploadedAt.split("T")[0]} by {r.leaseUploadedBy}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No lease agreement uploaded yet.</p>
                        )}
                    </div>
                </div>

                {r?.kycRejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <span className="font-medium">Rejection reason:</span> {r.kycRejectionReason}
                    </div>
                )}
                </div>{/* end left col */}

                {/* Right: actions */}
                <div className="space-y-4">
                    {r?.hasPortalAccount && (
                        <div className="card">
                            <div className="card-body flex items-center gap-2 text-sm">
                                <ShieldCheck size={16} className={r?.portalEnabled ? "text-green-500" : "text-gray-300"} />
                                {r?.portalEnabled
                                    ? <span className="text-green-700">Portal active</span>
                                    : <span className="text-gray-500">Portal enabled after lease + KYC approval</span>
                                }
                            </div>
                        </div>
                    )}

                    {isApproved && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                            <Check size={16} /> KYC approved.
                        </div>
                    )}

                    {(isPending || isRejected) && (
                        <div className="card">
                            <div className="card-header"><h3>Actions</h3></div>
                            <div className="card-body space-y-3">
                                <button
                                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                                    onClick={handleApprove}
                                    disabled={processing}
                                >
                                    <Check size={16} /> {isRejected ? "Re-approve" : "Approve KYC"}
                                </button>

                                {isPending && (
                                    <div className="border-t border-gray-100 pt-3 space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                                        <textarea
                                            className="form-input w-full text-sm"
                                            rows={3}
                                            placeholder="Describe why this KYC is being rejected…"
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                        <button
                                            className="btn bg-red-500 text-white hover:bg-red-600 w-full flex items-center justify-center gap-2"
                                            onClick={handleReject}
                                            disabled={processing}
                                        >
                                            <X size={16} /> Reject KYC
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>{/* end grid */}
        </DashPage>
    );
}

function DocCard({ label, number, frontUrl, backUrl }) {
    const hasDoc = frontUrl || backUrl;
    return (
        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
            <p className="font-semibold text-sm text-gray-800 mb-1">{label}</p>
            <p className="text-xs text-gray-500 mb-3 font-mono">{number || (hasDoc ? "Number not entered" : "Not uploaded")}</p>
            <div className="flex gap-3 text-xs">
                {frontUrl && (
                    <a href={frontUrl} target="_blank" rel="noreferrer"
                        className="text-[#D4A017] hover:underline flex items-center gap-1">
                        <Eye size={12} /> Front
                    </a>
                )}
                {backUrl && (
                    <a href={backUrl} target="_blank" rel="noreferrer"
                        className="text-[#D4A017] hover:underline flex items-center gap-1">
                        <Eye size={12} /> Back
                    </a>
                )}
                {!hasDoc && <span className="text-gray-400">No documents uploaded</span>}
            </div>
        </div>
    );
}
