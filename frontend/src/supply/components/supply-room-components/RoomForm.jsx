import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";

function RoomForm({ isExpanded, setIsExpanded }) {
  const { getOptions } = useDropdowns();
  const navigate = useNavigate();

  const oneBhk = ['A1', 'A2'];
  const onePointFiveBhk = ['A1', 'A2', 'B1'];
  const twoBhk = ['A1', 'A2', 'B1', 'B2'];
  const twoPointFiveBhk = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const threeBhk = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
  const roomData = location.state?.roomData;
  const owner_id = location.state?.owner_id;
  const propertyId = location.state?.propertyId;
  const roomId = location.state?.roomId;
  const { id } = useParams();

  const [numberOfBedData, setNumberOfBedData] = useState([]);
  const [isBedDataVisible, setIsBedDataVisible] = useState(true);

  const [roomDetails, setRoomDetails] = useState({
    propertyId: roomData.property_id,
    roomNo: "",
    roomType: "",
    beds: []
  })

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
    updateProperties(bedLabels);
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

  const getCSRFToken = () => {
    return Cookies.get('csrftoken');
  }

  axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`/supply/room-form-submit/${id}/`, roomDetails, {
        withCredentials: true,
      });

      if (response.data.success) {
        alert(response.data.message);

        setRoomDetails({
          roomNo: "",
          roomType: "",
          beds: []
        });
        (roomId === 0) ? navigate(`/supply/supply-room-table`, { state: { owner_id, propertyId } }) : navigate(`/supply/supply-room-table/${roomData?.property_id}`, { state: { owner_id, propertyId } });
      }
      else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
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

        <div className={`text-slate-800 max-lg:bg-white min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 lg:pb-[1rem]`}>
          <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={handleSubmit} method='POST'>

            <div className="sm:flex justify-start">
              <button
                className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => (roomId === 0) ? navigate(`/supply/supply-room-table`, { state: { owner_id, propertyId } }) : navigate(`/supply/supply-room-table/${roomData?.property_id}`, { state: { owner_id, propertyId } })}
                type="button">Prev</button>
            </div>

            <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">ADD ROOM DETAILS</h1>

            {isBedDataVisible ? <div className="mb-[20px]">
              <label htmlFor="roomNo" className="text-[#D4A017] max-sm:text-sm"><strong>Room Number: <span className="text-red-500">*</span></strong></label>
              <input
                type="text"
                id="roomNo"
                value={roomDetails.roomNo}
                onChange={roomHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs text-xs sm:text-sm"
                name="roomNo"
                placeholder="Enter the Room Number here"
                required />

              <label htmlFor="roomType" className="text-[#D4A017] max-sm:text-sm"><strong>Room Type: <span className="text-red-500">*</span></strong></label>
              <select
                id="roomType"
                value={roomDetails.roomType}
                onChange={roomHandleChange}
                className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                name="roomType"
                required
              >
                <option value="" disabled>Select the Room type here</option>
                {getOptions('room_types').map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>

              <button
                className="block w-full px-4 py-2 mt-5 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B]" onClick={() => dataHandleToggle()}
                type="button">Next</button>
            </div> : <div className="mb-[20px]">

              {roomDetails.beds.map((data, index) => (
                <div key={`${data.id}-${data.bedLabels}`} className="my-5">
                  <label htmlFor={`bed${data}`} className="text-[#D4A017] block max-sm:text-sm"><strong>{(numberOfBedData.length === 1) ? numberOfBedData[index] : `Bed ${numberOfBedData[index]}`}</strong></label>

                  <div className="flex flex-col sm:flex-row justify-between mt-5">
                    <label htmlFor={`balconyAccess_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Balcony Access: <span className="text-red-500">*</span></label>

                    <select
                      id={`balconyAccess_${data.id}`}
                      value={data.balconyAccess}
                      onChange={(e) => handleBedChange(data.id, "balconyAccess", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                      name={`balconyAccess_${data.id}`}
                      required
                    >
                      <option value="" disabled>Select the Balcony Access here</option>
                      {getOptions('balcony_options').map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`bathAccess_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Bath Access: <span className="text-red-500">*</span></label>

                    <select
                      id={`bathAccess_${data.id}`}
                      value={data.bathAccess}
                      onChange={(e) => handleBedChange(data.id, "bathAccess", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                      name={`bathAccess_${data.id}`}
                      required
                    >
                      <option value="" disabled>Select the Bath Access here</option>
                      {getOptions('bathroom_options').map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`roomType_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Room Type: <span className="text-red-500">*</span></label>

                    <select
                      id={`roomType_${data.id}`}
                      value={data.roomType}
                      onChange={(e) => handleBedChange(data.id, "roomType", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                      name={`roomType_${data.id}`}
                      required
                    >
                      <option value="" disabled>Select the Room Type here</option>
                      {getOptions('sharing_types').map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`energyPlan_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Energy Plan: <span className="text-red-500">*</span></label>

                    <select
                      id={`energyPlan_${data.id}`}
                      value={data.energyPlan}
                      onChange={(e) => handleBedChange(data.id, "energyPlan", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                      name={`energyPlan_${data.id}`}
                      required
                    >
                      <option value="" disabled>Select the Energy Plan here</option>
                      {getOptions('electricity_options').map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`hallAccess_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Hall Access: <span className="text-red-500">*</span></label>

                    <select
                      id={`hallAccess_${data.id}`}
                      value={data.hallAccess}
                      onChange={(e) => handleBedChange(data.id, "hallAccess", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                      name={`hallAccess_${data.id}`}
                      required
                    >
                      <option value="" disabled>Select the Hall Access here</option>
                      {getOptions('yes_no_options').map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`kitchenAccess_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Kitchen Access: <span className="text-red-500">*</span></label>

                    <select
                      id={`kitchenAccess_${data.id}`}
                      value={data.kitchenAccess}
                      onChange={(e) => handleBedChange(data.id, "kitchenAccess", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
                      name={`kitchenAccess_${data.id}`}
                      required
                    >
                      <option value="" disabled>Select the Kitchen Access here</option>
                      {getOptions('yes_no_na_options').map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`roomSqft_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Room Sqft: <span className="text-red-500">*</span></label>

                    <input
                      type="text"
                      id={`roomSqft_${data.id}`}
                      value={data.roomSqft}
                      onChange={(e) => handleBedChange(data.id, "roomSqft", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs"
                      name={`roomSqft_${data.id}`}
                      placeholder="Enter the Room Sqft here"
                      required />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`tataSkyNo_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">DTH Number: <span className="text-red-500">*</span></label>

                    <input
                      type="text"
                      id={`tataSkyNo_${data.id}`}
                      value={data.tataSkyNo}
                      onChange={(e) => handleBedChange(data.id, "tataSkyNo", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs"
                      name={`tataSkyNo_${data.id}`}
                      placeholder="Enter the Tata Sky Number here"
                      required />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`wifiNo_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Wifi Number: <span className="text-red-500">*</span></label>

                    <input
                      type="text"
                      id={`wifiNo_${data.id}`}
                      value={data.wifiNo}
                      onChange={(e) => handleBedChange(data.id, "wifiNo", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs"
                      name={`wifiNo_${data.id}`}
                      placeholder="Enter the Wifi Number here"
                      required />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between mt-3">
                    <label htmlFor={`bescomMeterNo_${data.id}`} className="mt-1 text-stone-400 max-sm:text-sm sm:w-[20%]">Bescom Meter Number: <span className="text-red-500">*</span></label>

                    <input
                      type="text"
                      id={`bescomMeterNo_${data.id}`}
                      value={data.bescomMeterNo}
                      onChange={(e) => handleBedChange(data.id, "bescomMeterNo", e.target.value)}
                      className="max-sm:mt-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs"
                      name={`bescomMeterNo_${data.id}`}
                      placeholder="Enter the Bescom Meter Number here"
                      required />
                  </div>

                  <hr className="my-5" />
                </div>
              ))}

              <div className="flex gap-5 mt-5">
                <button
                  className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle()}
                  type="button">Prev</button>

                <button
                  className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                  type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
              </div>
            </div>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default RoomForm