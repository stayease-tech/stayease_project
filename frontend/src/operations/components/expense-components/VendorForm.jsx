import React, { useState } from 'react'
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

function VendorForm({ isExpanded, setIsExpanded }) {
    const navigate = useNavigate();
    const location = useLocation();

    const expenseData = location.state?.expenseData;
    const index = location.state?.index;
    const ownerId = location.state?.ownerId;
    const id = location.state?.id;
    const propertyComplaintData = location.state?.propertyComplaintData;
    const realData = location.state?.originalData;

    const [vendorData, setVendorData] = useState({
        vendor: "",
        contact: "",
        category: "",
        billingType: "",
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        bankBranch: "",
        ifscCode: "",
        upiNumber: "",
        otherBankingDetails: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const vendorHandleChange = (e) => {
        if (e.target.type === 'file') {
            const file = e.target.files?.[0];
            if (file) {
                setVendorData(prev => ({
                    ...prev,
                    file: file,
                }));
            }
        } else {
            const { name, value } = e.target;
            setVendorData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    const getCSRFToken = () => {
        return Cookies.get('csrftoken');
    }

    axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

    const vendorHandleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/accounts/vendor-form-submit/', vendorData, {
                withCredentials: true,
            });

            alert(response.data.message);

            if (response.data.success) {
                setVendorData({
                    vendor: "",
                    contact: "",
                    category: "",
                    billingType: "",
                    accountHolderName: "",
                    accountNumber: "",
                    bankName: "",
                    bankBranch: "",
                    ifscCode: "",
                    upiNumber: "",
                    otherBankingDetails: ""
                })

                if (expenseData) {
                    expenseData.currentComponent = "categoryForm";
                    expenseData.selectedCategories[index].vendorType = "Registered";
                    expenseData.selectedCategories[index].vendor = vendorData.vendor;

                    navigate('/operations/operations-expense-form', { state: { expenseData, ownerId } });
                }
                if (propertyComplaintData) {
                    propertyComplaintData.vendor = vendorData.vendor;
                    navigate(`/operations/operations-propertycomplaint-data/${id}`, { state: { data: propertyComplaintData, realData } });
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again!');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex">
            <Sidebar isExpanded={isExpanded} toggleSidebar={() => setIsExpanded(!isExpanded)} />

            <div className="flex-1 duration-300">
                <Navbar isExpanded={isExpanded} />

                <div className={`text-slate-800 max-lg:bg-white min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6`}>
                    <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={vendorHandleSubmit} method='POST'>
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">VENDOR FORM</h1>

                        <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Create vendor data here</h3>

                        <label htmlFor="vendor" className="text-[#D4A017] max-sm:text-sm"><strong>Vendor:</strong></label>
                        <input type="text" id="vendor" value={vendorData.vendor} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="vendor" placeholder="Enter the Vendor Name here" required />

                        <label htmlFor="contact" className="text-[#D4A017] max-sm:text-sm"><strong>Contact:</strong></label>
                        <input type="tel" id="contact" value={vendorData.contact} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="contact" placeholder="Enter the Contact Number here" required />

                        <label htmlFor="category" className="text-[#D4A017] max-sm:text-sm"><strong>Category:</strong></label>
                        <select id="category" value={vendorData.category} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="category" required>
                            <option value="" disabled>Select the Category here</option>
                            <option value="Water Tanker">Water Tanker</option>
                            <option value="Electrician">Electrician</option>
                            <option value="Plumber">Plumber</option>
                            <option value="Fumigation">Fumigation</option>
                            <option value="DTH">DTH</option>
                            <option value="Garbage">Garbage</option>
                            <option value="Water Purifier">Water Purifier</option>
                            <option value="Consumables">Consumables</option>
                            <option value="Shipping and Freight">Shipping and Freight</option>
                            <option value="Soft Furnishing">Soft Furnishing</option>
                            <option value="Subscriptions">Subscriptions</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Others">Others</option>
                        </select>

                        <label htmlFor="billingType" className="text-[#D4A017] max-sm:text-sm"><strong>Billing Type:</strong></label>
                        <select id="billingType" value={vendorData.billingType} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="billingType" required>
                            <option value="" disabled>Select the Billing Type here</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="UPI">UPI</option>
                            <option value="Others">Others</option>
                        </select>

                        {vendorData.billingType === 'Bank Transfer' && <>
                            <label htmlFor="accountHolderName" className="text-[#D4A017] max-sm:text-sm"><strong>Account Holder Name:</strong></label>
                            <input type="text" id="accountHolderName" value={vendorData.accountHolderName} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="accountHolderName" placeholder="Enter the Account Holder Name here" required />

                            <label htmlFor="accountNumber" className="text-[#D4A017] max-sm:text-sm"><strong>Account Number:</strong></label>
                            <input type="text" id="accountNumber" value={vendorData.accountNumber} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="accountNumber" placeholder="Enter the Account Number here" required />

                            <label htmlFor="bankName" className="text-[#D4A017] max-sm:text-sm"><strong>Bank Name:</strong></label>
                            <input type="text" id="bankName" value={vendorData.bankName} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="bankName" placeholder="Enter the Bank Name here" required />

                            <label htmlFor="bankBranch" className="text-[#D4A017] max-sm:text-sm"><strong>Bank Branch:</strong></label>
                            <input type="text" id="bankBranch" value={vendorData.bankBranch} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="bankBranch" placeholder="Enter the Bank Branch here" required />

                            <label htmlFor="ifscCode" className="text-[#D4A017] max-sm:text-sm"><strong>IFSC Code:</strong></label>
                            <input type="text" id="ifscCode" value={vendorData.ifscCode} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="ifscCode" placeholder="Enter the IFSC Code here" />
                        </>}

                        {vendorData.billingType === 'UPI' && <>
                            <label htmlFor="upiNumber" className="text-[#D4A017] max-sm:text-sm"><strong>UPI Number:</strong></label>

                            <input type="text" id="upiNumber" value={vendorData.upiNumber} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="upiNumber" placeholder="Enter the UPI Number here" required />
                        </>}

                        {vendorData.billingType === 'Others' && <>
                            <label htmlFor="otherBankingDetails" className="text-[#D4A017] max-sm:text-sm"><strong>Other Banking Details:</strong></label>

                            <input type="text" id="otherBankingDetails" value={vendorData.otherBankingDetails} onChange={vendorHandleChange} className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm placeholder-gray-400 placeholder:text-xs" name="otherBankingDetails" placeholder="Mention the Banking Details here" required />
                        </>}

                        <button className="block w-full mt-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default VendorForm