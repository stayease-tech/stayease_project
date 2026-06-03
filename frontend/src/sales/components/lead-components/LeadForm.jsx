import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";
import { useDropdowns } from "../../../shared/DropdownContext";

function LeadForm({ isExpanded, setIsExpanded }) {
    const { getOptions } = useDropdowns();
    const navigate = useNavigate();

    const [leadData, setLeadData] = useState({
        leadDate: "",
        leadSource: "",
        name: "",
        contact: "",
        email: "",
        leadResult: "",
        notConvertedReason: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLeadData(prev => ({
            ...prev,
            notConvertedReason: ""
        }))
    }, [leadData.leadResult])

    const leadHandleChange = (e) => {
        const { name, value } = e.target;

        setLeadData((prevState) => ({
            ...prevState,
            [name]: name === "contact" ? formatIndianPhone(value) : value,
        }));
    }

    const validateLeadForm = () => {
        if (!leadData.leadDate) return "Lead date is required.";
        if (!leadData.leadSource) return "Lead source is required.";
        if (!leadData.name?.trim()) return "Lead name is required.";
        if (!/^[A-Za-z ]{2,}$/.test(leadData.name.trim())) return "Lead name must contain only letters and spaces.";
        if (!isValidIndianPhone(leadData.contact)) return "Contact number must be exactly 10 digits.";
        if (!leadData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) return "Please enter a valid email address.";
        if (!leadData.leadResult) return "Lead status is required.";
        if (leadData.leadResult === "Not Converted" && !leadData.notConvertedReason) return "Please select reason for not converted.";
        return null;
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const leadHandleSubmit = async (e) => {
        e.preventDefault();

        const error = validateLeadForm();
        if (error) {
            toast.error(error);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ...leadData,
                contact: normalizePhoneDigits(leadData.contact),
            };

            const response = await axios.post('/sales/leads-form-submit/', payload, {
                withCredentials: true,
                skipGlobalErrorToast: true,
            });

            alert(response.data.message);

            if (response.data.success) {
                setLeadData({
                    leadDate: "",
                    leadSource: "",
                    name: "",
                    contact: "",
                    email: "",
                    leadResult: "",
                    notConvertedReason: ""
                });

                navigate('/sales/sales-leads-table');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 max-lg:bg-white min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 lg:pb-[1rem]`}>
                    <form className="max-w-3xl mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800"
                        onSubmit={leadHandleSubmit} method='POST'>

                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-stone-400">ADD LEAD DATA</h1>

                        <label htmlFor="leadDate" className="text-[#D4A017] max-sm:text-sm"><strong>Lead Date: <span className="text-red-500">*</span></strong></label>
                        <input
                            type="date"
                            id="leadDate"
                            value={leadData.leadDate}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="leadDate"
                            required />

                        <label htmlFor="leadSource" className="text-[#D4A017] max-sm:text-sm"><strong>Lead Source: <span className="text-red-500">*</span></strong></label>
                        <select
                            id="leadSource"
                            value={leadData.leadSource}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="leadSource"
                            required>
                            <option value="" disabled>Select the Lead Source here</option>
                            {getOptions('lead_sources').map((src, i) => (
                                <option key={i} value={src}>{src}</option>
                            ))}
                        </select>

                        <label htmlFor="name" className="text-[#D4A017] max-sm:text-sm"><strong>Name: <span className="text-red-500">*</span></strong></label>
                        <input
                            type="text"
                            id="name"
                            value={leadData.name}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="name"
                            placeholder="Enter the Name here"
                            required />

                        <label htmlFor="contact" className="text-[#D4A017] max-sm:text-sm"><strong>Contact: <span className="text-red-500">*</span></strong></label>
                        <input
                            type="text"
                            id="contact"
                            value={leadData.contact}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="contact"
                            placeholder="98765 43210"
                            inputMode="numeric"
                            maxLength={11}
                            required />

                        <label htmlFor="email" className="text-[#D4A017] max-sm:text-sm"><strong>Email: <span className="text-red-500">*</span></strong></label>
                        <input
                            type="email"
                            id="email"
                            value={leadData.email}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="email"
                            placeholder="Enter the Email Id here"
                            required />

                        <label htmlFor="leadResult" className="text-[#D4A017] max-sm:text-sm"><strong>Lead Status: <span className="text-red-500">*</span></strong></label>
                        <select
                            id="leadResult"
                            value={leadData.leadResult}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="leadResult"
                            required>
                            <option value="" disabled>Select the Lead Status here</option>
                            {getOptions('lead_statuses').map((s, i) => (
                                <option key={i} value={s}>{s}</option>
                            ))}
                        </select>

                        {leadData.leadResult === "Not Converted" && <>
                            <label htmlFor="notConvertedReason" className="text-[#D4A017] max-sm:text-sm"><strong>Reason for Not Converted: <span className="text-red-500">*</span></strong></label>
                            <select
                                id="notConvertedReason"
                                value={leadData.notConvertedReason}
                                onChange={leadHandleChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                                name="notConvertedReason"
                                required>
                                <option value="" disabled>Select the Reason here</option>
                                {getOptions('not_converted_reasons').map((r, i) => (
                                    <option key={i} value={r}>{r}</option>
                                ))}
                            </select>
                        </>}

                        <button
                            className="block w-full mt-4 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" disabled={isSubmitting}
                            type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LeadForm