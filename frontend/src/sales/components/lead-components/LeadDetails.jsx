import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function LeadDetails() {
    const { getOptions } = useDropdowns();
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
                    <form className="max-w-3xl mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={handleLeadUpdate}>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">LEADS DATA</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/sales/sales-leads-table`)}
                                type="button">Prev</button>

                            <div className="flex justify-between sm:justify-end mb-5">
                                <button
                                    className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()} type="button">{!dataEditView ? 'Update Status' : 'View Details'}</button>

                                <button
                                    className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving || isDeleting}
                                    type={dataEditView ? "submit" : "button"}
                                    onClick={!dataEditView ? handleLeadDelete : null}
                                >
                                    {dataEditView ? (isSaving ? "Saving Details..." : "Save Details") : (isDeleting ? "Deleting..." : "Delete")}
                                </button>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                <tbody>
                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Lead Date</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{leadDetails?.leadDate}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="date"
                                                        value={leadDetails.leadDate}
                                                        onChange={(e) => leadHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        name="leadDate"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Lead Source</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{leadDetails?.leadSource}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="leadSource" value={leadDetails.leadSource} onChange={leadHandleChange} className="text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="leadSource" required>
                                                        <option value="" disabled>Select the Lead Source here</option>
                                                        {getOptions('lead_sources').map((src, i) => (
                                                            <option key={i} value={src}>{src}</option>
                                                        ))}
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Name</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{leadDetails?.name}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={leadDetails.name}
                                                        onChange={(e) => leadHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="Enter the Name here"
                                                        name="name"
                                                        required
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Contact</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{formatIndianPhone(leadDetails?.contact)}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={leadDetails.contact}
                                                        onChange={(e) => leadHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="98765 43210"
                                                        inputMode="numeric"
                                                        maxLength={11}
                                                        name="contact"
                                                        required
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Email</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{leadDetails?.email}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="email"
                                                        value={leadDetails.email}
                                                        onChange={(e) => leadHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="Enter the Name here"
                                                        name="email"
                                                        required
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Lead Status</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{leadDetails?.leadResult}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="leadResult" value={leadDetails.leadResult} onChange={leadHandleChange} className="text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="leadResult" required>
                                                        <option value="" disabled>Select the Lead Status here</option>
                                                        {getOptions('lead_statuses').map((s, i) => (
                                                            <option key={i} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    {leadDetails.leadResult === "Not Converted" && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Reason for Not Converted</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{leadDetails?.notConvertedReason}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <select id="notConvertedReason" value={leadDetails.notConvertedReason} onChange={leadHandleChange} className="text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="notConvertedReason" required>
                                                            <option value="" disabled>Select the Reason here</option>
                                                            {getOptions('not_converted_reasons').map((r, i) => (
                                                                <option key={i} value={r}>{r}</option>
                                                            ))}
                                                        </select>
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>
                                    </>}
                                </tbody>
                            </table>
                        </div>
                    </form>
        </DashPage>
    )
}

export default LeadDetails