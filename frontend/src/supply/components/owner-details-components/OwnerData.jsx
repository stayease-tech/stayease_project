import React from 'react'
import { formatIndianPhone } from "../../../shared/phone";

function DetailRow({ label, value, editMode, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 py-3 border-b border-gray-100 last:border-b-0">
            <dt className="text-sm font-medium text-[#D4A017] sm:w-40 sm:min-w-[10rem] sm:flex-shrink-0">{label}</dt>
            <dd className="text-sm text-slate-700 sm:flex-1 min-w-0">
                {editMode ? children : value}
            </dd>
        </div>
    );
}

function OwnerData({ ownerDetails, dataEditView, ownerHandleChange }) {
    const inputClass = "w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none";
    const selectClass = "w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none";

    return (
        <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Personal Information</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="Name *" value={ownerDetails.ownerName} editMode={dataEditView}>
                        <input type="text" name="ownerName" value={ownerDetails.ownerName}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="Enter the owner name" required />
                    </DetailRow>

                    <DetailRow label="Member Since *" value={ownerDetails.memberSince} editMode={dataEditView}>
                        <input type="month" name="memberSince" value={ownerDetails.memberSince}
                            onChange={ownerHandleChange} className={inputClass} required />
                    </DetailRow>

                    <DetailRow label="Date of Birth *" value={ownerDetails.ownerDob} editMode={dataEditView}>
                        <input type="date" name="ownerDob" value={ownerDetails.ownerDob}
                            onChange={ownerHandleChange} className={inputClass} required />
                    </DetailRow>

                    <DetailRow label="Gender *" value={ownerDetails.ownerGender} editMode={dataEditView}>
                        <select name="ownerGender" value={ownerDetails.ownerGender}
                            onChange={ownerHandleChange} className={selectClass} required>
                            <option value="" disabled>Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </DetailRow>
                </dl>
            </div>

            {/* Contact Details */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Contact Details</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="Phone *" value={formatIndianPhone(ownerDetails.ownerPhone)} editMode={dataEditView}>
                        <input type="text" name="ownerPhone" value={ownerDetails.ownerPhone}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="98765 43210" inputMode="numeric" maxLength={11} required />
                    </DetailRow>

                    <DetailRow label="Email *" value={ownerDetails.ownerEmail} editMode={dataEditView}>
                        <input type="email" name="ownerEmail" value={ownerDetails.ownerEmail}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="Enter the owner email" required />
                    </DetailRow>

                    <DetailRow label="Address *" value={ownerDetails.ownerAddress} editMode={dataEditView}>
                        <input type="text" name="ownerAddress" value={ownerDetails.ownerAddress}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="Enter the owner address" required />
                    </DetailRow>
                </dl>
            </div>
        </div>
    )
}

export default OwnerData
