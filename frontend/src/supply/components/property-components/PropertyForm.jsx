import React, { useState, useEffect } from "react";
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import PropertyData from "../property-form-components/PropertyData";
import PropertyKyc from "../property-form-components/PropertyKyc";
import NoOfBasements from "../property-form-components/NoOfBasements";
import NoOfFloors from "../property-form-components/NoOfFloors";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function PropertyForm({ isExpanded, setIsExpanded }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [propertyData, setPropertyData] = useState({
    propertyName: "",
    propertyType: "",
    foundedYear: "",
    doorBuilding: "",
    streetAddress: "",
    area: "",
    landmark: "",
    state: "",
    city: "",
    pincode: "",
    selectedMealTypes: [],
    rent: "",
    deposit: "",
    rentFree: "",
    rating: '',
    selectedAmenities: [],
    image: '',
    status: '',
    saleDeed: "",
    ebill: "",
    taxReceipt: "",
    waterBill: "",
    loi: "",
    agreement: "",
    basementNos: 0,
    roomsPerBasement: [],
    floorNos: 0,
    roomsPerFloor: [{ floor: 0, rooms: 0 }],
    noOfRooms: 0,
  });

  useEffect(() => {
    const totalRooms = propertyData.roomsPerBasement.reduce((sum, basement) => sum + basement.rooms, 0) + propertyData.roomsPerFloor.reduce((sum, floor) => sum + floor.rooms, 0);

    setPropertyData((prevState) => ({
      ...prevState,
      noOfRooms: totalRooms
    }))
  }, [propertyData.roomsPerBasement, propertyData.roomsPerFloor]);

  const [currentStep, setCurrentStep] = useState('propertyData');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataHandleToggle = (step) => {
    setCurrentStep(step);
  };

  const triggerPropertyFileInput = (type) => {
    if (type === "saleDeed") {
      document.getElementById("saleDeed").click();
    }

    if (type === "ebill") {
      document.getElementById("ebill").click();
    }

    if (type === "taxReceipt") {
      document.getElementById("taxReceipt").click();
    }

    if (type === "waterBill") {
      document.getElementById("waterBill").click();
    }

    if (type === "loi") {
      document.getElementById("loi").click();
    }

    if (type === "agreement") {
      document.getElementById("agreement").click();
    }

    if (type === "image") {
      document.getElementById("image").click();
    }
  };

  const propertyHandleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setPropertyData((prevState) => {
      if (type === 'file') {
        return {
          ...prevState,
          [name]: files[0]
        };
      }

      if (name === 'selectedMealTypes') {
        const updatedMealTypes = checked
          ? [...prevState.selectedMealTypes, value]
          : prevState.selectedMealTypes.filter(item => item !== value);

        return {
          ...prevState,
          selectedMealTypes: updatedMealTypes
        };
      }

      if (name === 'selectedAmenities') {
        const updatedAmenities = checked
          ? [...prevState.selectedAmenities, value]
          : prevState.selectedAmenities.filter(item => item !== value);

        return {
          ...prevState,
          selectedAmenities: updatedAmenities
        };
      }

      if (type === 'checkbox' && name !== 'selectedMealTypes' && name !== 'selectedAmenities') {
        return {
          ...prevState,
          [name]: checked
        };
      }

      return {
        ...prevState,
        [name]: value
      };
    });
  };

  const getCSRFToken = () => {
    return Cookies.get('csrftoken');
  }

  axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

  const propertyHandleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();

    Object.entries(propertyData).forEach(([key, value]) => {
      if (value !== null && typeof value === "object" && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    try {
      const response = await axios.post(`/supply/property-data-submit/${id}/`, formData, {
        withCredentials: true,
      });

      alert(response.data.message);

      if (response.data.success) {
        setPropertyData({
          propertyName: "",
          propertyType: "",
          foundedYear: "",
          doorBuilding: "",
          streetAddress: "",
          area: "",
          landmark: "",
          state: "",
          city: "",
          pincode: "",
          selectedMealTypes: [],
          rent: "",
          deposit: "",
          rentFree: "",
          rating: '',
          selectedAmenities: [],
          image: '',
          status: '',
          saleDeed: "",
          ebill: "",
          taxReceipt: "",
          waterBill: "",
          loi: "",
          agreement: "",
          basementNos: 0,
          roomsPerBasement: [],
          floorNos: 0,
          roomsPerFloor: [{ floor: 0, rooms: 0 }],
          noOfRooms: 0
        });

        navigate('/supply/supply-property-table');
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
          <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800"
            onSubmit={propertyHandleSubmit} method='POST'>

            <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">CREATE PROPERTY</h1>

            {currentStep === 'propertyData' && <>
              <PropertyData propertyData={propertyData} triggerPropertyFileInput={triggerPropertyFileInput} propertyHandleChange={propertyHandleChange} />

              <button
                className="block w-full px-4 py-2 mt-3 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('propertyKyc')}
                type="button">Next</button>
            </>
            }

            {currentStep === 'propertyKyc' && <>
              <PropertyKyc propertyData={propertyData} triggerPropertyFileInput={triggerPropertyFileInput} propertyHandleChange={propertyHandleChange} />

              <div className="flex gap-2 sm:gap-5 mt-5">
                <button
                  className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('propertyData')}
                  type="button">Prev</button>

                <button
                  className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('noOfBasements')}
                  type="button">Next</button>
              </div>
            </>
            }

            {currentStep === 'noOfBasements' && <>
              <NoOfBasements propertyData={propertyData} setPropertyData={setPropertyData} />

              <div className="flex gap-2 sm:gap-5 mt-5">
                <button
                  className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('propertyKyc')}
                  type="button">Prev</button>

                <button
                  className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('noOfFloors')}
                  type="button">Next</button>
              </div>
            </>
            }

            {currentStep === 'noOfFloors' && <>
              <NoOfFloors propertyData={propertyData} setPropertyData={setPropertyData} />

              <div className="flex gap-2 sm:gap-5 mt-5">
                <button
                  className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => dataHandleToggle('noOfBasements')}
                  type="button">Prev</button>

                <button
                  className="block w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" disabled={isSubmitting}
                  type="submit">{isSubmitting ? "Submitting..." : "Submit"}</button>
              </div>
            </>
            }
          </form>
        </div>
      </div>
    </div>
  )
}

export default PropertyForm