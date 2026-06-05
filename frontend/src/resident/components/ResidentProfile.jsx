// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import residentApi from "../residentApi";
import { toast } from "react-toastify";
import { formatIndianPhone } from "../../shared/phone";
import { DashPage } from "../../shared/Dashboard";

/**
 * ResidentProfile — displays and allows editing of the resident's personal details and stay information.
 * Fetches profile data on mount and renders a read-only view with an inline edit form
 * for name, email, and permanent address.
 *
 * @param {object} props
 * @param {boolean} props.isExpanded - Whether the sidebar is in expanded state.
 * @param {Function} props.setIsExpanded - Setter to toggle sidebar expanded state.
 * @returns {React.ReactElement}
 */
export default function ResidentProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        residentApi.get("/profile/")
            .then((res) => {
                if (res.data.success) {
                    setProfile(res.data);
                    setForm({ residentsName: res.data.residentsName, email: res.data.email, permanentAddress: res.data.permanentAddress });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    /**
     * Persists edited profile fields (name, email, permanent address) to the API.
     * Merges the updated values into local profile state and closes edit mode on success.
     */
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await residentApi.put("/profile/update/", form, { skipGlobalErrorToast: true });
            if (res.data.success) {
                setProfile((p) => ({ ...p, ...form }));
                setEditing(false);
                toast.success("Profile updated successfully.");
            } else {
                toast.error(res.data.message || "Failed to update profile.");
            }
        } catch {
            toast.error("Failed to update profile.");
        }
        setSaving(false);
    };

    /**
     * Field — renders a single read-only label/value row with a bottom border.
     *
     * @param {object} props
     * @param {string} props.label - Display label for the field.
     * @param {string|null|undefined} props.value - Value to display; falls back to "—" when falsy.
     * @returns {React.ReactElement}
     */
    const Field = ({ label, value }) => (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
        </div>
    );

    return (
        <DashPage>
                <div className="page-header">
                    <div><h1>My Profile</h1><p>View and update your personal details</p></div>
                    {!editing && !loading && (
                        <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-center"><div className="spinner"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card">
                            <div className="card-header"><h3>Personal Information</h3></div>
                            <div className="card-body">
                                {editing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Name</label>
                                            <input className="form-input" value={form.residentsName} onChange={(e) => setForm({ ...form, residentsName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Email</label>
                                            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Permanent Address</label>
                                            <textarea className="form-input" rows={3} value={form.permanentAddress} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} />
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                                {saving ? "Saving..." : "Save Changes"}
                                            </button>
                                            <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Field label="Name" value={profile?.residentsName} />
                                        <Field label="Phone" value={formatIndianPhone(profile?.phoneNumber) || "—"} />
                                        <Field label="Email" value={profile?.email} />
                                        <Field label="Address" value={profile?.permanentAddress} />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header"><h3>Stay Details</h3></div>
                            <div className="card-body">
                                <Field label="Property" value={profile?.propertyName} />
                                <Field label="Address" value={profile?.propertyAddress} />
                                <Field label="Room" value={profile?.roomNo} />
                                <Field label="Bed" value={profile?.bedLabel} />
                                <Field label="Check-in" value={profile?.checkIn} />
                                <Field label="Check-out" value={profile?.checkOut} />
                                <Field label="Rent/month" value={profile?.rentPerMonth ? `₹${profile.rentPerMonth}` : null} />
                                <Field label="Deposit Paid" value={profile?.totalDepositPaid ? `₹${profile.totalDepositPaid}` : null} />
                                <Field label="Comfort Class" value={profile?.comfortClass} />
                                <Field label="Meal Type" value={profile?.mealType} />
                                <Field label="KYC Status" value={profile?.kycApprovalStatus} />
                                <Field label="Resident Status" value={profile?.residentStatus} />
                            </div>
                        </div>
                    </div>
                )}
        </DashPage>
    );
}
