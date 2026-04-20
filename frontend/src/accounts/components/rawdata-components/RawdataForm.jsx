import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import axios from 'axios';
import Cookies from 'js-cookie';

function RawdataForm({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();

    const location = useLocation();
    const data = location.state?.data;
    const { id } = useParams();

    const [expenseCategory, setExpenseCategory] = useState([]);
    const [ownerData, setOwnerData] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    const [ownerRoomData, setOwnerRoomData] = useState([]);

    const [rawDataForm, setRawDataForm] = useState({
        date: data?.Date,
        desc: data?.Desc,
        type: data?.Type,
        balance: data?.balance,
        debit: data?.Debit,
        credit: data?.credit,
        propertyName: "",
        headOfExpense: "",
        expenseType: "",
        owner: "",
        room: "",
        category: "",
        comments: "",
        receipt: ""
    })

    const [loadingData, setLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setRawDataForm(prev => ({
            ...prev,
            expenseType: "",
            owner: "",
            room: "",
            category: "",
            comments: "",
            receipt: ""
        }))
    }, [rawDataForm.headOfExpense])

    useEffect(() => {
        setRawDataForm(prev => ({
            ...prev,
            owner: "",
            room: "",
            category: "",
            comments: "",
            receipt: ""
        }))
    }, [rawDataForm.expenseType])

    const triggerFileInput = (type) => {
        if (type === "receipt") {
            document.getElementById("receipt").click();
        }
    };

    useEffect(() => {
        const operationsCategories = ["BGV Charges", "Consumables", "Field Staff", "Printing and Stationary", "Property Maintenance", "Property Payroll", "Property Repairs", "Shipping and Freight", "Soft Furnishing", "Subscriptions", "Travel", "Utilities", "Other Operations Expense"];

        const salesCategories = ["Agreement", "Deposit Refund"];

        const marketingCategories = ["Meta", "Google", "Offline Marketing"];

        const transformationCategories = ["Purchase-Furniture", "Soft Furnishing"];

        const expansionCategories = ["Agreement Purchase", "Consultant Charges"];

        const hrAndAdminCategories = ["Travel expense", "Food expense", "Purchase - IT", "purchase - HR", "Stationery", "Apparels", "Service - IT", "Other Expense"];

        const residentDeductionsCategory = ["Property maintenance", "Damage Cost", "Electricity", "Monthly maintenance"];

        const residentPayableCategory = ["Desposit Refund", "Delay Charges"];

        const residentReceivableCategory = ["Rent", "Monthly maintenance"];

        const ownerDeductionsCategory = ["Electricity", "Asd", "RTO - furniture", "RTO - appliances", "Repair- furniture", "Repair - appliances", "Replacement- furniture", "Replacement - appliances", "Painting", "Repairs- others", "Lift", "Dg", "Water tankers", "Replacement - others"];

        const ownerPayoutCategory = ["Rent", "Arrears"];

        const categoryMap = {
            'Operations': operationsCategories,
            'Sales': salesCategories,
            'Marketing': marketingCategories,
            'Transformation': transformationCategories,
            'Expansion': expansionCategories,
            'HR & Admin': hrAndAdminCategories,
            'Resident Deductions': residentDeductionsCategory,
            'Resident Payable': residentPayableCategory,
            'Resident Receivable': residentReceivableCategory,
            'Owner Deductions': ownerDeductionsCategory,
            'Owner Payout': ownerPayoutCategory
        };

        setExpenseCategory(categoryMap[rawDataForm.expenseType] || []);
    }, [rawDataForm.expenseType]);

    const rawDataFormHandleChange = (e) => {
        const { name, value, type, files } = e.target;

        setRawDataForm(prevState => ({
            ...prevState,
            [name]: type === "file" ? files[0] : value,
        }));
    };

    const handleOwnerChange = (e) => {
        rawDataFormHandleChange(e);

        const selectedOwnerName = e.target.value;
        const selectedOwner = ownerData.find(owner => owner.ownerName === selectedOwnerName);
        setOwnerId(selectedOwner?.id || '');
    };

    useEffect(() => {
        if (rawDataForm.headOfExpense !== 'Owners') {
            return;
        }

        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/supply/get-owner-data/');

                setOwnerData(response.data.supply_table);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [rawDataForm.headOfExpense]);

    useEffect(() => {
        if (!rawDataForm.owner) {
            return;
        }

        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get(`/accounts/get-owner-rooms/${ownerId}`);

                setOwnerRoomData(response.data.rooms_data);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [rawDataForm.owner]);

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const rawDataHandleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);

        const formData = new FormData();

        Object.entries(rawDataForm).forEach(([key, value]) => {
            formData.append(key, value);
        });

        formData.append('ownerId', ownerId);

        try {
            const response = await axios.post(`/accounts/rawdata-form-submit/${id}/`, formData, {
                withCredentials: true,
            });

            alert(response.data.message);

            setRawDataForm({
                date: "",
                desc: "",
                details: "",
                month: "",
                type: "",
                balance: "",
                credit: "",
                propertyName: "",
                headOfExpense: "",
                expenseType: "",
                owner: "",
                room: "",
                category: "",
                comments: "",
                receipt: ""
            });

            navigate(`/accounts/accounts-rawdata-table/${id}`);
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="">
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 max-lg:bg-white min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 lg:pb-3`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={rawDataHandleSubmit} method='POST'>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">RAW DATA FORM</h1>

                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Justify the raw data here</h3>

                        <label htmlFor="propertyName" className="text-[#D4A017] max-sm:text-sm"><strong>Property Name:</strong></label>
                        <input type="text" id="propertyName" value={rawDataForm.propertyName} onChange={rawDataFormHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="propertyName" placeholder="Enter the Property Name here" required />

                        <label htmlFor="headOfExpense" className="text-[#D4A017] max-sm:text-sm"><strong>Head of Expense:</strong></label>
                        <select id="headOfExpense" value={rawDataForm.headOfExpense} onChange={rawDataFormHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="headOfExpense" required>
                            <option value="" disabled>Select the Head of Expense here</option>
                            <option value="Owners">Owners</option>
                            <option value="Stayease">Stayease</option>
                            <option value="Property">Property</option>
                            <option value="Resident">Resident</option>
                        </select>

                        <label htmlFor="expenseType" className="text-[#D4A017] max-sm:text-sm"><strong>Expense Type:</strong></label>
                        <select id="expenseType" value={rawDataForm.expenseType} onChange={rawDataFormHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="expenseType" required>
                            <option value="" disabled>Select the Expense Type here</option>

                            {(rawDataForm.headOfExpense !== 'Owners' && rawDataForm.headOfExpense !== 'Resident') && <>
                                <option value="Operations">Operations</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Transformation">Transformation</option>
                                <option value="Expansion">Expansion</option>
                                <option value="HR & Admin">HR & Admin</option>
                            </>}

                            {rawDataForm.headOfExpense === 'Owners' && <>
                                <option value="Owner Deductions">Owner Deductions</option>
                                <option value="Owner Payout">Owner Payout</option>
                            </>}

                            {rawDataForm.headOfExpense === 'Resident' && <>
                                <option value="Resident Deductions">Resident Deductions</option>
                                <option value="Resident Payable">Resident Payable</option>
                                <option value="Resident Receivable">Resident Receivable</option>
                            </>}
                        </select>

                        {rawDataForm.headOfExpense === 'Owners' && <>
                            <label className="text-[#D4A017] max-sm:text-sm"><strong>Owner:</strong></label>

                            <select
                                value={rawDataForm.owner}
                                name='owner'
                                onChange={handleOwnerChange}
                                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                                required
                            >
                                <option value="" disabled>Select the Owner here</option>{loadingData ? <option value="">
                                    Loading owners data...
                                </option> : <>
                                    {ownerData.map((owner) => (
                                        <option key={owner.id} value={owner.ownerName}>
                                            {owner.ownerName}
                                        </option>
                                    ))}
                                </>}
                            </select>

                            {rawDataForm.owner !== '' && <>
                                <label className="text-[#D4A017] max-sm:text-sm"><strong>Rooms:</strong></label>

                                <select
                                    value={rawDataForm.room}
                                    name='room'
                                    onChange={rawDataFormHandleChange}
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
                            </>}
                        </>}

                        <label className="text-[#D4A017] max-sm:text-sm"><strong>Category:</strong></label>
                        <select
                            value={rawDataForm.category}
                            onChange={rawDataFormHandleChange}
                            name="category"
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            required
                        >
                            <option value="" disabled>Select the Category here</option>
                            {expenseCategory.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        <label className="text-[#D4A017] max-sm:text-sm"><strong>Comments (Optional):</strong></label>
                        <input
                            type="text"
                            value={rawDataForm.comments}
                            onChange={rawDataFormHandleChange}
                            name="comments"
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                            placeholder="Enter any additional comments here"
                        />

                        <label className="text-[#D4A017] max-sm:text-sm"><strong>Upload Receipt:</strong></label>

                        <input
                            type="file"
                            id="receipt"
                            name="receipt"
                            accept="image/*, .pdf"
                            onChange={rawDataFormHandleChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => triggerFileInput('receipt')}
                            className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm bg-white text-left flex gap-3"
                        >
                            <span className="mt-1 text-lg"><FaUpload /></span> <span className="mt-1 text-xs sm:text-sm truncate w-64">{rawDataForm.receipt?.name || 'No file chosen'}</span>
                        </button>

                        <div className="flex gap-5 mt-5">
                            <button
                                className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/accounts/accounts-rawdata-table/${id}`)} type="button">Prev</button>

                            <button
                                className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RawdataForm