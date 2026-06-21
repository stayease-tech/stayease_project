// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function LiabilityData() {
    const { getOptionsWithCurrent } = useDropdowns();
    const navigate = useNavigate();
    const location = useLocation();
    const residentData = location.state?.residentData;
    const { id } = useParams();

    const [liabiltyData, setLiabiltyData] = useState({
        status: residentData?.status || '',
        checkSendEmail: residentData?.checkSendEmail || false,
        amount: residentData?.amount || '',
        utrNumber: residentData?.utrNumber || '',
        transferredDate: residentData?.transferredDate || ''
    });

    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [originalData, setOriginalData] = useState(residentData || {});

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

    const liabilityHandleChange = (e) => {
        const { name, type, checked, value } = e.target;

        setLiabiltyData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    function formatDateToDDMonYYYY(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    const viewAgreementHandle = (residentData) => {
        navigate(`/accounts/accounts-agreement-pdf/${residentData?.id}`, { state: { residentData, type: 'LiabilityData' } });
    }

    const getChangedData = () => {
        const changedData = {};

        Object.keys(liabiltyData).forEach(key => {
            const originalValue = originalData[key] || '';
            const currentValue = liabiltyData[key] || '';

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

    const liabilityHandleSubmit = async (e) => {
        e.preventDefault();

        const changedData = getChangedData();

        if (Object.keys(changedData).length === 0) {
            alert('No data is updated!');
            return;
        }

        setIsSaving(true);

        changedData['residentId'] = residentData?.residentId;

        try {
            const response = await axios.put(
                `/accounts/liability-data-update/${id}/`,
                changedData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            setOriginalData(prev => ({ ...prev, ...changedData }));

            alert(response.data.message);

            if (response.data.success) {
                navigate(`/accounts/accounts-liability-table`);
            }
        } catch (err) {
            console.error('Error updating form:', err);
            alert('There was an error updating the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    const thClass = "border-r border-gray-100 px-3 py-1.5 text-xs font-medium text-[#D4A017] text-left whitespace-nowrap w-48";
    const tdClass = "px-3 py-1.5 text-xs text-gray-800";

    return (
        <DashPage>
            <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={liabilityHandleSubmit}>
                <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">LIABILITY STATUS DATA</h1>

                <div className="sm:flex justify-between">
                    <button
                        className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/accounts/accounts-liability-table`)}
                        type="button">Prev</button>

                    <div className="flex justify-between sm:justify-end mb-5">
                        <button
                            className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()} type="button">{!dataEditView ? 'Update Status' : 'View Details'}</button>

                        {dataEditView === true && <button
                            className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving}
                            type='submit'
                        >
                            {isSaving ? "Saving Details..." : "Save Details"}
                        </button>}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Property Name</th>
                                <td className={tdClass}>{residentData?.propertyName || '-'}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Guest Name</th>
                                <td className={tdClass}>{residentData?.residentsName || '-'}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Check-in Date</th>
                                <td className={tdClass}>{residentData?.checkIn ? formatDateToDDMonYYYY(residentData?.checkIn) : '-'}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Check-out Date</th>
                                <td className={tdClass}>{residentData?.checkOut ? formatDateToDDMonYYYY(residentData?.checkOut) : '-'}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>View Agreement</th>
                                <td className={tdClass + " hover:text-[#D4A017] hover:cursor-pointer"} onClick={() => viewAgreementHandle(residentData)}>{residentData?.residentsName ? `${residentData?.residentsName.replace(/\s+/g, '')}_Contract.pdf` : '-'}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>KYC Type</th>
                                <td className={tdClass}>{residentData?.kycType || '-'}</td>
                            </tr>

                            {residentData?.kycType === 'Aadhar' && <>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Aadhar Number</th>
                                    <td className={tdClass}>{residentData?.aadharNumber || '-'}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Front Copy</th>
                                    <td className={tdClass}>
                                        <Link to={
                                            typeof residentData?.aadharFrontCopy === 'string'
                                                ? residentData?.aadharFrontCopy
                                                : residentData?.aadharFrontCopy
                                                    ? URL.createObjectURL(residentData?.aadharFrontCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {(residentData?.aadharFrontCopy || '').split('/')[8] || '-'}
                                        </Link>
                                    </td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Back Copy</th>
                                    <td className={tdClass}>
                                        <Link to={
                                            typeof residentData?.aadharBackCopy === 'string'
                                                ? residentData?.aadharBackCopy
                                                : residentData?.aadharBackCopy
                                                    ? URL.createObjectURL(residentData?.aadharBackCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {(residentData?.aadharBackCopy || '').split('/')[8] || '-'}
                                        </Link>
                                    </td>
                                </tr>
                            </>}

                            {residentData?.kycType === 'PAN' && <>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>PAN Number</th>
                                    <td className={tdClass}>{residentData?.panNumber || '-'}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Front Copy</th>
                                    <td className={tdClass}>
                                        <Link to={
                                            typeof residentData?.panFrontCopy === 'string'
                                                ? residentData?.panFrontCopy
                                                : residentData?.panFrontCopy
                                                    ? URL.createObjectURL(residentData?.panFrontCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {(residentData?.panFrontCopy || '').split('/')[8] || '-'}
                                        </Link>
                                    </td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Back Copy</th>
                                    <td className={tdClass}>
                                        <Link to={
                                            typeof residentData?.panBackCopy === 'string'
                                                ? residentData?.panBackCopy
                                                : residentData?.panBackCopy
                                                    ? URL.createObjectURL(residentData?.panBackCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {(residentData?.panBackCopy || '').split('/')[8] || '-'}
                                        </Link>
                                    </td>
                                </tr>
                            </>}

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Deposit</th>
                                <td className={tdClass}>{residentData?.totalDepositPaid || '-'}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Deductions</th>
                                <td className={tdClass}>{residentData?.residentDeductions || '-'}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Net Payout</th>
                                <td className={tdClass}>{(Number(residentData?.totalDepositPaid) - Number(residentData?.residentDeductions)) || 0}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Payout Date</th>
                                <td className={tdClass}>{residentData?.payoutDate ? formatDateToDDMonYYYY(residentData?.payoutDate) : '-'}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Update Status</th>
                                {!dataEditView ? <>
                                    <td className={tdClass}>{liabiltyData?.status}</td>
                                </> : <>
                                    <td className={tdClass}>
                                        <select id="status" value={liabiltyData.status} onChange={liabilityHandleChange} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="status" required>
                                            <option value="" disabled>Select the status here</option>
                                            {getOptionsWithCurrent('liability_statuses', liabiltyData.status).map((s, i) => (
                                                <option key={i} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </>}
                            </tr>

                            {(dataEditView && liabiltyData?.status === 'Pending') &&
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Send email requesting guest's bank details</th>

                                    <td className={tdClass}>
                                        <label className="relative inline-flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="hidden peer"
                                                name="checkSendEmail"
                                                checked={liabiltyData.checkSendEmail}
                                                onChange={liabilityHandleChange}
                                            />

                                            <span className="w-5 h-5 min-w-[20px] min-h-[20px] border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                                {liabiltyData.checkSendEmail && "✔"}
                                            </span>

                                            <span className="text-xs">
                                                {residentData?.checkSendEmail === true ? 'Send email again' : 'Send email'}
                                            </span>
                                        </label>
                                    </td>
                                </tr>
                            }

                            {liabiltyData?.status === 'Settled' && <>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Amount</th>
                                    {!dataEditView ? <>
                                        <td className={tdClass}>{liabiltyData?.amount}</td>
                                    </> : <>
                                        <td className={tdClass}>
                                            <input
                                                type="text"
                                                value={liabiltyData.amount}
                                                onChange={liabilityHandleChange}
                                                className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                placeholder="Enter the amount here"
                                                name="amount"
                                            />
                                        </td>
                                    </>}
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>UTR Number</th>
                                    {!dataEditView ? <>
                                        <td className={tdClass}>{liabiltyData?.utrNumber}</td>
                                    </> : <>
                                        <td className={tdClass}>
                                            <input
                                                type="text"
                                                value={liabiltyData.utrNumber}
                                                onChange={liabilityHandleChange}
                                                className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                placeholder="Enter the UTR number here"
                                                name="utrNumber"
                                            />
                                        </td>
                                    </>}
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Transferred Date</th>
                                    {!dataEditView ? <>
                                        <td className={tdClass}>{liabiltyData?.transferredDate}</td>
                                    </> : <>
                                        <td className={tdClass}>
                                            <input
                                                type="date"
                                                value={liabiltyData.transferredDate}
                                                onChange={liabilityHandleChange}
                                                className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300"
                                                name="transferredDate"
                                            />
                                        </td>
                                    </>}
                                </tr>
                            </>}
                        </tbody>
                    </table>
                </div>
            </form>
        </DashPage>
    );
}

export default LiabilityData;
