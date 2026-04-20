import React from 'react';
import { City, Country, State } from 'country-state-city';
import { FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";

function PropertyData({ dataEditView, propertyDetails, propertyHandleChange, triggerFileInput }) {
    const country = Country.getCountryByCode('IN');
    const states = State.getStatesOfCountry(country.isoCode);
    const state = states.find((state) => state.name === propertyDetails.state);
    const cities = City.getCitiesOfState(state?.countryCode, state?.isoCode);

    const mealTypes = ["Veg", "Non-Veg"];
    const amenities = ["Prime Locations", "Fully Furnished", "Parking Space", "Regular Housekeeping", "Free Wi-Fi", "Modular Kitchen", "CCTV Surveillance", "Washing Machine", "Workspace Setup", "Common Area", "Digital Lock Access", "Water Purifier", "OTT Subscriptions", "Community Intercom"];

    return (
        <div>
            <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">Property Details</h3>

            <div className="w-full overflow-x-auto">
                <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded text-xs sm:text-sm text-xs sm:text-sm-lg max-sm:text-xs">
                    <tbody className='text-xs sm:text-sm'>
                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Property ID</th>
                            <td className="flex">
                                <span className="py-1 px-2 w-full">{propertyDetails.serial_number}</span>
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Property Name</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.propertyName}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="propertyName"
                                            value={propertyDetails.propertyName}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="propertyName"
                                            placeholder="Enter the Property Name here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Property Type</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.propertyType}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="propertyType"
                                            value={propertyDetails.propertyType}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                            name="propertyType"
                                            required
                                        >
                                            <option value="" disabled>Select the Property type here</option>
                                            <option value="PG/Hostel">PG/Hostel</option>
                                            <option value="Apartment">Apartment</option>
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Founded Year</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.foundedYear}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="foundedYear"
                                            value={propertyDetails.foundedYear}
                                            onChange={(e) => propertyHandleChange(e)}
                                            min="1900" max="2100" step="1"
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="foundedYear"
                                            placeholder="Enter the Founded Year here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Door/Building</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.doorBuilding}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="doorBuilding"
                                            value={propertyDetails.doorBuilding}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="doorBuilding"
                                            placeholder="Enter the Door/Building here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Street Address</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.streetAddress}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="streetAddress"
                                            value={propertyDetails.streetAddress}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="streetAddress"
                                            placeholder="Enter the Street Address here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Area</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.area}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="area"
                                            value={propertyDetails.area}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="area"
                                            placeholder="Enter the Area here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Landmark (Optional)</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.landmark}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="landmark"
                                            value={propertyDetails.landmark}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="landmark"
                                            placeholder="Enter the Landmark here" />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">State</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.state}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="state"
                                            value={propertyDetails.state}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                            name="state"
                                            required
                                        >
                                            <option value="" disabled>Select the State here</option>
                                            {states.map((state) => (
                                                <option key={state.name} value={state.name}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">City</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.city}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="city"
                                            value={propertyDetails.city}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                            name="city"
                                            required
                                        >
                                            <option value="" disabled>Select the State here</option>
                                            {cities.map((city) => (
                                                <option key={city.name} value={city.name}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Pincode</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.pincode}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="pincode"
                                            value={propertyDetails.pincode}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="pincode"
                                            placeholder="Enter the Pincode here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Meal Type</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.selectedMealTypes.join(", ")}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        {mealTypes.map((mealType) => (
                                            <label
                                                key={mealType}
                                                className="relative inline-flex items-center space-x-2 cursor-pointer pe-5"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="peer hidden"
                                                    name="selectedMealTypes"
                                                    value={mealType}
                                                    checked={propertyDetails.selectedMealTypes.includes(mealType)}
                                                    onChange={(e) => propertyHandleChange(e)}
                                                />
                                                <span
                                                    className="w-5 h-5 border-2 border-gray-500 rounded text-xs sm:text-sm-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black"
                                                >{propertyDetails.selectedMealTypes.includes(mealType) && "✔"}</span>
                                                <span className="peer-checked:text-[#D4A017]">{mealType}</span>
                                            </label>
                                        ))}
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Rent</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.rent}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="rent"
                                            value={propertyDetails.rent}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="rent"
                                            placeholder="Enter the Landmark here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Deposit</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.deposit}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="deposit"
                                            value={propertyDetails.deposit}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="deposit"
                                            placeholder="Enter the Landmark here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Rent Free</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.rentFree}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <select
                                            id="rentFree"
                                            value={propertyDetails.rentFree}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm text-sm"
                                            name="rentFree"
                                            required
                                        >
                                            <option value="" disabled>Select the Rent Free type here</option>
                                            <option value="0">0</option>
                                            <option value="15000">15000</option>
                                            <option value="25000">25000</option>
                                        </select>
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Property Rating</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.rating}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="text"
                                            id="rating"
                                            value={propertyDetails.rating}
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                            name="rating"
                                            placeholder="Enter the Property Name here"
                                            required />
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Amenities</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">{propertyDetails.selectedAmenities.join(", ")}</span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        {amenities.map((amenity) => (
                                            <label
                                                key={amenity}
                                                className="relative inline-flex items-center space-x-2 cursor-pointer pe-5"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="peer hidden"
                                                    name="selectedAmenities"
                                                    value={amenity}
                                                    checked={propertyDetails.selectedAmenities.includes(amenity)}
                                                    onChange={(e) => propertyHandleChange(e)}
                                                />
                                                <span
                                                    className="w-5 h-5 border-2 border-gray-500 rounded text-xs sm:text-sm-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black"
                                                >{propertyDetails.selectedAmenities.includes(amenity) && "✔"}</span>
                                                <span className="peer-checked:text-[#D4A017]">{amenity}</span>
                                            </label>
                                        ))}
                                    </span>
                                </>}
                            </td>
                        </tr>

                        <tr className="border-b border-white">
                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Property Image</th>
                            <td className="flex">
                                {!dataEditView ? <>
                                    <span className="py-1 px-2 w-full">
                                        <Link to={
                                            typeof propertyDetails.image === 'string'
                                                ? propertyDetails.image
                                                : propertyDetails.image
                                                    ? URL.createObjectURL(propertyDetails.image)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                            {propertyDetails.image?.name || propertyDetails.image.split('/')[8]}
                                        </Link>
                                    </span>
                                </> : <>
                                    <span className="py-1 px-2 w-full">
                                        <input
                                            type="file"
                                            id="image"
                                            name="image"
                                            accept="image/*, .pdf"
                                            onChange={(e) => propertyHandleChange(e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('image')}
                                            className="p-2 text-black w-full border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                                        >
                                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-sm truncate w-64">{propertyDetails.image?.name || propertyDetails.image.split('/')[8]}</span>
                                        </button>
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

export default PropertyData