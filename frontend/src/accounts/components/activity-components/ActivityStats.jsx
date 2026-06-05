import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import axios from 'axios';
import { DashPage } from "../../../shared/Dashboard";

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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);

            try {
                const response = await axios.get('/accounts/get-user-activity-data/');

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
        navigate(`/accounts/accounts-login-data/${user?.id}`);
    };

    return (


        <DashPage>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">USER ACTIVITY TABLE</h1>

                        <div className="sm:flex justify-end">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="block mt-2 mb-3 text-black max-sm:w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs"
                            />
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse shadow-md rounded-lg max-sm:text-xs">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700">
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">User Name</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">User Email</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Status</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">View Login Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((user, i) => (
                                        <tr className="" key={user.id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{user?.username}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{user?.useremail}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{user?.login_data[user.login_data.length - 1].logout_time === null ? 'Online' : 'Offline'}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                <div className="flex justify-center">
                                                    <FaEye className="hover:text-[#D4A017] text-xl hover:cursor-pointer block" onClick={() => viewLoginDataTable(user)} />
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr>
                                        <td colSpan="5" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
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

export default ActivityStats