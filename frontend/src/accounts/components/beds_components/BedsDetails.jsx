import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { Link } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function BedsDetails({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const [dataEditView, setDataEditView] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const location = useLocation();
    const bedData = location?.state?.bedData || {};

    const [rentMonth, setRentMonth] = useState(bedData?.resident_data?.rent_records.slice(-1)?.[0]?.month);
    const [bedsDetails, setBedsDetails] = useState({
        rentStatus: bedData?.resident_data?.rent_records.slice(-1)?.[0]?.rentStatus || '',
        transferType: bedData?.resident_data?.rent_records.slice(-1)?.[0]?.transferType || '',
        utrNumber: bedData?.resident_data?.rent_records.slice(-1)?.[0]?.utrNumber || '',
        transferredDate: bedData?.resident_data?.rent_records.slice(-1)?.[0]?.transferredDate || '',
    });

    useEffect(() => {
        setBedsDetails(prev => ({
            ...prev,
            rentStatus: bedData?.resident_data?.rent_records.find(record => record.month === rentMonth)?.rentStatus || '',
            transferType: bedData?.resident_data?.rent_records.find(record => record.month === rentMonth)?.transferType || '',
            utrNumber: bedData?.resident_data?.rent_records.find(record => record.month === rentMonth)?.utrNumber || '',
            transferredDate: bedData?.resident_data?.rent_records.find(record => record.month === rentMonth)?.transferredDate || '',
        }))
    }, [rentMonth])

    const [originalData, setOriginalData] = useState(bedData || {});

    const bedsHandleChange = (e) => {
        const { name, value } = e.target;

        setBedsDetails((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    const editHandle = () => {
        setDataEditView(!dataEditView)
    }

    const viewAgreementHandle = (bedData) => {
        navigate(`/accounts/accounts-agreement-pdf/${bedData?.id}`, { state: { bedData, type: 'BedsDetails' } });
    }

    const getChangedData = () => {
        const changedData = {};

        Object.keys(bedsDetails).forEach(key => {
            const originalValue = originalData[key] || '';
            const currentValue = bedsDetails[key] || '';

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

    const bedsHandleUpdate = async (e) => {
        e.preventDefault();

        const changedData = getChangedData();

        if (Object.keys(changedData).length === 0) {
            alert('No data is updated!');
            return;
        }

        const formData = {};

        setIsSaving(true);

        formData['rentStatus'] = bedsDetails?.rentStatus;

        if (bedsDetails?.rentStatus === 'Received') {
            formData['transferType'] = bedsDetails?.transferType;
            formData['utrNumber'] = bedsDetails?.utrNumber;
            formData['transferredDate'] = bedsDetails?.transferredDate;
        }

        try {
            const response = await axios.put(
                `/sales/rent-data-update/${bedData?.resident_data?.rent_records.find(record => record.month === rentMonth)?.id}/`,
                formData,
                {
                    withCredentials: true,
                }
            );

            setOriginalData(prev => ({ ...prev, ...changedData }));

            alert(response.data.message);

            if (response.data.success) {
                navigate(`/accounts/accounts-beds-table`);
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
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={bedsHandleUpdate}>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">BEDS DATA</h1>

                        <div className="sm:flex justify-between">
                            <button
                                className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/accounts/accounts-beds-table`)}
                                type="button">Prev</button>

                            <div className="flex justify-between sm:justify-end mb-5">
                                <button
                                    className="block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" onClick={() => editHandle()} type="button">{!dataEditView ? 'Update Status' : 'View Details'}</button>

                                {dataEditView === true && <button
                                    className="ms-5 block px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] align-left max-sm:text-sm" disabled={isSaving}
                                    type='submit'
                                >
                                    {isSaving ? "Saving Details..." : "Save Details"}
                                </button>}
                            </div>
                        </div>

                        <h3 className="font-semibold my-4 text-stone-400 max-sm:text-sm">{bedData?.propertyName}</h3>

                        <div className="w-full overflow-x-auto">
                            <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                <tbody>
                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Flat Number</th>
                                        <td className="py-1 px-2">{bedData?.roomNo || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Flat Type</th>
                                        <td className="py-1 px-2">{bedData?.roomType || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Room Number</th>
                                        <td className="py-1 px-2">{bedData?.bedLabel || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Property Manager</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.propertyManager || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Sales Manager</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.salesManager || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comfort Class</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.comfortClass || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Meal Type</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.mealType || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Resident Name</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.residentsName || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Phone Number</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.phoneNumber || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Email</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.email || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Permanent Address</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.permanentAddress || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">KYC</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.kycType || '-'}</td>
                                    </tr>

                                    {bedData?.resident_data?.kycType === 'Aadhar' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Aadhar Number</th>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">{bedData?.resident_data?.aadharNumber || '-'}</span>
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th rowSpan="2" className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">Aadhar (Front & Back Copy)</th>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <Link to={
                                                        typeof bedData?.resident_data?.aadharFrontCopy === 'string'
                                                            ? `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${bedData.aadharFrontCopy}`
                                                            : bedData?.resident_data?.aadharFrontCopy
                                                                ? URL.createObjectURL(bedData?.resident_data?.aadharFrontCopy)
                                                                : '#'
                                                    } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                        {((bedData?.resident_data?.aadharFrontCopy || '').split('/')[5]) || '-'}
                                                    </Link>
                                                </span>
                                            </td>
                                        </tr>

                                        <tr className='border-b border-white'>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <Link to={
                                                        typeof bedData?.resident_data?.aadharBackCopy === 'string'
                                                            ? bedData?.resident_data?.aadharBackCopy
                                                            : `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${bedData.aadharBackCopy}`
                                                                ? URL.createObjectURL(bedData?.resident_data?.aadharBackCopy)
                                                                : '#'
                                                    } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                        {((bedData?.resident_data?.aadharBackCopy || '').split('/')[5]) || '-'}
                                                    </Link>
                                                </span>
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Aadhar Status</th>
                                            <td className="py-1 px-2">{bedData?.resident_data?.aadharStatus || '-'}</td>
                                        </tr>
                                    </>}

                                    {bedData.kycType === 'PAN' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">PAN Number</th>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">{bedData?.resident_data?.panNumber || '-'}</span>
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th rowSpan="2" className="border-r border-white py-1 px-2 text-[#D4A017] text-left max-sm:text-sm">PAN (Front & Back Copy)</th>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <Link to={
                                                        typeof bedData?.resident_data?.panFrontCopy === 'string'
                                                            ? `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${bedData.panFrontCopy}`
                                                            : bedData?.resident_data?.panFrontCopy
                                                                ? URL.createObjectURL(bedData?.resident_data?.panFrontCopy)
                                                                : '#'
                                                    } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                        {((bedData?.resident_data?.panFrontCopy || '').split('/')[5]) || '-'}
                                                    </Link>
                                                </span>
                                            </td>
                                        </tr>

                                        <tr className='border-b border-white'>
                                            <td className="flex">
                                                <span className="py-1 px-2 w-full">
                                                    <Link to={
                                                        typeof bedData?.resident_data?.panBackCopy === 'string'
                                                            ? `https://local-machine-bucket.s3.us-east-1.amazonaws.com/${bedData.panBackCopy}`
                                                            : bedData?.resident_data?.panBackCopy
                                                                ? URL.createObjectURL(bedData?.resident_data?.panBackCopy)
                                                                : '#'
                                                    } target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A017]">
                                                        {((bedData?.resident_data?.panBackCopy || '').split('/')[5]) || '-'}
                                                    </Link>
                                                </span>
                                            </td>
                                        </tr>

                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">PAN Status</th>
                                            <td className="py-1 px-2">{bedData?.resident_data?.panStatus || '-'}</td>
                                        </tr>
                                    </>}

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">check-In</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.checkIn ? new Date(bedData?.resident_data?.checkIn).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3') : '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">check-Out</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.checkOut ? new Date(bedData?.resident_data?.checkOut).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/(\w+) (\d+), (\d+)/, '$2-$1-$3') : '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Total Deposit Paid</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.totalDepositPaid || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rent Per Month</th>
                                        <td className="py-1 px-2">{bedData?.resident_data?.rentPerMonth || '-'}</td>
                                    </tr>

                                    {bedData?.salesStatus === 'Completed' && <>
                                        <tr className="border-b border-white">
                                            <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Agreement</th>
                                            <td className="py-1 px-2 hover:text-[#D4A017] hover:cursor-pointer" onClick={() => viewAgreementHandle(bedData)}>{`${bedData?.resident_data?.residentsName.replace(/\s+/g, '')}_Contract.pdf`}</td>
                                        </tr>

                                        {bedData?.resident_data?.rent_records.length && bedData?.resident_data?.rent_records.length > 0 ?
                                            <>
                                                <tr className="border-b border-white">
                                                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rent Month</th>
                                                    {!dataEditView ? <>
                                                        <td className="py-1 px-2">{rentMonth || '-'}</td>
                                                    </> : <>
                                                        <td className="flex">
                                                            <span className="py-1 px-2 w-full">
                                                                <select id="rentMonth" value={rentMonth} onChange={(e) => setRentMonth(e.target.value)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="rentMonth" required>
                                                                    <option value="" disabled>Select the month here</option>
                                                                    {bedData?.resident_data?.rent_records.map(record => <>
                                                                        <option key={record.id} value={record.month}>{record.month}</option>
                                                                    </>)}
                                                                </select>
                                                            </span>
                                                        </td>
                                                    </>}
                                                </tr>

                                                <tr className="border-b border-white">
                                                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Delay Charges</th>
                                                    <td className="py-1 px-2">{bedData?.resident_data?.rent_records.find(record => record.month === rentMonth)?.delayCharges}</td>
                                                </tr>

                                                <tr className="border-b border-white">
                                                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rent after Delay Charges</th>
                                                    <td className="py-1 px-2">{Number(((bedsDetails?.resident_data?.rentPerMonth || '').match(/^\d+/))) + Number(bedData?.resident_data?.rent_records.find(record => record.month === rentMonth)?.delayCharges)}</td>
                                                </tr>

                                                <tr className="border-b border-white">
                                                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rent Status</th>
                                                    {!dataEditView ? <>
                                                        <td className="py-1 px-2">{bedsDetails?.rentStatus || '-'}</td>
                                                    </> : <>
                                                        <td className="flex">
                                                            <span className="py-1 px-2 w-full">
                                                                <select id="rentStatus" value={bedsDetails.rentStatus} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="rentStatus" required>
                                                                    <option value="" disabled>Select the status here</option>
                                                                    <option value="Received">Received</option>
                                                                    <option value="Not Received">Not Received</option>
                                                                </select>
                                                            </span>
                                                        </td>
                                                    </>}
                                                </tr>

                                                {bedsDetails.rentStatus === 'Received' && <>
                                                    <tr className="border-b border-white">
                                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Transfer Type</th>
                                                        {!dataEditView ? <>
                                                            <td className="py-1 px-2">{bedsDetails?.transferType || '-'}</td>
                                                        </> : <>
                                                            <td className="flex">
                                                                <span className="py-1 px-2 w-full">
                                                                    <select id="transferType" value={bedsDetails.transferType} onChange={(e) => bedsHandleChange(e)} className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm" name="transferType" required>
                                                                        <option value="" disabled>Select the Transfer Type of the payment here</option>
                                                                        <option value="IMPS">IMPS</option>
                                                                        <option value="NEFT">NEFT</option>
                                                                        <option value="UPI">UPI</option>
                                                                        <option value="Cash">Cash</option>
                                                                    </select>
                                                                </span>
                                                            </td>
                                                        </>}
                                                    </tr>

                                                    <tr className="border-b border-white">
                                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">UTR number</th>
                                                        {!dataEditView ? <>
                                                            <td className="py-1 px-2">{bedsDetails?.utrNumber || '-'}</td>
                                                        </> : <>
                                                            <td className="flex">
                                                                <span className="py-1 px-2 w-full">
                                                                    <input
                                                                        type="text"
                                                                        value={bedsDetails.utrNumber}
                                                                        onChange={(e) => bedsHandleChange(e)}
                                                                        className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                                                                        placeholder="Enter any UTR Number here"
                                                                        name="utrNumber"
                                                                    />
                                                                </span>
                                                            </td>
                                                        </>}
                                                    </tr>

                                                    <tr className="border-b border-white">
                                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Transferred Date</th>
                                                        {!dataEditView ? <>
                                                            <td className="py-1 px-2">{bedsDetails?.transferredDate || '-'}</td>
                                                        </> : <>
                                                            <td className="flex">
                                                                <span className="py-1 px-2 w-full">
                                                                    <input
                                                                        type="date"
                                                                        value={bedsDetails.transferredDate}
                                                                        onChange={(e) => bedsHandleChange(e)}
                                                                        className="text-black w-full p-2 text-sm bg-white rounded text-xs sm:text-sm"
                                                                        name="transferredDate"
                                                                    />
                                                                </span>
                                                            </td>
                                                        </>}
                                                    </tr>
                                                </>}
                                            </>
                                            :
                                            <>
                                                <tr className="border-b border-white">
                                                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Rent Month</th>
                                                    {!dataEditView ? <>
                                                        <td className="py-1 px-2">{rentMonth || '-'}</td>
                                                    </> : <>
                                                        <td className="flex">
                                                            <span className="py-1 px-2 w-full">
                                                                Yet to be generated for this month
                                                            </span>
                                                        </td>
                                                    </>}
                                                </tr>
                                            </>}
                                    </>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default BedsDetails