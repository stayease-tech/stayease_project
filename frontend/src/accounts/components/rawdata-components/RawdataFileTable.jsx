// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function RawdataFileTable() {
    const navigate = useNavigate();

    const [rawdataFile, setRawdataFile] = useState([]);

    const [loadingData, setLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = rawdataFile.filter(item =>
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
                const response = await axios.get('/accounts/get-rawdata-file/');

                setRawdataFile(response.data.rawdata_files);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewRawdataTable = (rawdataFile) => {
        navigate(`/accounts/accounts-rawdata-table/${rawdataFile?.id}`);
    };

    const viewRawdataFile = (file) => {
        window.open(`https://local-machine-bucket.s3.us-east-1.amazonaws.com/${file}`, '_blank');
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const deleteRawdataFile = async (rawdataFile) => {

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`/accounts/rawdata-file-delete/${rawdataFile?.id}/`, {
                withCredentials: true,
            });

            if (response.data.success) {
                alert(response.data.message);

                setRawdataFile(prev => prev.filter(file => file.id !== rawdataFile?.id));
            }
        } catch (error) {
            console.error('Error deleting form:', error);
            alert('There was an error deleting the form. Please try again!');
        }
    };

    return (
        <DashPage>
            <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">RAWDATA FILES TABLE</h1>

            <div className="sm:flex justify-between">
                <button
                    className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate('/accounts/accounts-rawdatafile-upload')}
                    type="button">Upload Rawdata</button>

                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="mt-2 mb-3 text-black max-sm:w-full p-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-xs border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Rawdata File</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Last Updated</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.length > 0 ? paginatedData.map((file, i) => (
                            <tr className="hover:bg-gray-50 transition-colors" key={file.id}>
                                <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate hover:text-[#D4A017] hover:cursor-pointer" onClick={() => viewRawdataFile(file?.rawdataFile)}>{file?.rawdataFile.split('/')[5]}</td>
                                <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(file?.createdAt))}</td>
                                <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{formatter.format(new Date(file?.updatedAt))}</td>
                                <td className="px-3 py-1.5 text-xs text-gray-800">
                                    <div className="flex gap-3">
                                        <Eye
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => viewRawdataTable(file)}
                                        />
                                        <Trash2
                                            size={14}
                                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                            onClick={() => deleteRawdataFile(file)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-xs text-gray-500 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </DashPage>
    );
}

export default RawdataFileTable;
