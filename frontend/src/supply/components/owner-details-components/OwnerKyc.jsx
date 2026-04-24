import React from 'react';
import { Link } from "react-router-dom";
import { FaUpload } from "react-icons/fa";

function getFileName(fileValue) {
    if (!fileValue) return 'No file uploaded';
    if (typeof fileValue === 'object' && fileValue.name) return fileValue.name;
    if (typeof fileValue === 'string' && fileValue.length > 0) {
        const parts = fileValue.split('/');
        return parts[parts.length - 1] || 'View file';
    }
    return 'No file uploaded';
}

function getFileUrl(fileValue) {
    if (!fileValue) return '#';
    if (typeof fileValue === 'string') return fileValue;
    if (typeof fileValue === 'object') return URL.createObjectURL(fileValue);
    return '#';
}

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

function FileRow({ label, fileValue, fieldName, editMode, onChange, onTrigger }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 py-3 border-b border-gray-100 last:border-b-0">
            <dt className="text-sm font-medium text-[#D4A017] sm:w-40 sm:min-w-[10rem] sm:flex-shrink-0">{label}</dt>
            <dd className="text-sm text-slate-700 sm:flex-1 min-w-0">
                {!editMode ? (
                    fileValue ? (
                        <Link to={getFileUrl(fileValue)} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#D4A017] hover:underline">
                            {getFileName(fileValue)}
                        </Link>
                    ) : (
                        <span className="text-gray-400">No file uploaded</span>
                    )
                ) : (
                    <>
                        <input type="file" id={fieldName} name={fieldName} accept="image/*, .pdf"
                            onChange={onChange} className="hidden" />
                        <button type="button" onClick={() => onTrigger(fieldName)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50">
                            <FaUpload className="text-[#D4A017]" />
                            <span className="truncate max-w-xs">{getFileName(fileValue)}</span>
                        </button>
                    </>
                )}
            </dd>
        </div>
    );
}

function OwnerKyc({ dataEditView, ownerData, ownerDetails, triggerFileInput, ownerHandleChange }) {
    const inputClass = "w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none";
    const selectClass = "w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none";

    return (
        <div className="space-y-6">
            {/* Aadhaar KYC */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Aadhaar Details</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="Aadhaar Number *" value={
                        ownerDetails.aadharNumber
                            ? <span className="tracking-wider">{ownerDetails.aadharNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim()}</span>
                            : '—'
                    } editMode={dataEditView}>
                        <input type="text" name="aadharNumber"
                            value={ownerDetails.aadharNumber ? ownerDetails.aadharNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim() : ''}
                            onChange={ownerHandleChange} className={`${inputClass} tracking-wider`}
                            placeholder="XXXX XXXX XXXX" maxLength={14} inputMode="numeric" required />
                    </DetailRow>

                    <FileRow label="Aadhaar Front" fileValue={ownerDetails.aadharFrontCopy} fieldName="aadharFrontCopy"
                        editMode={dataEditView} onChange={ownerHandleChange} onTrigger={triggerFileInput} />

                    <FileRow label="Aadhaar Back" fileValue={ownerDetails.aadharBackCopy} fieldName="aadharBackCopy"
                        editMode={dataEditView} onChange={ownerHandleChange} onTrigger={triggerFileInput} />

                    <DetailRow label="Verification" value={ownerDetails.aadharVerification || '—'} editMode={dataEditView}>
                        <select name="aadharVerification" value={ownerDetails.aadharVerification}
                            onChange={ownerHandleChange} className={selectClass}>
                            <option value="" disabled>Select status</option>
                            <option value="Verified">Verified</option>
                            <option value="Not Verified">Not Verified</option>
                        </select>
                    </DetailRow>
                </dl>
            </div>

            {/* PAN KYC */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">PAN Details</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="PAN Number *" value={ownerDetails.panNumber || '—'} editMode={dataEditView}>
                        <input type="text" name="panNumber" value={ownerDetails.panNumber}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="ABCDE1234F" required />
                    </DetailRow>

                    <FileRow label="PAN Front" fileValue={ownerDetails.panFrontCopy} fieldName="panFrontCopy"
                        editMode={dataEditView} onChange={ownerHandleChange} onTrigger={triggerFileInput} />

                    <FileRow label="PAN Back" fileValue={ownerDetails.panBackCopy} fieldName="panBackCopy"
                        editMode={dataEditView} onChange={ownerHandleChange} onTrigger={triggerFileInput} />

                    <DetailRow label="Verification" value={ownerDetails.panVerification || '—'} editMode={dataEditView}>
                        <select name="panVerification" value={ownerDetails.panVerification}
                            onChange={ownerHandleChange} className={selectClass}>
                            <option value="" disabled>Select status</option>
                            <option value="Verified">Verified</option>
                            <option value="Not Verified">Not Verified</option>
                        </select>
                    </DetailRow>
                </dl>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Bank Details</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="Account Holder *" value={ownerDetails.accountHolderName || '—'} editMode={dataEditView}>
                        <input type="text" name="accountHolderName" value={ownerDetails.accountHolderName}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="Enter account holder name" required />
                    </DetailRow>

                    <DetailRow label="Account Number *" value={ownerDetails.accountNumber || '—'} editMode={dataEditView}>
                        <input type="text" name="accountNumber" value={ownerDetails.accountNumber}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="Enter account number" required />
                    </DetailRow>

                    <DetailRow label="Bank Name *" value={ownerDetails.bankName || '—'} editMode={dataEditView}>
                        <input type="text" name="bankName" value={ownerDetails.bankName}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="Enter bank name" required />
                    </DetailRow>

                    <DetailRow label="Branch *" value={ownerDetails.bankBranch || '—'} editMode={dataEditView}>
                        <input type="text" name="bankBranch" value={ownerDetails.bankBranch}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="Enter bank branch" required />
                    </DetailRow>

                    <DetailRow label="IFSC Code *" value={ownerDetails.ifscCode || '—'} editMode={dataEditView}>
                        <input type="text" name="ifscCode" value={ownerDetails.ifscCode}
                            onChange={ownerHandleChange} className={inputClass}
                            placeholder="ABCD0XXXXXX" required />
                    </DetailRow>

                    <DetailRow label="Account Status" value={ownerDetails.accountStatus || '—'} editMode={dataEditView}>
                        <select name="accountStatus" value={ownerDetails.accountStatus}
                            onChange={ownerHandleChange} className={selectClass}>
                            <option value="" disabled>Select status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </DetailRow>

                    <DetailRow label="Payment Type" value={ownerDetails.paymentType || '—'} editMode={dataEditView}>
                        <select name="paymentType" value={ownerDetails.paymentType}
                            onChange={ownerHandleChange} className={selectClass}>
                            <option value="" disabled>Select type</option>
                            <option value="Auto">Auto</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </DetailRow>

                    <FileRow label="Cheque Copy" fileValue={ownerDetails.chequeCopy} fieldName="chequeCopy"
                        editMode={dataEditView} onChange={ownerHandleChange} onTrigger={triggerFileInput} />
                </dl>
            </div>

            {/* Property Count */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Property Summary</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center inline-block min-w-[8rem]">
                    <p className="text-2xl font-bold text-[#D4A017]">{ownerData?.noOfProperties || 0}</p>
                    <p className="text-xs text-stone-400 mt-1">Properties</p>
                </div>
            </div>
        </div>
    )
}

export default OwnerKyc
