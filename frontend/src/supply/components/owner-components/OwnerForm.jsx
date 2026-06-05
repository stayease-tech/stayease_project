import React, { useState } from "react";
import OwnerData from "../owner-form-components/OwnerData";
import OwnerKyc from "../owner-form-components/OwnerKyc";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";
import { DashPage } from "../../../shared/Dashboard";

function OwnerForm() {
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
    const [emailError, setEmailError] = useState('');

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

        let nextValue = value;
        if (name === "ownerPhone") nextValue = formatIndianPhone(value);
        if (name === "aadharNumber") nextValue = value.replace(/\D/g, "").slice(0, 12);
        if (name === "panNumber") nextValue = value.toUpperCase().replace(/\s/g, "").slice(0, 10);
        if (name === "ifscCode") nextValue = value.toUpperCase().replace(/\s/g, "").slice(0, 11);
        if (name === "accountNumber") nextValue = value.replace(/\D/g, "").slice(0, 18);

        if (name === "ownerEmail") {
            if (nextValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextValue)) {
                setEmailError("Please enter a valid email address.");
            } else {
                setEmailError('');
            }
        }

        setOwnerData((prevState) => ({
            ...prevState,
            [name]: type === "file" ? files[0] : nextValue,
        }));
    }

    const validatePage1 = () => {
        if (!ownerData.ownerName?.trim() || !/^[A-Za-z ]{2,}$/.test(ownerData.ownerName.trim())) {
            toast.error("Please enter a valid owner name.");
            return false;
        }
        if (!ownerData.memberSince) {
            toast.error("Member since is required.");
            return false;
        }
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (ownerData.memberSince > currentMonth) {
            toast.error("Member Since cannot be a future date.");
            return false;
        }
        if (!isValidIndianPhone(ownerData.ownerPhone)) {
            toast.error("Owner phone must be exactly 10 digits.");
            return false;
        }
        if (!ownerData.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.ownerEmail)) {
            toast.error("Please enter a valid owner email.");
            setEmailError("Please enter a valid email address.");
            return false;
        }
        if (!ownerData.ownerAddress?.trim()) {
            toast.error("Owner address is required.");
            return false;
        }
        if (!ownerData.ownerDob) {
            toast.error("Date of birth is required.");
            return false;
        }
        if (new Date(ownerData.ownerDob) > new Date()) {
            toast.error("Date of birth cannot be in the future.");
            return false;
        }
        if (!ownerData.ownerGender) {
            toast.error("Owner gender is required.");
            return false;
        }
        return true;
    }

    const validateOwnerData = () => {
        if (!ownerData.ownerName?.trim() || !/^[A-Za-z ]{2,}$/.test(ownerData.ownerName.trim())) return "Please enter a valid owner name.";
        if (!ownerData.memberSince) return "Member since is required.";
        if (!isValidIndianPhone(ownerData.ownerPhone)) return "Owner phone must be exactly 10 digits.";
        if (!ownerData.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.ownerEmail)) return "Please enter a valid owner email.";
        if (!ownerData.ownerAddress?.trim()) return "Owner address is required.";
        if (!ownerData.ownerDob) return "Date of birth is required.";
        if (new Date(ownerData.ownerDob) > new Date()) return "Date of birth cannot be in the future.";
        if (!ownerData.ownerGender) return "Owner gender is required.";

        if (!/^\d{12}$/.test(ownerData.aadharNumber || "")) return "Aadhaar number must be 12 digits.";
        if (!ownerData.aadharVerification) return "Aadhaar verification status is required.";
        if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(ownerData.panNumber || "")) return "PAN must follow format: ABCDE1234F.";
        if (!ownerData.panVerification) return "PAN verification status is required.";

        if (!ownerData.accountHolderName?.trim()) return "Account holder name is required.";
        if (!/^\d{9,18}$/.test(ownerData.accountNumber || "")) return "Account number must be 9 to 18 digits.";
        if (!ownerData.bankName?.trim()) return "Bank name is required.";
        if (!ownerData.bankBranch?.trim()) return "Bank branch is required.";
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ownerData.ifscCode || "")) return "IFSC must follow format: ABCD0XXXXXX.";

        return null;
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const ownerHandleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateOwnerData();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();

        Object.entries(ownerData).forEach(([key, value]) => {
            if (key === "ownerPhone") {
                formData.append(key, normalizePhoneDigits(value));
                return;
            }
            formData.append(key, value);
        });

        try {
            const response = await axios.post('/supply/owner-form-submit/', formData, {
                withCredentials: true,
                skipGlobalErrorToast: true,
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
        <DashPage>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800"
                        onSubmit={ownerHandleSubmit} method='POST'>

                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">ADD OWNER DETAILS</h1>

                        {currentStep === 'ownerData' && <>
                            <OwnerData ownerData={ownerData} ownerHandleChange={ownerHandleChange} emailError={emailError} />

                            <button
                                className="block w-full px-4 py-2 mt-3 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                                onClick={() => { if (validatePage1()) dataHandleToggle('ownerKYC'); }}
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
        </DashPage>
    )
}

export default OwnerForm