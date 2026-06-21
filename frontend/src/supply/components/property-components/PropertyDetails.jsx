import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "react-toastify";
import PropertyData from "../property-details-components/PropertyData";
import PropertyKyc from "../property-details-components/PropertyKyc";
import { DashPage } from "../../../shared/Dashboard";

function PropertyDetails() {
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
        rentFreeUnit: propertyData?.rentFreeUnit || 'Days',
        rating: propertyData?.rating || '',
        selectedAmenities: propertyData?.selectedAmenities || [],
        image: propertyData?.image || null,
        status: propertyData?.status || '',
        noOfBasements: propertyData?.noOfBasements || '0',
        noOfFloors: propertyData?.noOfFloors || '0',
        noOfRooms: propertyData?.noOfRooms || '0',
        saleDeed: propertyData?.saleDeed || null,
        ebill: propertyData?.ebill || null,
        taxReceipt: propertyData?.taxReceipt || null,
        waterBill: propertyData?.waterBill || null,
        loi: propertyData?.loi || null,
        agreement: propertyData?.agreement || null,
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

            if (name === 'pincode') {
                return {
                    ...prevState,
                    [name]: value.replace(/\D/g, '').slice(0, 6)
                };
            }

            if (name === 'foundedYear') {
                return {
                    ...prevState,
                    [name]: value.replace(/\D/g, '').slice(0, 4)
                };
            }

            if (name === 'rent' || name === 'deposit' || name === 'rentFree' || name === 'noOfBasements' || name === 'noOfFloors' || name === 'noOfRooms') {
                return {
                    ...prevState,
                    [name]: value.replace(/\D/g, '')
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
            toast.info('No data is updated!');
            setIsSaving(false);
            return;
        }

        try {
            const response = await axios.put(`/supply/property-form-update/${id}/`, formData, {
                withCredentials: true,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                (propertyId === 0) ?
                    navigate(`/supply/supply-property-table`)
                    :
                    navigate(`/supply/supply-property-table/${propertyData.owner_id}`);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error('There was an error submitting the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    const handlePropertyDelete = async (e) => {
        e.preventDefault();

        const confirmDelete = window.confirm("Are you sure you want to delete this item?");
        if (!confirmDelete) return;

        setIsDeleting(true);

        try {
            const response = await axios.delete(`/supply/property-form-delete/${id}/`, {
                withCredentials: true,
            });

            if (response.data.success) {
                toast.success(response.data.message);
                (propertyId === 0) ?
                    navigate(`/supply/supply-property-table`)
                    :
                    navigate(`/supply/supply-property-table/${propertyData.owner_id}`);
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            console.error('Error deleting form:', err);
            toast.error('There was an error deleting the form. Please try again!');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <DashPage>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-8 sm:p-8 lg:p-10 lg:rounded-lg lg:bg-white text-slate-800" method="POST" onSubmit={handlePropertyUpdate}>
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-xl lg:text-2xl font-semibold text-[#D4A017]">
                                {propertyData?.propertyName || 'Property Details'}
                            </h1>
                            <p className="text-sm text-stone-400 mt-1">
                                {propertyData?.serial_number && `ID: ${propertyData.serial_number}`}
                                {propertyData?.ownerName && ` • Owner: ${propertyData.ownerName}`}
                                {propertyData?.city && ` • ${propertyData.area}, ${propertyData.city}`}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <button
                                className="px-4 py-2 bg-gray-100 text-slate-700 text-sm font-medium rounded hover:bg-gray-200"
                                onClick={() => (propertyId === 0)
                                    ? navigate(`/supply/supply-property-table`)
                                    : navigate(`/supply/supply-property-table/${propertyData.owner_id}`)}
                                type="button">
                                ← Back
                            </button>

                            <button
                                className="px-4 py-2 bg-[#D4A017] text-white text-sm font-medium rounded hover:bg-[#B8860B]"
                                onClick={() => editHandle()}
                                type="button">
                                {!dataEditView ? 'Edit' : 'Cancel Edit'}
                            </button>

                            {dataEditView ? (
                                <button
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50"
                                    disabled={isSaving}
                                    type="submit">
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            ) : (
                                <button
                                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 disabled:opacity-50"
                                    disabled={isDeleting}
                                    type="button"
                                    onClick={handlePropertyDelete}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            )}
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${currentStep === 'propertyData' ? 'border-[#D4A017] text-[#D4A017]' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                                onClick={() => dataHandleToggle('propertyData')}
                                type="button">
                                Property Info
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${currentStep === 'propertyKyc' ? 'border-[#D4A017] text-[#D4A017]' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                                onClick={() => dataHandleToggle('propertyKyc')}
                                type="button">
                                Documents & Building
                            </button>
                        </div>

                        {/* Tab Content */}
                        {currentStep === 'propertyData' && (
                            <PropertyData dataEditView={dataEditView} propertyDetails={propertyDetails} propertyHandleChange={propertyHandleChange} triggerFileInput={triggerFileInput} />
                        )}

                        {currentStep === 'propertyKyc' && (
                            <PropertyKyc dataEditView={dataEditView} propertyDetails={propertyDetails} propertyData={propertyData} propertyHandleChange={propertyHandleChange} triggerFileInput={triggerFileInput} />
                        )}
                    </form>
        </DashPage>
    )
}

export default PropertyDetails