import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from 'axios';

function LiabilityTable({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();

    const [bedsData, setBedsData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = bedsData.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

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

    function formatDateToDDMonYYYY(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

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
        setLoadingData(true);

        const fetchData = async () => {
            try {
                const response = await axios.get(`/accounts/get-beds-data/`);

                setBedsData(
                    (response?.data?.beds_table || [])
                );

            } catch (err) {
                console.log(err.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewAgreementHandle = (residentData) => {
        navigate(`/accounts/accounts-agreement-pdf/${residentData?.residentId}`, { state: { residentData, type: 'LiabilityTable' } });
    }

    const updateLiabilityStatus = async (residentData) => {
        (!residentData?.status) ? navigate(`/accounts/accounts-liability-form/${residentData?.residentId}`, { state: { residentData } }) : navigate(`/accounts/accounts-liability-data/${residentData?.id}`, { state: { residentData } });
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <Navbar isExpanded={isExpanded} />

            <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-5`}>
                <div className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800">
                    <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">LIABILITY DATA TABLE</h1>

                    <div className="sm:flex justify-end">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="block mt-2 mb-3 text-black max-sm:w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs"
                        />
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse shadow-md rounded-lg max-sm:text-xs">
                            <thead>
                                <tr className="bg-gray-50 text-gray-700">
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">No.</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Property Name</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Guest Name</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Check‑in Date</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Check‑out Date</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Agreement</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">KYC Type</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Front Copy</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Back Copy</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Deposit</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Deductions</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Net Payout</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Payout Date</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Update Status</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Submitted At</th>
                                    <th className="border border-gray-300 py-2 px-4 border-b text-center">Last Updated</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedData.length > 0 ? paginatedData.map((bedsData, i) => (
                                    <tr className="" key={bedsData.id}>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.propertyName || '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.residentsName || '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.checkIn ? formatDateToDDMonYYYY(bedsData?.checkIn) : '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.checkOut ? formatDateToDDMonYYYY(bedsData?.checkOut) : '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <div className="flex justify-evenly">
                                                <div>View</div>
                                                <FaEye className="block hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewAgreementHandle(bedsData)} />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.kycType || '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{(bedsData?.kycType === 'Aadhar' ?
                                            <Link to={
                                                typeof bedsData?.aadharFrontCopy === 'string'
                                                    ? bedsData?.aadharFrontCopy
                                                    : bedsData?.aadharFrontCopy
                                                        ? URL.createObjectURL(bedsData?.aadharFrontCopy)
                                                        : '#'
                                            } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                {(bedsData?.aadharFrontCopy || '').split('/')[8] || '-'}
                                            </Link>
                                            :
                                            <Link to={
                                                typeof bedsData?.panFrontCopy === 'string'
                                                    ? bedsData?.panFrontCopy
                                                    : bedsData?.panFrontCopy
                                                        ? URL.createObjectURL(bedsData?.panFrontCopy)
                                                        : '#'
                                            } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                {(bedsData?.panFrontCopy || '').split('/')[8] || '-'}
                                            </Link>)}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{(bedsData?.kycType === 'Aadhar' ?
                                            <Link to={
                                                typeof bedsData?.aadharBackCopy === 'string'
                                                    ? bedsData?.aadharBackCopy
                                                    : bedsData?.aadharBackCopy
                                                        ? URL.createObjectURL(bedsData?.aadharBackCopy)
                                                        : '#'
                                            } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                {(bedsData?.aadharBackCopy || '').split('/')[8] || '-'}
                                            </Link>
                                            :
                                            <Link to={
                                                typeof bedsData?.panBackCopy === 'string'
                                                    ? bedsData?.panBackCopy
                                                    : bedsData?.panBackCopy
                                                        ? URL.createObjectURL(bedsData?.panBackCopy)
                                                        : '#'
                                            } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                {(bedsData?.panBackCopy || '').split('/')[8] || '-'}
                                            </Link>)}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.totalDepositPaid || '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.residentDeductions || '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{(Number(bedsData?.totalDepositPaid) - Number(bedsData?.residentDeductions)) || 0}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.payoutDate ? formatDateToDDMonYYYY(bedsData?.payoutDate) : '-'}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <div className="flex justify-evenly">
                                                {bedsData?.status && <div>{bedsData?.status}</div>}

                                                <FaEdit className="block hover:text-[#D4A017] text-lg sm:text-xl hover:cursor-pointer" onClick={() => updateLiabilityStatus(bedsData)} />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.createdAt ? formatter.format(new Date(bedsData?.createdAt)) : "-"}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.updatedAt ? formatter.format(new Date(bedsData?.updatedAt)) : "-"}</td>
                                    </tr>
                                )) : <tr>
                                    <td colSpan="16" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
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
    )
}

export default LiabilityTable