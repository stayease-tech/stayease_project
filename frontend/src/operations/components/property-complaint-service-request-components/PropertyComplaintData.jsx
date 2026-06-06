// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft, Save, Star } from "lucide-react";
import { DashPage } from "../../../shared/Dashboard";

const COMPLAINT_STATUSES = ["Open", "Follow Up", "Closed"];

function InfoRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
        </div>
    );
}

function StarRating({ value }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={13}
                    className={i <= parseInt(value || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
            ))}
        </div>
    );
}

export default function PropertyComplaintData() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const raw = state?.data;

    const [vendorData, setVendorData] = useState([]);
    const [form, setForm] = useState({
        status:    raw?.status      || "Open",
        vendor:    raw?.vendor      || "",
        date:      raw?.date        || "",
        fromTime:  raw?.fromTime    || "",
        toTime:    raw?.toTime      || "",
        comments:  raw?.comments    || "",
    });
    const [original] = useState({ ...form });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "" });
    const statusChanged = form.status !== original.status;

    useEffect(() => {
        axios.defaults.headers.common["X-CSRFToken"] = Cookies.get("csrftoken");
        axios.get("/accounts/get-vendor-data/")
            .then((res) => setVendorData(res.data.vendor_table || []))
            .catch(console.error);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            // Clear comments when status changes so operator writes a fresh note
            ...(name === "status" ? { comments: "" } : {}),
        }));
        setMsg({ text: "", type: "" });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (statusChanged && !form.comments.trim()) {
            setMsg({ text: "A comment is required when changing the status.", type: "error" });
            return;
        }
        const changed = {};
        Object.keys(form).forEach((k) => {
            if ((form[k] || "") !== (original[k] || "")) changed[k] = form[k];
        });
        if (Object.keys(changed).length === 0) {
            setMsg({ text: "No changes to save.", type: "error" });
            return;
        }
        setSaving(true);
        if (changed.vendor) {
            const v = vendorData.find((vd) => vd.vendor === changed.vendor);
            if (v) changed.vendorId = v.id;
        }
        try {
            const res = await axios.put(`/operations/complaint-update/${id}/`, changed, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });
            if (res.data.success) {
                setMsg({ text: res.data.message || "Saved successfully.", type: "success" });
                setTimeout(() => navigate("/operations/operations-propertycomplaint-table"), 1000);
            } else {
                setMsg({ text: "Failed to save.", type: "error" });
            }
        } catch {
            setMsg({ text: "Error saving. Please try again.", type: "error" });
        }
        setSaving(false);
    };

    if (!raw) {
        navigate("/operations/operations-propertycomplaint-table", { replace: true });
        return null;
    }

    return (
        <DashPage>
            <div className="page-header">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/operations/operations-propertycomplaint-table")}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="text-gray-600" />
                    </button>
                    <div>
                        <h1>{raw.residentsName}</h1>
                        <p className="font-mono text-xs text-gray-400">{raw.ticket_number}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    form.status === "Closed"      ? "bg-green-50 text-green-700 border-green-200" :
                    form.status === "Follow Up"   ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                    "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                    {form.status}
                </span>
            </div>

            {msg.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm border ${
                    msg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                }`}>
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Complaint info (read-only) */}
                <div className="space-y-4">
                    <div className="card">
                        <div className="card-header"><h3>Complaint Details</h3></div>
                        <div className="card-body grid grid-cols-2 gap-3">
                            <InfoRow label="Room"     value={raw.roomNo} />
                            <InfoRow label="Phone"    value={raw.phoneNumber} />
                            <InfoRow label="Category" value={raw.category_type} />
                            <InfoRow label="Time"     value={raw.preferredTime} />
                            {raw.resident_urgency && <InfoRow label="Urgency"  value={raw.resident_urgency} />}
                            {raw.resident_location && <InfoRow label="Location" value={raw.resident_location} />}
                        </div>
                        {raw.issue_desc && (
                            <div className="px-4 pb-4">
                                <p className="text-xs text-gray-400 mb-1">Issue Description</p>
                                <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-2.5">{raw.issue_desc}</p>
                            </div>
                        )}
                    </div>

                    {/* Resident feedback (if any) */}
                    {raw.has_feedback && (
                        <div className="card">
                            <div className="card-header"><h3>Resident Feedback</h3></div>
                            <div className="card-body grid grid-cols-2 gap-3">
                                <InfoRow label="Issue Resolved" value={raw.feedback?.issueResolved} />
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Rating</p>
                                    <StarRating value={raw.feedback?.ratings} />
                                </div>
                                {raw.feedback?.suggestions && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-400 mb-0.5">Suggestions</p>
                                        <p className="text-sm text-gray-700 italic">"{raw.feedback.suggestions}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Editable fields */}
                <div className="card">
                    <div className="card-header"><h3>Update Complaint</h3></div>
                    <div className="card-body space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Status */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                <select name="status" value={form.status} onChange={handleChange} className="form-input">
                                    {COMPLAINT_STATUSES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Vendor */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Assign Vendor</label>
                                <select name="vendor" value={form.vendor} onChange={handleChange} className="form-input">
                                    <option value="">No vendor assigned</option>
                                    {vendorData.map((v) => (
                                        <option key={v.id} value={v.vendor}>{v.vendor}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Deadline</label>
                                <input type="date" name="date" value={form.date} onChange={handleChange} className="form-input" />
                            </div>

                            {/* From / To Time */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                                    <input type="time" name="fromTime" value={form.fromTime} onChange={handleChange} className="form-input" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                                    <input type="time" name="toTime" value={form.toTime} onChange={handleChange} className="form-input" />
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Comments {statusChanged && <span className="text-red-500">*</span>}
                                {statusChanged && <span className="ml-1 text-xs text-red-500 font-normal">(required when changing status)</span>}
                            </label>
                            <textarea name="comments" value={form.comments} onChange={handleChange}
                                className={`form-input ${statusChanged && !form.comments.trim() ? "border-red-400" : ""}`}
                                rows={3} placeholder={statusChanged ? "Explain the status change…" : "Add internal comments..."} />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
                                <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </DashPage>
    );
}
