import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { FaEye } from "react-icons/fa";
import { UseCSVDownload } from '../UseCSVDownload';

function TenantsTable({ isExpanded, setIsExpanded }) {
    const downloadCSV = UseCSVDownload();
    const navigate = useNavigate();
    const location = useLocation();
    const bedsData = location?.state?.bedsData || {};
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = bedsData.filter(item => {
        const searchTermLower = searchTerm.toLowerCase();

        const fieldsToSearch = [
            item.roomNo,
            item.roomType,
            item.bedLabel,
            item.tenant_data?.residentsName,
            item.tenant_data?.phoneNumber,
            item.tenant_data?.email,
        ];

        return fieldsToSearch.some(field =>
            field && String(field).toLowerCase().includes(searchTermLower)
        );
    });

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

    const outputData = bedsData.map(data => ({
        'Flat Number': data?.roomNo,
        'Flat Type': data?.roomType,
        'Room Number': data?.bedLabel,
        'Resident Name': data?.tenant_data?.residentsName,
        'Phone Number': data?.tenant_data?.phoneNumber,
        'Email ID': data?.tenant_data?.email,
    }));

    const viewTenantDataHandle = (bedData) => {
        return navigate(`/sales/sales-tenant-details/${bedData?.tenant_data?.id}`, { state: { bedData, bedsData, flag: true } });
    };

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-5`}>
                    <div className="max-w-6xl mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800">
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">TENANTS DATA TABLE</h1>

                        <div className="sm:flex justify-between">
                            <div className="sm:flex gap-2">
                                <button
                                    className="block max-sm:w-full mb-3 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] text-xs sm:text-sm" onClick={() => navigate(`/sales/sales-beds-table`)}
                                    type="button">Prev</button>

                                <button
                                    className="block max-sm:w-full mb-3 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] text-xs sm:text-sm" onClick={() => downloadCSV(outputData, 'Tenants_Data.csv')}
                                    type="button">Export Data</button>
                            </div>

                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="block my-2 text-black max-sm:w-full p-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs"
                            />
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse shadow-md rounded-lg max-sm:text-xs">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700">
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Flat Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Flat Type</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Room Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Resident Name</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Phone Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Email</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">View Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.map((bedData, i) => (
                                        <tr className="" key={bedData.id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData.roomNo}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData.roomType}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData.bedLabel}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData?.tenant_data?.residentsName}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData?.tenant_data?.phoneNumber}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData?.tenant_data?.email}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                <div className="flex justify-evenly">
                                                    <FaEye className="block hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewTenantDataHandle(bedData)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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

export default TenantsTable