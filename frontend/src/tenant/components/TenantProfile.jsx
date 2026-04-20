import { useState, useEffect } from "react";
import tenantApi from "../tenantApi";
import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";

export default function TenantProfile({ isExpanded, setIsExpanded }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        tenantApi.get("/profile/")
            .then((res) => {
                if (res.data.success) {
                    setProfile(res.data);
                    setForm({ residentsName: res.data.residentsName, email: res.data.email, permanentAddress: res.data.permanentAddress });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMsg("");
        try {
            const res = await tenantApi.put("/profile/update/", form);
            if (res.data.success) {
                setProfile((p) => ({ ...p, ...form }));
                setEditing(false);
                setMsg("Profile updated successfully.");
            }
        } catch {
            setMsg("Failed to update profile.");
        }
        setSaving(false);
    };

    const Field = ({ label, value }) => (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
        </div>
    );

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <TenantSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>My Profile</h1><p>View and update your personal details</p></div>
                    {!editing && !loading && (
                        <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                    )}
                </div>

                {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{msg}</div>}

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
                                        <Field label="Phone" value={profile?.phoneNumber} />
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
                                <Field label="Tenant Status" value={profile?.tenantStatus} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
