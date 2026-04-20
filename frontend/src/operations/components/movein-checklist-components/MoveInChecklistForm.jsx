import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function MoveInChecklistForm({ isExpanded, setIsExpanded }) {
    const propertyConditionArr = ['Walls & Paint Condition', 'Ceiling Condition', 'Flooring / Tiles', 'Doors & Locks', 'Main Door Keys', 'Room Keys', 'Cupboard Keys', 'Access Cards / Key Tags'];
    const electricalLightingArr = ['Ceiling Lights / Bulbs', 'Fans', 'Switches & Sockets', 'Air Conditioner (AC)', 'Wi-Fi Router / Internet', 'TV', 'DTH Connection', 'TV Remote'];
    const furnitureFixturesArr = ['Bed Frame', 'Mattress', 'Pillows', 'Bedsheets', 'Duvet / Blanket', 'Towels'];
    const kitchenPlumbingArr = ['Water Purifier', 'Sink Tap / Plumbing Lines', 'Refrigerator', 'Microwave / Induction / Stove', 'FurnitureFixtures Utensils'];
    const housekeepingCleanlinessArr = ['Overall Cleanliness', 'Bathroom Condition', 'Mirror / Fixtures', 'Dustbins'];

    const navigate = useNavigate();
    const location = useLocation();

    const bedsData = location?.state?.bedsData || {};

    const [itemCategory, setItemCategory] = useState([]);
    const [currentComponent, setCurrentComponent] = useState('MoveInChecklistForm');
    const [moveInChecklistData, setMoveInChecklistData] = useState({
        tenantId: bedsData?.tenant_data?.id,
        moveInPropertyCondition: [],
        moveInPropertyConditionComments: "",
        moveInElectricalLighting: [],
        moveInElectricalLightingComments: "",
        moveInFurnitureFixtures: [],
        moveInFurnitureFixturesComments: "",
        moveInKitchenPlumbing: [],
        moveInKitchenPlumbingComments: "",
        moveInHousekeepingCleanliness: [],
        moveInHousekeepingCleanlinessComments: "",
        moveInRemarks: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false);

    const dataHandleToggle = (step) => {
        if (step === 'PropertyCondition') {
            setItemCategory(propertyConditionArr)
        }
        if (step === 'ElectricalLighting') {
            setItemCategory(electricalLightingArr)
        }
        if (step === 'FurnitureFixtures') {
            setItemCategory(furnitureFixturesArr)
        }
        if (step === 'KitchenPlumbing') {
            setItemCategory(kitchenPlumbingArr)
        }
        if (step === 'HousekeepingCleanliness') {
            setItemCategory(housekeepingCleanlinessArr)
        }
        setCurrentComponent(step)
    }

    function formatDateToDDMonYYYY(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    const moveInChecklistHandleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setMoveInChecklistData(prev => {
            if (type === 'checkbox') {
                const fieldName = name;
                const currentArray = prev[fieldName] || [];

                if (checked) {
                    if (!currentArray.includes(value)) {
                        return {
                            ...prev,
                            [fieldName]: [...currentArray, value]
                        };
                    }
                } else {
                    return {
                        ...prev,
                        [fieldName]: currentArray.filter(item => item !== value)
                    };
                }
            }

            return {
                ...prev,
                [name]: value
            };
        });
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const moveInChecklistHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/operations/moveinchecklist-form-submit/', moveInChecklistData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            alert(response.data.message);

            if (response.data.success) {
                setMoveInChecklistData({
                    moveInPropertyCondition: [],
                    moveInPropertyConditionComments: "",
                    moveInElectricalLighting: [],
                    moveInElectricalLightingComments: "",
                    moveInFurnitureFixtures: [],
                    moveInFurnitureFixturesComments: "",
                    moveInKitchenPlumbing: [],
                    moveInKitchenPlumbingComments: "",
                    moveInHousekeepingCleanliness: [],
                    moveInHousekeepingCleanlinessComments: "",
                    moveInRemarks: ''
                })

                navigate(`/operations/operations-checklistfeedback-table`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 max-lg:bg-white min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-[1rem]`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={moveInChecklistHandleSubmit} method='POST'>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">MOVE-IN CHECKLIST FORM</h1>

                        {currentComponent === 'MoveInChecklistForm' && <>
                            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Fill up the details here...</h3>

                            <label htmlFor="residentName" className="text-[#D4A017] max-sm:text-sm"><strong>Resident Name:</strong></label>
                            <input type="text" value={bedsData?.tenant_data?.residentsName || ""} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" readOnly />

                            <label htmlFor="roomNo" className="text-[#D4A017] max-sm:text-sm"><strong>Flat Number:</strong></label>
                            <input type="text" value={bedsData?.roomNo || ""} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" readOnly />

                            <label htmlFor="roomType" className="text-[#D4A017] max-sm:text-sm"><strong>Flat Type:</strong></label>
                            <input type="text" value={bedsData?.roomType || ""} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" readOnly />

                            <label htmlFor="bedLabel" className="text-[#D4A017] max-sm:text-sm"><strong>Room Number:</strong></label>
                            <input type="text" value={bedsData?.bedLabel || ""} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" readOnly />

                            <label htmlFor="checkIn" className="text-[#D4A017] max-sm:text-sm"><strong>Move-In Date:</strong></label>
                            <input
                                type="text"
                                value={bedsData?.tenant_data?.checkIn ? formatDateToDDMonYYYY(bedsData?.tenant_data?.checkIn) : ""}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm text-xs sm:text-sm"
                                readOnly />

                            <label htmlFor="propertyManager" className="text-[#D4A017] max-sm:text-sm"><strong>Audit Done By:</strong></label>
                            <input type="text" value={bedsData?.tenant_data?.propertyManager || ""} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" readOnly />

                            <button
                                className="block w-full mt-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('PropertyCondition')}
                                type="button">Next</button>
                        </>}

                        {currentComponent === 'PropertyCondition' && <>
                            <div className="my-[20px]">
                                <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Property Condition details here</h3>

                                <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Select the details that needs to be checked here:</strong></label>
                                {itemCategory.map((category, index) => (
                                    <label key={index} className="relative inline-flex items-center space-x-2 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                        <input
                                            type="checkbox"
                                            className="peer hidden"
                                            name="moveInPropertyCondition"
                                            value={category}
                                            checked={moveInChecklistData.moveInPropertyCondition.includes(category)}
                                            onChange={moveInChecklistHandleChange}
                                        />
                                        <span className="w-5 h-5 border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                            {moveInChecklistData.moveInPropertyCondition.includes(category) && "✔"}
                                        </span>
                                        <span className="peer-checked:text-[#D4A017]">{category}</span>
                                    </label>
                                ))}

                                <label className="block text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                                <input
                                    type="text"
                                    value={moveInChecklistData.moveInPropertyConditionComments}
                                    onChange={moveInChecklistHandleChange}
                                    name="moveInPropertyConditionComments"
                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    placeholder="Enter any additional comments here"
                                />
                            </div>

                            <div className="flex gap-5 mt-5">
                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('MoveInChecklistForm')}
                                    type="button">Prev</button>

                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('ElectricalLighting')}
                                    type="button">Next</button>
                            </div>
                        </>
                        }

                        {currentComponent === 'ElectricalLighting' && <>
                            <div className="my-[20px]">
                                <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Electrical Lighting details here</h3>

                                <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Select the details that needs to be checked here:</strong></label>
                                {itemCategory.map((category, index) => (
                                    <label key={index} className="relative inline-flex items-center space-x-2 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                        <input
                                            type="checkbox"
                                            className="peer hidden"
                                            name="moveInElectricalLighting"
                                            value={category}
                                            checked={moveInChecklistData.moveInElectricalLighting.includes(category)}
                                            onChange={moveInChecklistHandleChange}
                                        />
                                        <span className="w-5 h-5 border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                            {moveInChecklistData.moveInElectricalLighting.includes(category) && "✔"}
                                        </span>
                                        <span className="peer-checked:text-[#D4A017]">{category}</span>
                                    </label>
                                ))}

                                <label className="block text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                                <input
                                    type="text"
                                    value={moveInChecklistData.moveInElectricalLightingComments}
                                    onChange={moveInChecklistHandleChange}
                                    name="moveInElectricalLightingComments"
                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    placeholder="Enter any additional comments here"
                                />
                            </div>

                            <div className="flex gap-5 mt-5">
                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('PropertyCondition')}
                                    type="button">Prev</button>

                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('FurnitureFixtures')}
                                    type="button">Next</button>
                            </div>
                        </>
                        }

                        {currentComponent === 'FurnitureFixtures' && <>
                            <div className="my-[20px]">
                                <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Furniture Fixtures details here</h3>

                                <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Select the details that needs to be checked here:</strong></label>
                                {itemCategory.map((category, index) => (
                                    <label key={index} className="relative inline-flex items-center space-x-2 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                        <input
                                            type="checkbox"
                                            className="peer hidden"
                                            name="moveInFurnitureFixtures"
                                            value={category}
                                            checked={moveInChecklistData.moveInFurnitureFixtures.includes(category)}
                                            onChange={moveInChecklistHandleChange}
                                        />
                                        <span className="w-5 h-5 border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                            {moveInChecklistData.moveInFurnitureFixtures.includes(category) && "✔"}
                                        </span>
                                        <span className="peer-checked:text-[#D4A017]">{category}</span>
                                    </label>
                                ))}

                                <label className="block text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                                <input
                                    type="text"
                                    value={moveInChecklistData.moveInFurnitureFixturesComments}
                                    onChange={moveInChecklistHandleChange}
                                    name="moveInFurnitureFixturesComments"
                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    placeholder="Enter any additional comments here"
                                />
                            </div>

                            <div className="flex gap-5 mt-5">
                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('ElectricalLighting')}
                                    type="button">Prev</button>

                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('KitchenPlumbing')}
                                    type="button">Next</button>
                            </div>
                        </>
                        }

                        {currentComponent === 'KitchenPlumbing' && <>
                            <div className="my-[20px]">
                                <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Kitchen Plumbing details here</h3>

                                <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Select the details that needs to be checked here:</strong></label>
                                {itemCategory.map((category, index) => (
                                    <label key={index} className="relative inline-flex items-center space-x-2 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                        <input
                                            type="checkbox"
                                            className="peer hidden"
                                            name="moveInKitchenPlumbing"
                                            value={category}
                                            checked={moveInChecklistData.moveInKitchenPlumbing.includes(category)}
                                            onChange={moveInChecklistHandleChange}
                                        />
                                        <span className="w-5 h-5 border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                            {moveInChecklistData.moveInKitchenPlumbing.includes(category) && "✔"}
                                        </span>
                                        <span className="peer-checked:text-[#D4A017]">{category}</span>
                                    </label>
                                ))}

                                <label className="block text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                                <input
                                    type="text"
                                    value={moveInChecklistData.moveInKitchenPlumbingComments}
                                    onChange={moveInChecklistHandleChange}
                                    name="moveInKitchenPlumbingComments"
                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    placeholder="Enter any additional comments here"
                                />
                            </div>

                            <div className="flex gap-5 mt-5">
                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('FurnitureFixtures')}
                                    type="button">Prev</button>

                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('HousekeepingCleanliness')}
                                    type="button">Next</button>
                            </div>
                        </>
                        }

                        {currentComponent === 'HousekeepingCleanliness' && <>
                            <div className="my-[20px]">
                                <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Housekeeping Cleanliness details here</h3>

                                <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Select the details that needs to be checked here:</strong></label>
                                {itemCategory.map((category, index) => (
                                    <label key={index} className="relative inline-flex items-center space-x-2 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                        <input
                                            type="checkbox"
                                            className="peer hidden"
                                            name="moveInHousekeepingCleanliness"
                                            value={category}
                                            checked={moveInChecklistData.moveInHousekeepingCleanliness.includes(category)}
                                            onChange={moveInChecklistHandleChange}
                                        />
                                        <span className="w-5 h-5 border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                            {moveInChecklistData.moveInHousekeepingCleanliness.includes(category) && "✔"}
                                        </span>
                                        <span className="peer-checked:text-[#D4A017]">{category}</span>
                                    </label>
                                ))}

                                <label className="block text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                                <input
                                    type="text"
                                    value={moveInChecklistData.moveInHousekeepingCleanlinessComments}
                                    onChange={moveInChecklistHandleChange}
                                    name="moveInHousekeepingCleanlinessComments"
                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    placeholder="Enter any additional comments here"
                                />
                            </div>

                            <div className="flex gap-5 mt-5">
                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('KitchenPlumbing')}
                                    type="button">Prev</button>

                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('Remarks')}
                                    type="button">Next</button>
                            </div>
                        </>
                        }

                        {currentComponent === 'Remarks' && <>
                            <div className="my-[20px]">
                                <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Remarks if any</h3>

                                <label className="block text-[#D4A017] max-sm:text-sm"><strong>Other remarks / Observations while moving in:</strong></label>
                                <input
                                    type="text"
                                    value={moveInChecklistData.moveInRemarks}
                                    onChange={moveInChecklistHandleChange}
                                    name="moveInRemarks"
                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                    placeholder="Enter any remarks here"
                                />
                            </div>

                            <div className="flex gap-5 mt-5">
                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('HousekeepingCleanliness')}
                                    type="button">Prev</button>

                                <button
                                    className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" disabled={isSubmitting} type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
                            </div>
                        </>
                        }
                    </form>
                </div>
            </div>
        </div>
    )
}

export default MoveInChecklistForm