import { useState } from "react";
import tenantApi from "../tenantApi";
import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";
import { Lock } from "lucide-react";

export default function TenantChangePassword({ isExpanded, setIsExpanded }) {
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ text: "", type: "" });

        if (form.newPassword !== form.confirmPassword) {
            setMsg({ text: "New passwords do not match.", type: "error" });
            return;
        }

        setSubmitting(true);
        try {
            const res = await tenantApi.post("/change-password/", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            if (res.data.success) {
                setMsg({ text: "Password changed successfully!", type: "success" });
                setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setMsg({ text: res.data.message, type: "error" });
            }
        } catch (err) {
            setMsg({ text: err.response?.data?.message || "Failed to change password.", type: "error" });
        }
        setSubmitting(false);
    };

    return (
        <div className="bg-[#F5F5F0] min-h-screen">
            <TenantSidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />
            <Navbar isExpanded={isExpanded} />
            <div className={`pt-20 px-6 md:px-8 pb-8 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"}`}>
                <div className="page-header">
                    <div><h1>Change Password</h1><p>Update your login password</p></div>
                </div>

                {msg.text && (
                    <div className={`mb-4 p-3 rounded-lg text-sm border ${msg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                        {msg.text}
                    </div>
                )}

                <div className="card max-w-md">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Current Password</label>
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    className="form-input"
                                    value={form.currentPassword}
                                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">New Password</label>
                                <input
                                    type={showNew ? "text" : "password"}
                                    className="form-input"
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button className="btn btn-primary w-full" type="submit" disabled={submitting}>
                                {submitting ? "Changing..." : "Change Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
