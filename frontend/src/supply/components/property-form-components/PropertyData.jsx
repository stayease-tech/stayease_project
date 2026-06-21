import React from 'react';
import { City, Country, State } from 'country-state-city';
import { FaUpload } from "react-icons/fa";
import { useDropdowns } from "../../../shared/DropdownContext";

function PropertyData({ propertyData, triggerPropertyFileInput, propertyHandleChange }) {
    const { getOptions } = useDropdowns();
    const country = Country.getCountryByCode('IN');
    const states = State.getStatesOfCountry(country.isoCode);
    const state = states.find((state) => state.name === propertyData.state);
    const cities = City.getCitiesOfState(state?.countryCode, state?.isoCode);

    const mealTypes = getOptions('property_meal_types');
    const amenities = getOptions('property_amenities');

    return (
        <div className="mb-[20px]">
            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Add Property Name, Address, Amenities and more...</h3>

            <label htmlFor={`propertyName`} className="text-[#D4A017] max-sm:text-sm"><strong>Property Name: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id={`propertyName`}
                value={propertyData.propertyName}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`propertyName`}
                placeholder="Enter the Property Name here"
                required />

            <label htmlFor={`propertyType`} className="text-[#D4A017] max-sm:text-sm"><strong>Property Type: <span className="text-red-500">*</span></strong></label>
            <select
                id={`propertyType`}
                value={propertyData.propertyType}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                name={`propertyType`}
                required
            >
                <option value="" disabled>Select the Property type here</option>
                {getOptions('property_types').map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                ))}
            </select>

            <label htmlFor={`foundedYear`} className="text-[#D4A017] max-sm:text-sm"><strong>Founded Year: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id={`foundedYear`}
                value={propertyData.foundedYear}
                onChange={propertyHandleChange}
                min="1900" max="2100" step="1"
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`foundedYear`}
                placeholder="Enter the Founded Year here"
                required />

            <label htmlFor={`doorBuilding`} className="text-[#D4A017] max-sm:text-sm"><strong>Building Number: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id={`doorBuilding`}
                value={propertyData.doorBuilding}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`doorBuilding`}
                placeholder="Enter the Building Number here"
                required />

            <label htmlFor={`streetAddress`} className="text-[#D4A017] max-sm:text-sm"><strong>Street Address: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id={`streetAddress`}
                value={propertyData.streetAddress}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`streetAddress`}
                placeholder="Enter the Street Address here"
                required />

            <label htmlFor={`area`} className="text-[#D4A017] max-sm:text-sm"><strong>Area: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id={`area`}
                value={propertyData.area}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`area`}
                placeholder="Enter the Area here"
                required />

            <label htmlFor={`landmark`} className="text-[#D4A017] max-sm:text-sm"><strong>Landmark (Optional):</strong></label>
            <input
                type="text"
                id={`landmark`}
                value={propertyData.landmark}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`landmark`}
                placeholder="Enter your Landmark here" />

            <label htmlFor={`state`} className="text-[#D4A017] max-sm:text-sm"><strong>State: <span className="text-red-500">*</span></strong></label>
            <select
                id={`state`}
                value={propertyData.state}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`state`}
                required
            >
                <option value="" disabled>Select the State here</option>
                {states.map((state) => (
                    <option key={state.name} value={state.name}>
                        {state.name}
                    </option>
                ))}
            </select>

            <label htmlFor={`city`} className="text-[#D4A017] max-sm:text-sm"><strong>City: <span className="text-red-500">*</span></strong></label>
            <select
                id={`city`}
                value={propertyData.city}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`city`}
                required
            >
                <option value="" disabled>Select the City here</option>
                {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                        {city.name}
                    </option>
                ))}
            </select>

            <label htmlFor={`pincode`} className="text-[#D4A017] max-sm:text-sm"><strong>Pincode: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id={`pincode`}
                value={propertyData.pincode}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`pincode`}
                placeholder="Enter 6-digit Indian Pincode"
                maxLength={6}
                inputMode="numeric"
                required />

            <div className="mb-3">
                <h3 className="text-[#D4A017] mt-2 mb-3 max-sm:text-sm"><strong>Meal Type:</strong></h3>

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
                            checked={propertyData.selectedMealTypes.includes(mealType)}
                            onChange={propertyHandleChange}
                        />
                        <span
                            className="w-5 h-5 border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black text-xs sm:text-sm"
                        >{propertyData.selectedMealTypes.includes(mealType) && "✔"}</span>
                        <span className="peer-checked:text-[#D4A017] max-sm:text-sm">{mealType}</span>
                    </label>
                ))}
            </div>

            <label htmlFor={`rent`} className="text-[#D4A017] max-sm:text-sm"><strong>Rent: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id={`rent`}
                value={propertyData.rent}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`rent`}
                placeholder="Enter the Rent here"
                inputMode="numeric"
                required />

            <label htmlFor={`deposit`} className="text-[#D4A017] max-sm:text-sm"><strong>Deposit: <span className="text-red-500">*</span></strong></label>
            <input
                type="text"
                id={`deposit`}
                value={propertyData.deposit}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`deposit`}
                placeholder="Enter the Deposit here"
                inputMode="numeric"
                required />

            <label htmlFor={`rentFree`} className="text-[#D4A017] max-sm:text-sm"><strong>Rent Free Period: <span className="text-red-500">*</span></strong></label>
            <div className="flex gap-3 mt-2 mb-3">
                <input
                    type="text"
                    id={`rentFree`}
                    value={propertyData.rentFree}
                    onChange={propertyHandleChange}
                    className="text-black flex-1 p-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs"
                    name={`rentFree`}
                    placeholder="Enter the number of days"
                    inputMode="numeric"
                    required />
                <select
                    id={`rentFreeUnit`}
                    value={propertyData.rentFreeUnit}
                    onChange={propertyHandleChange}
                    className="text-black w-28 p-2 border border-gray-300 rounded text-xs sm:text-sm"
                    name={`rentFreeUnit`}>
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                </select>
            </div>

            <label htmlFor={`rating`} className="text-[#D4A017] max-sm:text-sm"><strong>Rating: <span className="text-red-500">*</span></strong></label>
            <input
                type="number"
                id={`rating`}
                value={propertyData.rating}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name={`rating`}
                placeholder="Enter the rating (1-5)"
                step="0.1"
                min="1"
                max="5"
                required />

            <div className="mb-3">
                <h3 className="text-[#D4A017] mt-2 mb-3 max-sm:text-sm"><strong>Amenities:</strong></h3>

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
                            checked={propertyData.selectedAmenities.includes(amenity)}
                            onChange={propertyHandleChange}
                        />
                        <span
                            className="w-5 h-5 border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black text-xs sm:text-sm"
                        >{propertyData.selectedAmenities.includes(amenity) && "✔"}</span>
                        <span className="peer-checked:text-[#D4A017] max-sm:text-sm">{amenity}</span>
                    </label>
                ))}
            </div>

            <label htmlFor="image" className="text-[#D4A017] max-sm:text-sm">
                <strong>Property Image</strong>
            </label>
            <div className="w-full text-center">
                <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*, .pdf"
                    onChange={propertyHandleChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => triggerPropertyFileInput('image')}
                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm bg-white text-left flex gap-3"
                >
                    <span className="mt-1 text-sm sm:text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{propertyData.image?.name || 'No file chosen'}</span>
                </button>
            </div>

            <label htmlFor={`status`} className="text-[#D4A017] max-sm:text-sm"><strong>Status: <span className="text-red-500">*</span></strong></label>
            <select
                id={`status`}
                value={propertyData.status}
                onChange={propertyHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                name={`status`}
                required
            >
                <option value="" disabled>Select the Status of the Property here</option>
                {getOptions('property_statuses').map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                ))}
            </select>
        </div>
    )
}

export default PropertyData