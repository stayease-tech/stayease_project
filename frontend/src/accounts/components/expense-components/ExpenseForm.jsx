import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";

function ExpenseForm({ isExpanded, setIsExpanded, loggedUserEmail }) {
    const { getExpenseCategories, getOptions } = useDropdowns();

    const navigate = useNavigate();
    const location = useLocation();

    const activeOption = location.state?.activeOption;
    const expenseDetails = location.state?.expenseData;
    const owner_id = location.state?.ownerId;

    const [expenseCategory, setExpenseCategory] = useState([]);
    const [currentComponent, setCurrentComponent] = useState(expenseDetails ? 'categoryForm' : 'expenseForm');
    const [vendorData, setVendorData] = useState([]);
    const [propertyData, setPropertyData] = useState([]);
    const [ownerData, setOwnerData] = useState([]);
    const [ownerId, setOwnerId] = useState(owner_id || '');
    const [ownerRoomData, setOwnerRoomData] = useState([]);
    const [ownerResidentData, setOwnerResidentData] = useState([]);
    const [ownerDeductions, setOwnerDeductions] = useState([]);
    const [monthYear, setMonthYear] = useState('');
    const [expenseData, setExpenseData] = useState(
        activeOption === 'Expense' ?
            {
                expenseRaisedEmail: loggedUserEmail,
                propertyName: expenseDetails?.propertyName || "",
                headOfExpense: expenseDetails?.headOfExpense || "",
                expenseType: expenseDetails?.expenseType || "",
                owner: expenseDetails?.owner || "",
                room: expenseDetails?.room || "",
                resident: expenseDetails?.resident || "",
                selectedCategories: expenseDetails?.selectedCategories || []
            } : {
                expenseRaisedEmail: loggedUserEmail,
                propertyName: "",
                owner: "",
                rental: "",
                tds: "10",
                rentalAfterTds: "0",
                deductions: "",
                comments: ""
            }
    )

    const [loadingData, setLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dataHandleToggle = (step) => {
        if (step === 'expenseForm') {
            setCurrentComponent(step)
        }

        if (step === 'expenseType') {
            if (!expenseData.propertyName) {
                alert(`Please enter the Property Name!`)
            }
            else if (!expenseData.headOfExpense) {
                alert(`Please select the Head of Expense!`)
            }
            else if (!expenseData.expenseType) {
                alert(`Please select the Expense Type!`)
            }
            else if (expenseData.headOfExpense === 'Owners' && !expenseData.owner) {
                alert(`Please select the Owner!`)
            }
            else if (expenseData.owner && !expenseData.room) {
                alert(`Please select a Room!`)
            } else {
                if (expenseData.expenseType === 'Operations') {
                    setExpenseCategory(getExpenseCategories('Operations'))
                }
                else if (expenseData.expenseType === 'Sales') {
                    setExpenseCategory(getExpenseCategories('Sales'))
                }
                else if (expenseData.expenseType === 'Marketing') {
                    setExpenseCategory(getExpenseCategories('Marketing'))
                }
                else if (expenseData.expenseType === 'Transformation') {
                    setExpenseCategory(getExpenseCategories('Transformation'))
                }
                else if (expenseData.expenseType === 'Expansion') {
                    setExpenseCategory(getExpenseCategories('Expansion'))
                }
                else if (expenseData.expenseType === 'HR & Admin') {
                    setExpenseCategory(getExpenseCategories('HR & Admin'))
                }
                else if (expenseData.headOfExpense === 'Resident') {
                    if (expenseData.expenseType === 'Check-Out Deductions') {
                        setExpenseCategory(getExpenseCategories('Check-Out Deductions'))
                    }
                    else {
                        setExpenseCategory(getExpenseCategories('Monthly Maintenance'))
                    }
                }
                else if (expenseData.headOfExpense === 'Owners') {
                    if (expenseData.expenseType === 'Owner Deductions') {
                        setExpenseCategory(getExpenseCategories('Owner Deductions'))
                    }
                    else {
                        setExpenseCategory(getExpenseCategories('Owner Payout'))
                    }
                }
                else {
                    return
                }
                setCurrentComponent(step)
            }
        }

        if (step === 'categoryForm') {
            if (expenseData.selectedCategories.length === 0) {
                alert(`Please select any Category here to proceed!`)
            }
            else {
                setCurrentComponent(step)
            }
        }
    }

    const [tablevisibility, setTableVisibility] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = ownerDeductions.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });

    useEffect(() => {
        if (expenseDetails?.headOfExpense === expenseData.headOfExpense) return;

        setExpenseData(prev => ({
            ...prev,
            expenseType: "",
            owner: "",
            room: "",
            resident: "",
            selectedCategories: []
        }))
    }, [expenseData.headOfExpense])

    useEffect(() => {
        if (expenseDetails?.expenseType === expenseData.expenseType) return;

        setExpenseData(prev => ({
            ...prev,
            owner: "",
            room: "",
            resident: "",
            selectedCategories: []
        }))
    }, [expenseData.expenseType])

    useEffect(() => {
        if (activeOption === 'Expense') return;

        const ownerProperties = ownerData.find(owner => owner.ownerName === expenseData?.owner);

        setExpenseData(prev => ({
            ...prev,
            rental: ownerProperties?.sumOfRents || "0",
            deductions: ownerProperties?.sumOfExpenses || "0",
        }))
    }, [expenseData.owner])

    useEffect(() => {
        const tenPercent = (Number(expenseData?.tds) / 100) * Number(expenseData?.rental);

        const remaining = Number(expenseData?.rental) - tenPercent;

        setExpenseData(prev => ({
            ...prev,
            rentalAfterTds: remaining || "0",
        }))
    }, [expenseData.rental, expenseData.tds])

    useEffect(() => {
        if (activeOption === 'Expense') return;

        const ownerProperties = ownerData.find(owner => owner.ownerName === expenseData?.owner);

        setOwnerDeductions(ownerProperties?.approvedExpenses || [])
    }, [expenseData.owner])

    useEffect(() => {
        if (activeOption === 'Expense') return;

        const ownerProperties = ownerData.find(owner => owner.ownerName === expenseData?.owner);

        setMonthYear(ownerProperties?.monthYear || '')
    }, [expenseData.owner])

    const triggerFileInput = (type) => {
        document.getElementById(type).click();
    };

    const expenseHandleChange = (e, index = null, field = null) => {
        const { type, name, value, checked } = e.target;

        if (type === "checkbox" && name === "selectedCategories") {
            setExpenseData((prev) => {
                const exists = prev.selectedCategories.find(cat => cat.category === value);

                if (checked && !exists) {
                    return {
                        ...prev,
                        selectedCategories: [
                            ...prev.selectedCategories,
                            {
                                category: value,
                                amount: "",
                                gst: "",
                                remarks: "",
                                paymentType: "",
                                vendorType: "",
                                vendor: "",
                                accountId: "",
                                amountTransferredDate: "",
                                priority: "",
                                deadline: "",
                                comments: "",
                                receipt: ""
                            }
                        ]
                    };
                } else if (!checked && exists) {
                    return {
                        ...prev,
                        selectedCategories: prev.selectedCategories.filter(
                            (cat) => cat.category !== value
                        )
                    };
                }

                return prev;
            });
        }

        else if (index !== null && field) {
            if (type === 'file') {
                setExpenseData((prev) => {
                    const updatedCategories = [...prev.selectedCategories];
                    updatedCategories[index][field] = e.target.files?.[0];

                    return {
                        ...prev,
                        selectedCategories: updatedCategories
                    };
                });
            } else {
                setExpenseData((prev) => {
                    const updatedCategories = [...prev.selectedCategories];
                    updatedCategories[index][field] = value;

                    return {
                        ...prev,
                        selectedCategories: updatedCategories
                    };
                });
            }
        }

        else {
            setExpenseData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleOwnerChange = (e) => {
        expenseHandleChange(e);

        const selectedOwnerName = e.target.value;
        const selectedOwner = ownerData.find(owner => owner.ownerName === selectedOwnerName);
        setOwnerId(selectedOwner?.id || '');
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/accounts/get-vendor-data/');

                setVendorData(response?.data?.vendor_table || []);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/accounts/get-property-data/');

                const propertyNames = (response?.data?.properties || []).map(property => property.propertyName);

                setPropertyData([...new Set(propertyNames)]);

            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (activeOption === 'Expense') {
            if (expenseData.headOfExpense !== 'Owners') {
                return;
            }
        }

        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/accounts/get-owner-data/');

                setOwnerData(response?.data?.owner_data || []);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [expenseData.headOfExpense]);

    useEffect(() => {
        if (expenseData.headOfExpense === 'Resident' && !expenseData.propertyName) return;
        if (expenseData.headOfExpense !== 'Resident' && !expenseData.owner) return;

        const fetchData = async () => {
            setLoadingData(true);

            try {
                const response = (expenseData.headOfExpense === 'Resident') ? await axios.get(`/accounts/get-owner-rooms/${expenseData.propertyName}/`) : await axios.get(`/accounts/get-owner-rooms/${ownerId}/`);

                setOwnerRoomData(response?.data?.rooms_data || []);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [expenseData.owner, expenseData.headOfExpense, expenseData.propertyName]);

    useEffect(() => {
        if (!expenseData.room) return;

        const fetchData = async () => {
            setLoadingData(true);

            try {
                const response = await axios.get(`/accounts/get-resident-data/${expenseData.propertyName}/${expenseData.room}/`);

                setOwnerResidentData(response?.data?.residents_data || []);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [expenseData.headOfExpense, expenseData.room]);

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const expenseHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();

        formData.append('dashboardUser', 'accounts');
        formData.append('expenseRaisedEmail', expenseData.expenseRaisedEmail);
        formData.append('propertyName', expenseData.propertyName);
        formData.append('owner', expenseData.owner);
        formData.append('ownerId', ownerId);

        if (activeOption === 'Expense') {
            formData.append('headOfExpense', expenseData.headOfExpense);
            formData.append('expenseType', expenseData.expenseType);
            formData.append('room', expenseData.room);
            formData.append('resident', expenseData.resident);

            expenseData.selectedCategories.forEach((category, index) => {
                Object.entries(category).forEach(([key, value]) => {
                    if (key !== 'receipt') {
                        formData.append(`selectedCategories[${index}].${key}`, value);
                    } else if (value instanceof File) {
                        formData.append(`selectedCategories[${index}].receipt`, value);
                    }
                });
            });

            const vendorNames = expenseData.selectedCategories.map(category => category.vendor);

            const filteredVendorNames = vendorData.filter(data =>
                vendorNames.includes(data.vendor)
            );

            const filteredIds = filteredVendorNames.map(({ id }) => id);

            formData.append('vendorIds', JSON.stringify(filteredIds));
        } else {
            formData.append('monthYear', monthYear);
            formData.append('rental', expenseData.rental);
            formData.append('tds', expenseData.tds);
            formData.append('rentalAfterTds', expenseData.rentalAfterTds);
            formData.append('deductions', expenseData.deductions);
            formData.append('comments', expenseData.comments);
        }

        try {
            const response = (activeOption === 'Expense') ?
                await axios.post(`/accounts/expense-form-submit/`, formData, {
                    withCredentials: true,
                })
                :
                await axios.post(`/accounts/fixed-expense-form-submit/`, formData, {
                    withCredentials: true,
                });

            if (response.data.success) {
                alert(response.data.message);

                setExpenseData(activeOption === 'Expense' ? {
                    propertyName: "",
                    headOfExpense: "",
                    expenseType: "",
                    owner: "",
                    room: "",
                    resident: "",
                    selectedCategories: []
                } : {
                    propertyName: "",
                    owner: "",
                    rental: "",
                    tds: "10",
                    rentalAfterTds: "0",
                    deductions: "",
                    comments: ""
                })

                activeOption === 'Expense' ?
                    navigate('/accounts/accounts-expense-table', { state: { activeOption } })
                    :
                    navigate('/accounts/accounts-expense-table', { state: { activeOption } });
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

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 lg:pb-5`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={expenseHandleSubmit} method='POST'>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">PROPERTY-WISE EXPENSE FORM</h1>

                        {activeOption === 'Expense' && <>
                            {currentComponent === 'expenseForm' && <>
                                <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Create Property-wise Expense here</h3>

                                <label htmlFor="propertyName" className="text-[#D4A017] max-sm:text-sm"><strong>Property Name: <span className="text-red-500">*</span></strong></label>
                                <select id="propertyName" value={expenseData.propertyName} onChange={expenseHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="propertyName" required>
                                    <option value="" disabled>Select the property name here</option>
                                    {loadingData ? <option value="">
                                        Loading property data...
                                    </option> : <>
                                        {(propertyData || []).map((property, index) => (
                                            <option key={index} value={property}>
                                                {property}
                                            </option>
                                        ))}
                                    </>}
                                </select>

                                <label htmlFor="headOfExpense" className="text-[#D4A017] max-sm:text-sm"><strong>Head of Expense: <span className="text-red-500">*</span></strong></label>
                                <select id="headOfExpense" value={expenseData.headOfExpense} onChange={expenseHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="headOfExpense" required>
                                    <option value="" disabled>Select the Head of Expense here</option>
                                    {getOptions('head_of_expense').map((h, i) => (
                                        <option key={i} value={h}>{h}</option>
                                    ))}
                                </select>

                                <label htmlFor="expenseType" className="text-[#D4A017] max-sm:text-sm"><strong>Expense Type: <span className="text-red-500">*</span></strong></label>
                                <select id="expenseType" value={expenseData.expenseType} onChange={expenseHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="expenseType" required>
                                    <option value="" disabled>Select the Expense Type here</option>

                                    {(expenseData.headOfExpense === 'Stayease' || expenseData.headOfExpense === 'Property') && <>
                                        {getOptions('expense_types__stayease_property').map((t, i) => (
                                            <option key={i} value={t}>{t}</option>
                                        ))}
                                    </>}

                                    {expenseData.headOfExpense === 'Owners' && <>
                                        {getOptions('expense_types__owners').map((t, i) => (
                                            <option key={i} value={t}>{t}</option>
                                        ))}
                                    </>}

                                    {expenseData.headOfExpense === 'Resident' && <>
                                        {getOptions('expense_types__resident').map((t, i) => (
                                            <option key={i} value={t}>{t}</option>
                                        ))}
                                    </>}
                                </select>

                                {(expenseData.headOfExpense === 'Owners' || expenseData.headOfExpense === 'Resident') && <>
                                    {expenseData.headOfExpense === 'Owners' && <>
                                        <label className="text-[#D4A017] max-sm:text-sm"><strong>Owner: <span className="text-red-500">*</span></strong></label>

                                        <select
                                            value={expenseData.owner}
                                            name='owner'
                                            onChange={handleOwnerChange}
                                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select the Owner here</option>{loadingData ? <option value="">
                                                Loading owners data...
                                            </option> : <>
                                                {(ownerData || []).map((owner) => (
                                                    <option key={owner?.id} value={owner?.ownerName}>
                                                        {owner?.ownerName}
                                                    </option>
                                                ))}
                                            </>}
                                        </select>
                                    </>}

                                    {((expenseData.headOfExpense === "Resident" && expenseData.propertyName !== '') || expenseData.owner !== '') && <>
                                        <label className="text-[#D4A017] max-sm:text-sm"><strong>Rooms: <span className="text-red-500">*</span></strong></label>

                                        <select
                                            value={expenseData.room}
                                            name='room'
                                            onChange={expenseHandleChange}
                                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select the Room here</option>{loadingData ? <option value="">
                                                Loading rooms data...
                                            </option> : <>
                                                {ownerRoomData.map((room) => (
                                                    <option key={room.pk} value={room.fields.roomNo}>
                                                        {room.fields.roomNo}
                                                    </option>
                                                ))}
                                            </>}
                                        </select>

                                        {(expenseData.room !== '' && expenseData.headOfExpense === 'Resident') && <>
                                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Resident: <span className="text-red-500">*</span></strong></label>

                                            <select
                                                value={expenseData.resident}
                                                name='resident'
                                                onChange={handleOwnerChange}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                required
                                            >
                                                <option value="" disabled>Select the Resident here</option>{loadingData ? <option value="">
                                                    Loading residents data...
                                                </option> : <>
                                                    {(ownerResidentData || []).map((resident) => (
                                                        <option key={resident?.pk} value={resident?.fields?.residentsName}>
                                                            {resident?.fields?.residentsName}
                                                        </option>
                                                    ))}
                                                </>}
                                            </select>
                                        </>}
                                    </>}
                                </>}

                                <button
                                    className="block w-full mt-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('expenseType')}
                                    type="button">Next</button>
                            </>}

                            {currentComponent === 'expenseType' && <>
                                <div className="my-[20px]">
                                    <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Add {expenseData.expenseType} Expense here</h3>

                                    <label htmlFor="expenseCategory" className="text-[#D4A017] max-sm:text-sm block my-3"><strong>Select the Expense Category here:</strong></label>
                                    {expenseCategory.map((category, index) => (
                                        <label key={index} className="relative inline-flex items-center space-x-2 cursor-pointer pe-5 max-sm:text-sm">
                                            <input type="checkbox" className="peer hidden" name="selectedCategories" value={category} checked={expenseData.selectedCategories.some((cat) => cat.category === category)} onChange={expenseHandleChange} />

                                            <span className="w-5 h-5 border-2 border-gray-500 rounded-md flex items-center justify-center peer-checked:bg-[#eba312] peer-checked:border-black">{expenseData.selectedCategories.some((cat) => cat.category === category) && "✔"}</span>
                                            <span className="peer-checked:text-[#D4A017]">{category}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex gap-5 mt-5">
                                    <button
                                        className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('expenseForm')}
                                        type="button">Prev</button>

                                    <button
                                        className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('categoryForm')}
                                        type="button">Next</button>
                                </div>
                            </>
                            }

                            {currentComponent === 'categoryForm' && <>
                                {expenseData.selectedCategories.map((cat, index) => (
                                    <div key={index} className="mb-8">
                                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">{cat.category}</h3>

                                        <label className="text-[#D4A017] max-sm:text-sm"><strong>Amount: <span className="text-red-500">*</span></strong></label>
                                        <input
                                            type="text"
                                            value={cat.amount}
                                            onChange={(e) => expenseHandleChange(e, index, "amount")}
                                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                            placeholder="Enter the Amount here"
                                            required
                                        />

                                        <label className="text-[#D4A017] max-sm:text-sm"><strong>GST - Tax Amount (Enter 0 if not applicable): <span className="text-red-500">*</span></strong></label>
                                        <input
                                            type="text"
                                            value={cat.gst}
                                            onChange={(e) => expenseHandleChange(e, index, "gst")}
                                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                            placeholder="Enter the tax amount here"
                                            required
                                        />

                                        <label className="text-[#D4A017] max-sm:text-sm"><strong>Total Amount after GST:</strong></label>
                                        <input
                                            type="text"
                                            value={Number(cat.amount) + (isNaN(Number(cat.gst)) ? 0 : Number(cat.gst))}
                                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                            readOnly
                                        />

                                        {expenseData.headOfExpense === 'Resident' && <>
                                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Remarks: <span className="text-red-500">*</span></strong></label>
                                            <input
                                                type="text"
                                                value={cat.remarks}
                                                onChange={(e) => expenseHandleChange(e, index, "remarks")}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                placeholder="Enter any Remarks here"
                                                required
                                            />
                                        </>}

                                        {expenseData.headOfExpense !== 'Resident' && <>
                                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Payment Type: <span className="text-red-500">*</span></strong></label>
                                            <select
                                                value={cat.paymentType}
                                                onChange={(e) => expenseHandleChange(e, index, "paymentType")}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                required
                                            >
                                                <option value="" disabled>Select the Payment Type here</option>
                                                {getOptions('payment_types').map((p, i) => (
                                                    <option key={i} value={p}>{p}</option>
                                                ))}
                                            </select>

                                            {cat.paymentType === "Vendor" && <>
                                                <label className="text-[#D4A017] max-sm:text-sm"><strong>Vendor Type: <span className="text-red-500">*</span></strong></label>
                                                <select
                                                    value={cat.vendorType}
                                                    onChange={(e) => expenseHandleChange(e, index, "vendorType")}
                                                    className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                    required
                                                >
                                                    <option value="" disabled>Select the Vendor Type here</option>
                                                    {getOptions('vendor_types').map((v, i) => (
                                                        <option key={i} value={v}>{v}</option>
                                                    ))}
                                                </select>

                                                {cat.vendorType === "Registered" && <>
                                                    <label className="text-[#D4A017] max-sm:text-sm"><strong>Vendor: <span className="text-red-500">*</span></strong></label>

                                                    <select
                                                        value={cat.vendor}
                                                        onChange={(e) => expenseHandleChange(e, index, "vendor")}
                                                        className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                        required
                                                    >
                                                        <option value="" disabled>Select the Vendor here</option>{loadingData ? <option value="">
                                                            Loading vendor data...
                                                        </option> : <>
                                                            {vendorData.map((vendor, index) => (
                                                                <option key={index} value={vendor.vendor}>
                                                                    {vendor.vendor}
                                                                </option>
                                                            ))}
                                                        </>}
                                                    </select>
                                                </>}

                                                {cat.vendorType === "Not Registered" && <>
                                                    <label className="block mb-3 text-[#D4A017] max-sm:text-sm"><strong>Add the vendor details:</strong></label>

                                                    <button className="block mb-3 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => {
                                                        navigate('/accounts/accounts-vendor-form', { state: { expenseData, index, activeOption, ownerId } })
                                                    }} type="button">Click here to add the vendor details</button>
                                                </>}
                                            </>}

                                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Account Id (Optional):</strong></label>
                                            <input
                                                type="text"
                                                value={cat.accountId}
                                                onChange={(e) => expenseHandleChange(e, index, "accountId")}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                placeholder="Enter the Account Id here"
                                            />

                                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Amount Transferred Date:</strong></label>
                                            <input
                                                type="date"
                                                value={cat.amountTransferredDate}
                                                onChange={(e) => expenseHandleChange(e, index, "amountTransferredDate")}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                            />

                                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Priority: <span className="text-red-500">*</span></strong></label>
                                            <select
                                                value={cat.priority}
                                                onChange={(e) => expenseHandleChange(e, index, "priority")}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                required
                                            >
                                                <option value="" disabled>Select the Priority here</option>
                                                {expenseData.selectedCategories.map((priority, index) => (
                                                    <option key={index} value={`P${index + 1}`}>
                                                        {`P${index + 1}`}
                                                    </option>
                                                ))}
                                            </select>

                                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Deadline for the Payment: <span className="text-red-500">*</span></strong></label>
                                            <select
                                                value={cat.deadline}
                                                onChange={(e) => expenseHandleChange(e, index, "deadline")}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                required
                                            >
                                                <option value="" disabled>Select the Deadline here</option>
                                                {getOptions('deadline_options').map((d, i) => <option key={i} value={d}>{d}</option>)}
                                            </select>

                                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                                            <input
                                                type="text"
                                                value={cat.comments}
                                                onChange={(e) => expenseHandleChange(e, index, "comments")}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                                placeholder="Enter any additional comments here"
                                            />

                                            <label className="text-[#D4A017] max-sm:text-sm">
                                                <strong>Upload Receipt:</strong>
                                            </label>
                                            <input
                                                type="file"
                                                id={`receipt_${index}`}
                                                name="receipt"
                                                accept=".xlsx, .xls, .csv, .pdf, image/*"
                                                onChange={(e) => expenseHandleChange(e, index, "receipt")}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => triggerFileInput(`receipt_${index}`)}
                                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm bg-white text-left flex gap-3"
                                            >
                                                <span className="mt-1 text-lg"><FaUpload /></span>
                                                <span className="mt-1 text-xs sm:text-sm truncate w-64">{cat.receipt?.name || 'No file chosen'}</span>
                                            </button>
                                        </>}
                                    </div>
                                ))}

                                <div className="flex gap-5 mt-5">
                                    <button className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('expenseType')} type="button">Prev</button>

                                    <button className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
                                </div>
                            </>
                            }
                        </>}

                        {activeOption === 'Fixed Expense' && <>
                            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Create Property-wise Fixed Expense here</h3>

                            <label htmlFor="propertyName" className="text-[#D4A017] max-sm:text-sm"><strong>Property Name: <span className="text-red-500">*</span></strong></label>
                            <input
                                id="propertyName"
                                type="text"
                                value={expenseData.propertyName}
                                onChange={expenseHandleChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                name="propertyName"
                                placeholder="Enter the Property Name here"
                                required
                            />

                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Owner: <span className="text-red-500">*</span></strong></label>
                            <select
                                value={expenseData.owner}
                                name='owner'
                                onChange={handleOwnerChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                required
                            >
                                <option value="" disabled>Select the Owner here</option>{loadingData ? <option value="">
                                    Loading owners data...
                                </option> : <>
                                    {(ownerData || []).map((owner) => (
                                        <option key={owner?.id} value={owner?.ownerName}>
                                            {owner?.ownerName}
                                        </option>
                                    ))}
                                </>}
                            </select>

                            <label htmlFor="rental" className="text-[#D4A017] max-sm:text-sm"><strong>Rental: <span className="text-red-500">*</span></strong></label>
                            <input
                                id="rental"
                                type="text"
                                value={expenseData.rental}
                                onChange={expenseHandleChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                name="rental"
                                placeholder="Enter the Rental here"
                                required
                            />

                            <label htmlFor="tds" className="text-[#D4A017] max-sm:text-sm"><strong>TDS (Enter 0 if TDS is not applicable): <span className="text-red-500">*</span></strong></label>
                            <input type="text" id="tds" value={expenseData.tds} onChange={expenseHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="tds" placeholder="Enter the TDS percentage here" required />

                            <label htmlFor="rentalAfterTds" className="text-[#D4A017] max-sm:text-sm"><strong>Rental after TDS: (Read Only)</strong></label>
                            <input type="text" id="rentalAfterTds" value={expenseData.rentalAfterTds} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="rentalAfterTds" readOnly />

                            <label htmlFor="deductions" className="text-[#D4A017] max-sm:text-sm"><strong>Deductions: <span className="text-red-500">*</span></strong></label>
                            <input type="text" id="deductions" value={expenseData.deductions} onChange={expenseHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="deductions" placeholder="Enter the Deductions here" required />

                            <label htmlFor="deductionsCheck" className="block text-stone-400 my-3 max-sm:text-sm"><strong>Click here to check the deductions:</strong>

                                <button className="max-sm:w-full max-sm:mt-3 sm:ms-3 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" type="button" onClick={() => setTableVisibility(true)}>Click here</button>
                            </label>

                            {tablevisibility && <>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="mt-2 mb-3 text-black max-sm:w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs"
                                />

                                <div className="w-full overflow-x-auto">
                                    <table className="min-w-full table-auto border-collapse shadow-md rounded-lg max-sm:text-xs">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-700">
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">No.</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Expense Raised By</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Category</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Amount</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Payment Type</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Account Id</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Priority</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Deadline</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Receipt</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Comments</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Submitted At</th>
                                                <th className="border border-gray-300 py-2 px-4 text-left border-b text-center">Last Updated</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {paginatedData.length > 0 ? paginatedData.map((categoryData, i) => (
                                                <tr className="" key={categoryData.id}>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{startIndex + i + 1}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{categoryData?.expenseRaisedEmail || '-'}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{categoryData?.category}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{categoryData?.amount}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{categoryData?.paymentType}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{categoryData?.accountId}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{categoryData?.priority}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{categoryData?.deadline}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center hover:text-[#D4A017] hover:cursor-pointer" onClick={() => categoryData?.receipt && window.open(categoryData.receipt, '_blank')}>{categoryData?.receipt ? categoryData.receipt.split('/').pop() : ''}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{categoryData?.comments}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{formatter.format(new Date(categoryData?.createdAt))}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center">{formatter.format(new Date(categoryData?.updatedAt))}</td>
                                                </tr>
                                            )) : <tr>
                                                <td colSpan="12" className="border border-gray-300 px-4 py-2 text-center">No data available</td>
                                            </tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-center mt-4 space-x-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-4 py-2 rounded ${currentPage === page
                                                ? "bg-[#D4A017] text-white"
                                                : "bg-[#FDF6E3] text-[#B8860B] hover:bg-[#D4A017] hover:text-white"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            </>}

                            <label htmlFor="comments" className="text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                            <input
                                id="comments"
                                type="text"
                                value={expenseData.comments}
                                onChange={expenseHandleChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                name="comments"
                                placeholder="Enter any additional comments here"
                            />

                            <button className="block mt-4 w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
                        </>}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ExpenseForm