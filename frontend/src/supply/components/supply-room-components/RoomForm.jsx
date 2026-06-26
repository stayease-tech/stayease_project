// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

const BHK_BED_LABELS = {
  '1BHK':    ['A1', 'A2'],
  '1.5 BHK': ['A1', 'A2', 'B1'],
  '2BHK':    ['A1', 'A2', 'B1', 'B2'],
  '2.5 BHK': ['A1', 'A2', 'B1', 'B2', 'C1'],
  '3BHK':    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
};

const SINGLE_BED_TYPES = ['Bareshell', 'Private Space', 'Work Space', 'Common Area'];

const BED_FIELDS = ['balconyAccess', 'bathAccess', 'roomType', 'energyPlan',
                    'hallAccess', 'kitchenAccess', 'roomSqft', 'tataSkyNo',
                    'wifiNo', 'bescomMeterNo'];

function makeBed(index, label) {
  return {
    id: index + 1,
    bedLabel: label,
    balconyAccess: "",
    bathAccess: "",
    roomType: "",
    energyPlan: "",
    hallAccess: "",
    kitchenAccess: "",
    roomSqft: "",
    tataSkyNo: "",
    wifiNo: "",
    bescomMeterNo: "",
  };
}

function bedHasData(bed) {
  return BED_FIELDS.some(f => bed[f] !== "");
}

