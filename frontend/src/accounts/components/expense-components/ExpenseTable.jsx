import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { UseCSVDownload } from '../UseCSVDownload';
import axios from 'axios';

function ExpenseTable({ isExpanded, setIsExpanded }) {
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
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-5`}>
                    <div className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800">
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">{type === 'vendor' ? 'VENDOR-WISE EXPENSE TABLE' : 'PROPERTY-WISE EXPENSE TABLE'}</h1>

                        <div className={`${type === 'vendor' ? 'hidden' : 'flex justify-center items-center p-1 md:mb-5 gap-3'}`}>
                            <button
                                className={`px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm transition-colors ${activeOption === 'Expense'
                                    ? 'bg-[#B8860B] text-white'
                                    : 'hover:bg-[#B8860B]'
                                    }`}
                                onClick={() => setActiveOption('Expense')}
                            >
                                Expense
                            </button>

                            <button
                                className={`px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm transition-colors ${activeOption === 'Fixed Expense'
                                    ? 'bg-[#B8860B] text-white'
                                    : 'hover:bg-[#B8860B]'
                                    }`}
                                onClick={() => setActiveOption('Fixed Expense')}
                            >
                                Fixed Expense
                            </button>
                        </div>

                        <div className="sm:flex justify-between">
                            <button
                                className={`${type === 'vendor' ? 'block max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm' : 'hidden'}`} onClick={() => navigate('/accounts/accounts-vendor-table')}
                                type="button">Prev</button>

                            <div className={`${type === 'vendor' ? 'hidden' : 'flex justify-between sm:space-x-3'}`}>
                                <button
                                    className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() =>
                                        navigate('/accounts/accounts-expense-form', { state: { activeOption } })
                                    }
                                    type="button">
                                    {activeOption === 'Expense' ? 'Add Expense' : 'Add Fixed Expense'}</button>

                                <button
                                    className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => downloadCSV(outputData, 'expense_data.csv')}
                                    type="button">Export Data</button>
                            </div>

                            <div className="flex gap-2">
                                <select id="status" value={status} onChange={statusHandleChange} className="block mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="status" required>
                                    <option value="All">{`All (${data.length})`}</option>
                                    <option value="Pending">{`Pending (${data.filter(expense =>
                                        expense.status === 'Pending'
                                    ).length})`}</option>
                                    <option value="Approved">{`Approved (${data.filter(expense =>
                                        expense.status === 'Approved'
                                    ).length})`}</option>
                                    <option value="Rejected">{`Rejected (${data.filter(expense =>
                                        expense.status === 'Rejected'
                                    ).length})`}</option>
                                    <option value="Completed">{`Completed (${data.filter(expense =>
                                        expense.status === 'Completed'
                                    ).length})`}</option>
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
                            {activeOption === 'Expense' &&
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
                                            <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Update Status</th>
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
                                                <td className="border border-gray-300 px-4 py-2 text-center">{Number(expenseData?.amount) + (isNaN(Number(expenseData?.gst)) ? 0 : Number(expenseData?.gst))}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.paymentType || 'NA'}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{formatter.format(new Date(expenseData?.createdAt))}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{formatter.format(new Date(expenseData?.updatedAt))}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">
                                                    <div className="flex justify-evenly">
                                                        <div>{expenseData?.status}</div>
                                                        <FaEdit className="hover:text-[#D4A017] text-lg sm:text-xl hover:cursor-pointer" onClick={() => updateExpenseStatus(expenseData)} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : <tr>
                                            <td colSpan="13" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
                                        </tr>}
                                    </tbody>
                                </table>
                            }

                            {activeOption === 'Fixed Expense' &&
                                <table className="min-w-full table-auto border-collapse shadow-md rounded-lg max-sm:text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-700">
                                            <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                            <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Expense Raised Email</th>
                                            <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Property Name</th>
                                            <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Owner Name</th>
                                            <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Created At</th>
                                            <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Updated At</th>
                                            <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">View/Update Expense Details</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedData.length > 0 ? paginatedData.map((expenseData, i) => (
                                            <tr className="" key={expenseData.id}>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.expenseRaisedEmail}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.propertyName}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.owner}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">{expenseData?.createdAt ? formatter.format(new Date(expenseData.createdAt)) : "-"}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">
                                                    {expenseData?.updatedAt ? formatter.format(new Date(expenseData.updatedAt)) : "-"}</td>
                                                <td className="border border-gray-300 px-4 py-2 text-center">
                                                    <div className="flex justify-evenly">
                                                        <div className="flex justify-evenly">
                                                            <div>{expenseData?.status}</div>
                                                            <FaEdit className="hover:text-[#D4A017] text-lg sm:text-xl hover:cursor-pointer" onClick={() => viewFixedExpenseTable(expenseData)} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : <tr>
                                            <td colSpan="7" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
                                        </tr>}
                                    </tbody>
                                </table>
                            }
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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExpenseTable