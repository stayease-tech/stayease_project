// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { DATE_INPUT_MAX, DATE_INPUT_MIN, isValidIsoDateInRange } from "../../../shared/dateInput";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function residentDetails() {
    const { getOptions, getOptionsWithCurrent, getStaffNamesList } = useDropdowns();
    const navigate = useNavigate();
    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const location = useLocation();
    const bedData = location?.state?.bedData || {};
    const bedsData = location?.state?.bedsData || [];
    const flag = location?.state?.flag || false;
    const fromResidents = location?.state?.fromResidents || false;
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
            toast.warning('Check-in date must be before check-out date');
            setresidentDetails(prev => ({
                ...prev,
                checkOut: ''
            }));
        }

        if (name === 'checkOut' && residentDetails.checkIn && value < residentDetails.checkIn) {
            toast.warning('Check-out date must be after check-in date');
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
            toast.info('No data is updated!');
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

            if (response.data.success) {
                toast.success(response.data.message);
                navigate(fromResidents ? `/sales/sales-residents-list` : `/sales/sales-beds-table`);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Error updating form:', err);
            toast.error('There was an error updating the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <DashPage>
            <form className="max-w-3xl mx-auto py-6" onSubmit={bedsHandleUpdate}>
                <h1 className="text-center text-xl font-semibold mb-6 text-[#D4A017]">BEDS DATA</h1>

                <div className="flex justify-between mb-4">
                    <button
                        className="px-4 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                        onClick={() => fromResidents ? navigate(`/sales/sales-residents-list`) : flag ? navigate(`/sales/sales-residents-table/${bedData?.id}`, { state: { bedsData } }) : navigate(`/sales/sales-beds-table`)}
                        type="button"
                    >
                        Prev
                    </button>

                    <div className="flex gap-2">
                        <button
                            className="px-4 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                            onClick={() => editHandle()}
                            type="button"
                        >
                            {!dataEditView ? 'Update Details' : 'View Details'}
                        </button>

                        {dataEditView && (
                            <button
                                className="px-4 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B] disabled:opacity-50"
                                disabled={isSaving}
                                type="submit"
                            >
                                {isSaving ? "Saving..." : "Save Details"}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-xs font-semibold text-stone-400 mb-3">{bedData?.propertyName}</p>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <div className="grid grid-cols-2 gap-3">

                        {/* Static bed info */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Flat Number</p>
                            <p className="text-xs text-gray-800">{bedData?.roomNo}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Flat Type</p>
                            <p className="text-xs text-gray-800">{bedData?.roomType}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Room Number</p>
                            <p className="text-xs text-gray-800">{bedData?.bedLabel}</p>
                        </div>

                        {/* Property Manager */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Property Manager</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.propertyManager || '-'}</p>
                            ) : (
                                <select
                                    id="propertyManager"
                                    value={residentDetails.propertyManager}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    name="propertyManager"
                                    required
                                >
                                    <option value="" disabled>Select Property Manager</option>
                                    {getStaffNamesList().map((name, i) => (
                                        <option key={i} value={name}>{name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Sales Manager */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Sales Manager</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.salesManager || '-'}</p>
                            ) : (
                                <select
                                    id="salesManager"
                                    value={residentDetails.salesManager}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    name="salesManager"
                                    required
                                >
                                    <option value="" disabled>Select Sales Manager</option>
                                    {getStaffNamesList().map((name, i) => (
                                        <option key={i} value={name}>{name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Comfort Class */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Comfort Class</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.comfortClass || '-'}</p>
                            ) : (
                                <select
                                    id="comfortClass"
                                    value={residentDetails.comfortClass}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    name="comfortClass"
                                    required
                                >
                                    <option value="" disabled>Select Comfort Class</option>
                                    {getOptionsWithCurrent('comfort_classes', residentDetails.comfortClass).map((c, i) => (
                                        <option key={i} value={c}>{c}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Meal Type */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Meal Type</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.mealType || '-'}</p>
                            ) : (
                                <select
                                    id="mealType"
                                    value={residentDetails.mealType}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    name="mealType"
                                    required
                                >
                                    <option value="" disabled>Select Meal Type</option>
                                    {getOptionsWithCurrent('meal_types', residentDetails.mealType).map((m, i) => (
                                        <option key={i} value={m}>{m}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Resident Name */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Resident Name</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.residentsName || '-'}</p>
                            ) : (
                                <input
                                    type="text"
                                    value={residentDetails.residentsName}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="Enter resident name"
                                    name="residentsName"
                                />
                            )}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Phone Number</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.phoneNumber || '-'}</p>
                            ) : (
                                <input
                                    type="text"
                                    value={residentDetails.phoneNumber}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="98765 43210"
                                    inputMode="numeric"
                                    maxLength={11}
                                    name="phoneNumber"
                                />
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Email</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.email || '-'}</p>
                            ) : (
                                <input
                                    type="email"
                                    value={residentDetails.email}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="Enter email"
                                    name="email"
                                />
                            )}
                        </div>

                        {/* Permanent Address */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Permanent Address</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.permanentAddress || '-'}</p>
                            ) : (
                                <input
                                    type="text"
                                    value={residentDetails.permanentAddress}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="Enter permanent address"
                                    name="permanentAddress"
                                />
                            )}
                        </div>

                        {/* KYC */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">KYC</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.kycType || '-'}</p>
                            ) : (
                                <select
                                    id="kycType"
                                    value={residentDetails.kycType}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    name="kycType"
                                    required
                                >
                                    <option value="" disabled>Select document type</option>
                                    {getOptionsWithCurrent('kyc_types', residentDetails.kycType).map((k, i) => (
                                        <option key={i} value={k}>{k}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Aadhar fields */}
                        {residentDetails.kycType === 'Aadhar' && <>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Aadhar Number</label>
                                {!dataEditView ? (
                                    <p className="text-xs text-gray-800 tracking-wider">{residentDetails.aadharNumber ? residentDetails.aadharNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim() : '-'}</p>
                                ) : (
                                    <input
                                        type="text"
                                        id="aadharNumber"
                                        value={residentDetails.aadharNumber}
                                        onChange={bedsHandleChange}
                                        className="form-input w-full text-xs"
                                        name="aadharNumber"
                                        placeholder="Enter Aadhar number"
                                        required
                                    />
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Aadhar Front Copy</label>
                                {!dataEditView ? (
                                    <Link
                                        to={typeof residentDetails.aadharFrontCopy === 'string'
                                            ? `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${residentDetails.aadharFrontCopy}`
                                            : residentDetails.aadharFrontCopy
                                                ? URL.createObjectURL(residentDetails.aadharFrontCopy)
                                                : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-800 hover:text-[#D4A017]"
                                    >
                                        {(residentDetails.aadharFrontCopy?.name || (residentDetails?.aadharFrontCopy || '').split('/')[5]) || '-'}
                                    </Link>
                                ) : (
                                    <>
                                        <input type="file" id="aadharFrontCopy" name="aadharFrontCopy" accept="image/*, .pdf" onChange={bedsHandleChange} className="hidden" />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('aadharFrontCopy')}
                                            className="flex items-center gap-2 w-full px-3 py-1.5 border border-gray-300 rounded text-xs text-left bg-white text-gray-700"
                                        >
                                            <Upload size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{residentDetails.aadharFrontCopy?.name || (residentDetails.aadharFrontCopy || '').split('/')[5] || 'Upload document'}</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Aadhar Back Copy</label>
                                {!dataEditView ? (
                                    <Link
                                        to={typeof residentDetails.aadharBackCopy === 'string'
                                            ? `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${residentDetails.aadharBackCopy}`
                                            : residentDetails.aadharBackCopy
                                                ? URL.createObjectURL(residentDetails.aadharBackCopy)
                                                : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-800 hover:text-[#D4A017]"
                                    >
                                        {(residentDetails.aadharBackCopy?.name || (residentDetails?.aadharBackCopy || '').split('/')[5]) || '-'}
                                    </Link>
                                ) : (
                                    <>
                                        <input type="file" id="aadharBackCopy" name="aadharBackCopy" accept="image/*, .pdf" onChange={bedsHandleChange} className="hidden" />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('aadharBackCopy')}
                                            className="flex items-center gap-2 w-full px-3 py-1.5 border border-gray-300 rounded text-xs text-left bg-white text-gray-700"
                                        >
                                            <Upload size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{residentDetails.aadharBackCopy?.name || (residentDetails.aadharBackCopy || '').split('/')[5] || 'Upload document'}</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Aadhar Status</label>
                                {!dataEditView ? (
                                    <p className="text-xs text-gray-800">{residentDetails?.aadharStatus || '-'}</p>
                                ) : (
                                    <select
                                        id="aadharStatus"
                                        value={residentDetails.aadharStatus}
                                        onChange={bedsHandleChange}
                                        className="form-input w-full text-xs"
                                        name="aadharStatus"
                                        required
                                    >
                                        <option value="" disabled>Select status</option>
                                        {getOptionsWithCurrent('verification_statuses', residentDetails.aadharStatus).map((v, i) => (
                                            <option key={i} value={v}>{v}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </>}

                        {/* PAN fields */}
                        {residentDetails.kycType === 'PAN' && <>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">PAN Number</label>
                                {!dataEditView ? (
                                    <p className="text-xs text-gray-800">{residentDetails.panNumber || '-'}</p>
                                ) : (
                                    <input
                                        type="text"
                                        id="panNumber"
                                        value={residentDetails.panNumber}
                                        onChange={bedsHandleChange}
                                        className="form-input w-full text-xs"
                                        name="panNumber"
                                        placeholder="Enter PAN number"
                                        required
                                    />
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">PAN Front Copy</label>
                                {!dataEditView ? (
                                    <Link
                                        to={typeof residentDetails.panFrontCopy === 'string'
                                            ? residentDetails.panFrontCopy
                                            : `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${residentDetails.panFrontCopy}`
                                                ? URL.createObjectURL(residentDetails.panFrontCopy)
                                                : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-800 hover:text-[#D4A017]"
                                    >
                                        {(residentDetails.panFrontCopy?.name || (residentDetails?.panFrontCopy || '').split('/')[5]) || '-'}
                                    </Link>
                                ) : (
                                    <>
                                        <input type="file" id="panFrontCopy" name="panFrontCopy" accept="image/*, .pdf" onChange={bedsHandleChange} className="hidden" />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('panFrontCopy')}
                                            className="flex items-center gap-2 w-full px-3 py-1.5 border border-gray-300 rounded text-xs text-left bg-white text-gray-700"
                                        >
                                            <Upload size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{residentDetails.panFrontCopy?.name || (residentDetails.panFrontCopy || '').split('/')[5] || 'Upload document'}</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">PAN Back Copy</label>
                                {!dataEditView ? (
                                    <Link
                                        to={typeof residentDetails.panBackCopy === 'string'
                                            ? residentDetails.panBackCopy
                                            : `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${residentDetails.panBackCopy}`
                                                ? URL.createObjectURL(residentDetails.panBackCopy)
                                                : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-800 hover:text-[#D4A017]"
                                    >
                                        {(residentDetails.panBackCopy?.name || (residentDetails?.panBackCopy || '').split('/')[5]) || '-'}
                                    </Link>
                                ) : (
                                    <>
                                        <input type="file" id="panBackCopy" name="panBackCopy" accept="image/*, .pdf" onChange={bedsHandleChange} className="hidden" />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('panBackCopy')}
                                            className="flex items-center gap-2 w-full px-3 py-1.5 border border-gray-300 rounded text-xs text-left bg-white text-gray-700"
                                        >
                                            <Upload size={14} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{residentDetails.panBackCopy?.name || (residentDetails.panBackCopy || '').split('/')[5] || 'Upload document'}</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">PAN Status</label>
                                {!dataEditView ? (
                                    <p className="text-xs text-gray-800">{residentDetails?.panStatus || '-'}</p>
                                ) : (
                                    <select
                                        id="panStatus"
                                        value={residentDetails.panStatus}
                                        onChange={bedsHandleChange}
                                        className="form-input w-full text-xs"
                                        name="panStatus"
                                        required
                                    >
                                        <option value="" disabled>Select status</option>
                                        {getOptionsWithCurrent('verification_statuses', residentDetails.panStatus).map((v, i) => (
                                            <option key={i} value={v}>{v}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </>}

                        {/* Check-In */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Check-In</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.checkIn ? new Date(residentDetails.checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3') : '-'}</p>
                            ) : (
                                <input
                                    type="date"
                                    value={residentDetails.checkIn}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    name="checkIn"
                                    min={DATE_INPUT_MIN}
                                    max={DATE_INPUT_MAX}
                                />
                            )}
                        </div>

                        {/* Check-Out */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Check-Out</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.checkOut ? new Date(residentDetails.checkOut).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3') : '-'}</p>
                            ) : (
                                <input
                                    type="date"
                                    value={residentDetails.checkOut}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    name="checkOut"
                                    min={residentDetails.checkIn || DATE_INPUT_MIN}
                                    max={DATE_INPUT_MAX}
                                />
                            )}
                        </div>

                        {/* Total Deposit Paid */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Total Deposit Paid</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.totalDepositPaid || '-'}</p>
                            ) : (
                                <input
                                    type="text"
                                    value={residentDetails.totalDepositPaid}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="Enter total deposit paid"
                                    name="totalDepositPaid"
                                />
                            )}
                        </div>

                        {/* Rent Per Month */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 block">Rent Per Month</label>
                            {!dataEditView ? (
                                <p className="text-xs text-gray-800">{residentDetails?.rentPerMonth || '-'}</p>
                            ) : (
                                <input
                                    type="text"
                                    value={residentDetails.rentPerMonth}
                                    onChange={bedsHandleChange}
                                    className="form-input w-full text-xs"
                                    placeholder="Enter rent per month"
                                    name="rentPerMonth"
                                />
                            )}
                        </div>

                        {/* Active resident additional fields */}
                        {bedData?.resident_data?.residentStatus === 'Active' && <>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Delay Charges</p>
                                <p className="text-xs text-gray-800">
                                    {bedData?.resident_data?.residentStatus === 'Active' && bedData?.resident_data?.rent_records?.length > 0
                                        ? bedData.resident_data.rent_records.slice(-1)[0].delayCharges
                                        : 0}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Rent after Delay Charges</p>
                                <p className="text-xs text-gray-800">
                                    {Number((residentDetails?.rentPerMonth || '').match(/^\d+/)) + Number(bedData?.resident_data?.residentStatus === 'Active' && bedData?.resident_data?.rent_records?.length > 0
                                        ? bedData.resident_data.rent_records.slice(-1)[0].delayCharges
                                        : 0)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Agreement</p>
                                <p
                                    className="text-xs text-gray-800 hover:text-[#D4A017] cursor-pointer"
                                    onClick={() => viewAgreementHandle(bedData)}
                                >
                                    {`${bedData?.resident_data?.residentsName.replace(/\s+/g, '')}_Contract.pdf`}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Rent Status</p>
                                <p className="text-xs text-gray-800">
                                    {bedData?.resident_data?.residentStatus === 'Active' && bedData?.resident_data?.rent_records?.length > 0
                                        ? bedData.resident_data.rent_records.slice(-1)[0].rentStatus
                                        : 'Not Received'}
                                </p>
                            </div>
                        </>}

                    </div>
                </div>
            </form>
        </DashPage>
    );
}

export default residentDetails;
