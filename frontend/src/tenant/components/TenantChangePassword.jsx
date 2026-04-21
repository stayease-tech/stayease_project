import { useState } from "react";
import tenantApi from "../tenantApi";
import Navbar from "../../shared/Navbar";
import TenantSidebar from "./Sidebar";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";

export default function TenantChangePassword({ isExpanded, setIsExpanded }) {
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [submitting, setSubmitting] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await tenantApi.post("/change-password/", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            }, { skipGlobalErrorToast: true });
            if (res.data.success) {
                toast.success("Password changed successfully!");
                setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(res.data.message || "Failed to change password.");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password.");
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
