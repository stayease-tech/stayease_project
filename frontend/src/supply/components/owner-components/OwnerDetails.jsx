import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";
import OwnerData from "../owner-details-components/OwnerData";
import OwnerKyc from "../owner-details-components/OwnerKyc";

function OwnerDetails({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const location = useLocation();
    const ownerData = location.state?.ownerData;
    const { id } = useParams();

    const [ownerDetails, setOwnerDetails] = useState({
        ownerName: ownerData?.ownerName || "",
        memberSince: ownerData?.memberSince || "",
        ownerPhone: ownerData?.ownerPhone || "",
        ownerEmail: ownerData?.ownerEmail || "",
        ownerAddress: ownerData?.ownerAddress || "",
        ownerDob: ownerData?.ownerDob || "",
        ownerGender: ownerData?.ownerGender || "",
        aadharNumber: ownerData?.aadharNumber || "",
        aadharFrontCopy: ownerData?.aadharFrontCopy || "",
        aadharBackCopy: ownerData?.aadharBackCopy || "",
        aadharVerification: ownerData?.aadharVerification || "",
        panNumber: ownerData?.panNumber || "",
        panFrontCopy: ownerData?.panFrontCopy || "",
        panBackCopy: ownerData?.panBackCopy || "",
        accountHolderName: ownerData?.accountHolderName || "",
        accountNumber: ownerData?.accountNumber || "",
        panVerification: ownerData?.panVerification || "",
        bankName: ownerData?.bankName || "",
        bankBranch: ownerData?.bankBranch || "",
        ifscCode: ownerData?.ifscCode || "",
        accountStatus: ownerData?.accountStatus || "",
        paymentType: ownerData?.paymentType || "",
        chequeCopy: ownerData?.chequeCopy || "",
    });

    const [currentStep, setCurrentStep] = useState('ownerData');

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

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

    const ownerHandleChange = (e) => {
        const { name, value, type, files } = e.target;

        let nextValue = value;
        if (name === "ownerPhone") nextValue = formatIndianPhone(value);
        if (name === "aadharNumber") nextValue = value.replace(/\D/g, "").slice(0, 12);
        if (name === "panNumber") nextValue = value.toUpperCase().replace(/\s/g, "").slice(0, 10);
        if (name === "ifscCode") nextValue = value.toUpperCase().replace(/\s/g, "").slice(0, 11);
        if (name === "accountNumber") nextValue = value.replace(/\D/g, "").slice(0, 18);

        setOwnerDetails((prevState) => ({
            ...prevState,
            [name]: type === "file" ? files[0] : nextValue,
        }));
    }

    const validateOwnerData = () => {
        if (!ownerDetails.ownerName?.trim() || !/^[A-Za-z ]{2,}$/.test(ownerDetails.ownerName.trim())) return "Please enter a valid owner name.";
        if (!ownerDetails.memberSince) return "Member since is required.";
        if (!isValidIndianPhone(ownerDetails.ownerPhone)) return "Owner phone must be exactly 10 digits.";
        if (!ownerDetails.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerDetails.ownerEmail)) return "Please enter a valid owner email.";
        if (!ownerDetails.ownerAddress?.trim()) return "Owner address is required.";
        if (!ownerDetails.ownerDob) return "Date of birth is required.";
        if (new Date(ownerDetails.ownerDob) > new Date()) return "Date of birth cannot be in the future.";
        if (!ownerDetails.ownerGender) return "Owner gender is required.";
        if (!/^\d{12}$/.test(ownerDetails.aadharNumber || "")) return "Aadhaar number must be 12 digits.";
        if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(ownerDetails.panNumber || "")) return "PAN must follow format: ABCDE1234F.";
        if (!/^\d{9,18}$/.test(ownerDetails.accountNumber || "")) return "Account number must be 9 to 18 digits.";
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ownerDetails.ifscCode || "")) return "IFSC must follow format: ABCD0XXXXXX.";
        return null;
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const handleUpdate = async (e) => {
        e.preventDefault();
        const validationError = validateOwnerData();
        if (validationError) {
            toast.error(validationError);
            return;
        }
        setIsSaving(true);

        const formData = new FormData();

        Object.keys(ownerDetails).forEach((key) => {
            if (key === "aadharFrontCopy" || key === "aadharBackCopy" || key === "panFrontCopy" || key === "panBackCopy" || key === "chequeCopy") {
                const newFile = ownerDetails[key];

                if (typeof newFile === 'object') {
                    formData.append(key, newFile);
                }
            }

            if (ownerDetails[key] !== ownerData[key] && ownerDetails[key] !== undefined && ownerDetails[key] !== null && key !== "aadharFrontCopy" && key !== "aadharBackCopy" && key !== "panFrontCopy" && key !== "panBackCopy" && key !== "chequeCopy") {
                if (key === "ownerPhone") {
                    formData.append(key, normalizePhoneDigits(ownerDetails[key]));
                } else {
                    formData.append(key, ownerDetails[key]);
                }
            }
        });

        if (formData.entries().next().done) {
            alert('No data is updated!')
            setIsSaving(false);
            return;
        }

        try {
            const response = await axios.put(`/supply/owner-form-update/${id}/`, formData, {
                withCredentials: true,
                skipGlobalErrorToast: true,
            });

            if (response.data.success) {
                alert(response.data.message);

                navigate('/supply/supply-owner-table');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    const handleDelete = async (e) => {
        e.preventDefault();
        setIsDeleting(true);

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`/supply/owner-form-delete/${id}/`, {
                withCredentials: true,
            });

            alert(response.data.message);

            if (response.data.success) {
                navigate('/supply/supply-owner-table');
            }
        } catch (err) {
            console.error('Error deleting form:', err);
            alert('There was an error deleting the form. Please try again!');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-5`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800" method="POST" onSubmit={handleUpdate}>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">SUPPLY DETAILS</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/supply/supply-owner-table`)}
                                type="button">Prev</button>

                            <div className="flex justify-between sm:justify-end mb-5">
                                <button
                                    className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()}
                                    type="button">{!dataEditView ? 'Update Details' : 'View Details'}</button>

                                <button
                                    className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving || isDeleting}
                                    type={dataEditView ? "submit" : "button"}
                                    onClick={!dataEditView ? handleDelete : null}
                                >
                                    {dataEditView ? (isSaving ? "Saving Details..." : "Save Details") : (isDeleting ? "Deleting..." : "Delete")}
                                </button>
                            </div>
                        </div>

                        {currentStep === 'ownerData' && <>
                            <OwnerData ownerDetails={ownerDetails} dataEditView={dataEditView} ownerHandleChange={ownerHandleChange} />

                            <button
                                className="block w-full px-4 py-2 mt-5 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                                onClick={() => dataHandleToggle('ownerKyc')}
                                type="button">Next</button>

                        </>}

                        {currentStep === 'ownerKyc' && <>
                            <OwnerKyc dataEditView={dataEditView} ownerData={ownerData} ownerDetails={ownerDetails} triggerFileInput={triggerFileInput} ownerHandleChange={ownerHandleChange} />

                            <div className="flex gap-5 mt-5">
                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('ownerData')}
                                    type="button">Prev</button>
                            </div>
                        </>}
                    </form >
                </div>
            </div>
        </div >
    )
}

export default OwnerDetails