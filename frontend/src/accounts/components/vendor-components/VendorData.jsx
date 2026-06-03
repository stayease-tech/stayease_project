import React, { useState } from "react";
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";

function VendorData({ isExpanded, setIsExpanded }) {
  const { getOptions } = useDropdowns();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const data = location.state?.data;

  const [vendorData, setVendorData] = useState({
    vendor: data?.vendor || "",
    contact: data?.contact || "",
    category: data?.category || "",
    billingType: data?.billingType || "",
    accountHolderName: data?.accountHolderName || "",
    accountNumber: data?.accountNumber || "",
    bankName: data?.bankName || "",
    bankBranch: data?.bankBranch || "",
    ifscCode: data?.ifscCode || "",
    upiNumber: data?.upiNumber || "",
    otherBankingDetails: data?.otherBankingDetails || ""
  });

  const [dataEditView, setDataEditView] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [originalData, setOriginalData] = useState(data || {});

  const editHandle = () => {
    setDataEditView(!dataEditView)
  }

  const vendorHandleChange = (e) => {
    const { name, value } = e.target;

    setVendorData(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const getChangedData = () => {
    const changedData = {};

    Object.keys(vendorData).forEach(key => {
      const originalValue = originalData[key] || '';
      const currentValue = vendorData[key] || '';

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

  const vendorHandleUpdate = async (e) => {
    e.preventDefault();

    const changedData = getChangedData();

    if (Object.keys(changedData).length === 0) {
      alert('No data is updated!');
      return;
    }

    setIsSaving(true);

    try {
      const response = await axios.put(
        `/accounts/vendor-data-update/${id}/`,
        changedData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      setOriginalData(prev => ({ ...prev, ...changedData }));

      if (response.data.success) {
        alert(response.data.message);

        navigate(`/accounts/accounts-vendor-table`);
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
          <form className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800" onSubmit={vendorHandleUpdate}>
            <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">VENDOR DATA</h1>

            <div className="sm:flex justify-between">
              <button
                className="max-sm:w-full mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/accounts/accounts-vendor-table`)}
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

            <div className="w-full overflow-x-auto">
              <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                <tbody>
                  <tr className="border-b border-white">
                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Vendor</th>
                    {!dataEditView ? <>
                      <td className="py-1 px-2">{vendorData?.vendor}</td>
                    </> : <>
                      <td className="flex">
                        <span className="py-1 px-2 w-full">
                          <input
                            type="text"
                            value={vendorData.vendor}
                            onChange={(e) => vendorHandleChange(e)}
                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                            placeholder="Enter the Vendor Name here"
                            name="vendor"
                          />
                        </span>
                      </td>
                    </>}
                  </tr>

                  <tr className="border-b border-white">
                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Contact</th>
                    {!dataEditView ? <>
                      <td className="py-1 px-2">{vendorData?.contact}</td>
                    </> : <>
                      <td className="flex">
                        <span className="py-1 px-2 w-full">
                          <input
                            type="text"
                            value={vendorData.contact}
                            onChange={(e) => vendorHandleChange(e)}
                            className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                            placeholder="Enter the Contact Number here"
                            name="contact"
                          />
                        </span>
                      </td>
                    </>}
                  </tr>

                  <tr className="border-b border-white">
                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Category</th>
                    {!dataEditView ? <>
                      <td className="py-1 px-2">{vendorData?.category}</td>
                    </> : <>
                      <td className="flex">
                        <span className="py-1 px-2 w-full">
                          <select id="category" value={vendorData.category} onChange={vendorHandleChange} className="text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="category" required>
                            <option value="" disabled>Select the Category here</option>
                            {getOptions('vendor_categories').map((cat, i) => (
                              <option key={i} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </span>
                      </td>
                    </>}
                  </tr>

                  <tr className="border-b border-white">
                    <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Billing Type</th>
                    {!dataEditView ? <>
                      <td className="py-1 px-2">{vendorData?.billingType}</td>
                    </> : <>
                      <td className="flex">
                        <span className="py-1 px-2 w-full">
                          <select id="billingType" value={vendorData.billingType} onChange={vendorHandleChange} className="text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm" name="billingType" required>
                            <option value="" disabled>Select the Billing Type here</option>
                            {getOptions('billing_types').map((b, i) => (
                              <option key={i} value={b}>{b}</option>
                            ))}
                          </select>
                        </span>
                      </td>
                    </>}
                  </tr>

                  {vendorData.billingType === 'Bank Transfer' && <>
                    <tr className="border-b border-white">
                      <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Account Holder Name</th>
                      {!dataEditView ? <>
                        <td className="py-1 px-2">{vendorData?.accountHolderName}</td>
                      </> : <>
                        <td className="flex">
                          <span className="py-1 px-2 w-full">
                            <input
                              type="text"
                              value={vendorData.accountHolderName}
                              onChange={(e) => vendorHandleChange(e)}
                              className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                              placeholder="Enter the Account Holder Name here"
                              name="accountHolderName"
                            />
                          </span>
                        </td>
                      </>}
                    </tr>

                    <tr className="border-b border-white">
                      <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Account Number</th>
                      {!dataEditView ? <>
                        <td className="py-1 px-2">{vendorData?.accountNumber}</td>
                      </> : <>
                        <td className="flex">
                          <span className="py-1 px-2 w-full">
                            <input
                              type="text"
                              value={vendorData.accountNumber}
                              onChange={(e) => vendorHandleChange(e)}
                              className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                              placeholder="Enter the Account Number here"
                              name="accountNumber"
                            />
                          </span>
                        </td>
                      </>}
                    </tr>

                    <tr className="border-b border-white">
                      <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Bank Name</th>
                      {!dataEditView ? <>
                        <td className="py-1 px-2">{vendorData?.bankName}</td>
                      </> : <>
                        <td className="flex">
                          <span className="py-1 px-2 w-full">
                            <input
                              type="text"
                              value={vendorData.bankName}
                              onChange={(e) => vendorHandleChange(e)}
                              className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                              placeholder="Enter the Bank Name here"
                              name="bankName"
                            />
                          </span>
                        </td>
                      </>}
                    </tr>

                    <tr className="border-b border-white">
                      <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Bank Branch</th>
                      {!dataEditView ? <>
                        <td className="py-1 px-2">{vendorData?.bankBranch}</td>
                      </> : <>
                        <td className="flex">
                          <span className="py-1 px-2 w-full">
                            <input
                              type="text"
                              value={vendorData.bankBranch}
                              onChange={(e) => vendorHandleChange(e)}
                              className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                              placeholder="Enter the Bank Branch here"
                              name="bankBranch"
                            />
                          </span>
                        </td>
                      </>}
                    </tr>

                    <tr className="border-b border-white">
                      <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">IFSC Code</th>
                      {!dataEditView ? <>
                        <td className="py-1 px-2">{vendorData?.ifscCode}</td>
                      </> : <>
                        <td className="flex">
                          <span className="py-1 px-2 w-full">
                            <input
                              type="text"
                              value={vendorData.ifscCode}
                              onChange={(e) => vendorHandleChange(e)}
                              className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                              placeholder="Enter the IFSC Code here"
                              name="ifscCode"
                            />
                          </span>
                        </td>
                      </>}
                    </tr>
                  </>}

                  {vendorData.billingType === 'UPI' && <>
                    <tr className="border-b border-white">
                      <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">UPI Number</th>
                      {!dataEditView ? <>
                        <td className="py-1 px-2">{vendorData?.upiNumber}</td>
                      </> : <>
                        <td className="flex">
                          <span className="py-1 px-2 w-full">
                            <input
                              type="text"
                              value={vendorData.upiNumber}
                              onChange={(e) => vendorHandleChange(e)}
                              className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                              placeholder="Enter the UPI Number here"
                              name="upiNumber"
                            />
                          </span>
                        </td>
                      </>}
                    </tr>
                  </>}

                  {vendorData.billingType === 'Others' && <>
                    <tr className="border-b border-white">
                      <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Other Banking Details</th>
                      {!dataEditView ? <>
                        <td className="py-1 px-2">{vendorData?.otherBankingDetails}</td>
                      </> : <>
                        <td className="flex">
                          <span className="py-1 px-2 w-full">
                            <input
                              type="text"
                              value={vendorData.otherBankingDetails}
                              onChange={(e) => vendorHandleChange(e)}
                              className="text-black w-full p-2 text-sm placeholder-gray-400 placeholder:text-xs bg-white rounded text-xs sm:text-sm"
                              placeholder="Mention the Banking Details here"
                              name="otherBankingDetails"
                            />
                          </span>
                        </td>
                      </>}
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

export default VendorData