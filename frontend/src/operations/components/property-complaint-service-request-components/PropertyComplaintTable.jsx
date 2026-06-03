import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDropdowns } from "../../../shared/DropdownContext";

function PropertyComplaintTable({ isExpanded, setIsExpanded }) {
    const { getOptions } = useDropdowns();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [propertyComplaintData, setPropertyComplaintData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [status, setStatus] = useState('All');

    const statusFilteredData = propertyComplaintData.filter(item =>
        status === 'All' ? true : item.status === status
    );

    const filteredData = (statusFilteredData || []).filter(item =>
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
            try {
                const response = await axios.get('/operations/get-propertycomplaint-data/');

                setPropertyComplaintData(response?.data?.complaints_array)
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewPropertyComplaintData = (data) => {
        navigate(`/operations/operations-propertycomplaint-data/${data?.id}`, { state: { data } })
    };

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-5`}>
                    <div className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800">
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">PROPERTY COMPLAINT & SERVICE REQUEST TABLE</h1>

                        <div className="sm:flex justify-end">
                            <div className="flex gap-2">
                                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="block mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="status" required>
                                    <option value="All">{`All (${propertyComplaintData.length})`}</option>
                                    {getOptions('complaint_statuses').map((s, i) => (
                                        <option key={i} value={s}>{`${s} (${propertyComplaintData.filter(complaint => complaint.status === s).length})`}</option>
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
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Ticket Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Resident Name</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Room No.</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Phone Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Category</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Items</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Preferred Time</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Issue Description</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Submitted At</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Status</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Assign Vendor</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((propertyComplaintData, i) => (
                                        <tr className="" key={propertyComplaintData.id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.ticket_number || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.residentsName || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.roomNo || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.phoneNumber || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.category_type || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.items || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.preferredTime || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.issue_desc || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.submittedDateAndTime ? formatter.format(new Date(propertyComplaintData?.submittedDateAndTime)) : '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{propertyComplaintData?.status || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center mx-auto">
                                                <div className="flex justify-center">
                                                    <FaEdit className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewPropertyComplaintData(propertyComplaintData)} />
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr>
                                        <td colSpan="12" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PropertyComplaintTable