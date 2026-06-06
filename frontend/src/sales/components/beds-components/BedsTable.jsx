// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, PlusCircle } from "lucide-react";
import axios from 'axios';
import { UseCSVDownload } from '../UseCSVDownload';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function BedsTable() {
    const { getOptions } = useDropdowns();
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();

    const [data, setData] = useState([]);
    const [bedsData, setBedsData] = useState([]);
    const [salesStatus, setSalesStatus] = useState('All');

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

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            setBedsData([]);

            try {
                const response = await axios.get(`/sales/get-beds-data/`);
                const bedsTable = response?.data?.beds_table || [];

                const sortedData = [...bedsTable].sort((a, b) => {
                    const roomCompare = a.roomNo.localeCompare(b.roomNo);
                    return roomCompare !== 0 ? roomCompare : a.bedLabel.localeCompare(b.bedLabel);
                });

                setData(sortedData);

                const filteredData = salesStatus === 'All'
                    ? sortedData
                    : sortedData.filter(bed => bed.salesStatus === salesStatus);

                setBedsData(filteredData);
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [salesStatus]);

    const salesStatusHandleChange = (e) => {
        setSalesStatus(e.target.value);
    };

    const viewAgreementHandle = (bedData) => {
        return navigate(`/sales/sales-agreement-pdf/${bedData?.resident_data?.id}`, { state: { bedData } });
    };

    const outputData = bedsData.map(data => ({
        'Property Name': data.propertyName,
        'Property Type': data.propertyType,
        'Property Address': `${data.doorBuilding}, ${data.streetAddress}, ${data.area}, ${data.state}, ${data.city} - ${data.pincode}.`,
        'Building Level': data.buildingLevel,
        'Flat Number': data.roomNo,
        'Flat Type': data.roomType,
        'Room Number': data.bedLabel,
        'Balcony Access': data.balconyAccess,
        'Bath Access': data.bathAccess,
        'Energy Plan': data.energyPlan,
        'Hall Access': data.hallAccess,
        'Kitchen Access': data.kitchenAccess,
        'Room SQFT': data.roomSqft,
        'DTH Number': data.tataSkyNo,
        'Wifi Number': data.wifiNo,
        'Bescom Meter Number': data.bescomMeterNo,
        'Property Manager': data?.resident_data?.propertyManager,
        'Sales Manager': data?.resident_data?.salesManager,
        'Comfort Class': data?.resident_data?.comfortClass,
        'Meal Type': data?.resident_data?.mealType,
        'Resident Name': data?.resident_data?.residentsName,
        'Phone Number': data?.resident_data?.phoneNumber,
        'Email ID': data?.resident_data?.email,
        'KYC Type': data?.resident_data?.kycType,
        'Aadhar Number': data?.resident_data?.aadharNumber,
        'Aadhar Status': data?.resident_data?.aadharStatus,
        'PAN Number': data?.resident_data?.panNumber,
        'PAN Status': data?.resident_data?.panStatus,
        'Check-In': data?.resident_data?.checkIn,
        'Check-Out': data?.resident_data?.checkOut,
        'Total Deposit Paid': data?.resident_data?.totalDepositPaid,
        'Rent Per Month': data?.resident_data?.rentPerMonth,
    }));

    const viewresidentsDataHandle = (bedData) => {
        if (bedData?.resident_data && Object.keys(bedData.resident_data).length > 0) {
            const d = bedsData.filter(item => item.id === bedData.id);
            return navigate(`/sales/sales-residents-table/${bedData?.id}`, { state: { bedsData: d } });
        }
        return alert('No data available!');
    };

    const updateresidentDataHandle = (bedData) => {
        if (bedData.salesStatus === 'Completed') {
            return navigate(`/sales/sales-resident-details/${bedData?.resident_data?.id}`, { state: { bedData } });
        }
        return navigate(`/sales/sales-resident-form/${bedData?.id}`);
    };

    const statusColors = {
        Completed: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
    };

    const rentStatusColors = {
        Paid: 'bg-green-100 text-green-700',
        Unpaid: 'bg-red-100 text-red-700',
        Partial: 'bg-orange-100 text-orange-700',
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>View Beds</h1>
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
                    onClick={() => downloadCSV(outputData, 'Beds_Data.csv')}
                >
                    Export Data
                </button>
                <select
                    id="salesStatus"
                    value={salesStatus}
                    onChange={salesStatusHandleChange}
                    className="border border-gray-300 rounded text-xs px-2 py-1.5 text-black"
                    name="salesStatus"
                    required
                >
                    <option value="All">{`All (${data.length})`}</option>
                    {getOptions('sales_statuses').map((s, i) => (
                        <option key={i} value={s}>{`${s} (${data.filter(bed => bed.salesStatus === s).length})`}</option>
                    ))}
                </select>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Address</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Building Level</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Flat No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Flat Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Room No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Resident Data</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Current Resident</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Agreement</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Rent Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr>
                                    <td colSpan="12" className="px-3 py-4 text-center text-xs text-gray-400">Loading…</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((bed, i) => {
                                const rentStatus = bed?.salesStatus === 'Completed' && bed?.resident_data?.residentStatus === 'Active' && bed?.resident_data?.rent_records?.length > 0
                                    ? bed.resident_data.rent_records[bed.resident_data.rent_records.length - 1]?.rentStatus
                                    : 'NA';
                                return (
                                    <tr className="hover:bg-gray-50 transition-colors" key={bed.id}>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{bed.propertyName}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{bed.propertyType}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{`${bed.doorBuilding}, ${bed.streetAddress}, ${bed.area}, ${bed.state}, ${bed.city} - ${bed.pincode}.`}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{bed.buildingLevel}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{bed.roomNo}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{bed.roomType}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{bed.bedLabel}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <Eye
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => viewresidentsDataHandle(bed)}
                                            />
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            {bed.salesStatus === 'Completed' ? (
                                                <button
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                                                    onClick={() => updateresidentDataHandle(bed)}
                                                >
                                                    <Pencil size={11} /> Edit
                                                </button>
                                            ) : (
                                                <button
                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#D4A017] text-white rounded hover:bg-[#B8860B] transition-colors cursor-pointer"
                                                    onClick={() => updateresidentDataHandle(bed)}
                                                >
                                                    <PlusCircle size={11} /> Add
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <Eye
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => bed.salesStatus === 'Pending'
                                                    ? alert('Currently there is no resident allocated to generate the agreement!')
                                                    : viewAgreementHandle(bed)}
                                            />
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${rentStatusColors[rentStatus] || 'bg-gray-100 text-gray-600'}`}>
                                                {rentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="12" className="px-3 py-4 text-center text-xs text-gray-400">No data available</td>
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

export default BedsTable;