function DeleteConfirmModal({ bedLabel, hasData, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Delete {bedLabel}?
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {hasData
            ? `Bed ${bedLabel} has data entered. Deleting it will permanently remove all the information filled in for this bed. This cannot be undone.`
            : `Are you sure you want to delete Bed ${bedLabel}? This cannot be undone.`}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomForm() {
  const { getOptions } = useDropdowns();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const roomData   = location.state?.roomData;
  const owner_id   = location.state?.owner_id;
  const propertyId = location.state?.propertyId;
  const roomId     = location.state?.roomId;

  const [step, setStep]                 = useState(1);
  const [bedIndex, setBedIndex]         = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal]   = useState(false);

  const [roomDetails, setRoomDetails] = useState({
    propertyId: roomData.property_id,
    roomNo: "",
    roomType: "",
    beds: [],
  });

  const goToRoomTable = () => {
    (roomId === 0)
      ? navigate(`/supply/supply-room-table`, { state: { owner_id, propertyId } })
      : navigate(`/supply/supply-room-table/${roomData?.property_id}`, { state: { owner_id, propertyId } });
  };

  const buildBeds = (roomType) => {
    if (BHK_BED_LABELS[roomType]) {
      return BHK_BED_LABELS[roomType].map((label, i) => makeBed(i, label));
    }
    if (SINGLE_BED_TYPES.includes(roomType)) {
      return [makeBed(0, roomType)];
    }
    return [];
  };

  const handleNextStep = () => {
    if (!roomDetails.roomNo || !roomDetails.roomType) return;
    setRoomDetails(prev => ({ ...prev, beds: buildBeds(prev.roomType) }));
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
      beds: prev.beds.map(bed =>
        bed.id === bedId ? { ...bed, [fieldName]: value } : bed
      ),
    }));
  };

  const confirmDelete = () => {
    const currentId = roomDetails.beds[bedIndex].id;
    const newBeds   = roomDetails.beds.filter(b => b.id !== currentId);
    setRoomDetails(prev => ({ ...prev, beds: newBeds }));
    setBedIndex(Math.min(bedIndex, newBeds.length - 1));
    setDeleteModal(false);
  };

  const getCSRFToken = () => Cookies.get('csrftoken');
  axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/supply/room-form-submit/${id}/`, roomDetails, {
        withCredentials: true,
      });
      if (response.data.success) {
        alert(response.data.message);
        setRoomDetails({ roomNo: "", roomType: "", beds: [] });
        goToRoomTable();
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('There was an error submitting the form. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSingleBedType = SINGLE_BED_TYPES.includes(roomDetails.roomType);
  const currentBed      = roomDetails.beds[bedIndex];
  const isLastBed       = bedIndex === roomDetails.beds.length - 1;
  const totalBeds       = roomDetails.beds.length;

  const selClass   = "w-full p-2.5 border border-gray-300 rounded text-sm text-black bg-white";
  const inputClass = "w-full p-2.5 border border-gray-300 rounded text-sm text-black placeholder-gray-400";
  const labelClass = "block text-sm text-stone-500 mb-1";

  return (
    <DashPage>
      {deleteModal && currentBed && (
        <DeleteConfirmModal
          bedLabel={currentBed.bedLabel}
          hasData={bedHasData(currentBed)}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(false)}
        />
      )}

      <form
        className="h-full flex flex-col overflow-hidden"
        onSubmit={handleSubmit}
        method="POST"
      >
        {/* ── Header row ── */}
        <div className="grid grid-cols-3 items-center mb-6 shrink-0">
          <div className="flex justify-start">
            {step === 1 ? (
              <button
                className="px-4 py-1.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                onClick={goToRoomTable}
                type="button"
              >
                Prev
              </button>
            ) : (
              <span className="text-sm text-stone-500">
                {isSingleBedType ? currentBed?.bedLabel : `Bed ${currentBed?.bedLabel}`}
                {totalBeds > 1 && ` (${bedIndex + 1} of ${totalBeds})`}
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold text-[#D4A017] text-center">
            ADD ROOM DETAILS
          </h1>

          <div className="flex justify-end">
            {step === 2 && totalBeds > 1 && (
              <button
                type="button"
                onClick={() => setDeleteModal(true)}
                className="p-1.5 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                title="Remove this bed"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Step 1: Room info ── */}
        {step === 1 && (
          <div className="flex flex-col flex-1 justify-center max-w-lg mx-auto w-full gap-5">
            <div>
              <label htmlFor="roomNo" className="text-[#D4A017] text-sm font-semibold">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roomNo"
                value={roomDetails.roomNo}
                onChange={roomHandleChange}
                className="mt-1.5 w-full p-2.5 border border-gray-300 rounded text-sm text-black placeholder-gray-400"
                name="roomNo"
                placeholder="Enter the Room Number"
                required
              />
            </div>

            <div>
              <label htmlFor="roomType" className="text-[#D4A017] text-sm font-semibold">
                Room Type <span className="text-red-500">*</span>
              </label>
              <select
                id="roomType"
                value={roomDetails.roomType}
                onChange={roomHandleChange}
                className="mt-1.5 w-full p-2.5 border border-gray-300 rounded text-sm text-black bg-white"
                name="roomType"
                required
              >
                <option value="" disabled>Select the Room Type</option>
                {getOptions('room_types').map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              className="w-full py-2.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]"
              onClick={handleNextStep}
              type="button"
            >
              Next
            </button>
          </div>
        )}

        {/* ── Step 2: Bed details (2-col grid, vertically centered) ── */}
        {step === 2 && currentBed && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 flex items-center">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">

                {/* Col 1 */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Balcony Access <span className="text-red-500">*</span></label>
                    <select value={currentBed.balconyAccess} onChange={(e) => handleBedChange(currentBed.id, "balconyAccess", e.target.value)} className={selClass} required>
                      <option value="" disabled>Select</option>
                      {getOptions('balcony_options').map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Bath Access <span className="text-red-500">*</span></label>
                    <select value={currentBed.bathAccess} onChange={(e) => handleBedChange(currentBed.id, "bathAccess", e.target.value)} className={selClass} required>
                      <option value="" disabled>Select</option>
                      {getOptions('bathroom_options').map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Room Type <span className="text-red-500">*</span></label>
                    <select value={currentBed.roomType} onChange={(e) => handleBedChange(currentBed.id, "roomType", e.target.value)} className={selClass} required>
                      <option value="" disabled>Select</option>
                      {getOptions('sharing_types').map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Energy Plan <span className="text-red-500">*</span></label>
                    <select value={currentBed.energyPlan} onChange={(e) => handleBedChange(currentBed.id, "energyPlan", e.target.value)} className={selClass} required>
                      <option value="" disabled>Select</option>
                      {getOptions('electricity_options').map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Hall Access <span className="text-red-500">*</span></label>
                    <select value={currentBed.hallAccess} onChange={(e) => handleBedChange(currentBed.id, "hallAccess", e.target.value)} className={selClass} required>
                      <option value="" disabled>Select</option>
                      {getOptions('yes_no_options').map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Col 2 */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className={labelClass}>Kitchen Access <span className="text-red-500">*</span></label>
                    <select value={currentBed.kitchenAccess} onChange={(e) => handleBedChange(currentBed.id, "kitchenAccess", e.target.value)} className={selClass} required>
                      <option value="" disabled>Select</option>
                      {getOptions('yes_no_na_options').map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Room Sqft <span className="text-red-500">*</span></label>
                    <input type="text" value={currentBed.roomSqft} onChange={(e) => handleBedChange(currentBed.id, "roomSqft", e.target.value)} className={inputClass} placeholder="Enter sqft" required />
                  </div>

                  <div>
                    <label className={labelClass}>DTH Number <span className="text-red-500">*</span></label>
                    <input type="text" value={currentBed.tataSkyNo} onChange={(e) => handleBedChange(currentBed.id, "tataSkyNo", e.target.value)} className={inputClass} placeholder="Enter DTH number" required />
                  </div>

                  <div>
                    <label className={labelClass}>Wifi Number <span className="text-red-500">*</span></label>
                    <input type="text" value={currentBed.wifiNo} onChange={(e) => handleBedChange(currentBed.id, "wifiNo", e.target.value)} className={inputClass} placeholder="Enter wifi number" required />
                  </div>

                  <div>
                    <label className={labelClass}>Bescom Meter No <span className="text-red-500">*</span></label>
                    <input type="text" value={currentBed.bescomMeterNo} onChange={(e) => handleBedChange(currentBed.id, "bescomMeterNo", e.target.value)} className={inputClass} placeholder="Enter meter number" required />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer nav ── */}
            <div className="flex gap-4 mt-4 shrink-0">
              <button
                className="w-full py-2.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                onClick={handleBedPrev}
                type="button"
              >
                Prev
              </button>
              {isLastBed ? (
                <button
                  className="w-full py-2.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B] disabled:opacity-60"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              ) : (
                <button
                  className="w-full py-2.5 bg-[#D4A017] text-white text-sm font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                  onClick={handleBedNext}
                  type="button"
                >
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

export default RoomForm;
