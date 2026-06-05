// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { DATE_INPUT_MAX, DATE_INPUT_MIN, isValidIsoDateInRange } from "../../../shared/dateInput";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";
import { User, Phone, Mail, MapPin, Briefcase, Bed, Calendar, IndianRupee, ShieldCheck, CheckCircle, Copy, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

const FIELD_CLS = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30 focus:border-[#D4A017] transition-colors";
const LABEL_CLS = "block text-xs font-medium text-gray-500 mb-1.5";
const SELECT_CLS = `${FIELD_CLS} cursor-pointer`;

function SectionCard({ icon: Icon, title, children }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <span className="p-1.5 rounded-lg bg-[#D4A017]/10"><Icon size={15} className="text-[#D4A017]" /></span>
                <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function FieldRow({ children }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }) {
    return (
        <div>
            <label className={LABEL_CLS}>{label}</label>
            {children}
        </div>
    );
}

function getSubmitErrorMessage(err) {
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (typeof data === "string") {
        if (status === 401 || status === 403) {
            return "Your session expired. Please log in again and retry.";
        }
        return "Unable to submit the form right now. Please try again.";
    }

    const apiMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
        (Array.isArray(data?.errors) ? data.errors[0] : null);

    if (apiMessage) return apiMessage;

    if (status === 401 || status === 403) {
        return "Your session expired. Please log in again and retry.";
    }

    if (status === 404) {
        return "Service is temporarily unavailable. Please try again shortly.";
    }

    if (status >= 500) {
        return "Server is busy right now. Please try again in a moment.";
    }

    if (status >= 400) {
        return "Unable to submit the form right now. Please verify details and try again.";
    }

    if (err?.code === "ERR_NETWORK") {
        return "Unable to reach server. Please check your connection and backend server.";
    }

    return "There was an error submitting the form.";
}

export default function residentForm() {
    const { getOptions, getStaffNamesList } = useDropdowns();
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id || id === "new";

    const [beds, setBeds] = useState([]);
    const [form, setForm] = useState({
        bedId: isNew ? "" : id,
        propertyManager: "",
        salesManager: "",
        comfortClass: "",
        mealType: "",
        residentsName: "",
        phoneNumber: "",
        email: "",
        permanentAddress: "",
        kycType: "",
        aadharNumber: "",
        aadharStatus: "",
        panNumber: "",
        panStatus: "",
        checkIn: "",
        checkOut: "",
        totalDepositPaid: "0",
        rentPerMonth: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [credentials, setCredentials] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Fetch available beds when opened from sidebar (bedId = new)
    useEffect(() => {
        if (isNew) {
            axios.get("/sales/get-beds-data/", { withCredentials: true })
                .then((res) => {
                    if (res.data.success) {
                        const vacant = res.data.beds_table.filter(
                            (b) => b.salesStatus === "Vacant" || b.salesStatus === "Pending"
                        );
                        setBeds(vacant);
                    }
                })
                .catch(console.error);
        }
    }, [isNew]);

    const getCSRFToken = () => Cookies.get('csrftoken');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            let nextValue = value;

            if (name === "phoneNumber") {
                nextValue = formatIndianPhone(value);
            }

            if (name === "aadharNumber") {
                nextValue = value.replace(/\D/g, "").slice(0, 12);
            }

            if (name === "panNumber") {
                nextValue = value.toUpperCase().replace(/\s/g, "").slice(0, 10);
            }

            const next = { ...prev, [name]: nextValue };

            if (name === "kycType") {
                next.kycType = value;
                next.aadharNumber = "";
                next.aadharStatus = "";
                next.panNumber = "";
                next.panStatus = "";
            }

            if (name === "checkIn" && next.checkOut && nextValue > next.checkOut) {
                next.checkOut = "";
            }

            return next;
        });
    };

    const validateForm = () => {
        if (!form.bedId) return "Please select a bed.";
        if (!form.residentsName?.trim()) return "Resident name is required.";
        if (!/^[A-Za-z ]{2,}$/.test(form.residentsName.trim())) return "Resident name must contain only letters and spaces.";

        if (!isValidIndianPhone(form.phoneNumber)) return "Phone number must be exactly 10 digits.";

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
        if (!form.propertyManager) return "Property manager is required.";
        if (!form.salesManager) return "Sales manager is required.";
        if (!form.comfortClass) return "Comfort class is required.";
        if (!form.mealType) return "Meal plan is required.";
        if (!form.checkIn) return "Check-in date is required.";

        if (!isValidIsoDateInRange(form.checkIn, DATE_INPUT_MIN, DATE_INPUT_MAX)) {
            return "Check-in date must be between 1900-01-01 and 2099-12-31.";
        }

        if (form.checkOut && !isValidIsoDateInRange(form.checkOut, DATE_INPUT_MIN, DATE_INPUT_MAX)) {
            return "Check-out date must be between 1900-01-01 and 2099-12-31.";
        }

        if (form.checkOut && form.checkOut < form.checkIn) return "Check-out date cannot be before check-in date.";

        const rentValue = Number(form.rentPerMonth);
        if (!form.rentPerMonth || Number.isNaN(rentValue) || rentValue <= 0) return "Rent per month must be greater than 0.";

        const depositRaw = String(form.totalDepositPaid || "").trim();
        if (depositRaw) {
            const depositValue = Number(depositRaw);
            if (Number.isNaN(depositValue) || depositValue < 0) return "Total deposit paid cannot be negative.";
        }

        if (form.kycType === "Aadhar") {
            if (!/^\d{12}$/.test(form.aadharNumber || "")) return "Aadhaar number must be 12 digits.";
            if (!form.aadharStatus) return "Aadhaar verification status is required.";
        }

        if (form.kycType === "PAN") {
            if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(form.panNumber || "")) return "PAN must follow format: ABCDE1234F.";
            if (!form.panStatus) return "PAN verification status is required.";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setSubmitting(true);
        try {
            axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();
            const payload = {
                ...form,
                phoneNumber: normalizePhoneDigits(form.phoneNumber),
                totalDepositPaid: String(form.totalDepositPaid || "").trim() || "0",
            };

            const res = await axios.post('/sales/resident-form-submit/', payload, { withCredentials: true, skipGlobalErrorToast: true });
            if (res.data.success) {
                setCredentials(res.data.residentCredentials);
            } else {
                toast.error(res.data.message || "Submission failed.");
            }
        } catch (err) {
            const errMsg = getSubmitErrorMessage(err);
            toast.error(errMsg);
            console.error(err);
        }
        setSubmitting(false);
    };

    const copyToClipboard = (text) => navigator.clipboard.writeText(text);

    // ── Success screen ─────────────────────────────────────────────
    if (credentials) {
        return (
            <DashPage>
                <div className="pt-20 px-6 md:px-10 pb-10 flex items-start justify-center">
                        <div className="w-full max-w-lg mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} className="text-green-500" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">Resident Registered!</h2>
                                <p className="text-sm text-gray-500 mb-8">Share these credentials with the resident for portal access.</p>
                                <div className="space-y-3 text-left mb-8">
                                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">Phone / Username</p>
                                            <p className="text-sm font-semibold text-gray-900 font-mono">{credentials.username}</p>
                                        </div>
                                        <button onClick={() => copyToClipboard(credentials.username)} className="text-gray-400 hover:text-[#D4A017] transition-colors">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-0.5">Password</p>
                                            <p className="text-sm font-semibold text-gray-900 font-mono tracking-wider">
                                                {showPassword ? credentials.password : "••••••••••"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button onClick={() => copyToClipboard(credentials.password)} className="text-gray-400 hover:text-[#D4A017] transition-colors">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => navigate("/sales/sales-beds-table")}>
                                        Back to Beds
                                    </button>
                                    <button className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-[#D4A017] text-white hover:bg-[#B8860B] transition-colors" onClick={() => { setCredentials(null); setForm({ bedId: isNew ? "" : id, propertyManager: "", salesManager: "", comfortClass: "", mealType: "", residentsName: "", phoneNumber: "", email: "", permanentAddress: "", kycType: "", aadharNumber: "", aadharStatus: "", panNumber: "", panStatus: "", checkIn: "", checkOut: "", totalDepositPaid: "0", rentPerMonth: "" }); }}>
                                        Add Another
                                    </button>
                                </div>
                            </div>
                        </div>
                </div>
            </DashPage>
        );
    }

    // ── Form ───────────────────────────────────────────────────────
    return (
        <DashPage>
            <div className="max-w-3xl mx-auto">

                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Add Resident</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Register a new resident and generate portal credentials</p>
                        </div>
                        <button type="button" className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-white transition-colors" onClick={() => navigate("/sales/sales-beds-table")}>
                            ← Back
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Bed Selection */}
                        <SectionCard icon={Bed} title="Bed Assignment">
                            {isNew ? (
                                <Field label="Select Available Bed *">
                                    <select name="bedId" value={form.bedId} onChange={handleChange} className={SELECT_CLS} required>
                                        <option value="">Choose a bed...</option>
                                        {beds.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.propertyName} — Room {b.roomNo} — {b.bedLabel} ({b.salesStatus})
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            ) : (
                                <p className="text-sm text-gray-600">Bed ID: <span className="font-semibold text-gray-900">#{id}</span></p>
                            )}
                        </SectionCard>

                        {/* Resident Details */}
                        <SectionCard icon={User} title="Resident Details">
                            <div className="space-y-4">
                                <FieldRow>
                                    <Field label="Full Name *">
                                        <input name="residentsName" value={form.residentsName} onChange={handleChange} className={FIELD_CLS} placeholder="Enter resident's full name" required />
                                    </Field>
                                    <Field label="Phone Number *">
                                        <input
                                            name="phoneNumber"
                                            value={form.phoneNumber}
                                            onChange={handleChange}
                                            className={FIELD_CLS}
                                            placeholder="98765 43210"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={11}
                                            required
                                        />
                                    </Field>
                                </FieldRow>
                                <FieldRow>
                                    <Field label="Email Address">
                                        <input name="email" value={form.email} onChange={handleChange} className={FIELD_CLS} placeholder="email@example.com" type="email" />
                                    </Field>
                                    <Field label="Permanent Address">
                                        <input name="permanentAddress" value={form.permanentAddress} onChange={handleChange} className={FIELD_CLS} placeholder="City, State" />
                                    </Field>
                                </FieldRow>
                            </div>
                        </SectionCard>

                        {/* Tenancy Details */}
                        <SectionCard icon={Calendar} title="Tenancy Details">
                            <div className="space-y-4">
                                <FieldRow>
                                    <Field label="Comfort Class *">
                                        <select name="comfortClass" value={form.comfortClass} onChange={handleChange} className={SELECT_CLS} required>
                                            <option value="">Select comfort class</option>
                                            {getOptions('comfort_classes').map((c, i) => (
                                                <option key={i} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Meal Plan *">
                                        <select name="mealType" value={form.mealType} onChange={handleChange} className={SELECT_CLS} required>
                                            <option value="">Select meal plan</option>
                                            {getOptions('meal_types').map((m, i) => (
                                                <option key={i} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </FieldRow>
                                <FieldRow>
                                    <Field label="Check-In Date *">
                                        <input name="checkIn" value={form.checkIn} onChange={handleChange} className={FIELD_CLS} type="date" min={DATE_INPUT_MIN} max={DATE_INPUT_MAX} required />
                                    </Field>
                                    <Field label="Check-Out Date">
                                        <input name="checkOut" value={form.checkOut} onChange={handleChange} className={FIELD_CLS} type="date" min={form.checkIn || DATE_INPUT_MIN} max={DATE_INPUT_MAX} />
                                    </Field>
                                </FieldRow>
                                <FieldRow>
                                    <Field label="Rent per Month (₹) *">
                                        <input name="rentPerMonth" value={form.rentPerMonth} onChange={handleChange} className={FIELD_CLS} placeholder="e.g. 8000" type="number" min="0" required />
                                    </Field>
                                    <Field label="Total Deposit Paid (₹)">
                                        <input name="totalDepositPaid" value={form.totalDepositPaid} onChange={handleChange} className={FIELD_CLS} placeholder="e.g. 16000" type="number" min="0" />
                                    </Field>
                                </FieldRow>
                            </div>
                        </SectionCard>

                        {/* Management */}
                        <SectionCard icon={Briefcase} title="Management">
                            <FieldRow>
                                <Field label="Property Manager *">
                                    <select name="propertyManager" value={form.propertyManager} onChange={handleChange} className={SELECT_CLS} required>
                                        <option value="">Select manager</option>
                                        {getStaffNamesList().map((name, i) => (
                                            <option key={i} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Sales Manager *">
                                    <select name="salesManager" value={form.salesManager} onChange={handleChange} className={SELECT_CLS} required>
                                        <option value="">Select manager</option>
                                        {getStaffNamesList().map((name, i) => (
                                            <option key={i} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </Field>
                            </FieldRow>
                        </SectionCard>

                        {/* KYC Documents (optional) */}
                        <SectionCard icon={ShieldCheck} title="KYC Documents (Optional)">
                            <div className="space-y-4">
                                <Field label="KYC Document Type">
                                    <select name="kycType" value={form.kycType} onChange={handleChange} className={SELECT_CLS}>
                                        <option value="">Select document type</option>
                                        {getOptions('kyc_types').map((k, i) => (
                                            <option key={i} value={k}>{k}</option>
                                        ))}
                                    </select>
                                </Field>

                                {form.kycType === "Aadhar" && (
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Aadhaar Details</p>
                                        <FieldRow>
                                            <Field label="Aadhaar Number">
                                                <input name="aadharNumber" value={form.aadharNumber} onChange={handleChange} className={FIELD_CLS} placeholder="123412341234" inputMode="numeric" maxLength={12} />
                                            </Field>
                                            <Field label="Verification Status">
                                                <select name="aadharStatus" value={form.aadharStatus} onChange={handleChange} className={SELECT_CLS} required={form.kycType === "Aadhar"}>
                                                    <option value="">Select status</option>
                                                    {getOptions('verification_statuses').map((v, i) => (
                                                        <option key={i} value={v}>{v}</option>
                                                    ))}
                                                </select>
                                            </Field>
                                        </FieldRow>
                                        <p className="text-xs text-gray-400">Resident can upload document copies directly from their portal.</p>
                                    </div>
                                )}

                                {form.kycType === "PAN" && (
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">PAN Details</p>
                                        <FieldRow>
                                            <Field label="PAN Number">
                                                <input name="panNumber" value={form.panNumber} onChange={handleChange} className={FIELD_CLS} placeholder="ABCDE1234F" maxLength={10} />
                                            </Field>
                                            <Field label="Verification Status">
                                                <select name="panStatus" value={form.panStatus} onChange={handleChange} className={SELECT_CLS} required={form.kycType === "PAN"}>
                                                    <option value="">Select status</option>
                                                    {getOptions('verification_statuses').map((v, i) => (
                                                        <option key={i} value={v}>{v}</option>
                                                    ))}
                                                </select>
                                            </Field>
                                        </FieldRow>
                                        <p className="text-xs text-gray-400">Resident can upload document copies directly from their portal.</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Submit */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" className="px-6 py-2.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-white transition-colors" onClick={() => navigate("/sales/sales-beds-table")}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting} className="px-8 py-2.5 text-sm font-semibold rounded-lg bg-[#D4A017] text-white hover:bg-[#B8860B] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm shadow-[#D4A017]/20">
                                {submitting ? "Registering..." : "Register Resident"}
                            </button>
                        </div>
                    </form>
            </div>
        </DashPage>
    );
}

