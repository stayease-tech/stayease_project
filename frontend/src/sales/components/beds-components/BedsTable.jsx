import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdAddCircle } from "react-icons/io";
import { FaEdit, FaEye } from "react-icons/fa";
import axios from 'axios';
import { UseCSVDownload } from '../UseCSVDownload';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function BedsTable() {
    const { getOptions } = useDropdowns();
    const navigate = useNavigate();
    const downloadCSV = UseCSVDownload();

    const [data, setData] = useState([]);
    const [bedsData, setBedsData] = useState([]);
    const [salesStatus, setSalesStatus] = useState('All');

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
        const fetchData = async () => {
            setLoadingData(true);
            setBedsData([]);

            try {
                const response = await axios.get(`/sales/get-beds-data/`);
                const bedsTable = response?.data?.beds_table || [];

                const sortedData = [...bedsTable].sort((a, b) => {
                    const roomCompare = a.roomNo.localeCompare(b.roomNo);
                    return roomCompare !== 0 ? roomCompare : a.bedLabel.localeCompare(b.bedLabel);
                });

                setData(sortedData);

                const filteredData = salesStatus === 'All'
                    ? sortedData
                    : sortedData.filter(bed => bed.salesStatus === salesStatus);

                setBedsData(filteredData);
            } catch (err) {
                console.log(err.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [salesStatus]);

    const salesStatusHandleChange = (e) => {
        setSalesStatus(e.target.value);
    };

    const viewAgreementHandle = (bedData) => {
        return navigate(`/sales/sales-agreement-pdf/${bedData?.resident_data?.id}`, { state: { bedData } });
    }

    const outputData = bedsData.map(data => ({
        'Property Name': data.propertyName,
        'Property Type': data.propertyType,
        'Property Address': `${data.doorBuilding}, ${data.streetAddress}, ${data.area}, ${data.state}, ${data.city} - ${data.pincode}.`,
        'Building Level': data.buildingLevel,
        'Flat Number': data.roomNo,
        'Flat Type': data.roomType,
        'Room Number': data.bedLabel,
        'Balcony Access': data.balconyAccess,
        'Bath Access': data.bathAccess,
        'Energy Plan': data.energyPlan,
        'Hall Access': data.hallAccess,
        'Kitchen Access': data.kitchenAccess,
        'Room SQFT': data.roomSqft,
        'DTH Number': data.tataSkyNo,
        'Wifi Number': data.wifiNo,
        'Bescom Meter Number': data.bescomMeterNo,
        'Property Manager': data?.resident_data?.propertyManager,
        'Sales Manager': data?.resident_data?.salesManager,
        'Comfort Class': data?.resident_data?.comfortClass,
        'Meal Type': data?.resident_data?.mealType,
        'Resident Name': data?.resident_data?.residentsName,
        'Phone Number': data?.resident_data?.phoneNumber,
        'Email ID': data?.resident_data?.email,
        'KYC Type': data?.resident_data?.kycType,
        'Aadhar Number': data?.resident_data?.aadharNumber,
        'Aadhar Status': data?.resident_data?.aadharStatus,
        'PAN Number': data?.resident_data?.panNumber,
        'PAN Status': data?.resident_data?.panStatus,
        'Check-In': data?.resident_data?.checkIn,
        'Check-Out': data?.resident_data?.checkOut,
        'Total Deposit Paid': data?.resident_data?.totalDepositPaid,
        'Rent Per Month': data?.resident_data?.rentPerMonth
    }))

    const viewresidentsDataHandle = (bedData) => {
        if (bedData?.resident_data && Object.keys(bedData.resident_data).length > 0) {
            const data = bedsData.filter(data => data.id === bedData.id);
            return navigate(`/sales/sales-residents-table/${bedData?.id}`, { state: { bedsData: data } });
        }

        return alert('No data available!');
    };

    const updateresidentDataHandle = (bedData) => {
        if (bedData.salesStatus === 'Completed') {
            return navigate(`/sales/sales-resident-details/${bedData?.resident_data?.id}`, { state: { bedData } });
        }

        return navigate(`/sales/sales-resident-form/${bedData?.id}`);
    };

    return (


        <DashPage>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-2 text-[#D4A017]">BEDS DATA TABLE</h1>
                        <p className="text-center text-xs text-gray-400 mb-6">Beds are auto-created via Supply &rarr; Rooms &rarr; Add Room (select room type to generate beds)</p>

                        <div className="sm:flex justify-between">
                            <button
                                className="block mb-3 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] text-xs sm:text-sm" onClick={() => downloadCSV(outputData, 'Beds_Data.csv')}
                                type="button">Export Data</button>

                            <div className="flex gap-2">
                                <select
                                    id="salesStatus"
                                    value={salesStatus}
                                    onChange={salesStatusHandleChange}
                                    className="block mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    name="salesStatus"
                                    required
                                >
                                    <option value="All">{`All (${data.length})`}</option>
                                    {getOptions('sales_statuses').map((s, i) => (
                                        <option key={i} value={s}>{`${s} (${data.filter(bed => bed.salesStatus === s).length})`}</option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="block my-2 text-black max-sm:w-full p-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs"
                                />
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse shadow-md rounded-lg max-sm:text-xs">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-700">
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Property Name</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Property Type</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Property Address</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Building Level</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Flat Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Flat Type</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Room Number</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Complete Resident Data</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Current Resident Data</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">View Agreement</th>
                                        <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Rent Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedData.length > 0 ? paginatedData.map((bedsData, i) => (
                                        <tr className="" key={bedsData.id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedsData.propertyName}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedsData.propertyType}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{`${bedsData.doorBuilding}, ${bedsData.streetAddress}, ${bedsData.area}, ${bedsData.state}, ${bedsData.city} - ${bedsData.pincode}.`}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedsData.buildingLevel}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedsData.roomNo}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedsData.roomType}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedsData.bedLabel}</td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                <div className="flex justify-evenly">
                                                    <FaEye className="block hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewresidentsDataHandle(bedsData)} />
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-2 py-2 text-center">
                                                {bedsData.salesStatus === 'Completed' ? (
                                                    <button
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                                                        onClick={() => updateresidentDataHandle(bedsData)}
                                                    >
                                                        <FaEdit size={11} /> Edit Resident
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#D4A017] text-white rounded-md hover:bg-[#B8860B] transition-colors cursor-pointer"
                                                        onClick={() => updateresidentDataHandle(bedsData)}
                                                    >
                                                        <IoMdAddCircle size={13} /> Add Resident
                                                    </button>
                                                )}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                <div className="flex justify-center">
                                                    {(bedsData.salesStatus === 'Pending') ?
                                                        <div className="flex justify-evenly">
                                                            <FaEye className="block hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => alert('Currently there is no resident allocated to generate the agreement!')} />
                                                        </div>
                                                        :
                                                        <div className="flex justify-evenly">
                                                            <FaEye className="block hover:text-[#D4A017] text-xl hover:cursor-pointer" onClick={() => viewAgreementHandle(bedsData)} />
                                                        </div>
                                                    }
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">{bedsData?.salesStatus === 'Completed' && bedsData?.resident_data?.residentStatus === 'Active' && bedsData?.resident_data?.rent_records.length > 0
                                                ? bedsData?.resident_data?.rent_records[bedsData?.resident_data?.rent_records.length - 1]?.rentStatus : 'NA'}</td>
                                        </tr>
                                    )) : <tr>
                                        <td colSpan="12" className="border border-gray-300 px-4 py-2 text-center">{loadingData ? 'Loading Data...' : 'No data available'}</td>
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