// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import axios from 'axios';
import { UseCSVDownload } from '../UseCSVDownload';
import { formatIndianPhone } from "../../../shared/phone";
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function LeadTable() {
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();

    const [leadData, setLeadData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredData = leadData.filter(item =>
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
        timeZoneName: 'short',
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/sales/get-leads-data/');
                setLeadData(response?.data.leads_table || []);
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const outputData = leadData.map(data => ({
        'Lead Date': data.leadDate,
        'Lead Source': data.leadSource,
        'Name': data.name,
        'Contact': formatIndianPhone(data.contact),
        'Email': data.email,
        'Lead Status': data.leadResult,
        'Not Converted Reason': data.notConvertedReason,
        'Created At': data.createdAt,
        'Updated At': data.updatedAt,
    }));

    const editLeadHandle = (lead) => {
        navigate(`/sales/sales-leads-details/${lead?.id}`, { state: { leadData: lead } });
    };

    const leadStatusColors = {
        Converted: 'bg-green-100 text-green-700',
        'Not Converted': 'bg-red-100 text-red-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Followup: 'bg-blue-100 text-blue-700',
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Leads</h1>
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
                    onClick={() => navigate('/sales/sales-leads-form')}
                >
                    Add Lead
                </button>
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                    type="button"
                    onClick={() => downloadCSV(outputData, 'leads_data.csv')}
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Lead Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Lead Source</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Contact</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Email</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Lead Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Not Converted Reason</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Created At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Edit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr>
                                    <td colSpan="11" className="px-3 py-4 text-center text-xs text-gray-400">Loading…</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((lead, i) => (
                                <tr className="hover:bg-gray-50 transition-colors" key={lead.id}>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{lead?.leadDate}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{lead?.leadSource}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{lead?.name}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatIndianPhone(lead?.contact)}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{lead?.email}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${leadStatusColors[lead?.leadResult] || 'bg-gray-100 text-gray-600'}`}>
                                            {lead?.leadResult}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{lead?.notConvertedReason || '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatter.format(new Date(lead?.createdAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatter.format(new Date(lead?.updatedAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <Pencil
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => editLeadHandle(lead)}
                                        />
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="11" className="px-3 py-4 text-center text-xs text-gray-400">No data available</td>
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

export default LeadTable;
