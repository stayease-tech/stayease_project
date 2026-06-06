// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function OtherFilesTable() {
    const navigate = useNavigate();

    const [otherFiles, setOtherFiles] = useState([]);

    const [loadingData, setLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredData = otherFiles.filter(item =>
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
                const response = await axios.get('/accounts/get-other-files/');

                setOtherFiles(response.data.other_files);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewOtherFilesData = (otherFile) => {
        window.open(`https://local-machine-bucket.s3.us-east-1.amazonaws.com/${otherFile.file}`, '_blank');
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const deleteOtherFile = async (otherFile) => {

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`/accounts/other-file-delete/${otherFile?.id}/`, {
                withCredentials: true,
            });

            if (response.data.success) {
                alert(response.data.message);

                setOtherFiles(prev => prev.filter(file => file.id !== otherFile?.id));
            }
        } catch (error) {
            console.error('Error deleting form:', error);
            alert('There was an error deleting the form. Please try again!');
        }
    };

    return (
        <DashPage>
            <div className="page-header">
                <h1>Other Files</h1>
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
                    onClick={() => navigate('/accounts/accounts-otherfiles-upload')}
                    type="button"
                >
                    Upload File
                </button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">File Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">File</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Submitted At</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingData ? (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="6" className="px-3 py-1.5 text-xs text-gray-800 text-center">Loading…</td>
                                </tr>
                            ) : paginatedData.length > 0 ? paginatedData.map((file, i) => (
                                <tr className="hover:bg-gray-50 transition-colors" key={file.id}>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{file?.propertyName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{file?.fileName}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{file?.file.split('/')[5]}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 whitespace-nowrap">{formatter.format(new Date(file?.createdAt))}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">
                                        <div className="flex items-center gap-3">
                                            <Eye
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => viewOtherFilesData(file)}
                                            />
                                            <Trash2
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => deleteOtherFile(file)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td colSpan="6" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
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

export default OtherFilesTable;
