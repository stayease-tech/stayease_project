// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function LiabilityTable() {
    const navigate = useNavigate();

    const [bedsData, setBedsData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

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

    const formatter = { format: (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleString('en-IN', { month: 'short' });
        const year = d.getFullYear();
        const hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        const h12 = String(hours % 12 || 12).padStart(2, '0');
        return `${day} ${month} ${year}, ${h12}:${minutes}:${seconds} ${ampm}`;
    }};

    useEffect(() => {
        setLoadingData(true);

        const fetchData = async () => {
            try {
                const response = await axios.get(`/accounts/get-checked-out-residents/`);

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
        <DashPage>
            <div className="page-header">
                <h1>Liability Data Table</h1>
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Guest Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Check-in</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Check-out</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Agreement</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">KYC Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Front Copy</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Back Copy</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Deposit</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Deductions</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Net Payout</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Payout Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="16" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading…</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((bedsData, i) => (
                                <tr className="hover:bg-gray-50 transition-colors" key={bedsData.id}>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{bedsData?.propertyName || '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{bedsData?.residentsName || '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{bedsData?.checkIn ? formatDateToDDMonYYYY(bedsData?.checkIn) : '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{bedsData?.checkOut ? formatDateToDDMonYYYY(bedsData?.checkOut) : '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <div className="flex items-center gap-1">
                                            <span>View</span>
                                            <Eye
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => viewAgreementHandle(bedsData)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedsData?.kycType || '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        {bedsData?.kycType === 'Aadhar' ? (
                                            <Link
                                                to={typeof bedsData?.aadharFrontCopy === 'string' ? bedsData?.aadharFrontCopy : bedsData?.aadharFrontCopy ? URL.createObjectURL(bedsData?.aadharFrontCopy) : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-[#D4A017]"
                                            >
                                                {(bedsData?.aadharFrontCopy || '').split('/')[8] || '-'}
                                            </Link>
                                        ) : (
                                            <Link
                                                to={typeof bedsData?.panFrontCopy === 'string' ? bedsData?.panFrontCopy : bedsData?.panFrontCopy ? URL.createObjectURL(bedsData?.panFrontCopy) : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-[#D4A017]"
                                            >
                                                {(bedsData?.panFrontCopy || '').split('/')[8] || '-'}
                                            </Link>
                                        )}
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        {bedsData?.kycType === 'Aadhar' ? (
                                            <Link
                                                to={typeof bedsData?.aadharBackCopy === 'string' ? bedsData?.aadharBackCopy : bedsData?.aadharBackCopy ? URL.createObjectURL(bedsData?.aadharBackCopy) : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-[#D4A017]"
                                            >
                                                {(bedsData?.aadharBackCopy || '').split('/')[8] || '-'}
                                            </Link>
                                        ) : (
                                            <Link
                                                to={typeof bedsData?.panBackCopy === 'string' ? bedsData?.panBackCopy : bedsData?.panBackCopy ? URL.createObjectURL(bedsData?.panBackCopy) : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-[#D4A017]"
                                            >
                                                {(bedsData?.panBackCopy || '').split('/')[8] || '-'}
                                            </Link>
                                        )}
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedsData?.totalDepositPaid || '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedsData?.residentDeductions || '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{(Number(bedsData?.totalDepositPaid) - Number(bedsData?.residentDeductions)) || 0}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{bedsData?.payoutDate ? formatDateToDDMonYYYY(bedsData?.payoutDate) : '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <div className="flex items-center gap-2">
                                            {bedsData?.status ? (
                                                <>
                                                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 whitespace-nowrap">{bedsData?.status}</span>
                                                    <Pencil
                                                        size={14}
                                                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                        onClick={() => updateLiabilityStatus(bedsData)}
                                                    />
                                                </>
                                            ) : (
                                                <button
                                                    className="px-2 py-0.5 text-xs bg-[#D4A017] text-white rounded hover:bg-[#B8860B] cursor-pointer whitespace-nowrap"
                                                    onClick={() => updateLiabilityStatus(bedsData)}
                                                >
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{bedsData?.createdAt ? formatter.format(new Date(bedsData?.createdAt)) : "-"}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{bedsData?.updatedAt ? formatter.format(new Date(bedsData?.updatedAt)) : "-"}</td>
                                </tr>
                            )) : (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="16" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
        </DashPage>
    );
}

export default LiabilityTable;
