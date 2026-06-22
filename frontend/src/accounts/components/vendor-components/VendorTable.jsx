// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus } from "lucide-react";
import { UseCSVDownload } from '../UseCSVDownload';
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function VendorTable() {
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();

    const [vendorData, setVendorData] = useState([]);

    const [loadingData, setLoadingData] = useState(false);

    const [outputData, setOutputData] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredData = vendorData.filter(item =>
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

    const formatter = new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/accounts/get-vendor-data/');

                setVendorData(response.data.vendor_table);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData()
    }, []);

    useEffect(() => {
        setOutputData(vendorData.map(data => ({
            'Vendor': data.vendor,
            'Contact': data.contact,
            'Category': data.category,
            'Billing Type': data.billingType,
            'Account Holder Name': data.accountHolderName,
            'Account Number': data.accountNumber,
            'Bank Name': data.bankName,
            'Bank Branch': data.bankBranch,
            'IFSC Code': data.ifscCode,
            'UPI Number': data.upiNumber,
            'Other Banking Details': data.otherBankingDetails,
            'Created At': data.createdAt,
            'Updated At': data.updatedAt,
        })))
    }, [vendorData]);

    const viewExpenseCategoryTable = (vendorData) => {
        vendorData.categories.length !== 0 ?
            navigate(`/accounts/accounts-expense-table/${vendorData?.id}`, { state: { type: 'vendor' } })
            :
            navigate(`/accounts/accounts-expense-form`, { state: { activeOption: 'Expense' } });
    };

    const editVendorDetails = (vendorData) => {
        navigate(`/accounts/accounts-vendor-data/${vendorData?.id}`, { state: { data: vendorData } });
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Vendor Data Table</h1>
                <input
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="form-input w-48 text-xs"
                />
            </div>

            <div className="flex items-center gap-2 mb-3">
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                    onClick={() => navigate('/accounts/accounts-vendor-form')}
                    type="button"
                >
                    Add Vendor
                </button>
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                    onClick={() => downloadCSV(outputData, 'vendor_data.csv')}
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Vendor</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Contact</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Billing Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Expenses</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="9" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading…</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((vendorData, i) => (
                                <tr className="hover:bg-gray-50 transition-colors" key={vendorData.id}>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{vendorData?.vendor}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{vendorData?.contact}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{vendorData?.category}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{vendorData?.billingType}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatter.format(new Date(vendorData?.createdAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatter.format(new Date(vendorData?.updatedAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        {vendorData.categories.length !== 0 ? (
                                            <Eye
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => viewExpenseCategoryTable(vendorData)}
                                            />
                                        ) : (
                                            <Plus
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => viewExpenseCategoryTable(vendorData)}
                                            />
                                        )}
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Pencil
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => editVendorDetails(vendorData)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="9" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
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

export default VendorTable;
