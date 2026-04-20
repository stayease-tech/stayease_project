import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function CategoryData({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state?.data;
    const activeOption = location?.state?.activeOption || 'Expense';
    const { id } = useParams();
    const type = location?.state?.type;

    const [category, setCategory] = useState(
        activeOption === 'Expense' ?
            {
                remarks: data?.remarks || '',
                comments: data?.comments || '',
                status: data?.status || '',
                transferType: data?.transferType || '',
                utrNumber: data?.utrNumber || '',
            } : {
                comments: data?.comments || '',
                status: data?.status || '',
                transferType: data?.transferType || '',
                utrNumber: data?.utrNumber || '',
                amountTransferred: data?.amountTransferred || '',
                dateOfTransfer: data?.dateOfTransfer || '',
                emailNote: data?.emailNote || ''
            }
    );

    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [originalData, setOriginalData] = useState((activeOption === data) || {});

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

    const categoryHandleChange = (e) => {
        const { name, value } = e.target;

        setCategory(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    function formatDateToDDMonYYYY(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    const getChangedData = () => {
        const changedData = {};

        Object.keys(category).forEach(key => {
            const originalValue = originalData[key] || '';
            const currentValue = category[key] || '';

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

    const categoryHandleUpdate = async (e) => {
        e.preventDefault();

        const changedData = getChangedData();

        if (Object.keys(changedData).length === 0) {
            alert('No data is updated!');
            return;
        }

        setIsSaving(true);

        if ((activeOption === 'Fixed Expense')) {
            changedData['monthYear'] = data?.monthYear;
        }

        try {
            const response = (activeOption === 'Expense') ? await axios.put(
                `/accounts/accounts-form-update/${id}/`,
                changedData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            ) : await axios.put(
                `/accounts/accounts-fixed-expense-update/${id}/`,
                changedData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            setOriginalData(prev => ({ ...prev, ...changedData }));

            if (response.data.success) {
                alert(response.data.message);

                type === 'vendor' ?
                    navigate(`/accounts/accounts-expense-table/${id}`, { state: { activeOption, type } })
                    :
                    navigate(`/accounts/accounts-expense-table`, { state: { activeOption, type } });
            }
        } catch (err) {
            console.error('Error updating form:', err);
            alert('There was an error updating the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    const categoryHandleDelete = async (e) => {
        e.preventDefault();

        setIsDeleting(true);

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            const response = (activeOption === 'Expense') ? await axios.delete(`/accounts/accounts-form-delete/${id}/`, {
                withCredentials: true,
            }) : await axios.delete(`/accounts/accounts-fixed-expense-delete/${id}/`, {
                withCredentials: true,
            });

            if (response.data.success) {
                alert(response.data.message);

                type === 'vendor' ?
                    navigate(`/accounts/accounts-expense-table/${id}`, { state: { activeOption, type } })
                    :
                    navigate(`/accounts/accounts-expense-table`, { state: { activeOption, type } });
            }
        } catch (error) {
            console.error('Error deleting form:', error);
            alert('There was an error deleting the form. Please try again!');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`flex items-center min-h-screen text-slate-800 max-lg:bg-white ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={categoryHandleUpdate}>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">EXPENSE CATEGORY DATA</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => type === 'vendor' ?
                                    navigate(`/accounts/accounts-expense-table/${id}`, { state: { activeOption, type } })
                                    :
                                    navigate(`/accounts/accounts-expense-table`, { state: { activeOption, type } })}
                                type="button">Prev</button>

                            <div className="flex justify-between sm:justify-end mb-5">
                                <button
                                    className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()} type="button">{!dataEditView ? 'Update Status' : 'View Details'}</button>

                                <button
                                    className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving || isDeleting}
                                    type={dataEditView ? "submit" : "button"}
                                    onClick={!dataEditView ? categoryHandleDelete : null}
                                >
                                    {dataEditView ? (isSaving ? "Saving Details..." : "Save Details") : (isDeleting ? "Deleting..." : "Delete")}
                                </button>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            {activeOption === "Expense" &&
                                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                    <tbody>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Expense Raised By</th>
                                            <td className="py-1 px-2">{data?.expenseRaisedEmail}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Property Name</th>
                                            <td className="py-1 px-2">{data?.propertyName}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Head of Expense</th>
                                            <td className="py-1 px-2">{data?.headOfExpense}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Expense Type</th>
                                            <td className="py-1 px-2">{data?.expenseType}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Category</th>
                                            <td className="py-1 px-2">{data?.category}</td>
                                        </tr>

                                        {data?.headOfExpense === 'Owners' &&
                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Owner</th>
                                                <td className="py-1 px-2">{data?.owner}</td>
                                            </tr>
                                        }

                                        {(data?.headOfExpense === 'Owners' || data?.headOfExpense === 'Resident') &&
                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Room Number</th>
                                                <td className="py-1 px-2">{data?.room}</td>
                                            </tr>
                                        }

                                        {data?.headOfExpense === 'Resident' &&
                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Resident</th>
                                                <td className="py-1 px-2">{data?.resident}</td>
                                            </tr>
                                        }

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Amount</th>
                                            <td className="py-1 px-2">{data?.amount}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">GST (Tax Amount)</th>
                                            <td className="py-1 px-2">{data?.gst || 'NA'}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Total Amount after GST</th>
                                            <td className="py-1 px-2">{Number(data?.amount) + Number(data?.gst)}</td>
                                        </tr>

                                        {data?.headOfExpense === 'Resident' && <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Remarks</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{data?.remarks || '-'}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="text"
                                                            value={category.remarks}
                                                            onChange={(e) => categoryHandleChange(e)}
                                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                            placeholder="Enter any remarks here"
                                                            name="remarks"
                                                        />
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>}

                                        {data?.headOfExpense !== 'Resident' && <>
                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Payment Type</th>
                                                <td className="py-1 px-2">{data?.paymentType}</td>
                                            </tr>

                                            {data?.paymentType === "Vendor" && <>
                                                <tr className="border-b border-white">
                                                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Vendor</th>
                                                    <td className="py-1 px-2">{data?.vendor || 'NA'}</td>
                                                </tr>
                                            </>}

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Account Id (Optional)</th>
                                                <td className="py-1 px-2">{data?.accountId || 'NA'}</td>
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Amount Transferred Date</th>
                                                <td className="py-1 px-2">{data?.amountTransferredDate ? formatDateToDDMonYYYY(data?.amountTransferredDate) : ''}</td>
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Priority</th>
                                                <td className="py-1 px-2">{data?.priority}</td>
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Deadline</th>
                                                <td className="py-1 px-2">{data?.deadline}</td>
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Receipt</th>
                                                <td className="py-1 px-2 hover:text-[#D4A017] hover:cursor-pointer" onClick={() => data?.receipt && window.open(data.receipt, '_blank')}>{data?.receipt ? data.receipt.split('/').pop() : '-'}</td>
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments (Optional)</th>
                                                {!dataEditView ? <>
                                                    <td className="py-1 px-2">{data?.comments || '-'}</td>
                                                </> : <>
                                                    <td className="flex">
                                                        <span className="py-1 px-2 w-full">
                                                            <input
                                                                type="text"
                                                                value={category.comments}
                                                                onChange={(e) => categoryHandleChange(e)}
                                                                className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                                placeholder="Enter any additional comments here"
                                                                name="comments"
                                                            />
                                                        </span>
                                                    </td>
                                                </>}
                                            </tr>
                                        </>}

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Status</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{data?.status}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <select id="status" value={category.status} onChange={(e) => categoryHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="status" required>
                                                            <option value="" disabled>Select the status of the payment here</option>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Approved">Approved</option>
                                                            <option value="Rejected">Rejected</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>

                                        {category.status === 'Completed' && (<>
                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Transfer Type</th>
                                                {!dataEditView ? <>
                                                    <td className="py-1 px-2">{data?.transferType}</td>
                                                </> : <>
                                                    <td className="flex">
                                                        <span className="py-1 px-2 w-full">
                                                            <select id="transferType" value={category.transferType} onChange={(e) => categoryHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="transferType" required>
                                                                <option value="" disabled>Select the Transfer Type of the payment here</option>
                                                                <option value="IMPS">IMPS</option>
                                                                <option value="NEFT">NEFT</option>
                                                                <option value="UPI">UPI</option>
                                                                <option value="Cash">Cash</option>
                                                            </select>
                                                        </span>
                                                    </td>
                                                </>}
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">UTR number</th>
                                                {!dataEditView ? <>
                                                    <td className="py-1 px-2">{data?.utrNumber}</td>
                                                </> : <>
                                                    <td className="flex">
                                                        <span className="py-1 px-2 w-full">
                                                            <input
                                                                type="text"
                                                                value={category.utrNumber}
                                                                onChange={(e) => categoryHandleChange(e)}
                                                                className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                                placeholder="Enter any UTR Number here"
                                                                name="utrNumber"
                                                            />
                                                        </span>
                                                    </td>
                                                </>}
                                            </tr>
                                        </>)}
                                    </tbody>
                                </table>
                            }

                            {activeOption === "Fixed Expense" &&
                                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                    <tbody>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Expense Raised By</th>
                                            <td className="py-1 px-2">{data?.expenseRaisedEmail}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Property Name</th>
                                            <td className="py-1 px-2">{data?.propertyName}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Owner Name</th>
                                            <td className="py-1 px-2">{data?.owner}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rental</th>
                                            <td className="py-1 px-2">{data?.rental}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">TDS</th>
                                            <td className="py-1 px-2">{data?.tds}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rental after TDS</th>
                                            <td className="py-1 px-2">{data?.rentalAfterTds}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Deductions</th>
                                            <td className="py-1 px-2">{data?.deductions}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments (Optional)</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{data?.comments}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="text"
                                                            value={category.comments}
                                                            onChange={(e) => categoryHandleChange(e)}
                                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                            placeholder="Enter any additional comments here"
                                                            name="comments"
                                                        />
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Status</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{data?.status}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <select id="status" value={category.status} onChange={(e) => categoryHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="status" required>
                                                            <option value="" disabled>Select the status of the payment here</option>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Approved">Approved</option>
                                                            <option value="Rejected">Rejected</option>
                                                            <option value="Completed">Completed</option>
                                                        </select>
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>

                                        {category.status === 'Completed' && (<>
                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Transfer Type</th>
                                                {!dataEditView ? <>
                                                    <td className="py-1 px-2">{data?.transferType}</td>
                                                </> : <>
                                                    <td className="flex">
                                                        <span className="py-1 px-2 w-full">
                                                            <select id="transferType" value={category.transferType} onChange={(e) => categoryHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="transferType" required>
                                                                <option value="" disabled>Select the Transfer Type of the payment here</option>
                                                                <option value="IMPS">IMPS</option>
                                                                <option value="NEFT">NEFT</option>
                                                                <option value="UPI">UPI</option>
                                                                <option value="Cash">Cash</option>
                                                            </select>
                                                        </span>
                                                    </td>
                                                </>}
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">UTR Number</th>
                                                {!dataEditView ? <>
                                                    <td className="py-1 px-2">{data?.utrNumber}</td>
                                                </> : <>
                                                    <td className="flex">
                                                        <span className="py-1 px-2 w-full">
                                                            <input
                                                                type="text"
                                                                value={category.utrNumber}
                                                                onChange={(e) => categoryHandleChange(e)}
                                                                className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                                placeholder="Enter the UTR Number here"
                                                                name="utrNumber"
                                                            />
                                                        </span>
                                                    </td>
                                                </>}
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Amount Transferred</th>
                                                {!dataEditView ? <>
                                                    <td className="py-1 px-2">{data?.amountTransferred}</td>
                                                </> : <>
                                                    <td className="flex">
                                                        <span className="py-1 px-2 w-full">
                                                            <input
                                                                type="text"
                                                                value={category.amountTransferred}
                                                                onChange={(e) => categoryHandleChange(e)}
                                                                className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                                placeholder="Enter the Amount Transferred here"
                                                                name="amountTransferred"
                                                            />
                                                        </span>
                                                    </td>
                                                </>}
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Date of Transfer</th>
                                                {!dataEditView ? <>
                                                    <td className="py-1 px-2">{data?.dateOfTransfer}</td>
                                                </> : <>
                                                    <td className="flex">
                                                        <span className="py-1 px-2 w-full">
                                                            <input
                                                                type="date"
                                                                id="dateOfTransfer"
                                                                value={category.dateOfTransfer}
                                                                onChange={(e) => categoryHandleChange(e)}
                                                                className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                                name="dateOfTransfer"
                                                                required />
                                                        </span>
                                                    </td>
                                                </>}
                                            </tr>

                                            <tr className="border-b border-white">
                                                <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Email Body Note</th>
                                                {!dataEditView ? <>
                                                    <td className="py-1 px-2">{data?.emailNote}</td>
                                                </> : <>
                                                    <td className="flex">
                                                        <span className="py-1 px-2 w-full">
                                                            <input
                                                                type="text"
                                                                value={category.emailNote}
                                                                onChange={(e) => categoryHandleChange(e)}
                                                                className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                                placeholder="Add email body note here"
                                                                name="emailNote"
                                                                required
                                                            />
                                                        </span>
                                                    </td>
                                                </>}
                                            </tr>
                                        </>)}
                                    </tbody>
                                </table>
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CategoryData