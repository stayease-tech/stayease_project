// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function LeadDetails() {
    const { getOptionsWithCurrent } = useDropdowns();
    const navigate = useNavigate();
    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const location = useLocation();
    const leadData = location.state?.leadData;
    const { id } = useParams();

    const [leadDetails, setLeadDetails] = useState({
        leadDate: leadData?.leadDate || "",
        leadSource: leadData?.leadSource || "",
        name: leadData?.name || "",
        contact: formatIndianPhone(leadData?.contact || ""),
        email: leadData?.email || "",
        leadResult: leadData?.leadResult || "",
        notConvertedReason: leadData?.notConvertedReason || ""
    });

    const [originalData, setOriginalData] = useState(leadData || {});

    const editHandle = () => {
        setDataEditView(!dataEditView)
    };

    const leadHandleChange = (e) => {
        const { name, value } = e.target;

        setLeadDetails((prevState) => ({
            ...prevState,
            [name]: name === "contact" ? formatIndianPhone(value) : value,
        }));
    }

    const validateLeadData = () => {
        if (!leadDetails.leadDate) return "Lead date is required.";
        if (!leadDetails.leadSource) return "Lead source is required.";
        if (!leadDetails.name?.trim() || !/^[A-Za-z ]{2,}$/.test(leadDetails.name.trim())) return "Please enter a valid lead name.";
        if (!isValidIndianPhone(leadDetails.contact)) return "Contact number must be exactly 10 digits.";
        if (!leadDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadDetails.email)) return "Please enter a valid email address.";
        if (!leadDetails.leadResult) return "Lead status is required.";
        if (leadDetails.leadResult === "Not Converted" && !leadDetails.notConvertedReason) return "Please select reason for not converted.";
        return null;
    };

    const getChangedData = () => {
        const changedData = {};

        Object.keys(leadDetails).forEach(key => {
            const originalValue = originalData[key] || '';
            const currentValue = leadDetails[key] || '';

            if (currentValue !== originalValue) {
                changedData[key] = currentValue;
            }
        });

        return changedData;
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const handleLeadUpdate = async (e) => {
        e.preventDefault();
        const validationError = validateLeadData();
        if (validationError) {
            toast.error(validationError);
            return;
        }
        setIsSaving(true);

        const changedData = getChangedData();

        if (Object.keys(changedData).length === 0) {
            toast.info('No data is updated!');
            setIsSaving(false);
            return;
        }

        setIsSaving(true);

        try {
            if (changedData.contact) {
                changedData.contact = normalizePhoneDigits(changedData.contact);
            }

            const response = await axios.put(
                `/sales/leads-data-update/${id}/`,
                changedData,
                {
                    withCredentials: true,
                    skipGlobalErrorToast: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            setOriginalData(prev => ({ ...prev, ...changedData }));

            if (response.data.success) {
                toast.success(response.data.message);

                navigate(`/sales/sales-leads-table`);
            }
        } catch (err) {
            console.error('Error updating form:', err);
            toast.error('There was an error updating the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    const handleLeadDelete = async (e) => {
        e.preventDefault();
        setIsDeleting(true);

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`/sales/leads-data-delete/${id}/`, {
                withCredentials: true,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/sales/sales-leads-table');
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Error deleting form:', err);
            toast.error('There was an error deleting the form. Please try again!');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <DashPage>
            <form className="max-w-3xl mx-auto py-6" onSubmit={handleLeadUpdate}>
                <h1 className="text-center text-xl font-semibold mb-6 text-[#D4A017]">LEADS DATA</h1>

                <div className="flex justify-between mb-4">
                    <button
                        className="px-4 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                        onClick={() => navigate(`/sales/sales-leads-table`)}
                        type="button"
                    >
                        Prev
                    </button>

                    <div className="flex gap-2">
                        <button
                            className="px-4 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                            onClick={() => editHandle()}
                            type="button"
                        >
                            {!dataEditView ? 'Update Status' : 'View Details'}
                        </button>

                        <button
                            className="px-4 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] disabled:opacity-50"
                            disabled={isSaving || isDeleting}
                            type={dataEditView ? "submit" : "button"}
                            onClick={!dataEditView ? handleLeadDelete : null}
                        >
                            {dataEditView ? (isSaving ? "Saving..." : "Save Details") : (isDeleting ? "Deleting..." : "Delete")}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <div className="grid grid-cols-2 gap-3">

                        {/* Lead Date */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Lead Date</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{leadDetails?.leadDate}</p>
                            ) : (
                                <input
                                    type="date"
                                    value={leadDetails.leadDate}
                                    onChange={leadHandleChange}
                                    className="form-input w-full text-xs"
                                    name="leadDate"
                                />
                            )}
                        </div>

                        {/* Lead Source */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Lead Source</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{leadDetails?.leadSource}</p>
                            ) : (
                                <select
                                    id="leadSource"
                                    value={leadDetails.leadSource}
                                    onChange={leadHandleChange}
                                    className="form-input w-full text-xs"
                                    name="leadSource"
                                    required
                                >
                                    <option value="" disabled>Select Lead Source</option>
                                    {getOptionsWithCurrent('lead_sources', leadDetails.leadSource).map((src, i) => (
                                        <option key={i} value={src}>{src}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Name</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{leadDetails?.name}</p>
                            ) : (
                                <input
                                    type="text"
                                    value={leadDetails.name}
                                    onChange={leadHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="Enter name"
                                    name="name"
                                    required
                                />
                            )}
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Contact</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{formatIndianPhone(leadDetails?.contact)}</p>
                            ) : (
                                <input
                                    type="text"
                                    value={leadDetails.contact}
                                    onChange={leadHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="98765 43210"
                                    inputMode="numeric"
                                    maxLength={11}
                                    name="contact"
                                    required
                                />
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Email</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{leadDetails?.email}</p>
                            ) : (
                                <input
                                    type="email"
                                    value={leadDetails.email}
                                    onChange={leadHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="Enter email"
                                    name="email"
                                    required
                                />
                            )}
                        </div>

                        {/* Lead Status */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Lead Status</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{leadDetails?.leadResult}</p>
                            ) : (
                                <select
                                    id="leadResult"
                                    value={leadDetails.leadResult}
                                    onChange={leadHandleChange}
                                    className="form-input w-full text-xs"
                                    name="leadResult"
                                    required
                                >
                                    <option value="" disabled>Select Lead Status</option>
                                    {getOptionsWithCurrent('lead_statuses', leadDetails.leadResult).map((s, i) => (
                                        <option key={i} value={s}>{s}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Reason for Not Converted */}
                        {leadDetails.leadResult === "Not Converted" && (
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Reason for Not Converted</label>
                                {!dataEditView ? (
                                    <p className="text-xs text-gray-800">{leadDetails?.notConvertedReason}</p>
                                ) : (
                                    <select
                                        id="notConvertedReason"
                                        value={leadDetails.notConvertedReason}
                                        onChange={leadHandleChange}
                                        className="form-input w-full text-xs"
                                        name="notConvertedReason"
                                        required
                                    >
                                        <option value="" disabled>Select reason</option>
                                        {getOptionsWithCurrent('not_converted_reasons', leadDetails.notConvertedReason).map((r, i) => (
                                            <option key={i} value={r}>{r}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </form>
        </DashPage>
    );
}

export default LeadDetails;
