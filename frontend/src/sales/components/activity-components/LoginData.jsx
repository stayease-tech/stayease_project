// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";
import Pagination from "../../../shared/Pagination";

function LoginData() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    const navigate = useNavigate();
    const { id } = useParams();

    const [userLoginData, setUserLoginData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const [searchDate, setSearchDate] = useState(formattedDate);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const filteredData = userLoginData.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchDate)
        )
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchDate(e.target.value);
        setCurrentPage(1);
    };

    const convertTime = (isoDate) => {
        return new Date(isoDate).toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const calculateLoginDuration = (loginTime, logoutTime) => {
        if (!loginTime) return '-';

        const login = new Date(loginTime);
        const logout = logoutTime ? new Date(logoutTime) : new Date();

        const durationMs = logout - login;

        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    };

    const calculateTotalDuration = (sessions) => {
        let totalMs = 0;

        sessions.forEach(session => {
            if (session.login_time && session.login_time.slice(0, 10) === searchDate) {
                const login = new Date(session.login_time);
                const logout = session.logout_time ? new Date(session.logout_time) : new Date();
                totalMs += logout - login;
            }
        });

        return formatDuration(totalMs);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);

            try {
                const response = await axios.get('/sales/get-user-activity-data/');

                setUserLoginData(response?.data?.user_activity_data.filter(user => user.id === Number(id))[0].login_data || []);

            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [id]);

    return (
        <DashPage>
            <div className="page-header">
                <h1>Login Data</h1>
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                        onClick={() => navigate(`/sales/sales-user-activity-data`)}
                        type="button"
                    >
                        Prev
                    </button>
                    <input
                        type="date"
                        value={searchDate}
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
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Login Time</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Logout Time</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedData.length > 0 ? paginatedData.map((user, i) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{user?.login_time ? convertTime(user.login_time) : '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{user?.logout_time ? convertTime(user.logout_time) : '-'}</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800">{`${calculateLoginDuration(user?.login_time, user?.logout_time)} ${(userLoginData[userLoginData.length - 1].login_time === user.login_time && user?.logout_time === null) ? '(updating in real-time)' : ''}`}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-3 py-1.5 text-xs text-gray-800 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
                                </tr>
                            )}
                            {!loadingData && (
                                <tr className="bg-gray-50">
                                    <td colSpan="3" className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Total Time Logged In</td>
                                    <td className="px-3 py-1.5 text-xs text-gray-800 font-semibold">{calculateTotalDuration(userLoginData)}</td>
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

export default LoginData;
