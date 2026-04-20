import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import axios from 'axios';
import Cookies from 'js-cookie';
import PropertyData from "../property-details-components/PropertyData";
import PropertyKyc from "../property-details-components/PropertyKyc";

function PropertyDetails({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const location = useLocation();
    const propertyData = location.state?.propertyData;
    const propertyId = location.state?.propertyId;
    const { id } = useParams();

    const [propertyDetails, setPropertyDetails] = useState({
        serial_number: propertyData?.serial_number || '',
        propertyName: propertyData?.propertyName || '',
        propertyType: propertyData?.propertyType || '',
        foundedYear: propertyData?.foundedYear || '',
        doorBuilding: propertyData?.doorBuilding || '',
        streetAddress: propertyData?.streetAddress || '',
        area: propertyData?.area || '',
        landmark: propertyData?.landmark || '',
        state: propertyData?.state || '',
        city: propertyData?.city || '',
        pincode: propertyData?.pincode || '',
        selectedMealTypes: propertyData?.selectedMealTypes || [],
        rent: propertyData?.rent || '',
        deposit: propertyData?.deposit || '',
        rentFree: propertyData?.rentFree || '',
        rating: propertyData?.rating || '',
        selectedAmenities: propertyData?.selectedAmenities || [],
        image: propertyData?.image || '',
        status: propertyData?.status || '',
        saleDeed: propertyData?.saleDeed || '',
        ebill: propertyData?.ebill || '',
        taxReceipt: propertyData?.taxReceipt || '',
        waterBill: propertyData?.waterBill || '',
        loi: propertyData?.loi || '',
        agreement: propertyData?.agreement || '',
    });

    const [currentStep, setCurrentStep] = useState('propertyData');

    const dataHandleToggle = (step) => {
        setCurrentStep(step);
    };

    const triggerFileInput = (type) => {
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

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

    const propertyHandleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setPropertyDetails((prevState) => {
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

    const handlePropertyUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();

        Object.keys(propertyDetails).forEach((key) => {
            if (key === "image" || key === "saleDeed" || key === "ebill" || key === "taxReceipt" || key === "waterBill" || key === "loi" || key === "agreement") {
                const newFile = propertyDetails[key];

                if (typeof newFile === 'object') {
                    formData.append(key, newFile);
                }
            }

            if (propertyDetails[key] !== propertyData[key] && propertyDetails[key] !== undefined && propertyDetails[key] !== null && key !== "image" && key !== "saleDeed" && key !== "ebill" && key !== "taxReceipt" && key !== "waterBill" && key !== "loi" && key !== "agreement") {
                if (propertyDetails[key] !== null && typeof propertyDetails[key] === "object" && !(propertyDetails[key] instanceof File)) {
                    formData.append(key, JSON.stringify(propertyDetails[key]));
                } else {
                    formData.append(key, propertyDetails[key]);
                }
            }
        });

        if (formData.entries().next().done) {
            alert('No data is updated!')
            setIsSaving(false);
            return;
        }

        try {
            const response = await axios.put(`/supply/property-form-update/${id}/`, formData, {
                withCredentials: true,
            });

            alert(response.data.message);

            if (response.data.success) {
                (propertyId === 0) ?
                    navigate(`/supply/supply-property-table`)
                    :
                    navigate(`/supply/supply-property-table/${propertyData.owner_id}`);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    const handlePropertyDelete = async (e) => {
        e.preventDefault();
        setIsDeleting(true);

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`/supply/property-form-delete/${id}/`, {
                withCredentials: true,
            });

            alert(response.data.message);

            if (response.data.success) {
                (propertyId === 0) ?
                    navigate(`/supply/supply-property-table`)
                    :
                    navigate(`/supply/supply-property-table/${propertyData.owner_id}`);
            }
        } catch (err) {
            console.error('Error deleting form:', err);
            alert('There was an error deleting the form. Please try again!');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 bg-white lg:bg-gray-100 min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 pb-5`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800" method="POST" onSubmit={handlePropertyUpdate}>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">SUPPLY PROPERTY DETAILS</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => (propertyId === 0) ?
                                    navigate(`/supply/supply-property-table`)
                                    :
                                    navigate(`/supply/supply-property-table/${propertyData.owner_id}`)}
                                type="button">Prev</button>

                            <div className="flex justify-between sm:justify-end mb-5">
                                <button
                                    className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()}
                                    type="button">{!dataEditView ? 'Update Details' : 'View Details'}</button>

                                <button
                                    className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving || isDeleting}
                                    type={dataEditView ? "submit" : "button"}
                                    onClick={!dataEditView ? handlePropertyDelete : null}
                                >
                                    {dataEditView ? (isSaving ? "Saving Details..." : "Save Details") : (isDeleting ? "Deleting..." : "Delete")}
                                </button>
                            </div>
                        </div>

                        {currentStep === 'propertyData' && <>
                            <PropertyData dataEditView={dataEditView} propertyDetails={propertyDetails} propertyHandleChange={propertyHandleChange} triggerFileInput={triggerFileInput} />

                            <button
                                className="block w-full px-4 py-2 mt-5 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                                onClick={() => dataHandleToggle('propertyKyc')}
                                type="button">Next</button>
                        </>}

                        {currentStep === 'propertyKyc' && <>
                            <PropertyKyc dataEditView={dataEditView} propertyDetails={propertyDetails} propertyData={propertyData} propertyHandleChange={propertyHandleChange} triggerFileInput={triggerFileInput} />

                            <button
                                className="block w-full px-4 py-2 mt-5 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                                onClick={() => dataHandleToggle('propertyData')}
                                type="button">Prev</button>
                        </>}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PropertyDetails