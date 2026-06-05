// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import residentApi from "../residentApi";
import { ShieldCheck, Upload, AlertCircle, CheckCircle, FileUp, X } from "lucide-react";
import { toast } from "react-toastify";
import { useDropdowns } from "../../shared/DropdownContext";
import { DashPage } from "../../shared/Dashboard";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * residentKyc — KYC document upload and status page for the resident portal.
 * Shows the current approval status, displays existing document copies,
 * and provides a form to upload Aadhaar, PAN, and student/employee ID documents.
 * Automatically redirects to /resident/lease when KYC is already approved.
 *
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the sidebar is in expanded state.
 * @param {Function} props.setIsExpanded - Setter to toggle sidebar expanded state.
 * @returns {React.ReactElement}
 */
export default function residentKyc() {
    const navigate = useNavigate();
    const { getOptions } = useDropdowns();
    const [kyc, setKyc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState({});

    const idTypeOptions = getOptions('student_employee_id_types');
    const idTypes = idTypeOptions.length ? idTypeOptions : ['Student ID', 'Employee ID'];

    /**
     * Fetches the resident's current KYC status and document data from the API.
     * Redirects to the lease page if KYC is already approved.
     */
    const fetchKyc = () => {
        residentApi.get("/kyc/status/")
            .then((res) => {
                if (res.data.success) {
                    setKyc(res.data);
                    // Redirect to lease page if KYC is already approved
                    if (res.data.kycApprovalStatus === "Approved") {
                        navigate("/resident/lease", { replace: true });
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(fetchKyc, []);

    /**
     * Tracks a user-selected file for a given form field, enforcing the 5 MB size limit.
     * Passing `null` as the file removes the field's staged selection.
     *
     * @param {string} fieldName - The form field key the file belongs to (e.g. "aadharFrontCopy").
     * @param {File|null} file - The selected File object, or null to clear the selection.
     */
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

    /**
     * Submits the KYC document upload form as multipart/form-data.
     * Replaces empty native file inputs with tracked files from `selectedFiles` state,
     * then posts to the API and refreshes KYC status on success.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
     */
    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData(e.target);

        // Remove native file inputs and replace with tracked files
        for (const key of [...formData.keys()]) {
            if (formData.get(key) instanceof File && formData.get(key).size === 0) {
                formData.delete(key);
            }
        }
        for (const [key, file] of Object.entries(selectedFiles)) {
            formData.set(key, file);
        }

        try {
            const res = await residentApi.post("/kyc/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                skipGlobalErrorToast: true,
            });
            if (res.data.success) {
                toast.success("Documents uploaded successfully!");
                setSelectedFiles({});
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
        <DashPage>
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
                                                <FileUploadButton label="Front Copy" name="aadharFrontCopy" file={selectedFiles.aadharFrontCopy} onSelect={handleFileSelect} />
                                                <FileUploadButton label="Back Copy" name="aadharBackCopy" file={selectedFiles.aadharBackCopy} onSelect={handleFileSelect} />
                                            </div>
                                        </fieldset>

                                        <fieldset className="border border-gray-200 rounded-lg p-4">
                                            <legend className="text-sm font-semibold text-gray-700 px-2">PAN Card (Optional)</legend>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">PAN Number</label>
                                                    <input name="panNumber" className="form-input" placeholder="ABCDE1234F" defaultValue={kyc?.panNumber || ""} />
                                                </div>
                                                <FileUploadButton label="Front Copy" name="panFrontCopy" file={selectedFiles.panFrontCopy} onSelect={handleFileSelect} />
                                                <FileUploadButton label="Back Copy" name="panBackCopy" file={selectedFiles.panBackCopy} onSelect={handleFileSelect} />
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
                                                        {idTypes.map((t, i) => (
                                                            <option key={i} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">ID Number</label>
                                                    <input name="studentEmployeeIdNumber" className="form-input" defaultValue={kyc?.studentEmployeeIdNumber || ""} />
                                                </div>
                                                <FileUploadButton label="ID Copy" name="studentEmployeeIdCopy" file={selectedFiles.studentEmployeeIdCopy} onSelect={handleFileSelect} />
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
        </DashPage>
    );
}

/**
 * FileUploadButton — file picker with a styled preview of the selected file.
 * Shows a dashed upload button when no file is chosen, and a dismissible
 * filename chip once a file has been selected.
 *
 * @param {object} props
 * @param {string} props.label - Display label shown above the button.
 * @param {string} props.name - Form field name passed to the `onSelect` callback.
 * @param {File|null} props.file - Currently staged file, or null when none is selected.
 * @param {Function} props.onSelect - Callback `(name, file | null) => void` fired on change or clear.
 * @returns {React.ReactElement}
 */
function FileUploadButton({ label, name, file, onSelect }) {
    const inputRef = useRef(null);

    return (
        <div>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                    onSelect(name, e.target.files[0] || null);
                    e.target.value = "";
                }}
            />
            {file ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <FileUp size={16} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800 truncate flex-1">{file.name}</span>
                    <button type="button" onClick={() => onSelect(name, null)} className="text-green-600 hover:text-red-500">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-[#D4A017] rounded-lg text-sm font-medium text-[#D4A017] bg-[#D4A017]/5 hover:bg-[#D4A017]/10 transition-colors"
                >
                    <Upload size={16} />
                    Choose File
                </button>
            )}
            <p className="text-[10px] text-gray-400 mt-1">Images or PDF, max 5 MB</p>
        </div>
    );
}

/**
 * DocCard — displays a summary of a single uploaded identity document.
 * Shows the document label, ID number (or "Not provided"), and links to
 * open the front and back image/PDF copies in a new tab.
 *
 * @param {object} props
 * @param {string} props.label - Document type label (e.g. "Aadhaar", "PAN").
 * @param {string|null|undefined} props.number - The ID number on the document.
 * @param {string|null|undefined} props.frontUrl - URL of the front-side copy.
 * @param {string|null|undefined} props.backUrl - URL of the back-side copy.
 * @returns {React.ReactElement}
 */
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
