import React, { useState, useEffect } from 'react';
import { FaUpload } from "react-icons/fa";

function OwnerKyc({ ownerHandleChange, ownerData, triggerFileInput }) {
    const [isAadharOpen, setIsAadharOpen] = useState(false);
    const [isPanOpen, setIsPanOpen] = useState(false);

    const toggleDropdown = (type) => {
        if (type === 'aadhar') {
            setIsAadharOpen(!isAadharOpen);
        }
        if (type === 'pan') {
            setIsPanOpen(!isPanOpen);
        }
    };

    useEffect(() => {
        if (ownerData.aadharFrontCopy !== "" && ownerData.aadharBackCopy !== "") {
            setIsAadharOpen(false);
        }

        if (ownerData.panFrontCopy !== "" && ownerData.panBackCopy !== "") {
            setIsPanOpen(false);
        }
    }, [ownerData.aadharFrontCopy, ownerData.aadharBackCopy, ownerData.panFrontCopy, ownerData.panBackCopy])

    return (
        <div>
            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Owner KYC</h3>

            <label htmlFor="aadharNumber" className="text-[#D4A017] max-sm:text-sm"><strong>Aadhar Number:</strong></label>
            <input
                type="text"
                id="aadharNumber"
                value={ownerData.aadharNumber}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="aadharNumber"
                placeholder="Enter the Account Number here"
                required />

            <label htmlFor="rentFree" className="text-[#D4A017] max-sm:text-sm"><strong>Upload Aadhar:</strong></label>
            <button
                type="button"
                onClick={() => toggleDropdown("aadhar")}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 text-left border border-gray-300 rounded bg-white text-xs sm:text-sm"
            >
                Upload your Document here
            </button>
            {isAadharOpen && (
                <div className='relative'>
                    <div className="absolute flex flex-col justify-evenly bg-white border border-gray-300 rounded shadow-lg z-10 w-full max-w-xs">
                        <div className="border-b border-gray-300">
                            <input
                                type="file"
                                id="aadharFrontCopy"
                                name="aadharFrontCopy"
                                accept="image/*, .pdf"
                                onChange={ownerHandleChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => triggerFileInput('aadharFrontCopy')}
                                className="text-black p-2 rounded text-sm bg-white text-left flex gap-3 items-center w-full"
                            >
                                <span className="text-sm sm:text-lg"><FaUpload /></span>
                                <span className="text-xs sm:text-sm truncate flex-1">
                                    {ownerData.aadharFrontCopy?.name || 'Upload Front Copy'}
                                </span>
                            </button>
                        </div>

                        <div className="border-b border-gray-300">
                            <input
                                type="file"
                                id="aadharBackCopy"
                                name="aadharBackCopy"
                                accept="image/*, .pdf"
                                onChange={ownerHandleChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => triggerFileInput('aadharBackCopy')}
                                className="text-black p-2 rounded text-sm bg-white text-left flex gap-3 items-center w-full"
                            >
                                <span className="text-sm sm:text-lg"><FaUpload /></span>
                                <span className="text-xs sm:text-sm truncate flex-1">
                                    {ownerData.aadharBackCopy?.name || 'Upload Back Copy'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <label htmlFor="aadharVerification" className="text-[#D4A017] max-sm:text-sm"><strong>Aadhar Verification:</strong></label>
            <select
                id="aadharVerification"
                value={ownerData.aadharVerification}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="aadharVerification"
                required>
                <option value="" disabled>Select the Verification Status here</option>
                <option value="Verified">Verified</option>
                <option value="Not Verified">Not Verified</option>
            </select>

            <label htmlFor="panNumber" className="text-[#D4A017] max-sm:text-sm"><strong>PAN Number:</strong></label>
            <input
                type="text"
                id="panNumber"
                value={ownerData.panNumber}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="panNumber"
                placeholder="Enter the Account Number here"
                required />

            <label htmlFor="rentFree" className="text-[#D4A017] max-sm:text-sm"><strong>Upload PAN:</strong></label>
            <button
                type="button"
                onClick={() => toggleDropdown("pan")}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 text-left border border-gray-300 rounded bg-white text-xs sm:text-sm"
            >
                Upload your Document here
            </button>
            {isPanOpen && (
                <div className='relative'>
                    <div className="absolute flex flex-col justify-evenly bg-white border border-gray-300 rounded shadow-lg z-10 w-full max-w-xs">
                        <div className="border border-gray-300">
                            <input
                                type="file"
                                id="panFrontCopy"
                                name="panFrontCopy"
                                accept="image/*, .pdf"
                                onChange={ownerHandleChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => triggerFileInput('panFrontCopy')}
                                className="text-black p-2 rounded text-sm bg-white text-left flex gap-3 items-center w-full"
                            >
                                <span className="text-sm sm:text-lg"><FaUpload /></span> <span className="text-xs sm:text-sm truncate flex-1">{ownerData.panFrontCopy?.name || 'Upload Front Copy'}</span>
                            </button>
                        </div>

                        <div className="border border-gray-300">
                            <input
                                type="file"
                                id="panBackCopy"
                                name="panBackCopy"
                                accept="image/*, .pdf"
                                onChange={ownerHandleChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => triggerFileInput('panBackCopy')}
                                className="text-black p-2 rounded text-sm bg-white text-left flex gap-3 items-center w-full"
                            >
                                <span className="text-sm sm:text-lg"><FaUpload /></span> <span className="text-xs sm:text-sm truncate flex-1">{ownerData.panBackCopy?.name || 'Upload Front Copy'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <label htmlFor="panVerification" className="text-[#D4A017] max-sm:text-sm"><strong>PAN Verification:</strong></label>
            <select
                id="panVerification"
                value={ownerData.panVerification}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="panVerification"
                required>
                <option value="" disabled>Select the Verification Status here</option>
                <option value="Verified">Verified</option>
                <option value="Not Verified">Not Verified</option>
            </select>

            <h3 className="font-semibold mb-4 mt-4 text-stone-400 max-sm:text-sm">Bank Details</h3>

            <label htmlFor="accountHolderName" className="text-[#D4A017] max-sm:text-sm"><strong>Account Holder's Name:</strong></label>
            <input
                type="text"
                id="accountHolderName"
                value={ownerData.accountHolderName}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="accountHolderName"
                placeholder="Enter the Account Holder's Name here"
                required />

            <label htmlFor="accountNumber" className="text-[#D4A017] max-sm:text-sm"><strong>Account Number:</strong></label>
            <input
                type="text"
                id="accountNumber"
                value={ownerData.accountNumber}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="accountNumber"
                placeholder="Enter the Account Number here"
                required />

            <label htmlFor="bankName" className="text-[#D4A017] max-sm:text-sm"><strong>Bank Name:</strong></label>
            <input
                type="text"
                id="bankName"
                value={ownerData.bankName}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="bankName"
                placeholder="Enter the Bank Name here"
                required />

            <label htmlFor="bankBranch" className="text-[#D4A017] max-sm:text-sm"><strong>Bank Branch:</strong></label>
            <input
                type="text"
                id="bankBranch"
                value={ownerData.bankBranch}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="bankBranch"
                placeholder="Enter the Bank Branch here"
                required />

            <label htmlFor="ifscCode" className="text-[#D4A017] max-sm:text-sm"><strong>IFSC Code:</strong></label>
            <input
                type="text"
                id="ifscCode"
                value={ownerData.ifscCode}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ifscCode"
                placeholder="Enter the IFSC Code here"
                required />

            <label htmlFor="accountStatus" className="text-[#D4A017] max-sm:text-sm"><strong>Account Status:</strong></label>
            <select
                id="accountStatus"
                value={ownerData.accountStatus}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="accountStatus"
                required>
                <option value="" disabled>Select the Account Status here</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
            </select>

            <label htmlFor="paymentType" className="text-[#D4A017] max-sm:text-sm"><strong>Payment Type:</strong></label>
            <select
                id="paymentType"
                value={ownerData.paymentType}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="paymentType"
                required>
                <option value="" disabled>Select the Payment Type here</option>
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
            </select>

            <label htmlFor="chequeCopy" className="text-[#D4A017] max-sm:text-sm">
                <strong>Cheque Copy</strong>
            </label>

            <div className="w-full text-center">
                <input
                    type="file"
                    id="chequeCopy"
                    name="chequeCopy"
                    accept="image/*, .pdf"
                    onChange={ownerHandleChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => triggerFileInput('chequeCopy')}
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                >
                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{ownerData.chequeCopy?.name || 'No file chosen'}</span>
                </button>
            </div>
        </div>
    )
}

export default OwnerKyc