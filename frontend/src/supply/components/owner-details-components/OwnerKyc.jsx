import React from 'react';
import { Link } from "react-router-dom";
import { FaUpload } from "react-icons/fa";

function OwnerKyc({ dataEditView, ownerData, ownerDetails, triggerFileInput, ownerHandleChange }) {
    return (
        <div className='mt-3'>
            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Owner KYC</h3>

            <div className="w-full overflow-x-auto">
                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded text-xs sm:text-sm-lg max-sm:text-xs">
                    <tbody className='text-xs sm:text-sm'>
                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Aadhar Number</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.aadharNumber}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="aadharNumber"
                                            value={ownerDetails.aadharNumber}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="aadharNumber"
                                            placeholder="Enter the Aadhar Number here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th rowSpan="2" className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Upload Aadhar</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof ownerDetails.aadharFrontCopy === 'string'
                                                ? ownerDetails.aadharFrontCopy
                                                : ownerDetails.aadharFrontCopy
                                                    ? URL.createObjectURL(ownerDetails.aadharFrontCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {ownerDetails.aadharFrontCopy?.name || ownerDetails?.aadharFrontCopy.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
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
                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{ownerDetails.aadharFrontCopy?.name || ownerDetails.aadharFrontCopy.split('/')[8]}</span>
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
                                            typeof ownerDetails.aadharBackCopy === 'string'
                                                ? ownerDetails.aadharBackCopy
                                                : ownerDetails.aadharBackCopy
                                                    ? URL.createObjectURL(ownerDetails.aadharBackCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {ownerDetails.aadharBackCopy?.name || ownerDetails?.aadharBackCopy.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
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
                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{ownerDetails.aadharBackCopy?.name || ownerDetails.aadharBackCopy.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Aadhar Verification</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.aadharVerification}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="aadharVerification"
                                            value={ownerDetails.aadharVerification}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="aadharVerification"
                                            required>
                                            <option value="" disabled>Select the Verification Status here</option>
                                            <option value="Verified">Verified</option>
                                            <option value="Not Verified">Not Verified</option>
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">PAN Number</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.panNumber}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="panNumber"
                                            value={ownerDetails.panNumber}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="panNumber"
                                            placeholder="Enter the Aadhar Number here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th rowSpan="2" className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Upload PAN</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof ownerDetails.panFrontCopy === 'string'
                                                ? ownerDetails.panFrontCopy
                                                : ownerDetails.panFrontCopy
                                                    ? URL.createObjectURL(ownerDetails.panFrontCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {ownerDetails.panFrontCopy?.name || ownerDetails?.panFrontCopy.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
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
                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{ownerDetails.panFrontCopy?.name || ownerDetails.panFrontCopy.split('/')[8]}</span>
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
                                            typeof ownerDetails.panBackCopy === 'string'
                                                ? ownerDetails.panBackCopy
                                                : ownerDetails.panBackCopy
                                                    ? URL.createObjectURL(ownerDetails.panBackCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {ownerDetails.panBackCopy?.name || ownerDetails?.panBackCopy.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
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
                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{ownerDetails.panBackCopy?.name || ownerDetails.panBackCopy.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">PAN Verification</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.panVerification}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="panVerification"
                                            value={ownerDetails.panVerification}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="panVerification"
                                            required>
                                            <option value="" disabled>Select the Verification Status here</option>
                                            <option value="Verified">Verified</option>
                                            <option value="Not Verified">Not Verified</option>
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">Bank Details</h3>

            <div className="w-full overflow-x-auto">
                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded text-xs sm:text-sm-lg max-sm:text-xs">
                    <tbody className='text-xs sm:text-sm'>
                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Account Holder's Name</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.accountHolderName}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="accountHolderName"
                                            value={ownerDetails.accountHolderName}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="accountHolderName"
                                            placeholder="Enter the Account Holder's Name here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Account Number</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.accountNumber}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="accountNumber"
                                            value={ownerDetails.accountNumber}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="accountNumber"
                                            placeholder="Enter the Account Number here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Bank Name</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.bankName}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="bankName"
                                            value={ownerDetails.bankName}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="bankName"
                                            placeholder="Enter the Bank Name here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Bank Branch</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.bankBranch}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="bankBranch"
                                            value={ownerDetails.bankBranch}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="bankBranch"
                                            placeholder="Enter the Bank Branch here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">IFSC Code</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.ifscCode}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="ifscCode"
                                            value={ownerDetails.ifscCode}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="ifscCode"
                                            placeholder="Enter the IFSC Code here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Account Status</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.accountStatus}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="accountStatus"
                                            value={ownerDetails.accountStatus}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="accountStatus"
                                            required>
                                            <option value="" disabled>Select the Account Status here</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Payment Type</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.paymentType}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="paymentType"
                                            value={ownerDetails.paymentType}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="paymentType"
                                            required>
                                            <option value="" disabled>Select the Payment Type here</option>
                                            <option value="Auto">Auto</option>
                                            <option value="Manual">Manual</option>
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Cheque Copy</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof ownerDetails.chequeCopy === 'string'
                                                ? ownerDetails.chequeCopy
                                                : ownerDetails.chequeCopy
                                                    ? URL.createObjectURL(ownerDetails.chequeCopy)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {ownerDetails.chequeCopy?.name || ownerDetails?.chequeCopy.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
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
                                            className="p-2 text-black w-full border border-gray-300 rounded text-xs sm:text-sm text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{ownerDetails.chequeCopy?.name || ownerDetails.chequeCopy.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">Property Details</h3>

            <div className="w-full overflow-x-auto">
                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded text-xs sm:text-sm-lg max-sm:text-xs">
                    <tbody className='text-xs sm:text-sm'>
                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">No of Properties</th>
                            <td className="flex">
                                <span className="py-1 px-2 w-full">{ownerData?.noOfProperties}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default OwnerKyc