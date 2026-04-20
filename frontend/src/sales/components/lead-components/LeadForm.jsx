import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function LeadForm({ isExpanded, setIsExpanded }) {
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
            [name]: value,
        }));
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const leadHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/sales/leads-form-submit/', leadData, {
                withCredentials: true,
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
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800"
                        onSubmit={leadHandleSubmit} method='POST'>

                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-stone-400">ADD LEAD DATA</h1>

                        <label htmlFor="leadDate" className="text-[#D4A017] max-sm:text-sm"><strong>Lead Date:</strong></label>
                        <input
                            type="date"
                            id="leadDate"
                            value={leadData.leadDate}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="leadDate"
                            required />

                        <label htmlFor="leadSource" className="text-[#D4A017] max-sm:text-sm"><strong>Lead Source:</strong></label>
                        <select
                            id="leadSource"
                            value={leadData.leadSource}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="leadSource"
                            required>
                            <option value="" disabled>Select the Lead Source here</option>
                            <option value="Transfer">Transfer</option>
                            <option value="New">New</option>
                            <option value="Referal">Referal</option>
                            <option value="Walkin">Walkin</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Whatsapp">Whatsapp</option>
                            <option value="Inbound">Inbound</option>
                            <option value="Google">Google</option>
                            <option value="Website">Website</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Pamphlet">Pamphlet</option>
                        </select>

                        <label htmlFor="name" className="text-[#D4A017] max-sm:text-sm"><strong>Name:</strong></label>
                        <input
                            type="text"
                            id="name"
                            value={leadData.name}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="name"
                            placeholder="Enter the Name here"
                            required />

                        <label htmlFor="contact" className="text-[#D4A017] max-sm:text-sm"><strong>Contact:</strong></label>
                        <input
                            type="text"
                            id="contact"
                            value={leadData.contact}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="contact"
                            placeholder="Enter the Contact Number here"
                            required />

                        <label htmlFor="email" className="text-[#D4A017] max-sm:text-sm"><strong>Email:</strong></label>
                        <input
                            type="email"
                            id="email"
                            value={leadData.email}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="email"
                            placeholder="Enter the Email Id here"
                            required />

                        <label htmlFor="leadResult" className="text-[#D4A017] max-sm:text-sm"><strong>Lead Status:</strong></label>
                        <select
                            id="leadResult"
                            value={leadData.leadResult}
                            onChange={leadHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="leadResult"
                            required>
                            <option value="" disabled>Select the Lead Status here</option>
                            <option value="Not Converted">Not Converted</option>
                            <option value="Converted - Visit">Converted - Visit</option>
                            <option value="Followup">Followup</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Not Contacted">Not Contacted</option>
                            <option value="Converted - Closed">Converted - Closed</option>
                        </select>

                        {leadData.leadResult === "Not Converted" && <>
                            <label htmlFor="notConvertedReason" className="text-[#D4A017] max-sm:text-sm"><strong>Reason for Not Converted:</strong></label>
                            <select
                                id="notConvertedReason"
                                value={leadData.notConvertedReason}
                                onChange={leadHandleChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                                name="notConvertedReason"
                                required>
                                <option value="" disabled>Select the Reason here</option>
                                <option value="Price">Price</option>
                                <option value="Availability">Availability</option>
                                <option value="Location">Location</option>
                                <option value="Food">Food</option>
                                <option value="Directly disconnected">Directly disconnected</option>
                                <option value="Number not reachable">Number not reachable</option>
                                <option value="Wrong number">Wrong number</option>
                                <option value="No call availability on this number">No call availability on this number</option>
                                <option value="Not looking for any colive space">Not looking for any colive space</option>
                                <option value="Yet to confirm">Yet to confirm</option>
                                <option value="Called multiple times no response">Called multiple times no response</option>
                                <option value="Shortstay">Shortstay</option>
                                <option value="Longstay">Longstay</option>
                                <option value="Shift to another property">Shift to another property</option>
                                <option value="Not responded">Not responded</option>
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