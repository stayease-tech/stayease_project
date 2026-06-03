import React from 'react';
import { City, Country, State } from 'country-state-city';
import { FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDropdowns } from "../../../shared/DropdownContext";

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

function PropertyData({ dataEditView, propertyDetails, propertyHandleChange, triggerFileInput }) {
    const { getOptions } = useDropdowns();
    const country = Country.getCountryByCode('IN');
    const states = State.getStatesOfCountry(country.isoCode);
    const state = states.find((state) => state.name === propertyDetails.state);
    const cities = City.getCitiesOfState(state?.countryCode, state?.isoCode);

    const mealTypes = getOptions('property_meal_types');
    const amenities = getOptions('property_amenities');

    const inputClass = "w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none";
    const selectClass = "w-full p-2 border border-gray-300 rounded text-sm text-black bg-white focus:ring-2 focus:ring-[#D4A017] focus:border-transparent outline-none";

    return (
        <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Basic Information</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="Property ID" value={propertyDetails.serial_number}>
                        <span className="text-slate-500">{propertyDetails.serial_number}</span>
                    </DetailRow>

                    <DetailRow label="Property Name *" value={propertyDetails.propertyName} editMode={dataEditView}>
                        <input type="text" name="propertyName" value={propertyDetails.propertyName}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter property name" required />
                    </DetailRow>

                    <DetailRow label="Property Type *" value={propertyDetails.propertyType} editMode={dataEditView}>
                        <select name="propertyType" value={propertyDetails.propertyType}
                            onChange={propertyHandleChange} className={selectClass} required>
                            <option value="" disabled>Select property type</option>
                            {getOptions('property_types').map((t, i) => (
                                <option key={i} value={t}>{t}</option>
                            ))}
                        </select>
                    </DetailRow>

                    <DetailRow label="Founded Year *" value={propertyDetails.foundedYear} editMode={dataEditView}>
                        <input type="text" name="foundedYear" value={propertyDetails.foundedYear}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter founded year" inputMode="numeric" required />
                    </DetailRow>

                    <DetailRow label="Status" value={propertyDetails.status || '—'} editMode={dataEditView}>
                        <select name="status" value={propertyDetails.status}
                            onChange={propertyHandleChange} className={selectClass} required>
                            <option value="" disabled>Select status</option>
                            {getOptions('property_statuses').map((s, i) => (
                                <option key={i} value={s}>{s}</option>
                            ))}
                        </select>
                    </DetailRow>

                    <DetailRow label="Rating" value={propertyDetails.rating || '—'} editMode={dataEditView}>
                        <input type="number" name="rating" value={propertyDetails.rating}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter rating (1-5)" min="1" max="5" />
                    </DetailRow>
                </dl>
            </div>

            {/* Location Card */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Location</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="Door/Building *" value={propertyDetails.doorBuilding} editMode={dataEditView}>
                        <input type="text" name="doorBuilding" value={propertyDetails.doorBuilding}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter door/building number" required />
                    </DetailRow>

                    <DetailRow label="Street Address *" value={propertyDetails.streetAddress} editMode={dataEditView}>
                        <input type="text" name="streetAddress" value={propertyDetails.streetAddress}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter street address" required />
                    </DetailRow>

                    <DetailRow label="Area *" value={propertyDetails.area} editMode={dataEditView}>
                        <input type="text" name="area" value={propertyDetails.area}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter area" required />
                    </DetailRow>

                    <DetailRow label="Landmark" value={propertyDetails.landmark || '—'} editMode={dataEditView}>
                        <input type="text" name="landmark" value={propertyDetails.landmark}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter landmark (optional)" />
                    </DetailRow>

                    <DetailRow label="State *" value={propertyDetails.state} editMode={dataEditView}>
                        <select name="state" value={propertyDetails.state}
                            onChange={propertyHandleChange} className={selectClass} required>
                            <option value="" disabled>Select state</option>
                            {states.map((s) => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </DetailRow>

                    <DetailRow label="City *" value={propertyDetails.city} editMode={dataEditView}>
                        <select name="city" value={propertyDetails.city}
                            onChange={propertyHandleChange} className={selectClass} required>
                            <option value="" disabled>Select city</option>
                            {cities.map((c) => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </DetailRow>

                    <DetailRow label="Pincode *" value={propertyDetails.pincode} editMode={dataEditView}>
                        <input type="text" name="pincode" value={propertyDetails.pincode}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter pincode" inputMode="numeric" required />
                    </DetailRow>
                </dl>
            </div>

            {/* Financial Card */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Financial Details</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="Rent *" value={propertyDetails.rent ? `₹${propertyDetails.rent}` : '—'} editMode={dataEditView}>
                        <input type="text" name="rent" value={propertyDetails.rent}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter rent amount" inputMode="numeric" required />
                    </DetailRow>

                    <DetailRow label="Deposit *" value={propertyDetails.deposit ? `₹${propertyDetails.deposit}` : '—'} editMode={dataEditView}>
                        <input type="text" name="deposit" value={propertyDetails.deposit}
                            onChange={propertyHandleChange} className={inputClass}
                            placeholder="Enter deposit amount" inputMode="numeric" required />
                    </DetailRow>

                    <DetailRow label="Rent Free *" value={propertyDetails.rentFree ? `₹${propertyDetails.rentFree}` : '—'} editMode={dataEditView}>
                        <select name="rentFree" value={propertyDetails.rentFree}
                            onChange={propertyHandleChange} className={selectClass} required>
                            <option value="" disabled>Select rent free amount</option>
                            {getOptions('rent_free_options').map((r, i) => (
                                <option key={i} value={r}>{Number(r).toLocaleString('en-IN')}</option>
                            ))}
                        </select>
                    </DetailRow>
                </dl>
            </div>

            {/* Meals & Amenities Card */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Meals & Amenities</h3>
                <dl className="divide-y divide-gray-100">
                    <DetailRow label="Meal Type"
                        value={propertyDetails.selectedMealTypes?.length > 0 ? propertyDetails.selectedMealTypes.join(", ") : '—'}
                        editMode={dataEditView}>
                        <div className="flex flex-wrap gap-4">
                            {mealTypes.map((mealType) => (
                                <label key={mealType} className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="selectedMealTypes" value={mealType}
                                        checked={propertyDetails.selectedMealTypes?.includes(mealType)}
                                        onChange={propertyHandleChange}
                                        className="w-4 h-4 accent-[#D4A017]" />
                                    <span className="text-sm">{mealType}</span>
                                </label>
                            ))}
                        </div>
                    </DetailRow>

                    <DetailRow label="Amenities"
                        value={propertyDetails.selectedAmenities?.length > 0 ? propertyDetails.selectedAmenities.join(", ") : '—'}
                        editMode={dataEditView}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {amenities.map((amenity) => (
                                <label key={amenity} className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="selectedAmenities" value={amenity}
                                        checked={propertyDetails.selectedAmenities?.includes(amenity)}
                                        onChange={propertyHandleChange}
                                        className="w-4 h-4 accent-[#D4A017]" />
                                    <span className="text-sm">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </DetailRow>
                </dl>
            </div>

            {/* Property Image Card */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-4">Property Image</h3>
                {!dataEditView ? (
                    <div>
                        {propertyDetails.image ? (
                            <Link to={getFileUrl(propertyDetails.image)}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-[#D4A017] hover:underline">
                                📄 {getFileName(propertyDetails.image)}
                            </Link>
                        ) : (
                            <span className="text-sm text-gray-400">No image uploaded</span>
                        )}
                    </div>
                ) : (
                    <div>
                        <input type="file" id="image" name="image" accept="image/*, .pdf"
                            onChange={propertyHandleChange} className="hidden" />
                        <button type="button" onClick={() => triggerFileInput('image')}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50">
                            <FaUpload className="text-[#D4A017]" />
                            <span className="truncate max-w-xs">{getFileName(propertyDetails.image)}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PropertyData
