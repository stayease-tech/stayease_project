// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import axios from 'axios';
import Logout from "../Logout";
import Pagination from "../../../shared/Pagination";

function PropertyTable() {
    let publicUrl = process.env.PUBLIC_URL + '/';
    const navigate = useNavigate();
    const [propertyData, setPropertyData] = useState([]);
    const [isScrolledUp, setIsScrolledUp] = useState(true);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

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

    const handleScroll = useCallback(() => {
        const currentScrollPosition = window.pageYOffset;

        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 80) {
            setIsScrolledUp(false);
        } else if (currentScrollPosition < lastScrollPosition) {
            setIsScrolledUp(true);
        }

        setLastScrollPosition(currentScrollPosition);
    }, [lastScrollPosition]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollPosition, handleScroll]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/supply/get-property-data/');
                console.log(response.data.property_data);
                setPropertyData(response.data.property_data);
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            }
        };

        fetchData();
    }, []);

    const viewHandle = (property) => {
        navigate(`/supply/supply-property-details`, { state: { propertyData: property } });
    };

    return (
        <div className="lg:pb-2 lg:pt-[6rem]">
            <nav className={`bg-slate-800 shadow-md text-white fixed w-full top-0 z-[100] transition-opacity duration-300 ${isScrolledUp ? 'opacity-100' : 'opacity-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center">
                            <img
                                alt="CompanyLogo"
                                src={publicUrl + "static/img/brand_logo/stayEase-Logo.webp"}
                                className="h-18 w-auto object-cover"
                                loading="lazy"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Link to='/supply/supply-property-form' className="hover:text-[#D4A017]">Property Form</Link>
                            <Logout />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 pt-[5rem]">
                <div className="page-header">
                    <h1>StayEase Property Table</h1>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="form-input w-48 text-xs"
                    />
                </div>

                <div className="card">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto text-xs border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">No.</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Property Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedData.length > 0 ? paginatedData.map((property, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{startIndex + i + 1}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">{property?.propertyName}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">{property?.status}</td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800">
                                            <Eye
                                                size={14}
                                                className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                                                onClick={() => viewHandle(property)}
                                            />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-3 py-1.5 text-xs text-gray-800 text-center">No data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </div>
        </div>
    );
}

export default PropertyTable;
