import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye } from "react-icons/fa";
import axios from 'axios';
import { UseCSVDownload } from '../UseCSVDownload';
import { DashPage } from "../../../shared/Dashboard";

function BedsTable() {
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();

    const [bedsData, setBedsData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = bedsData.filter(item =>
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
        setLoadingData(true);

        const fetchData = async () => {
            try {
                const response = await axios.get(`/sales/get-beds-data/`);

                setBedsData(
                    (response?.data?.beds_table || [])
                        .filter(item => item?.salesStatus === "Completed" && item?.resident_data?.residentStatus === 'Active')
                        .sort((a, b) => {
                            if (a.roomNo !== b.roomNo) {
                                return a.roomNo.localeCompare(b.roomNo);
                            }
                            return a.bedLabel.localeCompare(b.bedLabel);
                        })
                );
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const viewAgreementHandle = (bedData) => {
        navigate(`/accounts/accounts-agreement-pdf/${bedData?.resident_data?.id}`, { state: { bedData, type: 'BedsTable' } });
    }

    const outputData = bedsData.map(data => ({
        ['Property Name']: data.propertyName,
        ['Property Type']: data.propertyType,
        ['Property Address']: `${data.doorBuilding}, ${data.streetAddress}, ${data.area}, ${data.state}, ${data.city} - ${data.pincode}.`,
        ['Building Level']: data.buildingLevel,
        ['Flat Number']: data.roomNo,
        ['Flat Type']: data.roomType,
        ['Room Number']: data.bedLabel,
        ['Property Manager']: data?.resident_data?.propertyManager,
        ['Sales Manager']: data?.resident_data?.salesManager,
        ['Comfort Class']: data?.resident_data?.comfortClass,
        ['Meal Type']: data?.resident_data?.mealType,
        ['Resident Name']: data?.resident_data?.residentsName,
        ['Phone Number']: data?.resident_data?.phoneNumber,
        ['Email ID']: data?.resident_data?.email,
        ['KYC Type']: data?.resident_data?.kycType,
        ['Aadhar Number']: data?.resident_data?.aadharNumber,
        ['Aadhar Status']: data?.resident_data?.aadharStatus,
        ['PAN Number']: data?.resident_data?.panNumber,
        ['PAN Status']: data?.resident_data?.panStatus,
        ['Check-In']: data?.resident_data?.checkIn,
        ['Check-Out']: data?.resident_data?.checkOut,
        ['Total Deposit Paid']: data?.resident_data?.totalDepositPaid,
        ['Rent Per Month']: data?.resident_data?.rentPerMonth
    }))

    const updateBedsDataHandle = (bedData) => {
        navigate(`/accounts/accounts-beds-details/${bedData?.resident_data?.id}`, { state: { bedData } });
    };

    return (


        <DashPage>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">RENTAL TRACKING TABLE</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="block mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => downloadCSV(outputData, 'Beds_Data.csv')}
                                type="button">Export Data</button>

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
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Property Name</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Resident Name</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Flat Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Flat Type</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Room Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">View Agreement</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Rent Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((bedData, i) => (
                                        <tr className="" key={bedData.id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData?.propertyName}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData?.resident_data?.residentsName}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData?.roomNo}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData?.roomType}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedData?.bedLabel}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                <div className="flex justify-center">
                                                    <FaEye className="block hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewAgreementHandle(bedData)} />
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-center">
                                                <div className="flex justify-evenly">
                                                    <div>
                                                        {bedData?.resident_data?.rent_records[bedData?.resident_data?.rent_records.length - 1]?.rentStatus || 'NA'}
                                                    </div>
                                                    <FaEdit className="block hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => updateBedsDataHandle(bedData)} />
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr>
                                        <td colSpan="8" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
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

export default BedsTable