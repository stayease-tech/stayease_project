import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import axios from 'axios';
import Logout from "../Logout";

function PropertyTable() {
    let publicUrl = process.env.PUBLIC_URL + '/';
    const navigate = useNavigate();
    const [propertyData, setPropertyData] = useState([]);
    const [isScrolledUp, setIsScrolledUp] = useState(true);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    let predefinedOrder = ["/stayease-harmonia", "/stayease-nestio"];
    const seenPathnames = new Set(predefinedOrder);

    propertyData.forEach(item => {
        if (item.propertyPathname && !seenPathnames.has(item.propertyPathname)) {
            predefinedOrder.push(item.propertyPathname);
            seenPathnames.add(item.propertyPathname);
        }
    });

    propertyData.sort((a, b) => {
        const isAEmpty = !a.propertyPathname;
        const isBEmpty = !b.propertyPathname;

        if (isAEmpty && isBEmpty) return 0;
        if (isAEmpty) return 1;
        if (isBEmpty) return -1;

        return predefinedOrder.indexOf(a.propertyPathname) - predefinedOrder.indexOf(b.propertyPathname);
    });

    const filteredData = propertyData.filter(item =>
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

    const handleScroll = useCallback(() => {
        const currentScrollPosition = window.pageYOffset

        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 80) {
            setIsScrolledUp(false)
        } else if (currentScrollPosition < lastScrollPosition) {
            setIsScrolledUp(true)
        }

        setLastScrollPosition(currentScrollPosition)
    }, [lastScrollPosition])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [lastScrollPosition, handleScroll])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/supply/get-property-data/');
                console.log(response.data.property_data)
                setPropertyData(response.data.property_data);
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            }
        };

        fetchData();
    }, []);

    const viewHandle = (propertyData) => {
        navigate(`/supply/supply-property-details`, { state: { propertyData } });
    };

    return (
        <div className="lg:pb-2 lg:pt-[6rem]">
            <nav className={`bg-slate-800 shadow-md text-white fixed w-full top-0 z-[100] transition-opacity duration-300 ${isScrolledUp ? 'opacity-100' : 'opacity-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center">
                            <img alt="CompanyLogo" src={publicUrl + "static/img/brand_logo/stayEase-Logo.webp"} className="h-18 w-auto object-cover"
                                loading="lazy" />
                        </div>

                        <div className="flex gap-3">
                            <Link to='/supply/supply-property-form' className="hover:text-[#D4A017]">Property Form</Link>
                            <Logout />
                        </div>
                    </div>
                </div>
            </nav >

            <h1 className="text-[#D4A017] text-center text-2xl font-semibold mt-[5rem] mb-8 hidden lg:block">STAYEASE PROPERTY TABLE</h1>

            <div className="w-[100%] lg:w-[50%] mx-auto lg:my-8 p-8 lg:p-10 lg:rounded-lg bg-white min-h-screen lg:min-h-[0] text-slate-800" method='POST'>

                <h1 className="text-[#D4A017] text-center text-2xl font-semibold mt-[5rem] mb-8 lg:hidden">STAYEASE PROPERTY TABLE</h1>

                <div className="flex justify-end">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border border-gray-300 rounded px-4 py-2 mb-4 text-black"
                    />
                </div>

                <div className="overflow-auto">
                    <table className="min-w-full table-auto border-collapse shadow-md rounded-lg">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700">
                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Property Name</th>
                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Status</th>
                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">View Details</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.length > 0 ? paginatedData.map((propertyData, i) => (
                                <tr className="" key={i}>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{propertyData?.propertyName}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">{propertyData?.status}</td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                        <div className="flex justify-evenly">
                                            <FaEye className="hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewHandle(propertyData)} />
                                        </div>
                                    </td>
                                </tr>
                            )) : <tr>
                                <td colSpan="7" className="border border-gray-300 px-4 py-2 text-center">No data available</td>
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
            </div>
        </div >
    )
}

export default PropertyTable