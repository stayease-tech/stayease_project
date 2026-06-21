// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";

function VendorData() {
  const { getOptionsWithCurrent } = useDropdowns();
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

  const thClass = "border-r border-gray-100 px-3 py-1.5 text-xs font-medium text-[#D4A017] text-left whitespace-nowrap w-48";
  const tdClass = "px-3 py-1.5 text-xs text-gray-800";

  return (
    <DashPage>
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

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs border-collapse">
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <th className={thClass}>Vendor</th>
                {!dataEditView ? <>
                  <td className={tdClass}>{vendorData?.vendor}</td>
                </> : <>
                  <td className={tdClass}>
                    <input
                      type="text"
                      value={vendorData.vendor}
                      onChange={(e) => vendorHandleChange(e)}
                      className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                      placeholder="Enter the Vendor Name here"
                      name="vendor"
                    />
                  </td>
                </>}
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <th className={thClass}>Contact</th>
                {!dataEditView ? <>
                  <td className={tdClass}>{vendorData?.contact}</td>
                </> : <>
                  <td className={tdClass}>
                    <input
                      type="text"
                      value={vendorData.contact}
                      onChange={(e) => vendorHandleChange(e)}
                      className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                      placeholder="Enter the Contact Number here"
                      name="contact"
                    />
                  </td>
                </>}
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <th className={thClass}>Category</th>
                {!dataEditView ? <>
                  <td className={tdClass}>{vendorData?.category}</td>
                </> : <>
                  <td className={tdClass}>
                    <select id="category" value={vendorData.category} onChange={vendorHandleChange} className="text-black w-full p-1.5 text-xs rounded border border-gray-300" name="category" required>
                      <option value="" disabled>Select the Category here</option>
                      {getOptionsWithCurrent('vendor_categories', vendorData.category).map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                </>}
              </tr>

              <tr className="hover:bg-gray-50 transition-colors">
                <th className={thClass}>Billing Type</th>
                {!dataEditView ? <>
                  <td className={tdClass}>{vendorData?.billingType}</td>
                </> : <>
                  <td className={tdClass}>
                    <select id="billingType" value={vendorData.billingType} onChange={vendorHandleChange} className="text-black w-full p-1.5 text-xs rounded border border-gray-300" name="billingType" required>
                      <option value="" disabled>Select the Billing Type here</option>
                      {getOptionsWithCurrent('billing_types', vendorData.billingType).map((b, i) => (
                        <option key={i} value={b}>{b}</option>
                      ))}
                    </select>
                  </td>
                </>}
              </tr>

              {vendorData.billingType === 'Bank Transfer' && <>
                <tr className="hover:bg-gray-50 transition-colors">
                  <th className={thClass}>Account Holder Name</th>
                  {!dataEditView ? <>
                    <td className={tdClass}>{vendorData?.accountHolderName}</td>
                  </> : <>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={vendorData.accountHolderName}
                        onChange={(e) => vendorHandleChange(e)}
                        className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                        placeholder="Enter the Account Holder Name here"
                        name="accountHolderName"
                      />
                    </td>
                  </>}
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <th className={thClass}>Account Number</th>
                  {!dataEditView ? <>
                    <td className={tdClass}>{vendorData?.accountNumber}</td>
                  </> : <>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={vendorData.accountNumber}
                        onChange={(e) => vendorHandleChange(e)}
                        className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                        placeholder="Enter the Account Number here"
                        name="accountNumber"
                      />
                    </td>
                  </>}
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <th className={thClass}>Bank Name</th>
                  {!dataEditView ? <>
                    <td className={tdClass}>{vendorData?.bankName}</td>
                  </> : <>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={vendorData.bankName}
                        onChange={(e) => vendorHandleChange(e)}
                        className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                        placeholder="Enter the Bank Name here"
                        name="bankName"
                      />
                    </td>
                  </>}
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <th className={thClass}>Bank Branch</th>
                  {!dataEditView ? <>
                    <td className={tdClass}>{vendorData?.bankBranch}</td>
                  </> : <>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={vendorData.bankBranch}
                        onChange={(e) => vendorHandleChange(e)}
                        className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                        placeholder="Enter the Bank Branch here"
                        name="bankBranch"
                      />
                    </td>
                  </>}
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <th className={thClass}>IFSC Code</th>
                  {!dataEditView ? <>
                    <td className={tdClass}>{vendorData?.ifscCode}</td>
                  </> : <>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={vendorData.ifscCode}
                        onChange={(e) => vendorHandleChange(e)}
                        className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                        placeholder="Enter the IFSC Code here"
                        name="ifscCode"
                      />
                    </td>
                  </>}
                </tr>
              </>}

              {vendorData.billingType === 'UPI' && <>
                <tr className="hover:bg-gray-50 transition-colors">
                  <th className={thClass}>UPI Number</th>
                  {!dataEditView ? <>
                    <td className={tdClass}>{vendorData?.upiNumber}</td>
                  </> : <>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={vendorData.upiNumber}
                        onChange={(e) => vendorHandleChange(e)}
                        className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                        placeholder="Enter the UPI Number here"
                        name="upiNumber"
                      />
                    </td>
                  </>}
                </tr>
              </>}

              {vendorData.billingType === 'Others' && <>
                <tr className="hover:bg-gray-50 transition-colors">
                  <th className={thClass}>Other Banking Details</th>
                  {!dataEditView ? <>
                    <td className={tdClass}>{vendorData?.otherBankingDetails}</td>
                  </> : <>
                    <td className={tdClass}>
                      <input
                        type="text"
                        value={vendorData.otherBankingDetails}
                        onChange={(e) => vendorHandleChange(e)}
                        className="text-black w-full p-1.5 text-xs placeholder-gray-400 bg-white rounded border border-gray-300"
                        placeholder="Mention the Banking Details here"
                        name="otherBankingDetails"
                      />
                    </td>
                  </>}
                </tr>
              </>}
            </tbody>
          </table>
        </div>
      </form>
    </DashPage>
  );
}

export default VendorData;
