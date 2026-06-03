// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { Link } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { DATE_INPUT_MAX, DATE_INPUT_MIN, isValidIsoDateInRange } from "../../../shared/dateInput";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";
import { useDropdowns } from "../../../shared/DropdownContext";

function residentDetails({ isExpanded, setIsExpanded }) {
    const { getOptions, getStaffNamesList } = useDropdowns();
    const navigate = useNavigate();
    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const location = useLocation();
    const bedData = location?.state?.bedData || {};
    const bedsData = location?.state?.bedsData || [];
    const flag = location?.state?.flag || false;
    const { id } = useParams();

    const [residentDetails, setresidentDetails] = useState({
        propertyManager: bedData?.resident_data?.propertyManager || '',
        salesManager: bedData?.resident_data?.salesManager || '',
        comfortClass: bedData?.resident_data?.comfortClass || '',
        mealType: bedData?.resident_data?.mealType || '',
        residentsName: bedData?.resident_data?.residentsName || '',
        phoneNumber: formatIndianPhone(bedData?.resident_data?.phoneNumber || ''),
        email: bedData?.resident_data?.email || '',
        permanentAddress: bedData?.resident_data?.permanentAddress || '',
        kycType: bedData?.resident_data?.kycType || '',
        aadharNumber: bedData?.resident_data?.aadharNumber || '',
        aadharFrontCopy: bedData?.resident_data?.aadharFrontCopy || '',
        aadharBackCopy: bedData?.resident_data?.aadharBackCopy || '',
        aadharStatus: bedData?.resident_data?.aadharStatus || '',
        panNumber: bedData?.resident_data?.panNumber || '',
        panFrontCopy: bedData?.resident_data?.panFrontCopy || '',
        panBackCopy: bedData?.resident_data?.panBackCopy || '',
        panStatus: bedData?.resident_data?.panStatus || '',
        checkIn: bedData?.resident_data?.checkIn || '',
        checkOut: bedData?.resident_data?.checkOut || '',
        totalDepositPaid: bedData?.resident_data?.totalDepositPaid || '',
        rentPerMonth: bedData?.resident_data?.rentPerMonth || ''
    });

    const [originalData, setOriginalData] = useState(bedData?.resident_data || {});

    const triggerFileInput = (type) => {
        if (type === "aadharFrontCopy") {
            document.getElementById("aadharFrontCopy").click();
        }
        if (type === "aadharBackCopy") {
            document.getElementById("aadharBackCopy").click();
        }

        if (type === "panFrontCopy") {
            document.getElementById("panFrontCopy").click();
        }
        if (type === "panBackCopy") {
            document.getElementById("panBackCopy").click();
        }
    };

    const bedsHandleChange = (e) => {
        const { name, value, type, files } = e.target;

        let nextValue = value;
        if (name === "phoneNumber") nextValue = formatIndianPhone(value);
        if (name === "aadharNumber") nextValue = value.replace(/\D/g, "").slice(0, 12);
        if (name === "panNumber") nextValue = value.toUpperCase().replace(/\s/g, "").slice(0, 10);

        setresidentDetails((prevState) => ({
            ...prevState,
            [name]: type === "file" ? files[0] : nextValue,
        }));

        if (name === 'checkIn' && residentDetails.checkOut && value > residentDetails.checkOut) {
            alert('Check-in date must be before check-out date');
            setresidentDetails(prev => ({
                ...prev,
                checkOut: ''
            }));
        }

        if (name === 'checkOut' && residentDetails.checkIn && value < residentDetails.checkIn) {
            alert('Check-out date must be after check-in date');
            setresidentDetails(prev => ({
                ...prev,
                checkOut: residentDetails.checkIn
            }));
        }
    }

    const validateresidentDetails = () => {
        if (!residentDetails.residentsName?.trim() || !/^[A-Za-z ]{2,}$/.test(residentDetails.residentsName.trim())) return "Please enter a valid resident name.";
        if (!isValidIndianPhone(residentDetails.phoneNumber)) return "Phone number must be exactly 10 digits.";
        if (residentDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(residentDetails.email)) return "Please enter a valid email address.";
        if (residentDetails.checkIn && !isValidIsoDateInRange(residentDetails.checkIn, DATE_INPUT_MIN, DATE_INPUT_MAX)) return "Check-in date must be between 1900-01-01 and 2099-12-31.";
        if (residentDetails.checkOut && !isValidIsoDateInRange(residentDetails.checkOut, DATE_INPUT_MIN, DATE_INPUT_MAX)) return "Check-out date must be between 1900-01-01 and 2099-12-31.";
        if (residentDetails.checkOut && residentDetails.checkIn && residentDetails.checkOut < residentDetails.checkIn) return "Check-out date cannot be before check-in date.";
        if (residentDetails.totalDepositPaid && Number(residentDetails.totalDepositPaid) < 0) return "Total deposit paid cannot be negative.";
        if (residentDetails.rentPerMonth && Number(residentDetails.rentPerMonth) <= 0) return "Rent per month must be greater than 0.";

        if (residentDetails.kycType === "Aadhar") {
            if (!/^\d{12}$/.test(residentDetails.aadharNumber || "")) return "Aadhaar number must be 12 digits.";
            if (!residentDetails.aadharStatus) return "Aadhaar status is required.";
        }

        if (residentDetails.kycType === "PAN") {
            if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(residentDetails.panNumber || "")) return "PAN must follow format: ABCDE1234F.";
            if (!residentDetails.panStatus) return "PAN status is required.";
        }

        return null;
    };

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

    const viewAgreementHandle = (bedData) => {
        navigate(`/sales/sales-agreement-pdf/${bedData?.resident_data?.id}`, { state: { bedsData, bedData, flag, bedsDetailsFlag: true } });
    }

    const getChangedData = () => {
        const changedData = {};

        Object.keys(residentDetails).forEach(key => {
            const originalValue = originalData[key] || '';
            const currentValue = residentDetails[key] || '';

            if (currentValue !== originalValue) {
                changedData[key] = currentValue;
            }
        });

        return changedData;
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const bedsHandleUpdate = async (e) => {
        e.preventDefault();

        const validationError = validateresidentDetails();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        const changedData = getChangedData();

        if (Object.keys(changedData).length === 0) {
            alert('No data is updated!');
            return;
        }

        const formData = new FormData();

        setIsSaving(true);

        Object.keys(changedData).forEach((key) => {
            if (key === "aadharFrontCopy" || key === "aadharBackCopy" || key === "panFrontCopy" || key === "panBackCopy") {
                const newFile = changedData[key];

                if (typeof newFile === 'object') {
                    formData.append(key, newFile);
                }
            }
            else {
                formData.append(key, changedData[key]);
            }
        });

        if (changedData.phoneNumber) {
            formData.set('phoneNumber', normalizePhoneDigits(changedData.phoneNumber));
        }

        formData.append('bedId', bedData?.id)

        try {
            const response = await axios.put(
                `/sales/resident-data-update/${id}/`,
                formData,
                {
                    withCredentials: true,
                }
            );

            setOriginalData(prev => ({ ...prev, ...changedData }));

            alert(response.data.message);

            if (response.data.success) {
                navigate(`/sales/sales-beds-table`);
            }
        } catch (err) {
            console.error('Error updating form:', err);
            alert('There was an error updating the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`flex items-center min-h-screen text-slate-800 max-lg:bg-white ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6`}>
                    <form className="max-w-3xl mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={bedsHandleUpdate}>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">BEDS DATA</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => flag ? navigate(`/sales/sales-residents-table/${bedData?.id}`, { state: { bedsData } }) : navigate(`/sales/sales-beds-table`)}
                                type="button">Prev</button>

                            <div className="flex justify-between sm:justify-end mb-5">
                                <button
                                    className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()} type="button">{!dataEditView ? 'Update Details' : 'View Details'}</button>

                                {dataEditView === true && <button
                                    className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving}
                                    type='submit'
                                >
                                    {isSaving ? "Saving Details..." : "Save Details"}
                                </button>}
                            </div>
                        </div>

                        <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">{bedData?.propertyName}</h3>

                        <div className="w-full overflow-x-auto">
                            <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                <tbody>
                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Flat Number</th>
                                        <td className="py-1 px-2">{bedData?.roomNo}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Flat Type</th>
                                        <td className="py-1 px-2">{bedData?.roomType}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Room Number</th>
                                        <td className="py-1 px-2">{bedData?.bedLabel}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Property Manager</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.propertyManager || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="propertyManager" value={residentDetails.propertyManager} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="propertyManager" required>
                                                        <option value="" disabled>Select the Property Manager here</option>
                                                        {getStaffNamesList().map((name, i) => (
                                                            <option key={i} value={name}>{name}</option>
                                                        ))}
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Sales Manager</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.salesManager || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="salesManager" value={residentDetails.salesManager} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="salesManager" required>
                                                        <option value="" disabled>Select the Sales Manager here</option>
                                                        {getStaffNamesList().map((name, i) => (
                                                            <option key={i} value={name}>{name}</option>
                                                        ))}
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comfort Class</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.comfortClass || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="comfortClass" value={residentDetails.comfortClass} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="comfortClass" required>
                                                        <option value="" disabled>Select the Comfort Class here</option>
                                                        {getOptions('comfort_classes').map((c, i) => (
                                                            <option key={i} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Meal Type</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.mealType || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="mealType" value={residentDetails.mealType} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="mealType" required>
                                                        <option value="" disabled>Select the Meal Type here</option>
                                                        {getOptions('meal_types').map((m, i) => (
                                                            <option key={i} value={m}>{m}</option>
                                                        ))}
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Resident Name</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.residentsName || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={residentDetails.residentsName}
                                                        onChange={(e) => bedsHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="Enter the Resident Name here"
                                                        name="residentsName"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Phone Number</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.phoneNumber || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={residentDetails.phoneNumber}
                                                        onChange={(e) => bedsHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="98765 43210"
                                                        inputMode="numeric"
                                                        maxLength={11}
                                                        name="phoneNumber"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Email</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.email || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="email"
                                                        value={residentDetails.email}
                                                        onChange={(e) => bedsHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="Enter the Email here"
                                                        name="email"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Permanent Address</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.permanentAddress || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={residentDetails.permanentAddress}
                                                        onChange={(e) => bedsHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="Enter the Permanent Address here"
                                                        name="permanentAddress"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">KYC</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.kycType || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="kycType" value={residentDetails.kycType} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="kycType" required>
                                                        <option value="" disabled>Select the document type here</option>
                                                        {getOptions('kyc_types').map((k, i) => (
                                                            <option key={i} value={k}>{k}</option>
                                                        ))}
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    {residentDetails.kycType === 'Aadhar' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Aadhar Number</th>
                                            <td className="flex">
                                                {!dataEditView ? <>
                                                    <span className="py-1 px-2 w-full tracking-wider">{residentDetails.aadharNumber ? residentDetails.aadharNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim() : '-'}</span>
                                                </> : <>
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="text"
                                                            id="aadharNumber"
                                                            value={residentDetails.aadharNumber}
                                                            onChange={(e) => bedsHandleChange(e)}
                                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                            name="aadharNumber"
                                                            placeholder="Enter the Aadhar Number here"
                                                            required />
                                                    </span>
                                                </>}
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th rowSpan="2" className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Aadhar (Front & Back Copy)</th>
                                            <td className="flex">
                                                {!dataEditView ? <>
                                                    <span className="py-1 px-2 w-full">
                                                        <Link to={
                                                            typeof residentDetails.aadharFrontCopy === 'string'
                                                                ? `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${residentDetails.aadharFrontCopy}`
                                                                : residentDetails.aadharFrontCopy
                                                                    ? URL.createObjectURL(residentDetails.aadharFrontCopy)
                                                                    : '#'
                                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                            {(residentDetails.aadharFrontCopy?.name || (residentDetails?.aadharFrontCopy || '').split('/')[5]) || '-'}
                                                        </Link>
                                                    </span>
                                                </> : <>
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="file"
                                                            id="aadharFrontCopy"
                                                            name="aadharFrontCopy"
                                                            accept="image/*, .pdf"
                                                            onChange={(e) => bedsHandleChange(e)}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerFileInput('aadharFrontCopy')}
                                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                                        >
                                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{residentDetails.aadharFrontCopy?.name || (residentDetails.aadharFrontCopy || '').split('/')[5] || 'Upload the document here'}</span>
                                                        </button>
                                                    </span>
                                                </>}
                                            </td>
                                        </tr>
                                        <tr className='border-b border-white'>
                                            <td className="flex">
                                                {!dataEditView ? <>
                                                    <span className="py-1 px-2 w-full">
                                                        <Link to={
                                                            typeof residentDetails.aadharBackCopy === 'string'
                                                                ? `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${residentDetails.aadharBackCopy}`
                                                                : residentDetails.aadharBackCopy
                                                                    ? URL.createObjectURL(residentDetails.aadharBackCopy)
                                                                    : '#'
                                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                            {(residentDetails.aadharBackCopy?.name || (residentDetails?.aadharBackCopy || '').split('/')[5]) || '-'}
                                                        </Link>
                                                    </span>
                                                </> : <>
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="file"
                                                            id="aadharBackCopy"
                                                            name="aadharBackCopy"
                                                            accept="image/*, .pdf"
                                                            onChange={(e) => bedsHandleChange(e)}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerFileInput('aadharBackCopy')}
                                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                                        >
                                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{residentDetails.aadharBackCopy?.name || (residentDetails.aadharBackCopy || '').split('/')[5] || 'Upload the document here'}</span>
                                                        </button>
                                                    </span>
                                                </>}
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Aadhar Status</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{residentDetails?.aadharStatus || '-'}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <select id="aadharStatus" value={residentDetails.aadharStatus} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="aadharStatus" required>
                                                            <option value="" disabled>Select the status here</option>
                                                            {getOptions('verification_statuses').map((v, i) => (
                                                                <option key={i} value={v}>{v}</option>
                                                            ))}
                                                        </select>
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>
                                    </>}

                                    {residentDetails.kycType === 'PAN' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">PAN Number</th>
                                            <td className="flex">
                                                {!dataEditView ? <>
                                                    <span className="py-1 px-2 w-full">{residentDetails.panNumber || '-'}</span>
                                                </> : <>
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="text"
                                                            id="panNumber"
                                                            value={residentDetails.panNumber}
                                                            onChange={(e) => bedsHandleChange(e)}
                                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                            name="panNumber"
                                                            placeholder="Enter the PAN Number here"
                                                            required />
                                                    </span>
                                                </>}
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th rowSpan="2" className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">PAN (Front & Back Copy)</th>
                                            <td className="flex">
                                                {!dataEditView ? <>
                                                    <span className="py-1 px-2 w-full">
                                                        <Link to={
                                                            typeof residentDetails.panFrontCopy === 'string'
                                                                ? residentDetails.panFrontCopy
                                                                : `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${residentDetails.panFrontCopy}`
                                                                    ? URL.createObjectURL(residentDetails.panFrontCopy)
                                                                    : '#'
                                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                            {(residentDetails.panFrontCopy?.name || (residentDetails?.panFrontCopy || '').split('/')[5]) || '-'}
                                                        </Link>
                                                    </span>
                                                </> : <>
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="file"
                                                            id="panFrontCopy"
                                                            name="panFrontCopy"
                                                            accept="image/*, .pdf"
                                                            onChange={(e) => bedsHandleChange(e)}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerFileInput('panFrontCopy')}
                                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                                        >
                                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{residentDetails.panFrontCopy?.name || (residentDetails.panFrontCopy || '').split('/')[5] || 'Upload the document here'}</span>
                                                        </button>
                                                    </span>
                                                </>}
                                            </td>
                                        </tr>
                                        <tr className='border-b border-white'>
                                            <td className="flex">
                                                {!dataEditView ? <>
                                                    <span className="py-1 px-2 w-full">
                                                        <Link to={
                                                            typeof residentDetails.panBackCopy === 'string'
                                                                ? residentDetails.panBackCopy
                                                                : `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${residentDetails.panBackCopy}`
                                                                    ? URL.createObjectURL(residentDetails.panBackCopy)
                                                                    : '#'
                                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                            {(residentDetails.panBackCopy?.name || (residentDetails?.panBackCopy || '').split('/')[5]) || '-'}
                                                        </Link>
                                                    </span>
                                                </> : <>
                                                    <span className="py-1 px-2 w-full">
                                                        <input
                                                            type="file"
                                                            id="panBackCopy"
                                                            name="panBackCopy"
                                                            accept="image/*, .pdf"
                                                            onChange={(e) => bedsHandleChange(e)}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerFileInput('panBackCopy')}
                                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                                        >
                                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{residentDetails.panBackCopy?.name || (residentDetails.panBackCopy || '').split('/')[5] || 'Upload the document here'}</span>
                                                        </button>
                                                    </span>
                                                </>}
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">PAN Status</th>
                                            {!dataEditView ? <>
                                                <td className="py-1 px-2">{residentDetails?.panStatus || '-'}</td>
                                            </> : <>
                                                <td className="flex">
                                                    <span className="py-1 px-2 w-full">
                                                        <select id="panStatus" value={residentDetails.panStatus} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="panStatus" required>
                                                            <option value="" disabled>Select the status here</option>
                                                            {getOptions('verification_statuses').map((v, i) => (
                                                                <option key={i} value={v}>{v}</option>
                                                            ))}
                                                        </select>
                                                    </span>
                                                </td>
                                            </>}
                                        </tr>
                                    </>}

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">check-In</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.checkIn ? new Date(residentDetails.checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3') : '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="date"
                                                        value={residentDetails.checkIn}
                                                        onChange={(e) => bedsHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                                        name="checkIn"
                                                        min={DATE_INPUT_MIN}
                                                        max={DATE_INPUT_MAX}
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">check-Out</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.checkOut ? new Date(residentDetails.checkOut).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3') : '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="date"
                                                        value={residentDetails.checkOut}
                                                        onChange={(e) => bedsHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                                        name="checkOut"
                                                        min={residentDetails.checkIn || DATE_INPUT_MIN}
                                                        max={DATE_INPUT_MAX}
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Total Deposit Paid</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.totalDepositPaid || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={residentDetails.totalDepositPaid}
                                                        onChange={(e) => bedsHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="Enter the Total Deposit Paid here"
                                                        name="totalDepositPaid"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rent Per Month</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{residentDetails?.rentPerMonth || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={residentDetails.rentPerMonth}
                                                        onChange={(e) => bedsHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                        placeholder="Enter the Rent Per Month here"
                                                        name="rentPerMonth"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    {bedData?.resident_data?.residentStatus === 'Active' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Delay Charges</th>
                                            <td className="py-1 px-2">{bedData?.resident_data?.residentStatus === 'Active' && bedData?.resident_data?.rent_records?.length > 0
                                                ? bedData.resident_data.rent_records.slice(-1)[0].delayCharges
                                                : 0}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rent after Delay Charges</th>
                                            <td className="py-1 px-2">{Number((residentDetails?.rentPerMonth || '').match(/^\d+/)) + Number(bedData?.resident_data?.residentStatus === 'Active' && bedData?.resident_data?.rent_records?.length > 0
                                                ? bedData.resident_data.rent_records.slice(-1)[0].delayCharges
                                                : 0)}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Agreement</th>
                                            <td className="py-1 px-2 hover:text-[#D4A017] hover:cursor-pointer" onClick={() => viewAgreementHandle(bedData)}>{`${bedData?.resident_data?.residentsName.replace(/\s+/g, '')}_Contract.pdf`}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rent Status</th>
                                            <td className="py-1 px-2">{bedData?.resident_data?.residentStatus === 'Active' && bedData?.resident_data?.rent_records?.length > 0
                                                ? bedData.resident_data.rent_records.slice(-1)[0].rentStatus
                                                : 'Not Received'}</td>
                                        </tr>
                                    </>}
                                </tbody>
                            </table>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default residentDetails