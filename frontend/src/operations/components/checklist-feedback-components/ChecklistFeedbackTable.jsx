import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation } from "react-router-dom";
import { IoMdAddCircle } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import axios from 'axios';

function ChecklistFeedbackTable({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const location = useLocation();

    const bedsData = location?.state?.bedsData || '';

    const [checklistFeedbackData, setChecklistFeedbackData] = useState([]);

    const [loadingData, setLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState(bedsData?.residentsName || "");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const mergedMap = new Map();

    checklistFeedbackData.forEach(obj => {
        const key = `${obj.residentsName}-${obj.roomNumber}`;

        if (!mergedMap.has(key)) {
            mergedMap.set(key, { residentsName: obj.residentsName, roomNumber: obj.roomNumber });
        }

        const existingObj = mergedMap.get(key);
        for (const [prop, value] of Object.entries(obj)) {
            if (prop !== 'residentsName' && prop !== 'roomNumber') {
                existingObj[prop] = value;
            }
        }
    });

    const filteredData = Array.from(mergedMap.values()).filter(item =>
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

    function formatDateToDDMonYYYY(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    const mergeData = (moveInChecklist_data, moveInFeedback_data, moveOutChecklist_data, moveOutFeedback_data) => {
        const allData = [
            ...moveInChecklist_data,
            ...moveInFeedback_data,
            ...moveOutChecklist_data,
            ...moveOutFeedback_data
        ];

        const merged = {};

        allData.forEach(item => {
            const key = `${item.residentsName}_${item.roomNo}`;

            if (!merged[key]) {
                merged[key] = { ...item };
            } else {
                merged[key] = {
                    ...merged[key],
                    ...item,
                    checkIn: merged[key].checkIn || item.checkIn,
                    checkOut: merged[key].checkOut || item.checkOut
                };
            }
        });

        setChecklistFeedbackData(Object.values(merged));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/operations/get-checklistfeedback-data/');

                mergeData(
                    response.data.moveInChecklist_data,
                    response.data.moveInFeedback_data,
                    response.data.moveOutChecklist_data,
                    response.data.moveOutFeedback_data
                )
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewMoveInChecklistData = (data) => {
        navigate(`/operations/operations-moveinchecklist-data/${data?.tenantId}`, { state: { data: data } });
    };

    const generateLink = (data, type) => {
        const params = new URLSearchParams({
            tenantId: data?.tenantId,
        }).toString();

        return type === 'moveInFeedback' ? (`${window.location.origin}/operations/operations-moveinfeedback-form/${data?.tenantId}?${params}`) : (`${window.location.origin}/operations/operations-moveoutfeedback-form/${data?.tenantId}?${params}`)
    };

    const viewMoveInFeedbackData = async (data) => {
        if (data?.moveInFeedbackStatus) {
            navigate(`/operations/operations-moveinfeedback-data/${data?.tenantId}`, { state: { data: data } });
        } else {
            const link = generateLink(data, 'moveInFeedback');
            await navigator.clipboard.writeText(link);

            alert('Link copied successfully!');
        }
    };

    const viewMoveOutChecklistData = (data) => {
        (data?.moveOutChecklistStatus) ?
            navigate(`/operations/operations-moveoutchecklist-data/${data?.tenantId}`, { state: { data } })
            :
            navigate(`/operations/operations-moveoutchecklist-form/${data?.tenantId}`, { state: { data } });

    };

    const viewMoveOutFeedbackData = async (data) => {
        if (data?.moveOutFeedbackStatus) {
            navigate(`/operations/operations-moveoutfeedback-data/${data?.tenantId}`, { state: { data } });
        } else {
            const link = generateLink(data, 'moveOutFeedback');
            await navigator.clipboard.writeText(link);

            alert('Link copied successfully!');
        }
    };

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-5`}>
                    <div className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800">
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">RESIDENT CHECKLIST & FEEDBACK TABLE</h1>

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
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Resident Name</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Flat Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Flat Type</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Room No.</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Move-In Date</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Move-In Checklist Data</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Move-In Feedback Data</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Move-Out Date</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Move-Out Checklist Data</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Move-Out Feedback Data</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((checklistFeedbackData, i) => (
                                        <tr className="" key={checklistFeedbackData.id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{checklistFeedbackData?.residentsName || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{checklistFeedbackData?.roomNo || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{checklistFeedbackData?.roomType || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{checklistFeedbackData?.bedLabel || '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{checklistFeedbackData?.checkIn ? formatDateToDDMonYYYY(checklistFeedbackData?.checkIn) : '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center mx-auto">
                                                <div className="flex justify-between">
                                                    <div>{checklistFeedbackData?.moveInChecklistStatus}</div>
                                                    <FaEye className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewMoveInChecklistData(checklistFeedbackData)} />
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center mx-auto">
                                                {(checklistFeedbackData?.moveInFeedbackStatus) ?
                                                    <div className="flex justify-between">
                                                        <div>{checklistFeedbackData?.moveInFeedbackStatus}</div>
                                                        <FaEye className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewMoveInFeedbackData(checklistFeedbackData)} />
                                                    </div>
                                                    :
                                                    <div className="flex justify-between">
                                                        <div>Pending</div>
                                                        <FaCopy className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewMoveInFeedbackData(checklistFeedbackData)} />
                                                    </div>}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{checklistFeedbackData?.checkOut ? formatDateToDDMonYYYY(checklistFeedbackData?.checkOut) : '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center mx-auto">
                                                {(checklistFeedbackData?.moveOutChecklistStatus) ?
                                                    <div className="flex justify-between">
                                                        <div>{checklistFeedbackData?.moveOutChecklistStatus}</div>
                                                        <FaEye className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewMoveOutChecklistData(checklistFeedbackData)} />
                                                    </div>
                                                    :
                                                    <div className="flex justify-between">
                                                        <div>Pending</div>
                                                        <IoMdAddCircle className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewMoveOutChecklistData(checklistFeedbackData)} />
                                                    </div>}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center mx-auto">
                                                {(checklistFeedbackData?.moveOutFeedbackStatus) ?
                                                    <div className="flex justify-between">
                                                        <div>{checklistFeedbackData?.moveOutFeedbackStatus}</div>
                                                        <FaEye className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewMoveOutFeedbackData(checklistFeedbackData)} />
                                                    </div>
                                                    :
                                                    <div className="flex justify-between">
                                                        <div>Pending</div>
                                                        <FaCopy className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewMoveOutFeedbackData(checklistFeedbackData)} />
                                                    </div>}
                                            </td>
                                        </tr>
                                    )) : <tr>
                                        <td colSpan="11" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
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

export default ChecklistFeedbackTable