// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function ExpenseTable() {
    const { getOptions } = useDropdowns();
    const navigate = useNavigate();

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

    const formatter = new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            setExpenseData([]);

            try {
                const response = await axios.get('/accounts/get-expense-data/');

                setData((response?.data?.expense_table || []).filter(expense =>
                    expense?.dashboardUser === 'supply'
                ) || []);

                setExpenseData((response?.data?.expense_table || []).filter(expense =>
                    expense?.dashboardUser === 'supply'
                ).filter(expense => status === 'All' ? true : expense.status === status));
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [status]);

    const statusHandleChange = (e) => {
        setStatus(e.target.value);

        setExpenseData((prevData) => (
            prevData.filter(expense =>
                status === 'All' ? true : expense.status === status
            )
        ));
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Property-Wise Expense Table</h1>
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                        onClick={() => navigate('/supply/supply-expense-form')}
                        type="button"
                    >
                        Add Expense
                    </button>
                    <select
                        id="status"
                        value={status}
                        onChange={statusHandleChange}
                        className="form-input w-48 text-xs"
                        name="status"
                        required
                    >
                        <option value="All">{`All (${data.length})`}</option>
                        {getOptions('expense_statuses').map((s, i) => (
                            <option key={i} value={s}>{`${s} (${data.filter(expense => expense.status === s).length})`}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="form-input w-48 text-xs"
                    />
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expense Head</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expense Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Raised By</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">GST</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Total (after GST)</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr>
                                    <td colSpan="13" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading...</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((expenseItem, i) => (
                                <tr key={expenseItem.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseItem?.propertyName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseItem?.headOfExpense}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseItem?.expenseType}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseItem?.category}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseItem?.expenseRaisedEmail}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseItem?.amount}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseItem?.gst || 'NA'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        {Number(expenseItem?.amount) + (isNaN(Number(expenseItem?.gst)) ? 0 : Number(expenseItem?.gst))}
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseItem?.paymentType || 'NA'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(expenseItem?.createdAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(expenseItem?.updatedAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseItem?.status}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="13" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </DashPage>
    );
}

export default ExpenseTable;
