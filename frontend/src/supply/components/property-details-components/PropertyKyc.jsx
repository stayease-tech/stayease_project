import React from 'react';
import { FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";

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

function FileRow({ label, fileValue, fieldName, editMode, onChange, onTrigger }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 py-3 border-b border-gray-100 last:border-b-0">
            <dt className="text-sm font-medium text-[#D4A017] sm:w-40 sm:min-w-[10rem] sm:flex-shrink-0">{label}</dt>
            <dd className="text-sm text-slate-700 sm:flex-1 min-w-0">
                {!editMode ? (
                    fileValue ? (
                        <Link to={getFileUrl(fileValue)} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#D4A017] hover:underline">
                            📄 {getFileName(fileValue)}
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

function PropertyKyc({ dataEditView, propertyDetails, propertyData, propertyHandleChange, triggerFileInput }) {
    const inputClass = "w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none";
    return (
        <div className="space-y-6">
            {/* Property KYC Documents */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Property KYC Documents</h3>
                <dl className="divide-y divide-gray-100">
                    <FileRow label="Sale Deed" fileValue={propertyDetails.saleDeed} fieldName="saleDeed"
                        editMode={dataEditView} onChange={propertyHandleChange} onTrigger={triggerFileInput} />
                    <FileRow label="E Bill" fileValue={propertyDetails.ebill} fieldName="ebill"
                        editMode={dataEditView} onChange={propertyHandleChange} onTrigger={triggerFileInput} />
                    <FileRow label="Tax Receipt" fileValue={propertyDetails.taxReceipt} fieldName="taxReceipt"
                        editMode={dataEditView} onChange={propertyHandleChange} onTrigger={triggerFileInput} />
                    <FileRow label="Water Bill" fileValue={propertyDetails.waterBill} fieldName="waterBill"
                        editMode={dataEditView} onChange={propertyHandleChange} onTrigger={triggerFileInput} />
                </dl>
            </div>

            {/* Supply Documents */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Supply Documents</h3>
                <dl className="divide-y divide-gray-100">
                    <FileRow label="LOI" fileValue={propertyDetails.loi} fieldName="loi"
                        editMode={dataEditView} onChange={propertyHandleChange} onTrigger={triggerFileInput} />
                    <FileRow label="Agreement" fileValue={propertyDetails.agreement} fieldName="agreement"
                        editMode={dataEditView} onChange={propertyHandleChange} onTrigger={triggerFileInput} />
                </dl>
            </div>

            {/* Building Details */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Building Details</h3>
                {!dataEditView ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                            <p className="text-2xl font-bold text-[#D4A017]">{propertyDetails.noOfBasements || 0}</p>
                            <p className="text-xs text-stone-400 mt-1">Basements</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                            <p className="text-2xl font-bold text-[#D4A017]">{propertyDetails.noOfFloors || 0}</p>
                            <p className="text-xs text-stone-400 mt-1">Floors</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                            <p className="text-2xl font-bold text-[#D4A017]">{propertyDetails.noOfRooms || 0}</p>
                            <p className="text-xs text-stone-400 mt-1">Total Rooms</p>
                        </div>
                    </div>
                ) : (
                    <dl className="divide-y divide-gray-100">
                        <DetailRow label="No. of Basements" value={propertyDetails.noOfBasements || '0'} editMode={dataEditView}>
                            <input type="number" name="noOfBasements" value={propertyDetails.noOfBasements}
                                onChange={propertyHandleChange} className={inputClass}
                                placeholder="Enter number of basements" min="0" />
                        </DetailRow>
                        <DetailRow label="No. of Floors" value={propertyDetails.noOfFloors || '0'} editMode={dataEditView}>
                            <input type="number" name="noOfFloors" value={propertyDetails.noOfFloors}
                                onChange={propertyHandleChange} className={inputClass}
                                placeholder="Enter number of floors" min="0" />
                        </DetailRow>
                        <DetailRow label="Total Rooms" value={propertyDetails.noOfRooms || '0'} editMode={dataEditView}>
                            <input type="number" name="noOfRooms" value={propertyDetails.noOfRooms}
                                onChange={propertyHandleChange} className={inputClass}
                                placeholder="Enter total rooms" min="0" />
                        </DetailRow>
                    </dl>
                )}
            </div>
        </div>
    )
}

export default PropertyKyc
