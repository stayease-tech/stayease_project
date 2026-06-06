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
                const response = await axios.get('/accounts/get-expense-data/');

                setData((response?.data?.expense_table || []).filter(expense =>
                    expense?.dashboardUser === 'operations'
                ) || []);

                setExpenseData((response?.data?.expense_table || []).filter(expense =>
                    expense?.dashboardUser === 'operations'
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
                        onClick={() => navigate('/operations/operations-expense-form')}
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expense Raised By</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Amount</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">GST</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Total after GST</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.length > 0 ? paginatedData.map((expenseData, i) => (
                                <tr key={expenseData.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.propertyName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.headOfExpense}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.expenseType}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.category}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{expenseData?.expenseRaisedEmail}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.amount}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.gst || 'NA'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        {Number(expenseData?.amount) + (isNaN(Number(expenseData?.gst)) ? 0 : Number(expenseData?.gst))}
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.paymentType || 'NA'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(expenseData?.createdAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(expenseData?.updatedAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{expenseData?.status}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="13" className="px-3 py-1.5 text-xs text-gray-800 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
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
