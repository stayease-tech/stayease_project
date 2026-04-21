import React, { useState, useEffect } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import axios from 'axios';

function PropertyComplaintData({ isExpanded, setIsExpanded }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const propertyComplaintData = location.state?.data;
    const realData = location.state?.realData;

    const [originalData, setOriginalData] = useState(
        realData ? { ...realData } : { ...propertyComplaintData }
    );
    const [propertyComplaintDetails, setPropertyComplaintDetails] = useState({
        status: propertyComplaintData?.status,
        vendor: propertyComplaintData?.vendor,
        date: propertyComplaintData?.date,
        fromTime: propertyComplaintData?.fromTime,
        toTime: propertyComplaintData?.toTime,
        comments: propertyComplaintData?.comments
    });
    const [registeredVendor, setRegisteredVendor] = useState(propertyComplaintDetails.vendor ? 'Yes' : '');
    const [dataEditView, setDataEditView] = useState(realData ? true : false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [vendorData, setVendorData] = useState([]);

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-');
        } catch {
            return dateStr;
        }
    };

    const formatTimeForDisplay = (timeStr) => {
        if (!timeStr) return '';

        try {
            if (timeStr.includes('AM') || timeStr.includes('PM')) {
                return timeStr;
            }

            const [hours, minutes] = timeStr.split(':');
            const hourInt = parseInt(hours);
            const minuteInt = parseInt(minutes || '00');

            const period = hourInt >= 12 ? 'PM' : 'AM';
            const displayHour = hourInt % 12 || 12;

            return `${displayHour}:${minuteInt.toString().padStart(2, '0')} ${period}`;
        } catch (error) {
            console.error('Error formatting time for display:', error);
            return 'TBC';
        }
    };

    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });

    const propertyComplaintHandleChange = (e) => {
        const { name, value } = e.target;

        setPropertyComplaintDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await axios.get('/accounts/get-vendor-data/');

                setVendorData(response.data.vendor_table);
            } catch (error) {
                console.log(error.message || 'Error fetching data');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const vendorDataFetcher = () => {
        propertyComplaintData.status = propertyComplaintDetails.status;
        propertyComplaintData.vendor = propertyComplaintDetails.vendor;
        propertyComplaintData.date = propertyComplaintDetails.date;
        propertyComplaintData.fromTime = propertyComplaintDetails.fromTime;
        propertyComplaintData.toTime = propertyComplaintDetails.toTime;
        propertyComplaintData.comments = propertyComplaintDetails.comments;

        navigate('/operations/operations-vendor-form', { state: { id, propertyComplaintData, originalData } })
    }

    const getChangedData = () => {
        const changedData = {};

        Object.keys(propertyComplaintDetails).forEach(key => {
            const originalValue = originalData[key] || '';
            const currentValue = propertyComplaintDetails[key] || '';

            if (currentValue !== originalValue) {
                changedData[key] = currentValue;
            }
        });

        return changedData;
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const propertyComplaintHandleUpdate = async (e) => {
        e.preventDefault();

        const changedData = getChangedData();

        if (Object.keys(changedData).length === 0) {
            alert('No data is updated!');
            return;
        }

        setIsSaving(true);

        if (changedData?.vendor) {
            const vendorId = vendorData.find(vendor => vendor.vendor === changedData.vendor).id;
            changedData.vendorId = vendorId;
        }

        try {
            const response = await axios.put(
                `/operations/operations-form-update/${id}/`,
                changedData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )

            setOriginalData(prev => ({ ...prev, ...changedData }));

            if (response.data.success) {
                alert(response.data.message);

                navigate(`/operations/operations-propertycomplaint-table`)
            }
        } catch (err) {
            console.error('Error updating form:', err);
            alert('There was an error updating the form. Please try again!');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`flex items-center min-h-screen text-slate-800 max-lg:bg-white ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6`}>
                    <form className="max-w-3xl mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={propertyComplaintHandleUpdate}>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">PROPERTY COMPLAINT DATA</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/operations/operations-propertycomplaint-table`)}
                                type="button">Prev</button>

                            <div className="flex justify-between sm:justify-end mb-5">
                                <button
                                    className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()} type="button">{!dataEditView ? 'Update Details' : 'View Details'}</button>

                                {dataEditView === true && <button
                                    className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving}
                                    type='submit'
                                >
                                    {isSaving ? "Saving Details..." : "Save Details"}
                                </button>}
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                <tbody>
                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Ticket Number</th>
                                        <td className="py-1 px-2">{propertyComplaintData?.ticket_number || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Resident Name</th>
                                        <td className="py-1 px-2">{propertyComplaintData?.residentsName || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Room No.</th>
                                        <td className="py-1 px-2">{propertyComplaintData?.roomNo || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Phone Number</th>
                                        <td className="py-1 px-2">{propertyComplaintData?.phoneNumber || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Category</th>
                                        <td className="py-1 px-2">{propertyComplaintData?.category_type || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Items</th>
                                        <td className="py-1 px-2">{propertyComplaintData?.items || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Preferred Time</th>
                                        <td className="py-1 px-2">{propertyComplaintData?.preferredTime || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Issue Description</th>
                                        <td className="py-1 px-2">{propertyComplaintData?.issue_desc || ''}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Status</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{propertyComplaintDetails?.status || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="status" value={propertyComplaintDetails.status} onChange={(e) => propertyComplaintHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="status" required>
                                                        <option value="" disabled>Select the status here</option>
                                                        <option value="Open">Open</option>
                                                        <option value="Follow Up">Follow Up</option>
                                                        <option value="Closed">Closed</option>
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Registered Vendor</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{registeredVendor || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="registeredVendor" value={registeredVendor} onChange={(e) => setRegisteredVendor(e.target.value)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="registeredVendor" required>
                                                        <option value="" disabled>Select the option here</option>
                                                        <option value="Yes">Yes</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    {registeredVendor === 'Yes' && <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Vendor</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{propertyComplaintDetails?.vendor || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <select id="vendor" value={propertyComplaintDetails.vendor} onChange={(e) => propertyComplaintHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="vendor" required>
                                                        <option value="" disabled>Select the Vendor here</option>{loadingData ? <option value="">
                                                            Loading vendor data...
                                                        </option> : <>
                                                            {vendorData.map((vendor, index) => (
                                                                <option key={index} value={vendor.vendor}>
                                                                    {vendor.vendor}
                                                                </option>
                                                            ))}
                                                        </>}
                                                    </select>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>}

                                    {registeredVendor === 'No' && <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Add Vendor</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{registeredVendor === 'No' && '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <button className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={vendorDataFetcher} type="button">Click here to add the vendor details</button>
                                                </span>
                                            </td>
                                        </>}
                                    </tr>}

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Deadline</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{formatDateForDisplay(propertyComplaintDetails?.date) || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="date"
                                                        name='date'
                                                        value={propertyComplaintDetails.date}
                                                        onChange={(e) => propertyComplaintHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">From Time</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{formatTimeForDisplay(propertyComplaintDetails?.fromTime) || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="time"
                                                        name='fromTime'
                                                        value={propertyComplaintDetails.fromTime}
                                                        onChange={(e) => propertyComplaintHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">To Time</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{formatTimeForDisplay(propertyComplaintDetails?.toTime) || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="time"
                                                        name='toTime'
                                                        value={propertyComplaintDetails.toTime}
                                                        onChange={(e) => propertyComplaintHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments</th>
                                        {!dataEditView ? <>
                                            <td className="py-1 px-2">{propertyComplaintDetails?.comments || '-'}</td>
                                        </> : <>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <input
                                                        type="text"
                                                        name='comments'
                                                        value={propertyComplaintDetails.comments}
                                                        onChange={(e) => propertyComplaintHandleChange(e)}
                                                        className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                                        placeholder="Enter the comments here"
                                                    />
                                                </span>
                                            </td>
                                        </>}
                                    </tr>

                                    {propertyComplaintData?.has_feedback && <>
                                        <tr className="border-b border-white">
                                            <th colSpan={2} className="border-r border-white py-1 px-2 text-stone-400 text-center">Resident Feedback</th>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Issue Resolved</th>
                                            <td className="py-1 px-2">{propertyComplaintData?.feedback?.issueResolved || '-'}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Ratings</th>
                                            <td className="py-1 px-2">{propertyComplaintData?.feedback?.ratings || '-'}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Sugestions</th>
                                            <td className="py-1 px-2">{propertyComplaintData?.feedback?.suggestions || '-'}</td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Submitted At</th>
                                            <td className="py-1 px-2">{propertyComplaintData?.feedback?.submittedDateAndTime ? formatter.format(new Date(propertyComplaintData?.feedback?.submittedDateAndTime)) : '-'}</td>
                                        </tr>
                                    </>}
                                </tbody>
                            </table>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PropertyComplaintData