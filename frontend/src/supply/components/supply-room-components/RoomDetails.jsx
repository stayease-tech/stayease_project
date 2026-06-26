// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

const BHK_LABELS = {
    '1BHK':    ['A1', 'A2'],
    '1.5 BHK': ['A1', 'A2', 'B'],
    '2BHK':    ['A1', 'A2', 'B1', 'B2'],
    '2.5 BHK': ['A1', 'A2', 'B1', 'B2', 'C'],
    '3BHK':    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
};

const SINGLE_BED_TYPES = ['Bareshell', 'Private Space', 'Work Space', 'Common Area'];

function RoomDetails() {
    const { getOptionsWithCurrent } = useDropdowns();
    const navigate = useNavigate();

    const location   = useLocation();
    const roomData   = location.state?.roomData;
    const owner_id   = location.state?.owner_id;
    const propertyId = location.state?.propertyId;
    const roomId     = location.state?.roomId;
    const { id }     = useParams();

    const [step, setStep]           = useState(1);
    const [bedIndex, setBedIndex]   = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving]   = useState(false);

    const [roomDetails, setRoomDetails] = useState({
        propertyId: roomData.property_id,
        roomNo:   roomData?.roomNo   || "",
        roomType: roomData?.roomType || "",
        beds:     roomData?.beds     || [],
    });

    const [originalData, setOriginalData] = useState(roomData || {});

    const goToRoomTable = () => {
        (roomId === 0)
            ? navigate(`/supply/supply-room-table`, { state: { owner_id, propertyId } })
            : navigate(`/supply/supply-room-table/${roomData?.property_id}`, { state: { owner_id, propertyId } });
    };

    // Rebuild beds when room type changes; preserve existing bed data where labels match.
    const rebuildBeds = (newRoomType) => {
        const labels = BHK_LABELS[newRoomType] || [newRoomType];
        setRoomDetails(prev => ({
            ...prev,
            beds: labels.map((bedLabel, index) => {
                const existing = prev.beds.find(b => b.bedLabel === bedLabel);
                return existing || {
                    id: index + 1,
                    bedLabel,
                    balconyAccess: "", bathAccess: "", roomType: "",
                    energyPlan: "", hallAccess: "", kitchenAccess: "",
                    roomSqft: "", tataSkyNo: "", wifiNo: "", bescomMeterNo: "",
                };
            }),
        }));
    };

    const handleNextStep = () => {
        if (roomDetails.roomType !== originalData.roomType) {
            rebuildBeds(roomDetails.roomType);
        }
        setBedIndex(0);
        setStep(2);
    };

    const handleBedNext = () => {
        if (bedIndex < roomDetails.beds.length - 1) setBedIndex(i => i + 1);
    };

    const handleBedPrev = () => {
        if (bedIndex > 0) setBedIndex(i => i - 1);
        else setStep(1);
    };

    const roomHandleChange = (e) => {
        const { name, value } = e.target;
        setRoomDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleBedChange = (bedId, fieldName, value) => {
        setRoomDetails(prev => ({
            ...prev,
            beds: prev.beds.map(bed => bed.id === bedId ? { ...bed, [fieldName]: value } : bed),
        }));
    };

    const getChangedData = () => {
        const changedData = {};
        if (originalData?.property_id) changedData.property_id = originalData.property_id;

        Object.keys(roomDetails).forEach(key => {
            if (key === 'beds') return;
            if (roomDetails[key] !== originalData?.[key]) changedData[key] = roomDetails[key];
        });

        changedData.beds = roomDetails.beds
            .map((currentBed, index) => {
                const originalBed = originalData?.beds?.[index] || {};
                const bedChanges  = {};
                let hasChanges    = false;
                if (currentBed.id) bedChanges.id = currentBed.id;
                Object.keys(currentBed).forEach(key => {
                    if (key === 'id') return;
                    if (currentBed[key] !== originalBed[key]) { bedChanges[key] = currentBed[key]; hasChanges = true; }
                });
                return hasChanges ? bedChanges : null;
            })
            .filter(Boolean);

        if (changedData.beds?.length === 0) delete changedData.beds;
        return changedData;
    };

    axios.defaults.headers.common['X-CSRFToken'] = Cookies.get('csrftoken');

    const handleUpdate = async (e) => {
        e.preventDefault();
        const changedData = getChangedData();
        if (Object.keys(changedData).length === 0) { toast.info('No data is updated!'); return; }
        setIsSaving(true);
        if (roomDetails.roomType !== roomData.roomType) changedData.beds = roomDetails.beds;
        try {
            const response = await axios.put(`/supply/room-data-update/${id}/`, changedData, { withCredentials: true });
            setOriginalData(prev => ({ ...prev, ...changedData }));
            if (response.data.success) {
                toast.success(response.data.message);
                goToRoomTable();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Error updating room:', err);
            toast.error('There was an error updating the room. Please try again!');
        } finally {
            setIsSaving(false);
        }
    };

    const isSingleBedType = SINGLE_BED_TYPES.includes(roomDetails.roomType);
    const currentBed      = roomDetails.beds[bedIndex];
    const totalBeds       = roomDetails.beds.length;
    const isLastBed       = bedIndex === totalBeds - 1;

    const selClass   = "w-full p-2.5 border border-gray-300 rounded text-sm text-black bg-white";
    const inputClass = "w-full p-2.5 border border-gray-300 rounded text-sm text-black bg-white placeholder-gray-400";
    const labelClass = "block text-sm text-stone-500 mb-1";
    const valueClass = "text-sm font-medium text-gray-800";

    return (
        <DashPage>
            <form className="h-full flex flex-col overflow-hidden" method="POST" onSubmit={handleUpdate}>

                {/* ── Header ── */}
                <div className="grid grid-cols-3 items-center mb-6 shrink-0">
                    {/* Left */}
                    <div className="flex items-center gap-3">
                        {step === 1 ? (
                            <button type="button" onClick={goToRoomTable}
                                className="px-4 py-1.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]">
                                Cancel
                            </button>
                        ) : (
                            <span className="text-sm text-stone-500">
                                {isSingleBedType ? currentBed?.bedLabel : `Bed ${currentBed?.bedLabel}`}
                                {totalBeds > 1 && ` (${bedIndex + 1} of ${totalBeds})`}
                            </span>
                        )}
                    </div>

                    {/* Centre */}
                    <h1 className="text-xl font-bold text-[#D4A017] text-center">SUPPLY ROOM DETAILS</h1>

                    {/* Right */}
                    <div className="flex justify-end items-center gap-3">
                        <button type="button" onClick={() => setIsEditMode(v => !v)}
                            className="px-4 py-1.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]">
                            {isEditMode ? 'View Details' : 'Update Details'}
                        </button>
                        {isEditMode && (
                            <button type="submit" disabled={isSaving}
                                className="px-4 py-1.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B] disabled:opacity-60">
                                {isSaving ? 'Saving...' : 'Save Details'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Step 1: Room info ── */}
                {step === 1 && (
                    <div className="flex flex-col flex-1 justify-center max-w-lg mx-auto w-full gap-5">
                        <div>
                            <label className="text-[#D4A017] text-sm font-semibold">Room Number</label>
                            {isEditMode ? (
                                <input type="text" name="roomNo" value={roomDetails.roomNo} onChange={roomHandleChange}
                                    className={`mt-1.5 ${inputClass}`} placeholder="Enter the Room Number" required />
                            ) : (
                                <p className={`mt-1.5 ${valueClass}`}>{roomDetails.roomNo}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-[#D4A017] text-sm font-semibold">Room Type</label>
                            {isEditMode ? (
                                <select name="roomType" value={roomDetails.roomType} onChange={roomHandleChange}
                                    className={`mt-1.5 ${selClass}`} required>
                                    <option value="" disabled>Select the Room Type</option>
                                    {getOptionsWithCurrent('room_types', roomDetails.roomType).map((t, i) => (
                                        <option key={i} value={t}>{t}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className={`mt-1.5 ${valueClass}`}>{roomDetails.roomType}</p>
                            )}
                        </div>

                        <button type="button" onClick={handleNextStep}
                            className="w-full py-2.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]">
                            Next
                        </button>
                    </div>
                )}

                {/* ── Step 2: One bed at a time, 2-col grid, vertically centered ── */}
                {step === 2 && currentBed && (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 flex items-center">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">

                                {/* Col 1 */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <p className={labelClass}>Balcony Access {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <select value={currentBed.balconyAccess} onChange={(e) => handleBedChange(currentBed.id, "balconyAccess", e.target.value)} className={selClass} required>
                                                <option value="" disabled>Select</option>
                                                {getOptionsWithCurrent('balcony_options', currentBed.balconyAccess).map((t, i) => <option key={i} value={t}>{t}</option>)}
                                            </select>
                                        ) : <p className={valueClass}>{currentBed.balconyAccess || '—'}</p>}
                                    </div>
                                    <div>
                                        <p className={labelClass}>Bath Access {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <select value={currentBed.bathAccess} onChange={(e) => handleBedChange(currentBed.id, "bathAccess", e.target.value)} className={selClass} required>
                                                <option value="" disabled>Select</option>
                                                {getOptionsWithCurrent('bathroom_options', currentBed.bathAccess).map((t, i) => <option key={i} value={t}>{t}</option>)}
                                            </select>
                                        ) : <p className={valueClass}>{currentBed.bathAccess || '—'}</p>}
                                    </div>
                                    <div>
                                        <p className={labelClass}>Room Type {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <select value={currentBed.roomType} onChange={(e) => handleBedChange(currentBed.id, "roomType", e.target.value)} className={selClass} required>
                                                <option value="" disabled>Select</option>
                                                {getOptionsWithCurrent('sharing_types', currentBed.roomType).map((t, i) => <option key={i} value={t}>{t}</option>)}
                                            </select>
                                        ) : <p className={valueClass}>{currentBed.roomType || '—'}</p>}
                                    </div>
                                    <div>
                                        <p className={labelClass}>Energy Plan {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <select value={currentBed.energyPlan} onChange={(e) => handleBedChange(currentBed.id, "energyPlan", e.target.value)} className={selClass} required>
                                                <option value="" disabled>Select</option>
                                                {getOptionsWithCurrent('electricity_options', currentBed.energyPlan).map((t, i) => <option key={i} value={t}>{t}</option>)}
                                            </select>
                                        ) : <p className={valueClass}>{currentBed.energyPlan || '—'}</p>}
                                    </div>
                                    <div>
                                        <p className={labelClass}>Hall Access {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <select value={currentBed.hallAccess} onChange={(e) => handleBedChange(currentBed.id, "hallAccess", e.target.value)} className={selClass} required>
                                                <option value="" disabled>Select</option>
                                                {getOptionsWithCurrent('yes_no_options', currentBed.hallAccess).map((t, i) => <option key={i} value={t}>{t}</option>)}
                                            </select>
                                        ) : <p className={valueClass}>{currentBed.hallAccess || '—'}</p>}
                                    </div>
                                </div>

                                {/* Col 2 */}
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <p className={labelClass}>Kitchen Access {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <select value={currentBed.kitchenAccess} onChange={(e) => handleBedChange(currentBed.id, "kitchenAccess", e.target.value)} className={selClass} required>
                                                <option value="" disabled>Select</option>
                                                {getOptionsWithCurrent('yes_no_na_options', currentBed.kitchenAccess).map((t, i) => <option key={i} value={t}>{t}</option>)}
                                            </select>
                                        ) : <p className={valueClass}>{currentBed.kitchenAccess || '—'}</p>}
                                    </div>
                                    <div>
                                        <p className={labelClass}>Room Sqft {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <input type="text" value={currentBed.roomSqft} onChange={(e) => handleBedChange(currentBed.id, "roomSqft", e.target.value)} className={inputClass} placeholder="Enter sqft" required />
                                        ) : <p className={valueClass}>{currentBed.roomSqft || '—'}</p>}
                                    </div>
                                    <div>
                                        <p className={labelClass}>DTH Number {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <input type="text" value={currentBed.tataSkyNo} onChange={(e) => handleBedChange(currentBed.id, "tataSkyNo", e.target.value)} className={inputClass} placeholder="Enter DTH number" required />
                                        ) : <p className={valueClass}>{currentBed.tataSkyNo || '—'}</p>}
                                    </div>
                                    <div>
                                        <p className={labelClass}>Wifi Number {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <input type="text" value={currentBed.wifiNo} onChange={(e) => handleBedChange(currentBed.id, "wifiNo", e.target.value)} className={inputClass} placeholder="Enter wifi number" required />
                                        ) : <p className={valueClass}>{currentBed.wifiNo || '—'}</p>}
                                    </div>
                                    <div>
                                        <p className={labelClass}>Bescom Meter No {isEditMode && <span className="text-red-500">*</span>}</p>
                                        {isEditMode ? (
                                            <input type="text" value={currentBed.bescomMeterNo} onChange={(e) => handleBedChange(currentBed.id, "bescomMeterNo", e.target.value)} className={inputClass} placeholder="Enter meter number" required />
                                        ) : <p className={valueClass}>{currentBed.bescomMeterNo || '—'}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer nav ── */}
                        <div className="flex gap-4 mt-4 shrink-0">
                            <button type="button" onClick={handleBedPrev}
                                className="w-full py-2.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]">
                                Prev
                            </button>
                            {!isLastBed && (
                                <button type="button" onClick={handleBedNext}
                                    className="w-full py-2.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]">
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </form>
        </DashPage>
    );
}

export default RoomDetails;
