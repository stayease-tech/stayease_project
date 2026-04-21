import React from 'react'

function OwnerData({ ownerData, ownerHandleChange }) {

    return (
        <div>
            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Add Owner Details</h3>

            <label htmlFor="ownerName" className="text-[#D4A017] max-sm:text-sm"><strong>Name:</strong></label>
            <input
                type="text"
                id="ownerName"
                value={ownerData.ownerName}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerName"
                placeholder="Enter the Owner Name here"
                required />

            <label htmlFor="memberSince" className="text-[#D4A017] max-sm:text-sm"><strong>Member Since:</strong></label>
            <input
                type="month"
                id="memberSince"
                value={ownerData.memberSince}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400"
                name="memberSince"
                required />

            <label htmlFor="ownerPhone" className="text-[#D4A017] max-sm:text-sm"><strong>Phone:</strong></label>
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

            <label htmlFor="ownerEmail" className="text-[#D4A017] max-sm:text-sm"><strong>Email:</strong></label>
            <input
                type="email"
                id="ownerEmail"
                value={ownerData.ownerEmail}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerEmail"
                placeholder="Enter the Owner Email Id here"
                required />

            <label htmlFor="ownerAddress" className="text-[#D4A017] max-sm:text-sm"><strong>Address:</strong></label>
            <input
                type="text"
                id="ownerAddress"
                value={ownerData.ownerAddress}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerAddress"
                placeholder="Enter the Owner Address here"
                required />

            <label htmlFor="ownerDob" className="text-[#D4A017] max-sm:text-sm"><strong>Date of Birth:</strong></label>
            <input
                type="date"
                id="ownerDob"
                value={ownerData.ownerDob}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerDob"
                required />

            <label htmlFor="ownerGender" className="text-[#D4A017] max-sm:text-sm"><strong>Gender:</strong></label>
            <select
                id="ownerGender"
                value={ownerData.ownerGender}
                onChange={ownerHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="ownerGender"
                required>
                <option value="" disabled>Select the Owner Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
        </div>
    )
}

export default OwnerData