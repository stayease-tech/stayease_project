import React from 'react'
import { formatIndianPhone } from "../../../shared/phone";

function OwnerData({ ownerDetails, dataEditView, ownerHandleChange }) {
    return (
        <div>
            <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">Owner Details</h3>

            <div className="w-full overflow-x-auto">
                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded text-xs sm:text-sm-lg max-sm:text-xs">
                    <tbody className='text-xs sm:text-sm'>
                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Name</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.ownerName}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="ownerName"
                                            value={ownerDetails.ownerName}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="ownerName"
                                            placeholder="Enter the Owner Name here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Member Since</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.memberSince}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="month"
                                            id="memberSince"
                                            value={ownerDetails.memberSince}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                            name="memberSince"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Phone</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{formatIndianPhone(ownerDetails.ownerPhone)}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="ownerPhone"
                                            value={ownerDetails.ownerPhone}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="ownerPhone"
                                            placeholder="98765 43210"
                                            inputMode="numeric"
                                            maxLength={11}
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Email</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.ownerEmail}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="email"
                                            id="ownerEmail"
                                            value={ownerDetails.ownerEmail}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="ownerEmail"
                                            placeholder="Enter the Owner Email here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Address</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.ownerAddress}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="ownerAddress"
                                            value={ownerDetails.ownerAddress}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="ownerAddress"
                                            placeholder="Enter the Owner Address here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Date of Birth</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.ownerDob}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="date"
                                            id="ownerDob"
                                            value={ownerDetails.ownerDob}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="ownerDob"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Gender</th>

                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{ownerDetails.ownerGender}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="ownerGender"
                                            value={ownerDetails.ownerGender}
                                            onChange={ownerHandleChange}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="ownerGender"
                                            required>
                                            <option value="" disabled>Select the Owner Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default OwnerData