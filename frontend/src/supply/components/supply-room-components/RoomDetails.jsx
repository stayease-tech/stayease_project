// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function RoomDetails() {
    const { getOptionsWithCurrent } = useDropdowns();
    const navigate = useNavigate();

    const oneBhk = ['A1', 'A2'];
    const onePointFiveBhk = ['A1', 'A2', 'B1'];
    const twoBhk = ['A1', 'A2', 'B1', 'B2'];
    const twoPointFiveBhk = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const threeBhk = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    const [dataEditView, setDataEditView] = useState(false);
    const location = useLocation();
    const roomData = location.state?.roomData;
    const owner_id = location.state?.owner_id;
    const propertyId = location.state?.propertyId;
    const roomId = location.state?.roomId;
    const { id } = useParams();
    const [isSaving, setIsSaving] = useState(false);

    const [isBedDataVisible, setIsBedDataVisible] = useState(true);
    const [numberOfBedData, setNumberOfBedData] = useState([]);

    const [roomDetails, setRoomDetails] = useState({
        propertyId: roomData.property_id,
        roomNo: roomData?.roomNo || "",
        roomType: roomData?.roomType || "",
        beds: roomData?.beds || []
    })

    const [originalData, setOriginalData] = useState(roomData || {});

    const updateProperties = (bedLabels) => {
        setRoomDetails(prevState => {
            const newBedsData = bedLabels.map((bedLabel, index) => {
                const existingBed = prevState.beds.find(bed => bed.bedLabel === bedLabel);

                return existingBed || {
                    id: index + 1,
                    bedLabel: bedLabel,
                    balconyAccess: "",
                    bathAccess: "",
                    roomType: "",
                    energyPlan: "",
                    hallAccess: "",
                    kitchenAccess: "",
                    roomSqft: "",
                    tataSkyNo: "",
                    wifiNo: "",
                    bescomMeterNo: ""
                };
            });

            return {
                ...prevState,
                beds: newBedsData
            };
        });
    };

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

    const dataHandleToggle = () => {
        let bedLabels = [];

        switch (roomDetails.roomType) {
            case '1 BHK':
                bedLabels = oneBhk;
                break;
            case '1.5 BHK':
                bedLabels = onePointFiveBhk;
                break;
            case '2 BHK':
                bedLabels = twoBhk;
                break;
            case '2.5 BHK':
                bedLabels = twoPointFiveBhk;
                break;
            case '3 BHK':
                bedLabels = threeBhk;
                break;
            case 'Bareshell':
            case 'Private Space':
            case 'Work Space':
            case 'Common Area':
                bedLabels = [roomDetails.roomType];
                break;
            default:
                bedLabels = [];
        }

        setNumberOfBedData(bedLabels);
        (roomDetails.roomType !== roomData.roomType) ? updateProperties(bedLabels) : roomDetails.beds = roomData.beds;
        setIsBedDataVisible(!isBedDataVisible);
    };

    const roomHandleChange = (e) => {
        const { name, value } = e.target;

        setRoomDetails((prevState) => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleBedChange = (bedId, fieldName, value) => {
        setRoomDetails(prevState => ({
            ...prevState,
            beds: prevState.beds.map(bed =>
                bed.id === bedId
                    ? { ...bed, [fieldName]: value }
                    : bed
            )
        }));
    };

    const getChangedData = () => {
        const changedData = {};

        if (originalData?.property_id) {
            changedData.property_id = originalData.property_id;
        }

        Object.keys(roomDetails).forEach(key => {
            if (key === 'beds') return;
            if (roomDetails[key] !== originalData?.[key]) {
                changedData[key] = roomDetails[key];
            }
        });

        changedData.beds = roomDetails.beds
            .map((currentBed, index) => {
                const originalBed = originalData?.beds?.[index] || {};
                const bedChanges = {};
                let hasChanges = false;

                if (currentBed.id) bedChanges.id = currentBed.id;

                Object.keys(currentBed).forEach(key => {
                    if (key === 'id') return;
                    if (currentBed[key] !== originalBed[key]) {
                        bedChanges[key] = currentBed[key];
                        hasChanges = true;
                    }
                });

                return hasChanges ? bedChanges : null;
            })
            .filter(bed => bed !== null);

        if (changedData.beds?.length === 0) {
            delete changedData.beds;
        }

        return changedData;
    };

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken()

    const handleUpdate = async (e) => {
        e.preventDefault();

        const changedData = getChangedData();

        if (Object.keys(changedData).length === 0) {
            toast.info('No data is updated!');
            return;
        }

        setIsSaving(true);

        if (roomDetails.roomType !== roomData.roomType) {
            changedData['beds'] = roomDetails.beds
        }

        try {
            const response = await axios.put(`/supply/room-data-update/${id}/`, changedData, {
                withCredentials: true,
            });

            setOriginalData(prev => ({ ...prev, ...changedData }));

            if (response.data.success) {
                toast.success(response.data.message);
                (roomId === 0) ? navigate(`/supply/supply-room-table`, { state: { owner_id, propertyId } }) : navigate(`/supply/supply-room-table/${roomData?.property_id}`, { state: { owner_id, propertyId } });
            }
            else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error('There was an error submitting the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    const thClass = "border-r border-gray-100 px-3 py-1.5 text-xs font-medium text-[#D4A017] text-left whitespace-nowrap w-48";
    const tdClass = "px-3 py-1.5 text-xs text-gray-800";

    return (
        <DashPage>
            <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800" method="POST" onSubmit={handleUpdate}>
                <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">SUPPLY ROOM DETAILS</h1>

                <div className="sm:flex justify-between">
                    <button
                        className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => (roomId === 0) ? navigate(`/supply/supply-room-table`, { state: { owner_id, propertyId } }) : navigate(`/supply/supply-room-table/${roomData?.property_id}`, { state: { owner_id, propertyId } })}
                        type="button">Prev</button>

                    <div className="flex justify-between sm:justify-end mb-5">
                        <button
                            className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()}
                            type="button">{!dataEditView ? 'Update Details' : 'View Details'}</button>

                        {dataEditView && <button
                            className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm"
                            type='submit' disabled={isSaving}
                        >
                            {isSaving ? "Saving Details..." : "Save Details"}
                        </button>}
                    </div>
                </div>

                {isBedDataVisible ? <>
                    <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">Room Details</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto text-xs border-collapse">
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Room No</th>
                                    <td className={tdClass}>
                                        {!dataEditView ? <>
                                            {roomDetails.roomNo}
                                        </> :
                                            <input
                                                type="text"
                                                id="roomNo"
                                                value={roomDetails.roomNo}
                                                onChange={roomHandleChange}
                                                className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                                                name="roomNo"
                                                placeholder="Enter the Room Number here"
                                                required />
                                        }
                                    </td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors">
                                    <th className={thClass}>Room Type</th>
                                    <td className={tdClass}>
                                        {!dataEditView ? <>
                                            {roomDetails.roomType}
                                        </> : <select
                                            id="roomType"
                                            value={roomDetails.roomType}
                                            onChange={roomHandleChange}
                                            className="text-black w-full p-1.5 text-xs bg-white rounded border border-gray-300"
                                            name="roomType"
                                            required
                                        >
                                            <option value="" disabled>Select the Room type here</option>
                                            {getOptionsWithCurrent('room_types', roomDetails.roomType).map((t, i) => (
                                                <option key={i} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <button
                            className="block w-full px-4 py-2 mt-5 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle()}
                            type="button">Next</button>
                    </div>
                </> : <>
                    {roomDetails.beds.map((data, index) => (
                        <div key={`${data.id}-${data.beds}`} className="my-5">

                            <label htmlFor={`bed${data}`} className="text-stone-400 max-sm:text-sm block mb-5"><strong>{(numberOfBedData.length === 1) ? numberOfBedData[index] : `Bed ${numberOfBedData[index]}`}</strong></label>

                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto text-xs border-collapse">
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Balcony Access</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.balconyAccess}
                                                </> : <select
                                                    id={`balconyAccess_${data.id}`}
                                                    value={data.balconyAccess}
                                                    onChange={(e) => handleBedChange(data.id, "balconyAccess", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300"
                                                    name={`balconyAccess_${data.id}`}
                                                    required
                                                >
                                                    <option value="" disabled>Select the Balcony Access here</option>
                                                    {getOptionsWithCurrent('balcony_options', data.balconyAccess).map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Bath Access</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.bathAccess}
                                                </> : <select
                                                    id={`bathAccess_${data.id}`}
                                                    value={data.bathAccess}
                                                    onChange={(e) => handleBedChange(data.id, "bathAccess", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300"
                                                    name={`bathAccess_${data.id}`}
                                                    required
                                                >
                                                    <option value="" disabled>Select the Bath Access here</option>
                                                    {getOptionsWithCurrent('bathroom_options', data.bathAccess).map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Room Type</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.roomType}
                                                </> : <select
                                                    id={`roomType_${data.id}`}
                                                    value={data.roomType}
                                                    onChange={(e) => handleBedChange(data.id, "roomType", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300"
                                                    name={`roomType_${data.id}`}
                                                    required
                                                >
                                                    <option value="" disabled>Select the Room Type here</option>
                                                    {getOptionsWithCurrent('sharing_types', data.roomType).map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Energy Plan</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.energyPlan}
                                                </> : <select
                                                    id={`energyPlan_${data.id}`}
                                                    value={data.energyPlan}
                                                    onChange={(e) => handleBedChange(data.id, "energyPlan", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300"
                                                    name={`energyPlan_${data.id}`}
                                                    required
                                                >
                                                    <option value="" disabled>Select the Energy Plan here</option>
                                                    {getOptionsWithCurrent('electricity_options', data.energyPlan).map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Hall Access</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.hallAccess}
                                                </> : <select
                                                    id={`hallAccess_${data.id}`}
                                                    value={data.hallAccess}
                                                    onChange={(e) => handleBedChange(data.id, "hallAccess", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300"
                                                    name={`hallAccess_${data.id}`}
                                                    required
                                                >
                                                    <option value="" disabled>Select the Hall Access here</option>
                                                    {getOptionsWithCurrent('yes_no_na_options', data.hallAccess).map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Kitchen Access</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.kitchenAccess}
                                                </> : <select
                                                    id={`kitchenAccess_${data.id}`}
                                                    value={data.kitchenAccess}
                                                    onChange={(e) => handleBedChange(data.id, "kitchenAccess", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300"
                                                    name={`kitchenAccess_${data.id}`}
                                                    required
                                                >
                                                    <option value="" disabled>Select the Kitchen Access here</option>
                                                    {getOptionsWithCurrent('yes_no_na_options', data.kitchenAccess).map((t, i) => (
                                                        <option key={i} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Room Sqft</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.roomSqft}
                                                </> : <input
                                                    type="text"
                                                    id={`roomSqft_${data.id}`}
                                                    value={data.roomSqft}
                                                    onChange={(e) => handleBedChange(data.id, "roomSqft", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300 placeholder-gray-400"
                                                    name={`roomSqft_${data.id}`}
                                                    placeholder="Enter the Room Sqft here"
                                                    required />
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>DTH Number</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.tataSkyNo}
                                                </> : <input
                                                    type="text"
                                                    id={`tataSkyNo_${data.id}`}
                                                    value={data.tataSkyNo}
                                                    onChange={(e) => handleBedChange(data.id, "tataSkyNo", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300 placeholder-gray-400"
                                                    name={`tataSkyNo_${data.id}`}
                                                    placeholder="Enter the Tata Sky Number here"
                                                    required />
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Wifi Number</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.wifiNo}
                                                </> : <input
                                                    type="text"
                                                    id={`wifiNo_${data.id}`}
                                                    value={data.wifiNo}
                                                    onChange={(e) => handleBedChange(data.id, "wifiNo", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300 placeholder-gray-400"
                                                    name={`wifiNo_${data.id}`}
                                                    placeholder="Enter the Wifi Number here"
                                                    required />
                                                }
                                            </td>
                                        </tr>

                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <th className={thClass}>Bescom Meter Number</th>
                                            <td className={tdClass}>
                                                {!dataEditView ? <>
                                                    {data.bescomMeterNo}
                                                </> : <input
                                                    type="text"
                                                    id={`bescomMeterNo_${data.id}`}
                                                    value={data.bescomMeterNo}
                                                    onChange={(e) => handleBedChange(data.id, "bescomMeterNo", e.target.value)}
                                                    className="text-black w-full p-1.5 text-xs rounded border border-gray-300 placeholder-gray-400"
                                                    name={`bescomMeterNo_${data.id}`}
                                                    placeholder="Enter the Bescom Meter Number here"
                                                    required />
                                                }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    <button
                        className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle()}
                        type="button">Prev</button>
                </>
                }
            </form>
        </DashPage>
    );
}

export default RoomDetails;
