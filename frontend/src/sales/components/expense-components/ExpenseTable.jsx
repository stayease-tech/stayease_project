import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function ExpenseTable() {
    const { getOptions } = useDropdowns();
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [status, setStatus] = useState('All');

    const [loadingData, setLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
                const response = await axios.get('/accounts/get-expense-data/');

                setData((response?.data?.expense_table || []).filter(expense =>
                    expense?.dashboardUser === 'sales'
                ) || []);

                setExpenseData((response?.data?.expense_table || []).filter(expense =>
                    expense?.dashboardUser === 'sales'
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
        setStatus(e.target.value)

        setExpenseData((prevData) => (
            prevData.filter(expense =>
                status === 'All' ? true : expense.status === status
            )
        ))
    }

    return (


        <DashPage>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">PROPERTY-WISE EXPENSE TABLE</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate('/sales/sales-expense-form')}
                                type="button">Add Expense</button>

                            <div className="flex gap-2">
                                <select id="status" value={status} onChange={statusHandleChange} className="block mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="status" required>
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
                                    className="block mt-2 mb-3 text-black max-sm:w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs"
                                />
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse shadow-md rounded-lg max-sm:text-xs">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700">
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Property Name</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Expense Head</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Expense Type</th>
                                        <th className="border border-gray-300 py-2 px-4 border-b text-center">Category</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Expense Raised By</th>
                                        <th className="border border-gray-300 py-2 px-4 border-b text-center">Amount</th>
                                        <th className="border border-gray-300 py-2 px-4 border-b text-center">GST</th>
                                        <th className="border border-gray-300 py-2 px-4 border-b text-center">Total Amount after GST</th>
                                        <th className="border border-gray-300 py-2 px-4 border-b text-center">Payment Type</th>
                                        <th className="border border-gray-300 py-2 px-4 border-b text-center">Submitted At</th>
                                        <th className="border border-gray-300 py-2 px-4 border-b text-center">Last Updated</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((expenseData, i) => (
                                        <tr className="" key={expenseData.id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.propertyName}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.headOfExpense}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.expenseType}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.category}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.expenseRaisedEmail}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.amount}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.gst || 'NA'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                {Number(expenseData?.amount) + (isNaN(Number(expenseData?.gst)) ? 0 : Number(expenseData?.gst))}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.paymentType || 'NA'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{formatter.format(new Date(expenseData?.createdAt))}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{formatter.format(new Date(expenseData?.updatedAt))}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                {expenseData?.status}
                                            </td>
                                        </tr>
                                    )) : <tr>
                                        <td colSpan="13" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap justify-center items-center mt-4 gap-1 max-sm:gap-0.5">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white disabled:opacity-50 transition-colors duration-200"
                                aria-label="Previous page"
                            >
                                &lt;
                            </button>

                            <button
                                key={1}
                                onClick={() => handlePageChange(1)}
                                className={`flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded transition-colors duration-200 max-sm:text-xs ${currentPage === 1
                                    ? "bg-[#D4A017] text-white"
                                    : "bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white"
                                    }`}
                            >
                                1
                            </button>

                            {currentPage > 3 && (
                                <span className="flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 max-sm:text-xs">
                                    ...
                                </span>
                            )}

                            {Array.from({ length: Math.min(4, totalPages - 2) }, (_, i) => {
                                let page;
                                if (currentPage <= 3) {
                                    page = i + 2;
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }

                                if (page > 1 && page < totalPages) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded transition-colors duration-200 max-sm:text-xs ${currentPage === page
                                                ? "bg-[#D4A017] text-white"
                                                : "bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            {currentPage < totalPages - 2 && (
                                <span className="flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 max-sm:text-xs">
                                    ...
                                </span>
                            )}

                            {totalPages > 1 && (
                                <button
                                    key={totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                    className={`flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded transition-colors duration-200 max-sm:text-xs ${currentPage === totalPages
                                        ? "bg-[#D4A017] text-white"
                                        : "bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white"
                                        }`}
                                >
                                    {totalPages}
                                </button>
                            )}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white disabled:opacity-50 transition-colors duration-200 max-sm:text-xs"
                                aria-label="Next page"
                            >
                                &gt;
                            </button>
                        </div>


        </DashPage>


    )
}

export default ExpenseTable