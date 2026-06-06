// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { Upload } from "lucide-react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function RawdataDetails() {
    const { getOptions, getExpenseCategories } = useDropdowns();
    const navigate = useNavigate();

    const [dataEditView, setDataEditView] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const location = useLocation();
    const data = location.state?.data;
    const { id } = useParams();

    const [expenseCategory, setExpenseCategory] = useState([]);
    const [ownerData, setOwnerData] = useState([]);
    const [ownerId, setOwnerId] = useState(data?.owner_instance_id || '');
    const [ownerRoomData, setOwnerRoomData] = useState([]);

    const [originalData, setOriginalData] = useState(data || {})

    const [rawDataForm, setRawDataForm] = useState({
        propertyName: data?.propertyName || "",
        headOfExpense: data?.headOfExpense || "",
        expenseType: data?.expenseType || "",
        owner: data?.owner || "",
        room: data?.room || "",
        category: data?.category || "",
        comments: data?.comments || "",
        receipt: data?.receipt || ""
    })

    useEffect(() => {
        if (data?.headOfExpense !== rawDataForm.headOfExpense) {
            setRawDataForm(prevState => ({
                ...prevState,
                expenseType: '',
                category: '',
            }));
        }
    }, [rawDataForm.headOfExpense])

    useEffect(() => {
        if (data?.expenseType !== rawDataForm.expenseType) {
            setRawDataForm(prevState => ({
                ...prevState,
                category: '',
            }));
        }
    }, [rawDataForm.expenseType])

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

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

    const getChangedData = () => {
        const changedData = {};

        Object.keys(rawDataForm).forEach(key => {
            const originalValue = originalData[key] || '';
            const currentValue = rawDataForm[key] || '';

            if (currentValue !== originalValue) {
                changedData[key] = currentValue;
            }
        });

        return changedData;
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const rawdataHandleUpdate = async (e) => {
        e.preventDefault();

        const changedData = getChangedData();

        if (Object.keys(changedData).length === 0) {
            toast.info('No data is updated!');
            return;
        }

        setIsSaving(true);

        try {
            const formData = new FormData();

            Object.entries(changedData).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (rawDataForm.headOfExpense === 'Owners') {
                formData.append('ownerId', ownerId);
            }

            const response = await axios.put(
                `/accounts/rawdata-form-update/${id}/`,
                formData,
                {
                    withCredentials: true
                }
            );

            setOriginalData(prev => ({ ...prev, ...changedData }));

            if (response.data.success) {
                toast.success(response.data.message);
                navigate(`/accounts/accounts-rawdata-table/${data.rawdata_id}`);
            }
        } catch (err) {
            console.error('Error updating form:', err);
            toast.error('There was an error updating the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    const rawdataHandleDelete = async (e) => {
        e.preventDefault();
        setIsDeleting(true);

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`/accounts/rawdata-form-delete/${id}/`, {
                withCredentials: true,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                navigate(`/accounts/accounts-rawdata-table/${data.rawdata_id}`);
            }
        } catch (error) {
            console.error('Error deleting form:', error);
            toast.error('There was an error deleting the form. Please try again!');
        } finally {
            setIsDeleting(false);
        }
    }

    const thClass = "border-r border-gray-100 px-3 py-1.5 text-xs font-medium text-[#D4A017] text-left whitespace-nowrap w-48";
    const tdClass = "px-3 py-1.5 text-xs text-gray-800";

    return (
        <DashPage>
            <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg text-slate-800 lg:bg-white" onSubmit={rawdataHandleUpdate}>
                <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">RAWDATA DETAILS</h1>

                <div className="sm:flex justify-between">
                    <button
                        className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/accounts/accounts-rawdata-table/${data.rawdata_id}`)}
                        type="button">Prev</button>

                    <div className="flex justify-end mb-5">
                        <button
                            className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()} type="button">{!dataEditView ? 'Update Status' : 'View Details'}</button>

                        <button
                            className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving || isDeleting}
                            type={dataEditView ? "submit" : "button"}
                            onClick={!dataEditView ? rawdataHandleDelete : null}
                        >
                            {dataEditView ? (isSaving ? "Saving Details..." : "Save Details") : (isDeleting ? "Deleting..." : "Delete")}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Date</th>
                                <td className={tdClass}>{data?.Date}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Description</th>
                                <td className={tdClass + " max-w-[180px] truncate"}>{data?.Desc}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Type</th>
                                <td className={tdClass}>{data?.Type}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Balance</th>
                                <td className={tdClass}>{data?.balance}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Debit</th>
                                <td className={tdClass}>{data?.Debit}</td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Credit</th>
                                <td className={tdClass}>{data?.credit}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="overflow-x-auto mt-5">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Property Name</th>
                                <td className={tdClass}>
                                    {!dataEditView ? <>
                                        {rawDataForm.propertyName}
                                    </> : <>
                                        <input
                                            type="text"
                                            id="propertyName"
                                            value={rawDataForm.propertyName}
                                            onChange={(e) => rawDataFormHandleChange(e)}
                                            className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                            name="propertyName"
                                            placeholder="Enter the Door/Building here"
                                            required />
                                    </>}
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Head of Expense</th>
                                <td className={tdClass}>
                                    {!dataEditView ? <>
                                        {rawDataForm.headOfExpense}
                                    </> : <>
                                        <select id="headOfExpense" value={rawDataForm.headOfExpense} onChange={(e) => rawDataFormHandleChange(e)} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="headOfExpense" required>
                                            <option value="" disabled>Select the Head of Expense here</option>
                                            {getOptions('head_of_expense').map((h, i) => (
                                                <option key={i} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </>}
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Expense Type</th>
                                <td className={tdClass}>
                                    {!dataEditView ? <>
                                        {rawDataForm.expenseType}
                                    </> : <>
                                        <select id="expenseType" value={rawDataForm.expenseType} onChange={(e) => rawDataFormHandleChange(e)} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="expenseType" required>
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
                                    </>}
                                </td>
                            </tr>

                            {(rawDataForm.headOfExpense === 'Owners') && <>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Owner</th>
                                    <td className={tdClass}>
                                        {!dataEditView ? <>
                                            {rawDataForm.owner}
                                        </> : <>
                                            <select id="owner" value={rawDataForm.owner} onChange={handleOwnerChange} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="owner" required>
                                                <option value="" disabled>Select the Owner here</option>
                                                {loadingData ? <option value="">Loading owners data...</option> : <>
                                                    {ownerData.map((owner) => (
                                                        <option key={owner.id} value={owner.ownerName}>
                                                            {owner.ownerName}
                                                        </option>
                                                    ))}
                                                </>}
                                            </select>
                                        </>}
                                    </td>
                                </tr>

                                {rawDataForm.owner !== '' && <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Room</th>
                                    <td className={tdClass}>
                                        {!dataEditView ? <>
                                            {rawDataForm.room}
                                        </> : <>
                                            <select id="room" value={rawDataForm.room} onChange={rawDataFormHandleChange} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="room" required>
                                                <option value="" disabled>Select the Room here</option>
                                                {loadingData ? <option value="">Loading rooms data...</option> : <>
                                                    {ownerRoomData.map((room) => (
                                                        <option key={room.pk} value={room.fields.roomNo}>
                                                            {room.fields.roomNo}
                                                        </option>
                                                    ))}
                                                </>}
                                            </select>
                                        </>}
                                    </td>
                                </tr>}
                            </>}

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Category</th>
                                <td className={tdClass}>
                                    {!dataEditView ? <>
                                        {rawDataForm.category}
                                    </> : <>
                                        <select id="category" value={rawDataForm.category} onChange={(e) => rawDataFormHandleChange(e)} className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300" name="category" required>
                                            <option value="" disabled>Select the Category here</option>
                                            {expenseCategory.map((category, index) => (
                                                <option key={index} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </>}
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Comments (Optional)</th>
                                <td className={tdClass}>
                                    {!dataEditView ? <>
                                        {rawDataForm.comments}
                                    </> : <>
                                        <input
                                            type="text"
                                            id="comments"
                                            value={rawDataForm.comments}
                                            onChange={(e) => rawDataFormHandleChange(e)}
                                            className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                            name="comments"
                                            placeholder="Enter the Door/Building here" />
                                    </>}
                                </td>
                            </tr>

                            <tr className="hover:bg-gray-50 transition-colors">
                                <th className={thClass}>Receipt</th>
                                <td className={tdClass}>
                                    {!dataEditView ? <>
                                        <Link to={
                                            typeof rawDataForm.receipt === 'string'
                                                ? rawDataForm.receipt
                                                : rawDataForm.receipt
                                                    ? URL.createObjectURL(rawDataForm.receipt)
                                                    : '#'
                                        } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017] max-w-[180px] truncate block">
                                            {rawDataForm.receipt?.name || rawDataForm?.receipt ? rawDataForm.receipt.split('/').pop() : ''}
                                        </Link>
                                    </> : <>
                                        <input
                                            type="file"
                                            id="receipt"
                                            name="receipt"
                                            accept="image/*, .pdf"
                                            onChange={(e) => rawDataFormHandleChange(e)}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => triggerFileInput('receipt')}
                                            className="text-black w-full p-1.5 border border-gray-300 rounded text-xs bg-white text-left flex gap-2 items-center"
                                        >
                                            <Upload size={14} className="text-gray-400" />
                                            <span className="truncate w-48">{rawDataForm.receipt?.name || rawDataForm?.receipt?.split('/').pop()}</span>
                                        </button>
                                    </>}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </form>
        </DashPage>
    );
}

export default RawdataDetails;
