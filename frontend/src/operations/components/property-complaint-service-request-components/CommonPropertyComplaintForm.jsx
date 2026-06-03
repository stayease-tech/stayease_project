import React, { useState, useCallback, useEffect } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";

function CommonPropertyComplaintForm() {
    const { getOptions } = useDropdowns();

    let publicUrl = process.env.PUBLIC_URL + '/';

    const [isScrolledUp, setIsScrolledUp] = useState(true);
    const [lastScrollPosition, setLastScrollPosition] = useState(0);

    const [itemCategory, setItemCategory] = useState([]);
    const [roomData, setRoomData] = useState([]);

    const [loadingData, setLoadingData] = useState(false);

    function generateShortDateTicket() {
        const now = new Date();
        const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '').slice(0, 6);
        const randomNum = Math.floor(100 + Math.random() * 900);
        return `STY-${dateStr}-${randomNum}`;
    }

    const [roomNo, setRoomNo] = useState('');
    const [bedLabel, setBedLabel] = useState('');

    const getCurrentBedId = () => {
        const foundRoom = roomData.find(room => room.roomNo === roomNo);
        const foundBed = foundRoom?.bed_details.find(bed => bed.bedLabel === bedLabel);
        return foundBed?.residentId || '';
    };

    const [propertyComplaintData, setPropertyComplaintData] = useState({
        residentsName: '',
        phoneNumber: '',
        electricalElectronics: {
            items: [],
            ticketNumber: ''
        },
        plumbingBathroom: {
            items: [],
            ticketNumber: ''
        },
        furnituresFixtures: {
            items: [],
            ticketNumber: ''
        },
        kitchenEquipment: {
            items: [],
            ticketNumber: ''
        },
        internetConnectivity: {
            items: [],
            ticketNumber: ''
        },
        others: {
            text: '',
            ticketNumber: ''
        },
        issueDesc: '',
        preferredTime: ''
    });

    const [currentComponent, setCurrentComponent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dataHandleToggle = (step) => {
        if (step === 'electricalElectronics') {
            setItemCategory(getOptions('complaint__electrical_electronics'))
        }
        if (step === 'plumbingBathroom') {
            setItemCategory(getOptions('complaint__plumbing_bathroom'))
        }
        if (step === 'furnituresFixtures') {
            setItemCategory(getOptions('complaint__furniture_fixtures'))
        }
        if (step === 'kitchenEquipment') {
            setItemCategory(getOptions('complaint__kitchen_equipment'))
        }
        if (step === 'internetConnectivity') {
            setItemCategory(getOptions('complaint__internet_connectivity'))
        }
        setCurrentComponent(step)
    }

    const handleScroll = useCallback(() => {
        const currentScrollPosition = window.pageYOffset;

        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 80) {
            setIsScrolledUp(false);
        } else if (currentScrollPosition < lastScrollPosition) {
            setIsScrolledUp(true);
        }

        setLastScrollPosition(currentScrollPosition)
    }, [lastScrollPosition])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [lastScrollPosition, handleScroll])

    const propertyComplaintHandleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setPropertyComplaintData(prev => {
            if (type === 'checkbox') {
                const [category, field] = name.split('-');

                if (field === 'items') {
                    const currentCategory = prev[category];
                    const currentArray = currentCategory.items || [];

                    if (checked) {
                        if (!currentArray.includes(value)) {
                            const updatedItems = [...currentArray, value];
                            const shouldGenerateTicket = updatedItems.length > 0 && !currentCategory.ticketNumber;

                            return {
                                ...prev,
                                [category]: {
                                    ...currentCategory,
                                    items: updatedItems,
                                    ticketNumber: shouldGenerateTicket ? generateShortDateTicket() : currentCategory.ticketNumber
                                }
                            };
                        }
                    } else {
                        const updatedItems = currentArray.filter(item => item !== value);
                        const shouldRemoveTicket = updatedItems.length === 0;

                        return {
                            ...prev,
                            [category]: {
                                ...currentCategory,
                                items: updatedItems,
                                ticketNumber: shouldRemoveTicket ? '' : currentCategory.ticketNumber
                            }
                        };
                    }
                }
            }

            if (name === 'others') {
                const currentOthers = prev.others;
                const shouldGenerateTicket = value.trim() !== '' && !currentOthers.ticketNumber;
                const shouldRemoveTicket = value.trim() === '' && currentOthers.ticketNumber;

                return {
                    ...prev,
                    others: {
                        ...currentOthers,
                        text: value,
                        ticketNumber: shouldGenerateTicket ? generateShortDateTicket() :
                            shouldRemoveTicket ? '' : currentOthers.ticketNumber
                    }
                };
            }

            if (name === 'residentsName' || name === 'phoneNumber' || name === 'issueDesc' || name === 'preferredTime') {
                return {
                    ...prev,
                    [name]: value
                };
            }

            return prev;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/operations/get-room-data/');

                setRoomData(response?.data?.room_bed_data || []);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const propertyComplaintHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const residentId = getCurrentBedId();
        propertyComplaintData.residentId = residentId;

        try {
            const response = await axios.post('/operations/propertycomplaint-form-submit/', propertyComplaintData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            alert(response.data.message);

            if (response.data.success) {
                setPropertyComplaintData(prev => ({
                    ...prev,
                    residentId: '',
                    roomNo: '',
                    bedLabel: '',
                    residentsName: '',
                    phoneNumber: '',
                    electricalElectronics: {
                        items: [],
                        ticketNumber: ''
                    },
                    plumbingBathroom: {
                        items: [],
                        ticketNumber: ''
                    },
                    furnituresFixtures: {
                        items: [],
                        ticketNumber: ''
                    },
                    kitchenEquipment: {
                        items: [],
                        ticketNumber: ''
                    },
                    internetConnectivity: {
                        items: [],
                        ticketNumber: ''
                    },
                    others: {
                        text: '',
                        ticketNumber: ''
                    },
                    issueDesc: '',
                    preferredTime: ''
                }))
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="lg:pb-2 pt-[5rem] lg:pt-[6rem]">
            <nav className={`bg-slate-800 shadow-md text-white fixed w-full top-0 z-[100] transition-opacity duration-300 ${isScrolledUp ? 'opacity-100' : 'opacity-0'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center">
                            <img alt="CompanyLogo" src={publicUrl + "static/img/brand_logo/stayEase-Logo.webp"} className="h-18 w-auto object-cover"
                                loading="lazy" />
                        </div>
                    </div>
                </div>
            </nav>

            <form className="max-lg:min-h-screen w-[100%] lg:w-[85%] mx-auto lg:my-8 pt-6 px-8 lg:p-10 lg:rounded-lg bg-white text-slate-800" onSubmit={propertyComplaintHandleSubmit} method='POST'>
                <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">PROPERTY COMPLAINT FORM</h1>

                {currentComponent === '' && <>
                    <label htmlFor="roomNo" className="text-[#D4A017] max-sm:text-sm"><strong>Unit Number:</strong></label>
                    <select
                        value={roomNo}
                        onChange={(e) => setRoomNo(e.target.value)}
                        className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                        required
                    >
                        <option value="" disabled>Select the unit here</option>
                        {loadingData ? <option value="">
                            Loading unit data...
                        </option> : <>
                            {(roomData || []).map((room, index) => (
                                <option key={index} value={room.roomNo}>
                                    {room.roomNo}
                                </option>
                            ))}
                        </>}
                    </select>

                    <label htmlFor="bedLabel" className="text-[#D4A017] max-sm:text-sm"><strong>Room Number:</strong></label>
                    <select
                        value={bedLabel}
                        onChange={e => setBedLabel(e.target.value)}
                        className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                        required
                    >
                        <option value="" disabled>Select the room here</option>
                        {loadingData ? <option value="">
                            Loading room data...
                        </option> : <>
                            {(((roomData || []).find(room => room.roomNo === roomNo)?.bed_details) || []).map((bed) => {
                                if (bed?.residentId) {
                                    return <option key={bed.id} value={bed.bedLabel}>
                                        {bed.bedLabel}
                                    </option>
                                }
                            })}
                        </>}
                    </select>

                    <label htmlFor="residentsName" className="text-[#D4A017] max-sm:text-sm"><strong>Resident Name:</strong></label>
                    <input type="text" name="residentsName" value={propertyComplaintData.residentsName} onChange={propertyComplaintHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" placeholder="Enter your name here" required />

                    <label htmlFor="phoneNumber" className="text-[#D4A017] max-sm:text-sm"><strong>Phone Number:</strong></label>
                    <input type="text" name="phoneNumber" value={propertyComplaintData.phoneNumber} onChange={propertyComplaintHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" placeholder="Enter your phone number here" required />

                    <button
                        className="block w-full mt-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('electricalElectronics')}
                        type="button">Next</button>
                </>}

                {currentComponent === 'electricalElectronics' && <>
                    <div className="my-[20px]">
                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Electrical & Electronics details here</h3>

                        <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Please tick ✓ all that apply:</strong></label>
                        {itemCategory.map((category, index) => (
                            <label key={index} className="relative flex items-start space-x-3 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        className="peer hidden"
                                        name="electricalElectronics-items"
                                        value={category}
                                        checked={propertyComplaintData.electricalElectronics.items.includes(category)}
                                        onChange={propertyComplaintHandleChange}
                                    />
                                    <span className="w-5 h-5 min-w-[20px] border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                        {propertyComplaintData.electricalElectronics.items.includes(category) && "✔"}
                                    </span>
                                </div>
                                <span className="peer-checked:text-[#D4A017] flex-1 flex-1">{category}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-5 mt-5">
                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('')}
                            type="button">Prev</button>

                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('plumbingBathroom')}
                            type="button">Next</button>
                    </div>
                </>
                }

                {currentComponent === 'plumbingBathroom' && <>
                    <div className="my-[20px]">
                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Plumbing & Bathroom details here</h3>

                        <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Please tick ✓ all that apply:</strong></label>
                        {itemCategory.map((category, index) => (
                            <label key={index} className="relative flex items-start space-x-3 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                <input
                                    type="checkbox"
                                    className="peer hidden"
                                    name="plumbingBathroom-items"
                                    value={category}
                                    checked={propertyComplaintData.plumbingBathroom.items.includes(category)}
                                    onChange={propertyComplaintHandleChange}
                                />
                                <span className="w-5 h-5 min-w-[20px] border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                    {propertyComplaintData.plumbingBathroom.items.includes(category) && "✔"}
                                </span>
                                <span className="peer-checked:text-[#D4A017] flex-1">{category}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-5 mt-5">
                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('electricalElectronics')}
                            type="button">Prev</button>

                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('furnituresFixtures')}
                            type="button">Next</button>
                    </div>
                </>
                }

                {currentComponent === 'furnituresFixtures' && <>
                    <div className="my-[20px]">
                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Furniture & Fixtures details here</h3>

                        <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Please tick ✓ all that apply:</strong></label>
                        {itemCategory.map((category, index) => (
                            <label key={index} className="relative flex items-start space-x-3 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                <input
                                    type="checkbox"
                                    className="peer hidden"
                                    name="furnituresFixtures-items"
                                    value={category}
                                    checked={propertyComplaintData.furnituresFixtures.items.includes(category)}
                                    onChange={propertyComplaintHandleChange}
                                />
                                <span className="w-5 h-5 min-w-[20px] border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                    {propertyComplaintData.furnituresFixtures.items.includes(category) && "✔"}
                                </span>
                                <span className="peer-checked:text-[#D4A017] flex-1">{category}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-5 mt-5">
                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('plumbingBathroom')}
                            type="button">Prev</button>

                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('kitchenEquipment')}
                            type="button">Next</button>
                    </div>
                </>
                }

                {currentComponent === 'kitchenEquipment' && <>
                    <div className="my-[20px]">
                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Kitchen & Equipment details here</h3>

                        <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Please tick ✓ all that apply:</strong></label>
                        {itemCategory.map((category, index) => (
                            <label key={index} className="relative flex items-start space-x-3 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                <input
                                    type="checkbox"
                                    className="peer hidden"
                                    name="kitchenEquipment-items"
                                    value={category}
                                    checked={propertyComplaintData.kitchenEquipment.items.includes(category)}
                                    onChange={propertyComplaintHandleChange}
                                />
                                <span className="w-5 h-5 min-w-[20px] border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                    {propertyComplaintData.kitchenEquipment.items.includes(category) && "✔"}
                                </span>
                                <span className="peer-checked:text-[#D4A017] flex-1">{category}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-5 mt-5">
                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('furnituresFixtures')}
                            type="button">Prev</button>

                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('internetConnectivity')}
                            type="button">Next</button>
                    </div>
                </>
                }

                {currentComponent === 'internetConnectivity' && <>
                    <div className="my-[20px]">
                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Check the Internet & Connectivity details here</h3>

                        <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Please tick ✓ all that apply:</strong></label>
                        {itemCategory.map((category, index) => (
                            <label key={index} className="relative flex items-start space-x-3 cursor-pointer pe-5 max-sm:text-sm mb-5">
                                <input
                                    type="checkbox"
                                    className="peer hidden"
                                    name="internetConnectivity-items"
                                    value={category}
                                    checked={propertyComplaintData.internetConnectivity.items.includes(category)}
                                    onChange={propertyComplaintHandleChange}
                                />
                                <span className="w-5 h-5 min-w-[20px] border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">
                                    {propertyComplaintData.internetConnectivity.items.includes(category) && "✔"}
                                </span>
                                <span className="peer-checked:text-[#D4A017] flex-1">{category}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-5 mt-5">
                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('kitchenEquipment')}
                            type="button">Prev</button>

                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('others')}
                            type="button">Next</button>
                    </div>
                </>
                }

                {currentComponent === 'others' && <>
                    <div className="mb-[20px]">
                        <label htmlFor="others" className="block mt-3 text-[#D4A017] max-sm:text-sm"><strong>Others</strong> (Please specify):</label>
                        <input
                            type="text"
                            value={propertyComplaintData.others.text}
                            onChange={propertyComplaintHandleChange}
                            name="others"
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            placeholder="Enter any other issues here"
                        />
                    </div>

                    <div className="mb-[20px]">
                        <label htmlFor="issueDesc" className="block mt-3 text-[#D4A017] max-sm:text-sm"><strong>Description of the Issue</strong> (Please describe your problem briefly):</label>
                        <input
                            type="text"
                            value={propertyComplaintData.issueDesc}
                            onChange={propertyComplaintHandleChange}
                            name="issueDesc"
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            placeholder="Describe your problem briefly here"
                        />
                    </div>

                    <div className="mb-[20px]">
                        <label htmlFor="itemCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Preferred Time for Visit / Inspection:</strong></label>
                        <select
                            value={propertyComplaintData.preferredTime}
                            name='preferredTime'
                            onChange={propertyComplaintHandleChange}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            required
                        >
                            <option value="" disabled>Select the Preferred Time for Visit / Inspection here</option>
                            {getOptions('preferred_times').map((t, i) => (
                                <option key={i} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-5 mt-5">
                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('internetConnectivity')}
                            type="button">Prev</button>

                        <button
                            className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" disabled={isSubmitting} type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
                    </div>
                </>
                }
            </form>
        </div>
    )
}

export default CommonPropertyComplaintForm