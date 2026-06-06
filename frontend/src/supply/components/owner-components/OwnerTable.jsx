// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus } from "lucide-react";
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function OwnerTable() {
    const navigate = useNavigate();
    const [ownerData, setOwnerData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredData = ownerData.filter(item =>
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
            try {
                const response = await axios.get('/supply/get-owner-data/');

                setOwnerData(response.data.supply_table);
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const propertyViewHandle = (owner) => {
        navigate(`/supply/supply-property-table/${owner?.id}`);
    };

    const addPropertyHandle = (owner) => {
        navigate(`/supply/supply-property-form/${owner?.id}`);
    };

    const editOwnerHandle = (owner) => {
        navigate(`/supply/supply-owner-details/${owner?.id}`, { state: { ownerData: owner } });
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>StayEase Owner Table</h1>
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                        onClick={() => navigate('/supply/supply-owner-form')}
                        type="button"
                    >
                        Add Owner
                    </button>
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Owner Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Properties</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">View</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Add Property</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr>
                                    <td colSpan="8" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading...</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((owner, i) => (
                                <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{owner?.ownerName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{owner?.noOfProperties ?? 0}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(owner?.submittedDateAndTime))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(owner?.updatedDateAndTime))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Eye
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => propertyViewHandle(owner)}
                                        />
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Plus
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => addPropertyHandle(owner)}
                                        />
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Pencil
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => editOwnerHandle(owner)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
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

export default OwnerTable;
