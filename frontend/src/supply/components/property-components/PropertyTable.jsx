// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function PropertyTable() {
    const navigate = useNavigate();
    const [propertyData, setPropertyData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const { id = 0 } = useParams();

    const filteredData = propertyData.filter(item =>
        Object.entries(item).some(([key, value]) => {
            if (Array.isArray(value)) return false;
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const formatter = new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });

    useEffect(() => {
        setLoadingData(true);
        const fetchData = async () => {
            try {
                const response = await axios.get(`/supply/get-property-data/${id}/`);

                setPropertyData(response.data.property_table);
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [id]);

    const roomViewHandle = (property) => {
        navigate(`/supply/supply-room-table/${property?.id}`, { state: { owner_id: property.owner_id, propertyId: id } });
    };

    const editPropertyHandle = (property) => {
        navigate(`/supply/supply-property-details/${property?.id}`, { state: { propertyData: property, propertyId: id } });
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Supply Property Table</h1>
                <div className="flex items-center gap-2">
                    {id !== 0 && (
                        <button
                            className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                            onClick={() => navigate('/supply/supply-owner-table')}
                            type="button"
                        >
                            Prev
                        </button>
                    )}
                    <button
                        className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                        onClick={() => navigate((id === 0) ? `/supply/supply-owner-table` : `/supply/supply-property-form/${id}`)}
                        type="button"
                    >
                        Add Property
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">View Rooms</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr>
                                    <td colSpan="8" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading...</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((property, i) => (
                                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{property?.ownerName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{property?.serial_number}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{property?.propertyName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(property?.submittedDateAndTime))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(property?.updatedDateAndTime))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Eye
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => roomViewHandle(property)}
                                        />
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Pencil
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => editPropertyHandle(property)}
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

export default PropertyTable;
