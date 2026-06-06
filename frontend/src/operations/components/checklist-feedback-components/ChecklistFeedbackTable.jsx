// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, Copy, PlusCircle } from "lucide-react";
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function ChecklistFeedbackTable() {
    const navigate = useNavigate();
    const location = useLocation();

    const bedsData = location?.state?.bedsData || '';

    const [checklistFeedbackData, setChecklistFeedbackData] = useState([]);

    const [loadingData, setLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState(bedsData?.residentsName || "");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

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
                );
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewMoveInChecklistData = (data) => {
        navigate(`/operations/operations-moveinchecklist-data/${data?.residentId}`, { state: { data: data } });
    };

    const generateLink = (data, type) => {
        const params = new URLSearchParams({
            residentId: data?.residentId,
        }).toString();

        return type === 'moveInFeedback'
            ? (`${window.location.origin}/operations/operations-moveinfeedback-form/${data?.residentId}?${params}`)
            : (`${window.location.origin}/operations/operations-moveoutfeedback-form/${data?.residentId}?${params}`);
    };

    const viewMoveInFeedbackData = async (data) => {
        if (data?.moveInFeedbackStatus) {
            navigate(`/operations/operations-moveinfeedback-data/${data?.residentId}`, { state: { data: data } });
        } else {
            const link = generateLink(data, 'moveInFeedback');
            await navigator.clipboard.writeText(link);
            alert('Link copied successfully!');
        }
    };

    const viewMoveOutChecklistData = (data) => {
        (data?.moveOutChecklistStatus)
            ? navigate(`/operations/operations-moveoutchecklist-data/${data?.residentId}`, { state: { data } })
            : navigate(`/operations/operations-moveoutchecklist-form/${data?.residentId}`, { state: { data } });
    };

    const viewMoveOutFeedbackData = async (data) => {
        if (data?.moveOutFeedbackStatus) {
            navigate(`/operations/operations-moveoutfeedback-data/${data?.residentId}`, { state: { data } });
        } else {
            const link = generateLink(data, 'moveOutFeedback');
            await navigator.clipboard.writeText(link);
            alert('Link copied successfully!');
        }
    };

    const statusBadge = (status) => {
        const base = "px-2 py-0.5 rounded-full text-xs font-medium";
        if (!status || status === 'Pending') return `${base} bg-yellow-100 text-yellow-700`;
        return `${base} bg-green-100 text-green-700`;
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Checklist &amp; Feedback</h1>
                <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="form-input w-48 text-xs"
                />
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">#</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Resident Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Room No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Bed</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Move-In Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Move-In Checklist</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Move-In Feedback</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Move-Out Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Move-Out Checklist</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Move-Out Feedback</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr>
                                    <td colSpan={11}>
                                        <div className="flex justify-center py-6">
                                            <div className="spinner" />
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((row, i) => (
                                    <tr className="hover:bg-gray-50 transition-colors" key={row.residentId || i}>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[200px] truncate">{row?.residentsName || '-'}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{row?.roomNo || '-'}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{row?.roomType || '-'}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{row?.bedLabel || '-'}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{row?.checkIn ? formatDateToDDMonYYYY(row.checkIn) : '-'}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="flex items-center gap-1.5">
                                                <span className={statusBadge(row?.moveInChecklistStatus)}>
                                                    {row?.moveInChecklistStatus || 'Pending'}
                                                </span>
                                                <Eye
                                                    size={14}
                                                    className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                    onClick={() => viewMoveInChecklistData(row)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="flex items-center gap-1.5">
                                                <span className={statusBadge(row?.moveInFeedbackStatus)}>
                                                    {row?.moveInFeedbackStatus || 'Pending'}
                                                </span>
                                                {row?.moveInFeedbackStatus ? (
                                                    <Eye
                                                        size={14}
                                                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                        onClick={() => viewMoveInFeedbackData(row)}
                                                    />
                                                ) : (
                                                    <Copy
                                                        size={14}
                                                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                        onClick={() => viewMoveInFeedbackData(row)}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{row?.checkOut ? formatDateToDDMonYYYY(row.checkOut) : '-'}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="flex items-center gap-1.5">
                                                <span className={statusBadge(row?.moveOutChecklistStatus)}>
                                                    {row?.moveOutChecklistStatus || 'Pending'}
                                                </span>
                                                {row?.moveOutChecklistStatus ? (
                                                    <Eye
                                                        size={14}
                                                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                        onClick={() => viewMoveOutChecklistData(row)}
                                                    />
                                                ) : (
                                                    <PlusCircle
                                                        size={14}
                                                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                        onClick={() => viewMoveOutChecklistData(row)}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <div className="flex items-center gap-1.5">
                                                <span className={statusBadge(row?.moveOutFeedbackStatus)}>
                                                    {row?.moveOutFeedbackStatus || 'Pending'}
                                                </span>
                                                {row?.moveOutFeedbackStatus ? (
                                                    <Eye
                                                        size={14}
                                                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                        onClick={() => viewMoveOutFeedbackData(row)}
                                                    />
                                                ) : (
                                                    <Copy
                                                        size={14}
                                                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                        onClick={() => viewMoveOutFeedbackData(row)}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={11} className="px-3 py-10 text-center text-gray-400">No data available</td>
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

export default ChecklistFeedbackTable;
