// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { UseCSVDownload } from "../UseCSVDownload";
import Papa from 'papaparse';
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function RawdataTable() {
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();
    const id = useParams();

    const [rows, setRows] = useState([]);
    const [rawdata, setRawdata] = useState([]);

    const [loadingData, setLoadingData] = useState(false);

    const [outputData, setOutputData] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    let keysToCompare = [];

    if (rawdata.length !== 0) {
        keysToCompare = ['Date', 'Desc', 'Type', 'balance', 'Debit', 'credit'];
    }

    const mergedArray = rows.map(obj1 => {
        const matchedObj = rawdata.find(obj2 =>
            keysToCompare.every(key => obj1[key] === obj2[key])
        );

        return {
            ...obj1,
            id: matchedObj?.id || "",
            createdAt: matchedObj?.createdAt || "",
            updatedAt: matchedObj?.updatedAt || "",
            status: matchedObj?.status || "Pending"
        };
    });

    const filteredData = (rawdata.length === 0) ? rows.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : mergedArray.filter(item =>
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
                const response = await axios.get(`/accounts/get-rawdata-content/${id.id}/`);

                if (response.data.success) {
                    setRawdata(response.data.rawdata);

                    const fileUrl = response.data.file_url;

                    const fileResponse = await fetch(fileUrl);
                    const csvText = await fileResponse.text();

                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const dataArray = results.data;
                            setRows(dataArray);
                        },
                        error: (error) => {
                            console.error("Error parsing CSV:", error);
                        }
                    });
                }

            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [id.id]);

    useEffect(() => {
        setOutputData(rawdata.map(data => ({
            'Date': data.Date,
            'Description': data.Desc,
            'Type': data.Type,
            'Balance': data.balance,
            'Debit': data.Debit,
            'Credit': data.credit,
            'Property Name': data.propertyName,
            'Head of Expense': data.headOfExpense,
            'Expense Type': data.expenseType,
            'Category': data.category,
            'Status': data.status,
            'Comments': data.comments,
            'Receipt': data.receipt,
            'Created At': data.createdAt,
            'Updated At': data.updatedAt,
        })))
    }, [rawdata]);


    const viewRawDataForm = (rawData) => {
        (rawData.status === 'Completed') ? navigate(`/accounts/accounts-rawdata-data/${rawData.id}`, { state: { data: rawdata.find(item => item.id === rawData.id) } }) : navigate(`/accounts/accounts-rawdata-form/${id.id}`, { state: { data: rawData } });
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Rawdata Table</h1>
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
                    onClick={() => navigate('/accounts/accounts-rawdatafile-table')}
                    type="button"
                >
                    Prev
                </button>
                <button
                    className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] transition-colors"
                    onClick={() => downloadCSV(outputData, 'rawdata.csv')}
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Description</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Debit</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Credit</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Balance</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="10" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading…</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((data, index) => (
                                <tr className="hover:bg-gray-50 transition-colors" key={index}>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + index + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{data.Date}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{data.Desc}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{data.Type}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{data.Debit}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{data.credit}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{data.balance}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{data?.createdAt ? formatter.format(new Date(data.createdAt)) : '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{data?.updatedAt ? formatter.format(new Date(data.updatedAt)) : '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <span>{data.status || 'Pending'}</span>
                                            <Pencil
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => viewRawDataForm(data)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="10" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
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

export default RawdataTable;
