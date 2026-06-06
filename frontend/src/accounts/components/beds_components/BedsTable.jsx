// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil } from "lucide-react";
import axios from 'axios';
import { UseCSVDownload } from '../UseCSVDownload';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function BedsTable() {
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();

    const [bedsData, setBedsData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredData = bedsData.filter(item =>
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

    useEffect(() => {
        setLoadingData(true);

        const fetchData = async () => {
            try {
                const response = await axios.get(`/sales/get-beds-data/`);

                setBedsData(
                    (response?.data?.beds_table || [])
                        .filter(item => item?.salesStatus === "Completed" && item?.resident_data?.residentStatus === 'Active')
                        .sort((a, b) => {
                            if (a.roomNo !== b.roomNo) {
                                return a.roomNo.localeCompare(b.roomNo);
                            }
                            return a.bedLabel.localeCompare(b.bedLabel);
                        })
                );
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewAgreementHandle = (bedData) => {
        navigate(`/accounts/accounts-agreement-pdf/${bedData?.resident_data?.id}`, { state: { bedData, type: 'BedsTable' } });
    }

    const outputData = bedsData.map(data => ({
        ['Property Name']: data.propertyName,
        ['Property Type']: data.propertyType,
        ['Property Address']: `${data.doorBuilding}, ${data.streetAddress}, ${data.area}, ${data.state}, ${data.city} - ${data.pincode}.`,
        ['Building Level']: data.buildingLevel,
        ['Flat Number']: data.roomNo,
        ['Flat Type']: data.roomType,
        ['Room Number']: data.bedLabel,
        ['Property Manager']: data?.resident_data?.propertyManager,
        ['Sales Manager']: data?.resident_data?.salesManager,
        ['Comfort Class']: data?.resident_data?.comfortClass,
        ['Meal Type']: data?.resident_data?.mealType,
        ['Resident Name']: data?.resident_data?.residentsName,
        ['Phone Number']: data?.resident_data?.phoneNumber,
        ['Email ID']: data?.resident_data?.email,
        ['KYC Type']: data?.resident_data?.kycType,
        ['Aadhar Number']: data?.resident_data?.aadharNumber,
        ['Aadhar Status']: data?.resident_data?.aadharStatus,
        ['PAN Number']: data?.resident_data?.panNumber,
        ['PAN Status']: data?.resident_data?.panStatus,
        ['Check-In']: data?.resident_data?.checkIn,
        ['Check-Out']: data?.resident_data?.checkOut,
        ['Total Deposit Paid']: data?.resident_data?.totalDepositPaid,
        ['Rent Per Month']: data?.resident_data?.rentPerMonth
    }))

    const updateBedsDataHandle = (bedData) => {
        navigate(`/accounts/accounts-beds-details/${bedData?.resident_data?.id}`, { state: { bedData } });
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Rental Tracking Table</h1>
                <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="form-input w-48 text-xs"
                />
            </div>

            <div className="flex items-center mb-3">
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                    onClick={() => downloadCSV(outputData, 'Beds_Data.csv')}
                    type="button"
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Resident Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Flat No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Flat Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Room No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Agreement</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Rent Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="8" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading…</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((bedData, i) => (
                                <tr className="hover:bg-gray-50 transition-colors" key={bedData.id}>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{bedData?.propertyName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{bedData?.resident_data?.residentsName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedData?.roomNo}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedData?.roomType}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{bedData?.bedLabel}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Eye
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => viewAgreementHandle(bedData)}
                                        />
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <span>{bedData?.resident_data?.rent_records[bedData?.resident_data?.rent_records.length - 1]?.rentStatus || 'NA'}</span>
                                            <Pencil
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => updateBedsDataHandle(bedData)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="8" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
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

export default BedsTable;
