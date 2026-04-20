import React from 'react';
import { FaUpload } from "react-icons/fa";

function PropertyKyc({ propertyData, triggerPropertyFileInput, propertyHandleChange }) {
    return (
        <div className='mb-[20px]'>
            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Property KYC</h3>

            <label htmlFor="saleDeed" className="text-[#D4A017] max-sm:text-sm">
                <strong>Sale Deed</strong>
            </label>
            <div className="w-full text-center">
                <input
                    type="file"
                    id="saleDeed"
                    name="saleDeed"
                    accept="image/*, .pdf"
                    onChange={propertyHandleChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => triggerPropertyFileInput('saleDeed')}
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                >
                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{propertyData.saleDeed?.name || 'No file chosen'}</span>
                </button>
            </div>

            <label htmlFor="ebill" className="text-[#D4A017] max-sm:text-sm">
                <strong>E Bill</strong>
            </label>
            <div className="w-full text-center">
                <input
                    type="file"
                    id="ebill"
                    name="ebill"
                    accept="image/*, .pdf"
                    onChange={propertyHandleChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => triggerPropertyFileInput('ebill')}
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                >
                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{propertyData.ebill?.name || 'No file chosen'}</span>
                </button>
            </div>

            <label htmlFor="taxReceipt" className="text-[#D4A017] max-sm:text-sm">
                <strong>Tax Receipt</strong>
            </label>
            <div className="w-full text-center">
                <input
                    type="file"
                    id="taxReceipt"
                    name="taxReceipt"
                    accept="image/*, .pdf"
                    onChange={propertyHandleChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => triggerPropertyFileInput('taxReceipt')}
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                >
                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{propertyData.taxReceipt?.name || 'No file chosen'}</span>
                </button>
            </div>

            <label htmlFor="waterBill" className="text-[#D4A017] max-sm:text-sm">
                <strong>Water Bill</strong>
            </label>
            <div className="w-full text-center">
                <input
                    type="file"
                    id="waterBill"
                    name="waterBill"
                    accept="image/*, .pdf"
                    onChange={propertyHandleChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => triggerPropertyFileInput('waterBill')}
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                >
                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{propertyData.waterBill?.name || 'No file chosen'}</span>
                </button>
            </div>

            <h3 className="font-semibold mb-4 mt-4 text-stone-400 max-sm:text-sm">Supply Documents</h3>

            <label htmlFor="loi" className="text-[#D4A017] max-sm:text-sm">
                <strong>LOI</strong>
            </label>
            <div className="w-full text-center">
                <input
                    type="file"
                    id="loi"
                    name="loi"
                    accept="image/*, .pdf"
                    onChange={propertyHandleChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => triggerPropertyFileInput('loi')}
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                >
                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{propertyData.loi?.name || 'No file chosen'}</span>
                </button>
            </div>

            <label htmlFor="agreement" className="text-[#D4A017] max-sm:text-sm">
                <strong>Agreement</strong>
            </label>
            <div className="w-full text-center">
                <input
                    type="file"
                    id="agreement"
                    name="agreement"
                    accept="image/*, .pdf"
                    onChange={propertyHandleChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => triggerPropertyFileInput('agreement')}
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                >
                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{propertyData.agreement?.name || 'No file chosen'}</span>
                </button>
            </div>
        </div>
    )
}

export default PropertyKyc