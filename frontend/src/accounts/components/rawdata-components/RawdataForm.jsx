import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function RawdataForm() {
    const { getOptions, getExpenseCategories } = useDropdowns();
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
        setExpenseCategory(getExpenseCategories(rawDataForm.expenseType));
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
        <DashPage>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={rawDataHandleSubmit} method='POST'>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">RAW DATA FORM</h1>

                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Justify the raw data here</h3>

                        <label htmlFor="propertyName" className="text-[#D4A017] max-sm:text-sm"><strong>Property Name:</strong></label>
                        <input type="text" id="propertyName" value={rawDataForm.propertyName} onChange={rawDataFormHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="propertyName" placeholder="Enter the Property Name here" required />

                        <label htmlFor="headOfExpense" className="text-[#D4A017] max-sm:text-sm"><strong>Head of Expense:</strong></label>
                        <select id="headOfExpense" value={rawDataForm.headOfExpense} onChange={rawDataFormHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="headOfExpense" required>
                            <option value="" disabled>Select the Head of Expense here</option>
                            {getOptions('head_of_expense').map((h, i) => (
                                <option key={i} value={h}>{h}</option>
                            ))}
                        </select>

                        <label htmlFor="expenseType" className="text-[#D4A017] max-sm:text-sm"><strong>Expense Type:</strong></label>
                        <select id="expenseType" value={rawDataForm.expenseType} onChange={rawDataFormHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="expenseType" required>
                            <option value="" disabled>Select the Expense Type here</option>

                            {(rawDataForm.headOfExpense !== 'Owners' && rawDataForm.headOfExpense !== 'Resident') &&
                                getOptions('expense_types__stayease_property').map((t, i) => (
                                    <option key={i} value={t}>{t}</option>
                                ))
                            }

                            {rawDataForm.headOfExpense === 'Owners' &&
                                getOptions('expense_types__owners').map((t, i) => (
                                    <option key={i} value={t}>{t}</option>
                                ))
                            }

                            {rawDataForm.headOfExpense === 'Resident' &&
                                getOptions('expense_types__resident').map((t, i) => (
                                    <option key={i} value={t}>{t}</option>
                                ))
                            }
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
        </DashPage>
    )
}

export default RawdataForm