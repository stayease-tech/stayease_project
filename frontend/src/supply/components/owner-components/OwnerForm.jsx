import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import OwnerData from "../owner-form-components/OwnerData";
import OwnerKyc from "../owner-form-components/OwnerKyc";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function OwnerForm({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();

    const [ownerData, setOwnerData] = useState({
        ownerName: "",
        memberSince: "",
        ownerPhone: "",
        ownerEmail: "",
        ownerAddress: "",
        ownerDob: "",
        ownerGender: "",
        aadharNumber: "",
        aadharFrontCopy: "",
        aadharBackCopy: "",
        aadharVerification: "",
        panNumber: "",
        panFrontCopy: "",
        panBackCopy: "",
        panVerification: "",
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        bankBranch: "",
        ifscCode: "",
        chequeCopy: "",
        accountStatus: "",
        paymentType: ""
    });

    const [currentStep, setCurrentStep] = useState('ownerData');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dataHandleToggle = (step) => {
        setCurrentStep(step);
    };

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

        if (type === "chequeCopy") {
            document.getElementById("chequeCopy").click();
        }
    };

    const ownerHandleChange = (e) => {
        const { name, value, type, files } = e.target;

        setOwnerData((prevState) => ({
            ...prevState,
            [name]: type === "file" ? files[0] : value,
        }));
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const ownerHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();

        Object.entries(ownerData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await axios.post('/supply/owner-form-submit/', formData, {
                withCredentials: true,
            });

            alert(response.data.message);

            if (response.data.success) {
                setOwnerData({
                    ownerName: "",
                    memberSince: "",
                    ownerPhone: "",
                    ownerEmail: "",
                    ownerAddress: "",
                    ownerDob: "",
                    ownerGender: "",
                    aadharNumber: "",
                    aadharFrontCopy: "",
                    aadharBackCopy: "",
                    aadharVerification: "",
                    panNumber: "",
                    panFrontCopy: "",
                    panBackCopy: "",
                    panVerification: "",
                    accountHolderName: "",
                    accountNumber: "",
                    bankName: "",
                    bankBranch: "",
                    ifscCode: "",
                    chequeCopy: "",
                    accountStatus: "",
                    paymentType: ""
                });

                navigate('/supply/supply-owner-table');
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
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800"
                        onSubmit={ownerHandleSubmit} method='POST'>

                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">ADD OWNER DETAILS</h1>

                        {currentStep === 'ownerData' && <>
                            <OwnerData ownerData={ownerData} ownerHandleChange={ownerHandleChange} />

                            <button
                                className="block w-full px-4 py-2 mt-3 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('ownerKYC')}
                                type="button">Next</button>
                        </>
                        }

                        {currentStep === 'ownerKYC' && <>
                            <OwnerKyc ownerData={ownerData} triggerFileInput={triggerFileInput} ownerHandleChange={ownerHandleChange} />

                            <div className="flex gap-2 sm:gap-5 mt-5">
                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('ownerData')}
                                    type="button">Prev</button>

                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" disabled={isSubmitting}
                                    type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
                            </div>
                        </>
                        }
                    </form>
                </div>
            </div>
        </div>
    )
}

export default OwnerForm