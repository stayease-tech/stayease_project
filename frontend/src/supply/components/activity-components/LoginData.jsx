import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";

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
    const itemsPerPage = 10;

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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const convertTime = (isoDate) => {
        const timeWithAMPM = new Date(isoDate).toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });

        return timeWithAMPM;
    }

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
                const response = await axios.get('/supply/get-user-activity-data/');

                setUserLoginData(response?.data?.user_activity_data.filter(user => user.id === Number(id))[0].login_data || []);

            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    return (


        <DashPage>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">LOGIN DATA</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="block max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/supply/supply-user-activity-data`)}
                                type="button">Prev</button>

                            <input
                                type="date"
                                value={searchDate}
                                onChange={handleSearchChange}
                                className="block mt-2 mb-3 text-black max-sm:w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs"
                            />
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse shadow-md rounded-lg max-sm:text-xs">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700">
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Login Time</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Logout Time</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Duration</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((user, i) => (
                                        <tr className="" key={user.id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{user?.login_time ? convertTime(user.login_time) : '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{user?.logout_time ? convertTime(user.logout_time) : '-'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{`${calculateLoginDuration(user?.login_time, user?.logout_time)} ${(userLoginData[userLoginData.length - 1].login_time === user.login_time && user?.logout_time === null) ? '(updating in real-time)' : ''}`}</td>
                                        </tr>
                                    )) : <tr>
                                        <td colSpan="4" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
                                    </tr>}
                                    {loadingData || <tr>
                                        <th colSpan="3" className="border border-gray-300 px-4 py-2 text-center">Total Time Logged In</th>
                                        <td className="border border-gray-300 px-4 py-2 text-center">{calculateTotalDuration(userLoginData)}</td>
                                    </tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap justify-center items-center mt-4 gap-1 max-sm:gap-0.5">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white disabled:opacity-50 transition-colors duration-200"
                                aria-label="Previous page"
                            >
                                &lt;
                            </button>

                            <button
                                key={1}
                                onClick={() => handlePageChange(1)}
                                className={`flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded transition-colors duration-200 max-sm:text-xs ${currentPage === 1
                                    ? "bg-[#D4A017] text-white"
                                    : "bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white"
                                    }`}
                            >
                                1
                            </button>

                            {currentPage > 3 && (
                                <span className="flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 max-sm:text-xs">
                                    ...
                                </span>
                            )}

                            {Array.from({ length: Math.min(4, totalPages - 2) }, (_, i) => {
                                let page;
                                if (currentPage <= 3) {
                                    page = i + 2;
                                } else if (currentPage >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = currentPage - 2 + i;
                                }

                                if (page > 1 && page < totalPages) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded transition-colors duration-200 max-sm:text-xs ${currentPage === page
                                                ? "bg-[#D4A017] text-white"
                                                : "bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            {currentPage < totalPages - 2 && (
                                <span className="flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 max-sm:text-xs">
                                    ...
                                </span>
                            )}

                            {totalPages > 1 && (
                                <button
                                    key={totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                    className={`flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded transition-colors duration-200 max-sm:text-xs ${currentPage === totalPages
                                        ? "bg-[#D4A017] text-white"
                                        : "bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white"
                                        }`}
                                >
                                    {totalPages}
                                </button>
                            )}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center justify-center h-8 w-8 max-sm:h-7 max-sm:w-7 rounded bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white disabled:opacity-50 transition-colors duration-200 max-sm:text-xs"
                                aria-label="Next page"
                            >
                                &gt;
                            </button>
                        </div>


        </DashPage>


    )
}

export default LoginData