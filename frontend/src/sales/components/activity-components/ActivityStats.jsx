// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function ActivityStats() {
    const navigate = useNavigate();

    const [userActivityData, setUserActivityData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = userActivityData.filter(item =>
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

            try {
                const response = await axios.get('/sales/get-user-activity-data/');

                setUserActivityData(response?.data?.user_activity_data || []);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewLoginDataTable = (user) => {
        navigate(`/sales/sales-login-data/${user?.id}`);
    };

    return (
        <DashPage>
            <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-6 text-[#D4A017]">USER ACTIVITY TABLE</h1>

            <div className="flex justify-end mb-3">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="text-black p-2 border border-gray-300 rounded text-xs placeholder-gray-400"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-xs border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">User Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">User Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">View Login Details</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.length > 0 ? paginatedData.map((user, i) => (
                            <tr className="hover:bg-gray-50 transition-colors" key={user.id}>
                                <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                <td className="px-3 py-1.5 text-xs text-gray-800">{user?.username}</td>
                                <td className="px-3 py-1.5 text-xs text-gray-800">{user?.useremail}</td>
                                <td className="px-3 py-1.5 text-xs text-gray-800">{user?.login_data[user.login_data.length - 1].logout_time === null ? 'Online' : 'Offline'}</td>
                                <td className="px-3 py-1.5 text-xs text-gray-800">
                                    <Eye
                                        size={14}
                                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                        onClick={() => viewLoginDataTable(user)}
                                    />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-3 py-3 text-xs text-gray-500 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </DashPage>
    );
}

export default ActivityStats;
