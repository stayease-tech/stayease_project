// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import residentApi from "../residentApi";
import { toast } from "react-toastify";
import { formatIndianPhone } from "../../shared/phone";
import { DashPage } from "../../shared/Dashboard";
import { Lock, Eye, EyeOff, FileText, Download } from "lucide-react";

function Field({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 truncate">{value || "—"}</p>
        </div>
    );
}

function StatusBadge({ value }) {
    const colors = {
        Approved: "bg-green-50 text-green-700 border-green-200",
        Pending:  "bg-amber-50 text-amber-700 border-amber-200",
        Rejected: "bg-red-50 text-red-700 border-red-200",
        Active:   "bg-green-50 text-green-700 border-green-200",
        Inactive: "bg-gray-100 text-gray-600 border-gray-200",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[value] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {value || "—"}
        </span>
    );
}

export default function ResidentProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lease, setLease] = useState(undefined);

    const [pwForm, setPwForm] = useState({ newPassword: "", confirmPassword: "" });
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    useEffect(() => {
        residentApi.get("/profile/")
            .then((res) => { if (res.data.success) setProfile(res.data); })
            .catch(console.error)
            .finally(() => setLoading(false));

        residentApi.get("/lease/")
            .then((res) => { setLease(res.data.success ? (res.data.leaseAgreement || null) : null); })
            .catch(() => setLease(null));
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (pwForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }
        setSavingPw(true);
        try {
            const res = await residentApi.post("/change-password/", {
                newPassword: pwForm.newPassword,
            }, { skipGlobalErrorToast: true });
            if (res.data.success) {
                toast.success("Password changed successfully.");
                setPwForm({ newPassword: "", confirmPassword: "" });
            } else {
                toast.error(res.data.message || "Failed to change password.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password.");
        }
        setSavingPw(false);
    };

    const initials = (() => {
        const name = profile?.residentsName || "";
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return "R";
    })();

    return (
        <DashPage>
            <div className="page-header">
                <div><h1>My Profile</h1><p>Account details and settings</p></div>
            </div>

            {loading ? (
                <div className="loading-center"><div className="spinner"></div></div>
            ) : (
                <div className="space-y-4">

                    {/* Avatar + name */}
                    <div className="card">
                        <div className="card-body flex items-center gap-4 py-3">
                            <div className="w-12 h-12 rounded-full bg-[#D4A017] text-black flex items-center justify-center text-lg font-bold flex-shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-semibold text-gray-900">{profile?.residentsName || "—"}</p>
                                <p className="text-sm text-gray-500">{formatIndianPhone(profile?.phoneNumber) || "—"}</p>
                            </div>
                            <StatusBadge value={profile?.residentStatus} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Personal Information */}
                        <div className="card">
                            <div className="card-header"><h3>Personal Information</h3></div>
                            <div className="card-body grid grid-cols-2 gap-x-6 gap-y-3">
                                <Field label="Full Name"         value={profile?.residentsName} />
                                <Field label="Phone"             value={formatIndianPhone(profile?.phoneNumber)} />
                                <Field label="Email"             value={profile?.email} />
                                <Field label="Permanent Address" value={profile?.permanentAddress} />
                            </div>
                        </div>

                        {/* Stay Details */}
                        <div className="card">
                            <div className="card-header"><h3>Stay Details</h3></div>
                            <div className="card-body grid grid-cols-2 gap-x-6 gap-y-3">
                                <Field label="Property"    value={profile?.propertyName} />
                                <Field label="Room / Bed"  value={profile?.roomNo && profile?.bedLabel ? `Room ${profile.roomNo} — ${profile.bedLabel}` : profile?.roomNo || profile?.bedLabel} />
                                <Field label="Check-in"    value={profile?.checkIn} />
                                <Field label="Check-out"   value={profile?.checkOut} />
                                <Field label="Rent / Month" value={profile?.rentPerMonth ? `₹${profile.rentPerMonth}` : null} />
                                <Field label="Deposit Paid" value={profile?.totalDepositPaid ? `₹${profile.totalDepositPaid}` : null} />
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-400 mb-0.5">KYC Status</p>
                                    <StatusBadge value={profile?.kycApprovalStatus} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lease Agreement */}
                    {lease !== undefined && (
                        <div className="card">
                            <div className="card-header"><h3>Lease Agreement</h3></div>
                            <div className="card-body">
                                {lease ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Signed Lease Agreement</p>
                                            {lease.uploadedAt && (
                                                <p className="text-xs text-gray-400 mt-0.5">Uploaded {lease.uploadedAt.split("T")[0]}</p>
                                            )}
                                        </div>
                                        {lease.pdfUrl && (
                                            <div className="flex items-center gap-2">
                                                <a href={lease.pdfUrl} target="_blank" rel="noreferrer"
                                                    className="btn btn-outline text-xs flex items-center gap-1.5">
                                                    <FileText size={13} /> View
                                                </a>
                                                <a href={lease.pdfUrl} download
                                                    className="btn btn-outline text-xs flex items-center gap-1.5">
                                                    <Download size={13} /> Download
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">Your lease agreement will appear here once it is ready.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Change Password */}
                    <div className="card">
                        <div className="card-header">
                            <div className="flex items-center gap-2">
                                <Lock size={15} className="text-gray-400" />
                                <h3>Change Password</h3>
                            </div>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? "text" : "password"}
                                            className="form-input pr-9"
                                            value={pwForm.newPassword}
                                            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                            required minLength={6} autoComplete="new-password"
                                        />
                                        <button type="button" onClick={() => setShowNew(!showNew)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            className="form-input pr-9"
                                            value={pwForm.confirmPassword}
                                            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                                            required minLength={6} autoComplete="new-password"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <button type="submit" disabled={savingPw} className="btn btn-primary w-full">
                                        {savingPw ? "Updating…" : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            )}
        </DashPage>
    );
}
