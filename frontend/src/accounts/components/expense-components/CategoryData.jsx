// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function CategoryData() {
    const { getOptionsWithCurrent } = useDropdowns();
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

    const thClass = "border-r border-gray-100 px-3 py-1.5 text-xs font-medium text-[#D4A017] text-left whitespace-nowrap w-48";
    const tdClass = "px-3 py-1.5 text-xs text-gray-800";

    return (
        <DashPage>
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

                <div className="overflow-x-auto">
                    {activeOption === "Expense" &&
                        <table className="min-w-full table-auto text-xs border-collapse">
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Expense Raised By</th>
                                    <td className={tdClass + " max-w-[180px] truncate"}>{data?.expenseRaisedEmail}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Property Name</th>
                                    <td className={tdClass}>{data?.propertyName}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Head of Expense</th>
                                    <td className={tdClass}>{data?.headOfExpense}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Expense Type</th>
                                    <td className={tdClass}>{data?.expenseType}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Category</th>
                                    <td className={tdClass}>{data?.category}</td>
                                </tr>

                                {data?.headOfExpense === 'Owners' &&
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Owner</th>
                                        <td className={tdClass}>{data?.owner}</td>
                                    </tr>
                                }

                                {(data?.headOfExpense === 'Owners' || data?.headOfExpense === 'Resident') &&
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Room Number</th>
                                        <td className={tdClass}>{data?.room}</td>
                                    </tr>
                                }

                                {data?.headOfExpense === 'Resident' &&
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Resident</th>
                                        <td className={tdClass}>{data?.resident}</td>
                                    </tr>
                                }

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Amount</th>
                                    <td className={tdClass}>{data?.amount}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>GST (Tax Amount)</th>
                                    <td className={tdClass}>{data?.gst || 'NA'}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Total Amount after GST</th>
                                    <td className={tdClass}>{Number(data?.amount) + Number(data?.gst)}</td>
                                </tr>

                                {data?.headOfExpense === 'Resident' &&
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Remarks</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.remarks || '-'}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <input
                                                    type="text"
                                                    value={category.remarks}
                                                    onChange={(e) => categoryHandleChange(e)}
                                                    className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                    placeholder="Enter any remarks here"
                                                    name="remarks"
                                                />
                                            </td>
                                        </>}
                                    </tr>
                                }

                                {data?.headOfExpense !== 'Resident' && <>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Payment Type</th>
                                        <td className={tdClass}>{data?.paymentType}</td>
                                    </tr>

                                    {data?.paymentType === "Vendor" && <>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Vendor</th>
                                            <td className={tdClass}>{data?.vendor || 'NA'}</td>
                                        </tr>
                                    </>}

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Account Id (Optional)</th>
                                        <td className={tdClass}>{data?.accountId || 'NA'}</td>
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Amount Transferred Date</th>
                                        <td className={tdClass}>{data?.amountTransferredDate ? formatDateToDDMonYYYY(data?.amountTransferredDate) : ''}</td>
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Priority</th>
                                        <td className={tdClass}>{data?.priority}</td>
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Deadline</th>
                                        <td className={tdClass}>{data?.deadline}</td>
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Receipt</th>
                                        <td className={tdClass + " hover:text-[#D4A017] hover:cursor-pointer max-w-[180px] truncate"} onClick={() => data?.receipt && window.open(data.receipt, '_blank')}>{data?.receipt ? data.receipt.split('/').pop() : '-'}</td>
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Comments (Optional)</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.comments || '-'}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <input
                                                    type="text"
                                                    value={category.comments}
                                                    onChange={(e) => categoryHandleChange(e)}
                                                    className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                    placeholder="Enter any additional comments here"
                                                    name="comments"
                                                />
                                            </td>
                                        </>}
                                    </tr>
                                </>}

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Status</th>
                                    {!dataEditView ? <>
                                        <td className={tdClass}>{data?.status}</td>
                                    </> : <>
                                        <td className={tdClass}>
                                            <select id="status" value={category.status} onChange={(e) => categoryHandleChange(e)} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="status" required>
                                                <option value="" disabled>Select the status of the payment here</option>
                                                {getOptionsWithCurrent('expense_statuses', category.status).map((s, i) => (
                                                    <option key={i} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </>}
                                </tr>

                                {category.status === 'Completed' && (<>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Transfer Type</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.transferType}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <select id="transferType" value={category.transferType} onChange={(e) => categoryHandleChange(e)} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="transferType" required>
                                                    <option value="" disabled>Select the Transfer Type of the payment here</option>
                                                    {getOptionsWithCurrent('transfer_types', category.transferType).map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>UTR Number</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.utrNumber}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <input
                                                    type="text"
                                                    value={category.utrNumber}
                                                    onChange={(e) => categoryHandleChange(e)}
                                                    className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                    placeholder="Enter any UTR Number here"
                                                    name="utrNumber"
                                                />
                                            </td>
                                        </>}
                                    </tr>
                                </>)}
                            </tbody>
                        </table>
                    }

                    {activeOption === "Fixed Expense" &&
                        <table className="min-w-full table-auto text-xs border-collapse">
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Expense Raised By</th>
                                    <td className={tdClass + " max-w-[180px] truncate"}>{data?.expenseRaisedEmail}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Property Name</th>
                                    <td className={tdClass}>{data?.propertyName}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Owner Name</th>
                                    <td className={tdClass}>{data?.owner}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Rental</th>
                                    <td className={tdClass}>{data?.rental}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>TDS</th>
                                    <td className={tdClass}>{data?.tds}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Rental after TDS</th>
                                    <td className={tdClass}>{data?.rentalAfterTds}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Deductions</th>
                                    <td className={tdClass}>{data?.deductions}</td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Comments (Optional)</th>
                                    {!dataEditView ? <>
                                        <td className={tdClass}>{data?.comments}</td>
                                    </> : <>
                                        <td className={tdClass}>
                                            <input
                                                type="text"
                                                value={category.comments}
                                                onChange={(e) => categoryHandleChange(e)}
                                                className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                placeholder="Enter any additional comments here"
                                                name="comments"
                                            />
                                        </td>
                                    </>}
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Status</th>
                                    {!dataEditView ? <>
                                        <td className={tdClass}>{data?.status}</td>
                                    </> : <>
                                        <td className={tdClass}>
                                            <select id="status" value={category.status} onChange={(e) => categoryHandleChange(e)} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="status" required>
                                                <option value="" disabled>Select the status of the payment here</option>
                                                {getOptionsWithCurrent('expense_statuses', category.status).map((s, i) => (
                                                    <option key={i} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </>}
                                </tr>

                                {category.status === 'Completed' && (<>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Transfer Type</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.transferType}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <select id="transferType" value={category.transferType} onChange={(e) => categoryHandleChange(e)} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="transferType" required>
                                                    <option value="" disabled>Select the Transfer Type of the payment here</option>
                                                    {getOptionsWithCurrent('transfer_types', category.transferType).map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>UTR Number</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.utrNumber}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <input
                                                    type="text"
                                                    value={category.utrNumber}
                                                    onChange={(e) => categoryHandleChange(e)}
                                                    className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                    placeholder="Enter the UTR Number here"
                                                    name="utrNumber"
                                                />
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Amount Transferred</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.amountTransferred}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <input
                                                    type="text"
                                                    value={category.amountTransferred}
                                                    onChange={(e) => categoryHandleChange(e)}
                                                    className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                    placeholder="Enter the Amount Transferred here"
                                                    name="amountTransferred"
                                                />
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Date of Transfer {dataEditView && <span className="text-red-500">*</span>}</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.dateOfTransfer}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <input
                                                    type="date"
                                                    id="dateOfTransfer"
                                                    value={category.dateOfTransfer}
                                                    onChange={(e) => categoryHandleChange(e)}
                                                    className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300"
                                                    name="dateOfTransfer"
                                                    required />
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <th className={thClass}>Email Body Note {dataEditView && <span className="text-red-500">*</span>}</th>
                                        {!dataEditView ? <>
                                            <td className={tdClass}>{data?.emailNote}</td>
                                        </> : <>
                                            <td className={tdClass}>
                                                <input
                                                    type="text"
                                                    value={category.emailNote}
                                                    onChange={(e) => categoryHandleChange(e)}
                                                    className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                    placeholder="Add email body note here"
                                                    name="emailNote"
                                                    required
                                                />
                                            </td>
                                        </>}
                                    </tr>
                                </>)}
                            </tbody>
                        </table>
                    }
                </div>
            </form>
        </DashPage>
    );
}

export default CategoryData;
