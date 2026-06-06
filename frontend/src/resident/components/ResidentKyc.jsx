// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import residentApi from "../residentApi";
import { ShieldCheck, Upload, AlertCircle, CheckCircle, FileUp, Eye, X, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useDropdowns } from "../../shared/DropdownContext";
import { DashPage } from "../../shared/Dashboard";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/** Extract a readable filename from a storage URL. */
const fileName = (url) => url ? decodeURIComponent(url.split("/").pop()) : null;

export default function residentKyc() {
    const navigate = useNavigate();
    const { getOptions } = useDropdowns();
    const [kyc, setKyc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [showUpload, setShowUpload] = useState(false);

    const idTypeOptions = getOptions('student_employee_id_types');
    const idTypes = idTypeOptions.length ? idTypeOptions : ['Student ID', 'Employee ID'];

    const fetchKyc = () => {
        residentApi.get("/kyc/status/")
            .then((res) => {
                if (res.data.success) {
                    setKyc(res.data);
                    if (res.data.kycApprovalStatus === "Approved") {
                        navigate("/resident/lease", { replace: true });
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(fetchKyc, []);

    const handleFileSelect = (fieldName, file) => {
        if (!file) {
            setSelectedFiles((prev) => { const next = { ...prev }; delete next[fieldName]; return next; });
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`"${file.name}" exceeds the 5 MB limit.`);
            return;
        }
        setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData(e.target);
        for (const key of [...formData.keys()]) {
            if (formData.get(key) instanceof File && formData.get(key).size === 0) formData.delete(key);
        }
        for (const [key, file] of Object.entries(selectedFiles)) formData.set(key, file);

        try {
            const res = await residentApi.post("/kyc/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                skipGlobalErrorToast: true,
            });
            if (res.data.success) {
                toast.success("Documents uploaded successfully!");
                setSelectedFiles({});
                setShowUpload(false);
                fetchKyc();
            } else {
                toast.error(res.data.message || "Upload failed.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed.");
        }
        setUploading(false);
    };

    const status = kyc?.kycApprovalStatus || "Pending";
    const isRejected = status === "Rejected";

    // Docs are considered uploaded if at least Aadhaar front exists
    const hasUploadedDocs = !!(kyc?.aadharFrontCopy || kyc?.panFrontCopy || kyc?.studentEmployeeIdCopy);

    // Show upload section when: no docs yet, or rejected, or user clicked "Replace"
    const uploadVisible = !hasUploadedDocs || isRejected || showUpload;

    const statusStyle = {
        Approved: "text-green-700 bg-green-50 border-green-200",
        Rejected: "text-red-700 bg-red-50 border-red-200",
        Pending:  "text-amber-700 bg-amber-50 border-amber-200",
    }[status] || "text-amber-700 bg-amber-50 border-amber-200";

    const StatusIcon = status === "Approved" ? CheckCircle : status === "Rejected" ? AlertCircle : ShieldCheck;

    const statusLabel = status === "Pending" ? "Pending for approval" : status;

    return (
        <DashPage>
            <div className="page-header">
                <div><h1>KYC Verification</h1><p>Your identity documents and verification status</p></div>
            </div>

            {loading ? (
                <div className="loading-center"><div className="spinner"></div></div>
            ) : (
                <div className="space-y-6">

                    {/* Status banner */}
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${statusStyle}`}>
                        <StatusIcon size={22} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">KYC Status: {statusLabel}</p>
                            {status === "Pending" && !hasUploadedDocs && (
                                <p className="text-xs mt-0.5">Please upload your documents below to complete verification.</p>
                            )}
                            {status === "Pending" && hasUploadedDocs && (
                                <p className="text-xs mt-0.5">Your documents have been submitted and are under review.</p>
                            )}
                            {kyc?.kycApprovedBy && (
                                <p className="text-xs mt-0.5">Approved by {kyc.kycApprovedBy} on {kyc.kycApprovalDate?.split("T")[0]}</p>
                            )}
                            {isRejected && kyc?.kycRejectionReason && (
                                <p className="text-xs mt-1 font-medium">Reason: {kyc.kycRejectionReason}</p>
                            )}
                        </div>
                    </div>

                    {/* Current Documents — shown only when docs already uploaded */}
                    {hasUploadedDocs && (
                        <div className="card">
                            <div className="card-header flex items-center justify-between">
                                <h3>Uploaded Documents</h3>
                                {/* Allow replacing only when rejected or explicitly triggered */}
                                {!isRejected && !showUpload && (
                                    <button
                                        onClick={() => setShowUpload(true)}
                                        className="flex items-center gap-1.5 text-xs text-[#D4A017] hover:text-[#B8860B] transition-colors"
                                    >
                                        <RefreshCw size={12} /> Replace documents
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <UploadedDocCard
                                        label="Aadhaar Card"
                                        number={kyc?.aadharNumber}
                                        files={[
                                            { name: "Front copy", url: kyc?.aadharFrontCopy },
                                            { name: "Back copy",  url: kyc?.aadharBackCopy },
                                        ]}
                                    />
                                    <UploadedDocCard
                                        label="PAN Card"
                                        number={kyc?.panNumber}
                                        files={[
                                            { name: "Front copy", url: kyc?.panFrontCopy },
                                            { name: "Back copy",  url: kyc?.panBackCopy },
                                        ]}
                                    />
                                    <UploadedDocCard
                                        label={kyc?.studentEmployeeIdType || "Student / Employee ID"}
                                        number={kyc?.studentEmployeeIdNumber}
                                        files={[
                                            { name: "ID copy", url: kyc?.studentEmployeeIdCopy },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload form — shown when no docs yet, rejected, or Replace clicked */}
                    {uploadVisible && (
                        <div className="card">
                            <div className="card-header flex items-center justify-between">
                                <h3>{isRejected ? "Re-upload Documents" : hasUploadedDocs ? "Replace Documents" : "Upload Documents"}</h3>
                                {hasUploadedDocs && !isRejected && (
                                    <button
                                        onClick={() => { setShowUpload(false); setSelectedFiles({}); }}
                                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                    >
                                        <X size={12} /> Cancel
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                {isRejected && (
                                    <p className="text-sm text-red-600 mb-4">
                                        Your KYC was rejected. Please re-upload corrected documents.
                                    </p>
                                )}
                                <form onSubmit={handleUpload} className="space-y-4">
                                    <p className="text-xs text-gray-500">Provide at least one of Aadhaar or PAN, plus a Student / Employee ID.</p>

                                    <fieldset className="border border-gray-200 rounded-lg p-4">
                                        <legend className="text-sm font-semibold text-gray-700 px-2">Aadhaar Card</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Aadhaar Number</label>
                                                <input name="aadharNumber" className="form-input" placeholder="XXXX XXXX XXXX" defaultValue={kyc?.aadharNumber || ""} />
                                            </div>
                                            <FileUploadField label="Front Copy" name="aadharFrontCopy" file={selectedFiles.aadharFrontCopy} onSelect={handleFileSelect} existingUrl={kyc?.aadharFrontCopy} />
                                            <FileUploadField label="Back Copy"  name="aadharBackCopy"  file={selectedFiles.aadharBackCopy}  onSelect={handleFileSelect} existingUrl={kyc?.aadharBackCopy} />
                                        </div>
                                    </fieldset>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 border-t border-gray-200" />
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">OR</span>
                                        <div className="flex-1 border-t border-gray-200" />
                                    </div>

                                    <fieldset className="border border-gray-200 rounded-lg p-4">
                                        <legend className="text-sm font-semibold text-gray-700 px-2">PAN Card</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">PAN Number</label>
                                                <input name="panNumber" className="form-input" placeholder="ABCDE1234F" defaultValue={kyc?.panNumber || ""} />
                                            </div>
                                            <FileUploadField label="Front Copy" name="panFrontCopy" file={selectedFiles.panFrontCopy} onSelect={handleFileSelect} existingUrl={kyc?.panFrontCopy} />
                                            <FileUploadField label="Back Copy"  name="panBackCopy"  file={selectedFiles.panBackCopy}  onSelect={handleFileSelect} existingUrl={kyc?.panBackCopy} />
                                        </div>
                                    </fieldset>

                                    <fieldset className="border border-gray-200 rounded-lg p-4">
                                        <legend className="text-sm font-semibold text-gray-700 px-2">Student / Employee ID (Required)</legend>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">ID Type <span className="text-red-500">*</span></label>
                                                <select name="studentEmployeeIdType" className="form-input" required defaultValue={kyc?.studentEmployeeIdType || ""}>
                                                    <option value="">Select type</option>
                                                    {idTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">ID Number <span className="text-red-500">*</span></label>
                                                <input name="studentEmployeeIdNumber" className="form-input" required defaultValue={kyc?.studentEmployeeIdNumber || ""} />
                                            </div>
                                            <FileUploadField label="ID Copy *" name="studentEmployeeIdCopy" file={selectedFiles.studentEmployeeIdCopy} onSelect={handleFileSelect} existingUrl={kyc?.studentEmployeeIdCopy} />
                                        </div>
                                    </fieldset>

                                    <button className="btn btn-primary flex items-center gap-2" type="submit" disabled={uploading}>
                                        <Upload size={16} />
                                        {uploading ? "Uploading…" : "Submit Documents"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </DashPage>
    );
}

/** Shows an already-uploaded file with its name and a View link. */
function UploadedDocCard({ label, number, files }) {
    const hasAny = files.some((f) => f.url);
    return (
        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
            <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
            {number && <p className="text-xs text-gray-500 mb-3 font-mono">{number}</p>}
            {!hasAny && <p className="text-xs text-gray-400">No documents uploaded</p>}
            <div className="space-y-2">
                {files.map(({ name, url }) => url ? (
                    <div key={name} className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <FileUp size={13} className="text-[#D4A017] flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-600">{name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{fileName(url)}</p>
                            </div>
                        </div>
                        <a href={url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-[#D4A017] hover:text-[#B8860B] flex-shrink-0">
                            <Eye size={12} /> View
                        </a>
                    </div>
                ) : null)}
            </div>
        </div>
    );
}

/** File picker — shows a "Choose File" button, or a filename chip once selected. */
function FileUploadField({ label, name, file, onSelect, existingUrl }) {
    const inputRef = useRef(null);
    return (
        <div>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => { onSelect(name, e.target.files[0] || null); e.target.value = ""; }}
            />
            {file ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <FileUp size={15} className="text-green-600 flex-shrink-0" />
                    <span className="text-xs text-green-800 truncate flex-1">{file.name}</span>
                    <button type="button" onClick={() => onSelect(name, null)} className="text-green-600 hover:text-red-500 flex-shrink-0">
                        <X size={13} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#D4A017] hover:text-[#D4A017] transition-colors"
                >
                    <Upload size={15} />
                    {existingUrl ? "Replace file" : "Choose file"}
                </button>
            )}
            <p className="text-[10px] text-gray-400 mt-1">Images or PDF · max 5 MB</p>
        </div>
    );
}
