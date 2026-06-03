import React from 'react'
import { useDropdowns } from "../../../shared/DropdownContext";

function OwnerData({ ownerData, ownerHandleChange, emailError }) {
    const { getOptions } = useDropdowns();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    return (
        <div>
            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Add Owner Details</h3>

            <label htmlFor="ownerName" className="text-[#D4A017] max-sm:text-sm"><strong>Name: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id="ownerName"
                value={ownerData.ownerName}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerName"
                placeholder="Enter the Owner Name here"
                required />

            <label htmlFor="memberSince" className="text-[#D4A017] max-sm:text-sm"><strong>Member Since: <span className="text-red-500">*</span></strong></label>
            <input
                type="month"
                id="memberSince"
                value={ownerData.memberSince}
                onChange={ownerHandleChange}
                max={currentMonth}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400"
                name="memberSince"
                required />

            <label htmlFor="ownerPhone" className="text-[#D4A017] max-sm:text-sm"><strong>Phone: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id="ownerPhone"
                value={ownerData.ownerPhone}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerPhone"
                placeholder="98765 43210"
                inputMode="numeric"
                maxLength={11}
                required />

            <label htmlFor="ownerEmail" className="text-[#D4A017] max-sm:text-sm"><strong>Email: <span className="text-red-500">*</span></strong></label>
            <input
                type="email"
                id="ownerEmail"
                value={ownerData.ownerEmail}
                onChange={ownerHandleChange}
                className={`mt-2 ${emailError ? 'mb-1' : 'mb-3'} text-black w-full p-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm`}
                name="ownerEmail"
                placeholder="Enter the Owner Email Id here"
                required />
            {emailError && <p className="text-red-500 text-xs mb-3">{emailError}</p>}

            <label htmlFor="ownerAddress" className="text-[#D4A017] max-sm:text-sm"><strong>Address: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id="ownerAddress"
                value={ownerData.ownerAddress}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerAddress"
                placeholder="Enter the Owner Address here"
                required />

            <label htmlFor="ownerDob" className="text-[#D4A017] max-sm:text-sm"><strong>Date of Birth: <span className="text-red-500">*</span></strong></label>
            <input
                type="date"
                id="ownerDob"
                value={ownerData.ownerDob}
                onChange={ownerHandleChange}
                max={new Date().toISOString().split('T')[0]}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerDob"
                required />

            <label htmlFor="ownerGender" className="text-[#D4A017] max-sm:text-sm"><strong>Gender: <span className="text-red-500">*</span></strong></label>
            <select
                id="ownerGender"
                value={ownerData.ownerGender}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerGender"
                required>
                <option value="" disabled>Select the Owner Gender</option>
                {getOptions('genders').map((g, i) => (
                    <option key={i} value={g}>{g}</option>
                ))}
            </select>
        </div>
    )
}

export default OwnerData