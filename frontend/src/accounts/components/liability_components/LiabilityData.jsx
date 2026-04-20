import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function LiabilityData({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const location = useLocation();
    const tenantData = location.state?.tenantData;
    const { id } = useParams();

    const [liabiltyData, setLiabiltyData] = useState({
        status: tenantData?.status || '',
        checkSendEmail: tenantData?.checkSendEmail || false,
        amount: tenantData?.amount || '',
        utrNumber: tenantData?.utrNumber || '',
        transferredDate: tenantData?.transferredDate || ''
    });

    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [originalData, setOriginalData] = useState(tenantData || {});

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

    const viewAgreementHandle = (tenantData) => {
        navigate(`/accounts/accounts-agreement-pdf/${tenantData?.id}`, { state: { tenantData, type: 'LiabilityData' } });
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

        changedData['tenantId'] = tenantData?.tenantId;

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

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`flex items-center min-h-screen text-slate-800 max-lg:bg-white ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6`}>
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

                        <div className="w-full overflow-x-auto">
                            <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                <tbody>
                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Property Name</th>
                                        <td className="py-1 px-2">{tenantData?.propertyName || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Guest Name</th>
                                        <td className="py-1 px-2">{tenantData?.residentsName || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Check‑in Date</th>
                                        <td className="py-1 px-2">{tenantData?.checkIn ? formatDateToDDMonYYYY(tenantData?.checkIn) : '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Check‑out Date</th>
                                        <td className="py-1 px-2">{tenantData?.checkOut ? formatDateToDDMonYYYY(tenantData?.checkOut) : '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">View Agreement</th>
                                        <td className="py-1 px-2 hover:text-[#D4A017] hover:cursor-pointer" onClick={() => viewAgreementHandle(tenantData)}>{tenantData?.residentsName ? `${tenantData?.residentsName.replace(/\s+/g, '')}_Contract.pdf` : '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">KYC Type</th>
                                        <td className="py-1 px-2">{tenantData?.kycType || '-'}</td>
                                    </tr>

                                    {tenantData?.kycType === 'Aadhar' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Aadhar Number</th>
                                            <td className="py-1 px-2">{tenantData?.aadharNumber || '-'}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Front Copy</th>
                                            <td className="py-1 px-2">
                                                <Link to={
                                                    typeof tenantData?.aadharFrontCopy === 'string'
                                                        ? tenantData?.aadharFrontCopy
                                                        : tenantData?.aadharFrontCopy
                                                            ? URL.createObjectURL(tenantData?.aadharFrontCopy)
                                                            : '#'
                                                } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                    {(tenantData?.aadharFrontCopy || '').split('/')[8] || '-'}
                                                </Link>
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Back Copy</th>
                                            <td className="py-1 px-2">
                                                <Link to={
                                                    typeof tenantData?.aadharBackCopy === 'string'
                                                        ? tenantData?.aadharBackCopy
                                                        : tenantData?.aadharBackCopy
                                                            ? URL.createObjectURL(tenantData?.aadharBackCopy)
                                                            : '#'
                                                } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                    {(tenantData?.aadharBackCopy || '').split('/')[8] || '-'}
                                                </Link>
                                            </td>
                                        </tr>
                                    </>}

                                    {tenantData?.kycType === 'PAN' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">PAN Number</th>
                                            <td className="py-1 px-2">{tenantData?.panNumber || '-'}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Front Copy</th>
                                            <td className="py-1 px-2">
                                                <Link to={
                                                    typeof tenantData?.panFrontCopy === 'string'
                                                        ? tenantData?.panFrontCopy
                                                        : tenantData?.panFrontCopy
                                                            ? URL.createObjectURL(tenantData?.panFrontCopy)
                                                            : '#'
                                                } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                    {(tenantData?.panFrontCopy || '').split('/')[8] || '-'}
                                                </Link>
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Back Copy</th>
                                            <td className="py-1 px-2">
                                                <Link to={
                                                    typeof tenantData?.panBackCopy === 'string'
                                                        ? tenantData?.panBackCopy
                                                        : tenantData?.panBackCopy
                                                            ? URL.createObjectURL(tenantData?.panBackCopy)
                                                            : '#'
                                                } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                    {(tenantData?.panBackCopy || '').split('/')[8] || '-'}
                                                </Link>
                                            </td>
                                        </tr>
                                    </>}

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Deposit</th>
                                        <td className="py-1 px-2">{tenantData?.totalDepositPaid || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Deductions</th>
                                        <td className="py-1 px-2">{tenantData?.residentDeductions || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Net Payout</th>
                                        <td className="py-1 px-2">{(Number(tenantData?.totalDepositPaid) - Number(tenantData?.residentDeductions)) || 0}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Payout Date</th>
                                        <td className="py-1 px-2">{tenantData?.payoutDate ? formatDateToDDMonYYYY(tenantData?.payoutDate) : '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Update Status</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{liabiltyData?.status}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="status" value={liabiltyData.status} onChange={liabilityHandleChange} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="status" required>
                                                        <option value="" disabled>Select the status here</option>
                                                        <option value="Pending">Pending</option>
                                                        <option value="Process">Process</option>
                                                        <option value="Settled">Settled</option>
                                                        <option value="Adjusted">Adjusted</option>
                                                        <option value="To Be Recovered">To Be Recovered</option>
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    {(dataEditView && liabiltyData?.status === 'Pending') &&
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Send email requesting guest's bank details</th>

                                            <td className="py-1 px-2">
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

                                                    <span className="text-xs sm:text-sm">
                                                        {tenantData?.checkSendEmail === true ? 'Send email again' : 'Send email'}
                                                    </span>
                                                </label>
                                            </td>
                                        </tr>
                                    }

                                    {liabiltyData?.status === 'Settled' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Amount</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{liabiltyData?.amount}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="text"
                                                            value={liabiltyData.amount}
                                                            onChange={liabilityHandleChange}
                                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                            placeholder="Enter the amount here"
                                                            name="amount"
                                                        />
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">UTR number</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{liabiltyData?.utrNumber}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="text"
                                                            value={liabiltyData.utrNumber}
                                                            onChange={liabilityHandleChange}
                                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                            placeholder="Enter the UTR number here"
                                                            name="utrNumber"
                                                        />
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Transferred Date</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{liabiltyData?.transferredDate}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="date"
                                                            value={liabiltyData.transferredDate}
                                                            onChange={liabilityHandleChange}
                                                            className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                                            name="transferredDate"
                                                        />
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>
                                    </>}
                                </tbody>
                            </table>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LiabilityData