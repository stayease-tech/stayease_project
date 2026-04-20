import React from 'react';
import { FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";

function PropertyKyc({ dataEditView, propertyDetails, propertyData, propertyHandleChange, triggerFileInput }) {
    return (
        <div>
            <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">Property KYC</h3>

            <div className="w-full overflow-x-auto">
                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded text-xs sm:text-sm-lg max-sm:text-xs">
                    <tbody className='text-xs sm:text-sm'>
                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Sale Deed</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof propertyDetails.saleDeed === 'string'
                                                ? propertyDetails.saleDeed
                                                : propertyDetails.saleDeed
                                                    ? URL.createObjectURL(propertyDetails.saleDeed)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {propertyDetails.saleDeed?.name || propertyDetails.saleDeed.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="file"
                                            id="saleDeed"
                                            name="saleDeed"
                                            accept="image/*, .pdf"
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('saleDeed')}
                                            className="p-2 text-black w-full border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-sm truncate w-64">{propertyDetails.saleDeed?.name || propertyDetails.saleDeed.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">E Bill</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof propertyDetails.ebill === 'string'
                                                ? propertyDetails.ebill
                                                : propertyDetails.ebill
                                                    ? URL.createObjectURL(propertyDetails.ebill)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {propertyDetails.ebill?.name || propertyDetails.ebill.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="file"
                                            id="ebill"
                                            name="ebill"
                                            accept="image/*, .pdf"
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('ebill')}
                                            className="p-2 text-black w-full border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-sm truncate w-64">{propertyDetails.ebill?.name || propertyDetails.ebill.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Tax Receipt</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof propertyDetails.taxReceipt === 'string'
                                                ? propertyDetails.taxReceipt
                                                : propertyDetails.taxReceipt
                                                    ? URL.createObjectURL(propertyDetails.taxReceipt)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {propertyDetails.taxReceipt?.name || propertyDetails.taxReceipt.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="file"
                                            id="taxReceipt"
                                            name="taxReceipt"
                                            accept="image/*, .pdf"
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('taxReceipt')}
                                            className="p-2 text-black w-full border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-sm truncate w-64">{propertyDetails.taxReceipt?.name || propertyDetails.taxReceipt.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Water Bill</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof propertyDetails.waterBill === 'string'
                                                ? propertyDetails.waterBill
                                                : propertyDetails.waterBill
                                                    ? URL.createObjectURL(propertyDetails.waterBill)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {propertyDetails.waterBill?.name || propertyDetails.waterBill.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="file"
                                            id="waterBill"
                                            name="waterBill"
                                            accept="image/*, .pdf"
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('waterBill')}
                                            className="p-2 text-black w-full border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-sm truncate w-64">{propertyDetails.waterBill?.name || propertyDetails.waterBill.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="font-semibold mt-8 mb-4 text-stone-400 max-sm:text-sm">Supply Documents</h3>

            <div className="overflow-auto">
                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded text-xs sm:text-sm-lg max-sm:text-xs">
                    <tbody className='text-xs sm:text-sm'>
                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">LOI</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof propertyDetails.loi === 'string'
                                                ? propertyDetails.loi
                                                : propertyDetails.loi
                                                    ? URL.createObjectURL(propertyDetails.loi)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {propertyDetails.loi?.name || propertyDetails.loi.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="file"
                                            id="loi"
                                            name="loi"
                                            accept="image/*, .pdf"
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('loi')}
                                            className="p-2 text-black w-full border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-sm truncate w-64">{propertyDetails.loi?.name || propertyDetails.loi.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Agreement</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof propertyDetails.agreement === 'string'
                                                ? propertyDetails.agreement
                                                : propertyDetails.agreement
                                                    ? URL.createObjectURL(propertyDetails.agreement)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {propertyDetails.agreement?.name || propertyDetails?.agreement.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="file"
                                            id="agreement"
                                            name="agreement"
                                            accept="image/*, .pdf"
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('agreement')}
                                            className="p-2 text-black w-full border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-sm truncate w-64">{propertyDetails.agreement?.name || propertyDetails.agreement.split('/')[8]}</span>
                                        </button>
                                    </span>
                                </>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">Building Details</h3>

            <div className="overflow-auto">
                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded text-xs sm:text-sm-lg max-sm:text-xs">
                    <tbody className='text-xs sm:text-sm'>
                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Number of Basements</th>
                            <td className="flex">
                                <span className="py-1 px-2 w-full">{propertyData?.noOfBasements}</span>
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Number of Floors</th>
                            <td className="flex">
                                <span className="py-1 px-2 w-full">{propertyData?.noOfFloors}</span>
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Number of Rooms</th>
                            <td className="flex">
                                <span className="py-1 px-2 w-full">{propertyData?.noOfRooms}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PropertyKyc