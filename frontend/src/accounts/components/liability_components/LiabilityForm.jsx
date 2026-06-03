import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";

export default function LiabilityForm({ isExpanded, setIsExpanded }) {
    const { getOptions } = useDropdowns();
    const location = useLocation();
    const navigate = useNavigate();
    const residentData = location.state?.residentData;

    const [liabiltyData, setLiabiltyData] = useState({
        residentId: residentData?.residentId,
        status: '',
        checkSendEmail: false,
        amount: '',
        utrNumber: '',
        transferredDate: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false);

    function formatDateToDDMonYYYY(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    const liabilityHandleChange = (e) => {
        const { name, type, checked, value } = e.target;

        setLiabiltyData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const liabilityHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(`/accounts/liability-form-submit/`, liabiltyData, {
                withCredentials: true,
            });

            if (response.data.success) {
                alert(response.data.message);

                setLiabiltyData({
                    status: '',
                    checkSendEmail: false,
                    amount: '',
                    utrNumber: '',
                    transferredDate: ''
                })

                navigate('/accounts/accounts-liability-table');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
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

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 lg:pb-5`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={liabilityHandleSubmit} method='POST'>

                        <div className="sm:flex justify-start">
                            <button
                                className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate("/accounts/accounts-liability-table")}
                                type="button">Prev</button>
                        </div>

                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">LIABILITY STATUS FORM</h1>

                        <label htmlFor="propertyName" className="text-[#D4A017] max-sm:text-sm"><strong>Property Name:</strong></label>
                        <input
                            id="propertyName"
                            type="text"
                            value={residentData?.propertyName || '-'}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="propertyName"
                            readOnly
                        />

                        <label htmlFor="residentsName" className="text-[#D4A017] max-sm:text-sm"><strong>Guest Name:</strong></label>
                        <input
                            id="residentsName"
                            type="text"
                            value={residentData?.residentsName || '-'}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="residentsName"
                            readOnly
                        />

                        <label htmlFor="checkIn" className="text-[#D4A017] max-sm:text-sm"><strong>Check‑in Date:</strong></label>
                        <input
                            id="checkIn"
                            type="text"
                            value={residentData?.checkIn ? formatDateToDDMonYYYY(residentData?.checkIn) : '-'}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="checkIn"
                            readOnly
                        />

                        <label htmlFor="checkOut" className="text-[#D4A017] max-sm:text-sm"><strong>Check-out Date:</strong></label>
                        <input
                            id="checkOut"
                            type="text"
                            value={residentData?.checkOut ? formatDateToDDMonYYYY(residentData?.checkOut) : '-'}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="checkOut"
                            readOnly
                        />

                        <label htmlFor="kycType" className="text-[#D4A017] max-sm:text-sm"><strong>KYC Type:</strong></label>
                        <input
                            id="kycType"
                            type="text"
                            value={residentData?.kycType || '-'}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="kycType"
                            readOnly
                        />

                        {residentData?.kycType === 'Aadhar' ?
                            <>
                                <label htmlFor="aadharNumber" className="text-[#D4A017] max-sm:text-sm"><strong>Aadhar Number:</strong></label>
                                <input
                                    id="aadharNumber"
                                    type="text"
                                    value={residentData?.aadharNumber || '-'}
                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    name="aadharNumber"
                                    readOnly
                                />
                            </>
                            :
                            <>
                                <label htmlFor="panNumber" className="text-[#D4A017] max-sm:text-sm"><strong>PAN Number:</strong></label>
                                <input
                                    id="panNumber"
                                    type="text"
                                    value={residentData?.panNumber || '-'}
                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    name="panNumber"
                                    readOnly
                                />
                            </>}

                        <label htmlFor="totalDepositPaid" className="text-[#D4A017] max-sm:text-sm"><strong>Deposit:</strong></label>
                        <input
                            id="totalDepositPaid"
                            type="text"
                            value={residentData?.totalDepositPaid || '-'}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="totalDepositPaid"
                            readOnly
                        />

                        <label htmlFor="residentDeductions" className="text-[#D4A017] max-sm:text-sm"><strong>Deductions:</strong></label>
                        <input
                            id="residentDeductions"
                            type="text"
                            value={residentData?.residentDeductions || '-'}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="residentDeductions"
                            readOnly
                        />

                        <label htmlFor="netPayout" className="text-[#D4A017] max-sm:text-sm"><strong>Net Payout:</strong></label>
                        <input
                            id="netPayout"
                            type="text"
                            value={(Number(residentData?.totalDepositPaid) - Number(residentData?.residentDeductions)) || 0}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="netPayout"
                            readOnly
                        />

                        <label htmlFor="payoutDate" className="text-[#D4A017] max-sm:text-sm"><strong>Payout Date:</strong></label>
                        <input
                            id="payoutDate"
                            type="text"
                            value={residentData?.payoutDate || '-'}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="payoutDate"
                            readOnly
                        />

                        <label htmlFor="status" className="text-[#D4A017] max-sm:text-sm"><strong>Status: <span className="text-red-500">*</span></strong></label>
                        <select id="status" value={liabiltyData.status} onChange={liabilityHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="status" required>
                            <option value="" disabled>Select the status here</option>
                            {getOptions('liability_statuses').map((s, i) => (
                                <option key={i} value={s}>{s}</option>
                            ))}
                        </select>

                        {liabiltyData?.status === 'Pending' && <>
                            <label className="relative inline-flex items-center space-x-2 cursor-pointer text-sm mb-5">
                                <input
                                    type="checkbox"
                                    className="hidden peer"
                                    name="checkSendEmail"
                                    checked={liabiltyData.checkSendEmail}
                                    onChange={liabilityHandleChange}
                                />

                                <span className="w-5 h-5 min-w-[20px] min-h-[20px] border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                    {liabiltyData?.checkSendEmail && "✔"}
                                </span>

                                <span className="text-xs sm:text-sm">
                                    Send email requesting guest's bank details
                                </span>
                            </label>
                        </>}

                        {liabiltyData?.status === 'Settled' && <>
                            <label htmlFor="amount" className="text-[#D4A017] max-sm:text-sm"><strong>Amount: <span className="text-red-500">*</span></strong></label>
                            <input
                                id="amount"
                                type="text"
                                value={liabiltyData.amount}
                                onChange={liabilityHandleChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                name="amount"
                                placeholder="Enter the amount here"
                                required
                            />

                            <label htmlFor="utrNumber" className="text-[#D4A017] max-sm:text-sm"><strong>UTR Number: <span className="text-red-500">*</span></strong></label>
                            <input
                                id="utrNumber"
                                type="text"
                                value={liabiltyData.utrNumber}
                                onChange={liabilityHandleChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                name="utrNumber"
                                placeholder="Enter the UTR number here"
                                required
                            />

                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Transferred Date: <span className="text-red-500">*</span></strong></label>
                            <input
                                id="transferredDate"
                                type="date"
                                value={liabiltyData.transferredDate}
                                onChange={liabilityHandleChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                name="transferredDate"
                                required
                            />
                        </>}

                        <button className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
                    </form>
                </div>
            </div>
        </div>
    )
}
