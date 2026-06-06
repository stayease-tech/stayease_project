// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { UseCSVDownload } from '../UseCSVDownload';
import axios from 'axios';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function ExpenseTable() {
    const { getOptions } = useDropdowns();
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();
    const location = useLocation();
    const { id } = useParams();
    const type = location?.state?.type;

    const [activeOption, setActiveOption] = useState(location?.state?.activeOption || 'Expense');
    const [data, setData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [status, setStatus] = useState('All');

    const [loadingData, setLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredData = expenseData.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            setExpenseData([]);

            try {
                const response = (activeOption === 'Expense') ? await axios.get('/accounts/get-expense-data/') : await axios.get('/accounts/get-fixed-expense-data/');

                setData(
                    type === 'vendor'
                        ?
                        (response?.data?.expense_table || []).filter(expense => Number(expense.vendor_instance_id) === Number(id))
                        :
                        (response?.data?.expense_table || [])
                )

                setExpenseData(
                    type === 'vendor'
                        ?
                        (response?.data?.expense_table || []).filter(expense =>
                            Number(expense.vendor_instance_id) === Number(id) &&
                            (status === 'All' || expense.status === status)
                        )
                        :
                        (response?.data?.expense_table || []).filter(expense =>
                            status === 'All' ? true : expense.status === status
                        )
                );
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [activeOption, type, id, status]);

    const statusHandleChange = (e) => {
        setStatus(e.target.value)

        setExpenseData((prevData) => (
            prevData.filter(expense =>
                status === 'All' ? true : expense.status === status
            )
        ))
    }

    const outputData = (activeOption === 'Expense') ?
        expenseData.map(expense => ({
            ['Property Name']: expense?.propertyName || '-',
            ['Head of Expense']: expense?.headOfExpense || '-',
            ['Expense Type']: expense?.expenseType || '-',
            ['Owner Name']: expense?.owner || 'NA',
            ['Room Number']: expense?.room || 'NA',
            ['Resident']: expense?.resident || 'NA',
            ['Category']: expense?.category || '-',
            ['Amount']: expense?.amount || '-',
            ['GST']: expense?.gst || 'NA',
            ['Remarks']: expense?.comments || '-',
            ['Payment Type']: expense?.paymentType || 'NA',
            ['Vendor Type']: expense?.vendorType || 'NA',
            ['Vendor']: expense?.vendor || 'NA',
            ['Account ID']: expense?.accountId || 'NA',
            ['Amount Transferred Date']: expense?.amountTransferredDate || '-',
            ['Priority']: expense?.priority || 'NA',
            ['Deadline']: expense?.deadline || 'NA',
            ['Comments']: expense?.comments || '-',
            ['Receipt']: expense?.receipt || '-',
            ['Status']: expense?.status || '-',
            ['Transfer Type']: expense?.transferType || '-',
            ['UTR Number']: expense?.utrNumber || '-',
            ['Created At']: expense?.createdAt || '-',
            ['Updated At']: expense?.updatedAt || '-',
        }))
        :
        expenseData.map(expense => ({
            ['Expense Raised Email']: expense?.expenseRaisedEmail || '-',
            ['Property Name']: expense?.propertyName || '-',
            ['Owner Name']: expense?.owner || '-',
            ['Rental']: expense?.rental || '-',
            ['TDS']: expense?.tds || '-',
            ['Deductions']: expense?.deductions || '-',
            ['Deductions After TDS']: expense?.deductionsAfterTds || '-',
            ['Status']: expense?.status || '-',
            ['Comments']: expense?.comments || '-',
            ['Transfer Type']: expense?.transferType || '-',
            ['UTR Number']: expense?.utrNumber || '-',
            ['Amount Transferred']: expense?.amountTransferred || '-',
            ['Date of Transfer']: expense?.dateOfTransfer || '-',
            ['Created At']: expense?.createdAt || '-',
            ['Updated At']: expense?.updatedAt || '-',
        }));

    const updateExpenseStatus = (expenseData) => {
        type === 'vendor' ?
            navigate(`/accounts/accounts-category-data/${id}`, { state: { data: expenseData, type, activeOption } }) :
            navigate(`/accounts/accounts-category-data/${expenseData?.category_id}`, { state: { data: expenseData, type: 'expense', activeOption } });
    };

    const viewFixedExpenseTable = (expenseData) => {
        navigate(`/accounts/accounts-category-data/${expenseData?.id}`, { state: { data: expenseData, type: 'expense', activeOption } });
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>{type === 'vendor' ? 'Vendor-wise Expense Table' : 'Property-wise Expense Table'}</h1>
                <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="form-input w-48 text-xs"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
                {type !== 'vendor' && (
                    <>
                        <button
                            className={`px-3 py-1.5 text-white text-xs font-medium rounded cursor-pointer transition-colors ${activeOption === 'Expense' ? 'bg-[#B8860B]' : 'bg-[#D4A017] hover:bg-[#B8860B]'}`}
                            onClick={() => setActiveOption('Expense')}
                        >
                            Expense
                        </button>
                        <button
                            className={`px-3 py-1.5 text-white text-xs font-medium rounded cursor-pointer transition-colors ${activeOption === 'Fixed Expense' ? 'bg-[#B8860B]' : 'bg-[#D4A017] hover:bg-[#B8860B]'}`}
                            onClick={() => setActiveOption('Fixed Expense')}
                        >
                            Fixed Expense
                        </button>
                        <button
                            className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                            onClick={() => navigate('/accounts/accounts-expense-form', { state: { activeOption } })}
                            type="button"
                        >
                            {activeOption === 'Expense' ? 'Add Expense' : 'Add Fixed Expense'}
                        </button>
                        <button
                            className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                            onClick={() => downloadCSV(outputData, 'expense_data.csv')}
                            type="button"
                        >
                            Export Data
                        </button>
                    </>
                )}
                {type === 'vendor' && (
                    <button
                        className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                        onClick={() => navigate('/accounts/accounts-vendor-table')}
                        type="button"
                    >
                        Prev
                    </button>
                )}
                <select
                    id="status"
                    value={status}
                    onChange={statusHandleChange}
                    className="px-2 py-1.5 border border-gray-300 rounded text-xs text-black"
                    name="status"
                    required
                >
                    <option value="All">{`All (${data.length})`}</option>
                    {getOptions('expense_statuses').map((s, i) => (
                        <option key={i} value={s}>{`${s} (${data.filter(expense => expense.status === s).length})`}</option>
                    ))}
                </select>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    {activeOption === 'Expense' && (
                        <table className="min-w-full table-auto text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expense Head</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expense Type</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Raised By</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Amount</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">GST</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Total w/ GST</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment Type</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingData ? (
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td colSpan="13" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading…</td>
                                    </tr>
                                ) : paginatedData.length > 0 ? paginatedData.map((expenseData, i) => (
                                    <tr className="hover:bg-gray-50 transition-colors" key={expenseData.id}>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.propertyName}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.headOfExpense}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.expenseType}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.category}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.expenseRaisedEmail}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.amount}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.gst || 'NA'}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{Number(expenseData?.amount) + (isNaN(Number(expenseData?.gst)) ? 0 : Number(expenseData?.gst))}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.paymentType || 'NA'}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatter.format(new Date(expenseData?.createdAt))}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatter.format(new Date(expenseData?.updatedAt))}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="flex items-center gap-2">
                                                <span>{expenseData?.status}</span>
                                                <Pencil
                                                    size={14}
                                                    className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                    onClick={() => updateExpenseStatus(expenseData)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td colSpan="13" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeOption === 'Fixed Expense' && (
                        <table className="min-w-full table-auto text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expense Raised Email</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Owner Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Created At</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Updated At</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loadingData ? (
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td colSpan="7" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading…</td>
                                    </tr>
                                ) : paginatedData.length > 0 ? paginatedData.map((expenseData, i) => (
                                    <tr className="hover:bg-gray-50 transition-colors" key={expenseData.id}>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.expenseRaisedEmail}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.propertyName}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.owner}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{expenseData?.createdAt ? formatter.format(new Date(expenseData.createdAt)) : "-"}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{expenseData?.updatedAt ? formatter.format(new Date(expenseData.updatedAt)) : "-"}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="flex items-center gap-2">
                                                <span>{expenseData?.status}</span>
                                                <Pencil
                                                    size={14}
                                                    className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                    onClick={() => viewFixedExpenseTable(expenseData)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td colSpan="7" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
        </DashPage>
    );
}

export default ExpenseTable;
