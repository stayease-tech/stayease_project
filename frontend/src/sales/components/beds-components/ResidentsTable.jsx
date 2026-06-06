// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye } from "lucide-react";
import { UseCSVDownload } from '../UseCSVDownload';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function residentsTable() {
    const downloadCSV = UseCSVDownload();
    const navigate = useNavigate();
    const location = useLocation();
    const bedsData = location?.state?.bedsData || {};
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredData = bedsData.filter(item => {
        const searchTermLower = searchTerm.toLowerCase();

        const fieldsToSearch = [
            item.roomNo,
            item.roomType,
            item.bedLabel,
            item.resident_data?.residentsName,
            item.resident_data?.phoneNumber,
            item.resident_data?.email,
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

    const outputData = bedsData.map(data => ({
        'Flat Number': data?.roomNo,
        'Flat Type': data?.roomType,
        'Room Number': data?.bedLabel,
        'Resident Name': data?.resident_data?.residentsName,
        'Phone Number': data?.resident_data?.phoneNumber,
        'Email ID': data?.resident_data?.email,
    }));

    const viewresidentDataHandle = (bedData) => {
        return navigate(`/sales/sales-resident-details/${bedData?.resident_data?.id}`, { state: { bedData, bedsData, flag: true } });
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Residents</h1>
                <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="form-input w-48 text-xs"
                />
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                    type="button"
                    onClick={() => navigate(`/sales/sales-beds-table`)}
                >
                    Prev
                </button>
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                    type="button"
                    onClick={() => downloadCSV(outputData, 'Residents_Data.csv')}
                >
                    Export Data
                </button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Flat Number</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Flat Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Room Number</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Resident Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Phone Number</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Email</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">View Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.length > 0 ? paginatedData.map((bedData, i) => (
                                <tr className="hover:bg-gray-50 transition-colors" key={bedData.id}>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedData.roomNo}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedData.roomType}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedData.bedLabel}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{bedData?.resident_data?.residentsName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedData?.resident_data?.phoneNumber}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{bedData?.resident_data?.email}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Eye
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => viewresidentDataHandle(bedData)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="px-3 py-4 text-center text-xs text-gray-400">No data available</td>
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

export default residentsTable;
