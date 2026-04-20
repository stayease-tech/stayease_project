import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { FaUpload } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function TenantForm({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const { id } = useParams();

    const [tenantData, setTenantData] = useState({
        bedId: id,
        propertyManager: "",
        salesManager: "",
        comfortClass: "",
        mealType: "",
        residentsName: "",
        phoneNumber: "",
        email: "",
        permanentAddress: "",
        kycType: "",
        aadharNumber: "",
        aadharFrontCopy: "",
        aadharBackCopy: "",
        aadharStatus: "",
        panNumber: "",
        panFrontCopy: "",
        panBackCopy: "",
        panStatus: "",
        checkIn: "",
        checkOut: "",
        totalDepositPaid: "",
        rentPerMonth: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

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

    useEffect(() => {
        setTenantData(prev => ({
            ...prev,
            aadharNumber: "",
            aadharFrontCopy: "",
            aadharBackCopy: "",
            aadharStatus: "",
            panNumber: "",
            panFrontCopy: "",
            panBackCopy: "",
            panStatus: "",
        }))
    }, [tenantData.kycType])

    const tenantHandleChange = (e) => {
        const { name, value, type, files } = e.target;

        setTenantData((prevState) => ({
            ...prevState,
            [name]: type === "file" ? files[0] : value,
        }));

        if (name === 'checkIn' && tenantData.checkOut && value > tenantData.checkOut) {
            alert('Check-in date must be before check-out date');
            setTenantData(prev => ({
                ...prev,
                checkOut: ''
            }));
        }

        if (name === 'checkOut' && tenantData.checkIn && value < tenantData.checkIn) {
            alert('Check-out date must be after check-in date');
            setTenantData(prev => ({
                ...prev,
                checkOut: tenantData.checkIn
            }));
        }
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const tenantHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/sales/tenant-form-submit/', tenantData, {
                withCredentials: true,
            });

            alert(response.data.message);

            if (response.data.success) {
                setTenantData({
                    bedId: "",
                    propertyManager: "",
                    salesManager: "",
                    comfortClass: "",
                    mealType: "",
                    residentsName: "",
                    phoneNumber: "",
                    email: "",
                    permanentAddress: "",
                    kycType: "",
                    aadharNumber: "",
                    aadharFrontCopy: "",
                    aadharBackCopy: "",
                    aadharStatus: "",
                    panNumber: "",
                    panFrontCopy: "",
                    panBackCopy: "",
                    panStatus: "",
                    checkIn: "",
                    checkOut: "",
                    totalDepositPaid: "",
                    rentPerMonth: "",
                });

                navigate(`/sales/sales-beds-table`);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 max-lg:bg-white min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 lg:pb-[1rem]`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={tenantHandleSubmit} method='POST'>
                        <div className="sm:flex justify-start">
                            <button
                                className="block max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/sales/sales-beds-table`)}
                                type="button">Prev</button>
                        </div>

                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-stone-400">ADD TENANT DATA</h1>

                        <label htmlFor="propertyManager" className="text-[#D4A017] max-sm:text-sm"><strong>Property Manager:</strong></label>
                        <select
                            id="propertyManager"
                            value={tenantData.propertyManager}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="propertyManager"
                            required>
                            <option value="" disabled>Select the property manager here</option>
                            <option value="Madhusudhan">Madhusudhan</option>
                            <option value="Kiran">Kiran</option>
                            <option value="Rithan">Rithan</option>
                        </select>

                        <label htmlFor="salesManager" className="text-[#D4A017] max-sm:text-sm"><strong>Sales Manager:</strong></label>
                        <select
                            id="salesManager"
                            value={tenantData.salesManager}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="salesManager"
                            required>
                            <option value="" disabled>Select the sales manager here</option>
                            <option value="Madhusudhan">Madhusudhan</option>
                            <option value="Kiran">Kiran</option>
                            <option value="Rithan">Rithan</option>
                        </select>

                        <label htmlFor="comfortClass" className="text-[#D4A017] max-sm:text-sm"><strong>Comfort Class:</strong></label>
                        <select
                            id="comfortClass"
                            value={tenantData.comfortClass}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="comfortClass"
                            required>
                            <option value="" disabled>Select the comfort class here</option>
                            <option value="With AC">With AC</option>
                            <option value="Without AC">Without AC</option>
                        </select>

                        <label htmlFor="mealType" className="text-[#D4A017] max-sm:text-sm"><strong>Meal Type:</strong></label>
                        <select
                            id="mealType"
                            value={tenantData.mealType}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="mealType"
                            required>
                            <option value="" disabled>Select the meal type here</option>
                            <option value="Breakfast Only">Breakfast Only</option>
                            <option value="Breakfast & Lunch">Breakfast & Lunch</option>
                            <option value="Breakfast, Lunch & Dinner">Breakfast, Lunch & Dinner</option>
                            <option value="Dinner Only">Dinner Only</option>
                            <option value="No Meal Plan">No Meal Plan</option>
                        </select>

                        <label htmlFor="residentsName" className="text-[#D4A017] max-sm:text-sm"><strong>Resident Name:</strong></label>
                        <input
                            type="text"
                            id="residentsName"
                            value={tenantData.residentsName}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="residentsName"
                            placeholder="Enter the resident name here"
                            required />

                        <label htmlFor="phoneNumber" className="text-[#D4A017] max-sm:text-sm"><strong>Phone Number:</strong></label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={tenantData.phoneNumber}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="phoneNumber"
                            placeholder="Enter the phone number here"
                            required />

                        <label htmlFor="email" className="text-[#D4A017] max-sm:text-sm"><strong>Email:</strong></label>
                        <input
                            type="email"
                            id="email"
                            value={tenantData.email}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="email"
                            placeholder="Enter the email address here"
                            required />

                        <label htmlFor="permanentAddress" className="text-[#D4A017] max-sm:text-sm"><strong>Permanent Address:</strong></label>
                        <input
                            type="text"
                            id="permanentAddress"
                            value={tenantData.permanentAddress}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="permanentAddress"
                            placeholder="Enter the permanent address address here"
                            required />

                        <label htmlFor="kycType" className="text-[#D4A017] max-sm:text-sm"><strong>KYC:</strong></label>
                        <select
                            id="kycType"
                            value={tenantData.kycType}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="kycType"
                            required>
                            <option value="" disabled>Select the document type here</option>
                            <option value="Aadhar">Aadhar</option>
                            <option value="PAN">PAN</option>
                        </select>

                        {tenantData.kycType === 'Aadhar' && <>
                            <label htmlFor="aadharNumber" className="text-[#D4A017] max-sm:text-sm"><strong>Aadhar Number:</strong></label>
                            <input
                                type="text"
                                id="aadharNumber"
                                value={tenantData.aadharNumber}
                                onChange={tenantHandleChange}
                                className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                                name="aadharNumber"
                                placeholder="Enter the aadhar number here"
                                required />

                            <label htmlFor="aadharFrontCopy" className="text-[#D4A017] max-sm:text-sm"><strong>Aadhar - Front Copy:</strong></label>

                            <span className="py-1 px-2 w-full">
                                <input
                                    type="file"
                                    id="aadharFrontCopy"
                                    name="aadharFrontCopy"
                                    accept="image/*, .pdf"
                                    onChange={tenantHandleChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => triggerFileInput('aadharFrontCopy')}
                                    className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3 my-2"
                                >
                                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{tenantData.aadharFrontCopy?.name || 'Upload the document here'}</span>
                                </button>
                            </span>

                            <label htmlFor="aadharBackCopy" className="text-[#D4A017] max-sm:text-sm"><strong>Aadhar - Back Copy:</strong></label>

                            <span className="py-1 px-2 w-full">
                                <input
                                    type="file"
                                    id="aadharBackCopy"
                                    name="aadharBackCopy"
                                    accept="image/*, .pdf"
                                    onChange={tenantHandleChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => triggerFileInput('aadharBackCopy')}
                                    className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3 my-2"
                                >
                                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{tenantData.aadharBackCopy?.name || 'Upload the document here'}</span>
                                </button>
                            </span>

                            <label htmlFor="aadharStatus" className="text-[#D4A017] max-sm:text-sm"><strong>Aadhar Status:</strong></label>
                            <select
                                id="aadharStatus"
                                value={tenantData.aadharStatus}
                                onChange={tenantHandleChange}
                                className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                                name="aadharStatus"
                                required>
                                <option value="" disabled>Select the status here</option>
                                <option value="Verified">Verified</option>
                                <option value="Not Verified">Not Verified</option>
                            </select>
                        </>}

                        {tenantData.kycType === 'PAN' && <>
                            <label htmlFor="panNumber" className="text-[#D4A017] max-sm:text-sm"><strong>PAN Number:</strong></label>
                            <input
                                type="text"
                                id="panNumber"
                                value={tenantData.panNumber}
                                onChange={tenantHandleChange}
                                className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                                name="panNumber"
                                placeholder="Enter the PAN number here"
                                required />

                            <label htmlFor="panFrontCopy" className="text-[#D4A017] max-sm:text-sm"><strong>PAN - Front Copy:</strong></label>

                            <span className="py-1 px-2 w-full">
                                <input
                                    type="file"
                                    id="panFrontCopy"
                                    name="panFrontCopy"
                                    accept="image/*, .pdf"
                                    onChange={tenantHandleChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => triggerFileInput('panFrontCopy')}
                                    className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3 my-2"
                                >
                                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{tenantData.panFrontCopy?.name || 'Upload the document here'}</span>
                                </button>
                            </span>

                            <label htmlFor="panBackCopy" className="text-[#D4A017] max-sm:text-sm"><strong>PAN - Back Copy:</strong></label>

                            <span className="py-1 px-2 w-full">
                                <input
                                    type="file"
                                    id="panBackCopy"
                                    name="panBackCopy"
                                    accept="image/*, .pdf"
                                    onChange={tenantHandleChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => triggerFileInput('panBackCopy')}
                                    className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3 my-2"
                                >
                                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{tenantData.panBackCopy?.name || 'Upload the document here'}</span>
                                </button>
                            </span>

                            <label htmlFor="panStatus" className="text-[#D4A017] max-sm:text-sm"><strong>PAN Status:</strong></label>
                            <select
                                id="panStatus"
                                value={tenantData.panStatus}
                                onChange={tenantHandleChange}
                                className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                                name="panStatus"
                                required>
                                <option value="" disabled>Select the status here</option>
                                <option value="Verified">Verified</option>
                                <option value="Not Verified">Not Verified</option>
                            </select>
                        </>}

                        <label htmlFor="checkIn" className="text-[#D4A017] max-sm:text-sm"><strong>Check-In:</strong></label>
                        <input
                            type="date"
                            id="checkIn"
                            value={tenantData.checkIn}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="checkIn"
                            required />

                        <label htmlFor="checkOut" className="text-[#D4A017] max-sm:text-sm"><strong>Check-Out:</strong></label>
                        <input
                            type="date"
                            id="checkOut"
                            value={tenantData.checkOut}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded text-xs sm:text-sm"
                            name="checkOut"
                            min={tenantData.checkIn} />

                        <label htmlFor="totalDepositPaid" className="text-[#D4A017] max-sm:text-sm"><strong>Total Deposit Paid:</strong></label>
                        <input
                            type="text"
                            id="totalDepositPaid"
                            value={tenantData.totalDepositPaid}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="totalDepositPaid"
                            placeholder="Enter the total deposit paid here"
                            required />

                        <label htmlFor="rentPerMonth" className="text-[#D4A017] max-sm:text-sm"><strong>Rent Per Month:</strong></label>
                        <input
                            type="text"
                            id="rentPerMonth"
                            value={tenantData.rentPerMonth}
                            onChange={tenantHandleChange}
                            className="my-2 text-black w-full p-2 border border-gray-300 rounded placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                            name="rentPerMonth"
                            placeholder="Enter the rent per month here"
                            required />

                        <button
                            className="block w-full mt-6 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" disabled={isSubmitting}
                            type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default TenantForm