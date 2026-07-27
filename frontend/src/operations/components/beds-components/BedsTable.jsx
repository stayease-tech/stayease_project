// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Copy, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { DashPage } from '../../../shared/Dashboard';
import Pagination from '../../../shared/Pagination';

function BedsTable() {
  const navigate = useNavigate();

  const [bedsData, setBedsData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredData = bedsData.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    setLoadingData(true);

    const fetchData = async () => {
      try {
        const response = await axios.get(`/sales/get-beds-data/`);

        setBedsData(
          (response?.data?.beds_table || [])
            .filter(
              (item) =>
                item?.salesStatus === 'Completed' &&
                item?.resident_data?.residentStatus === 'Active'
            )
            .sort((a, b) => {
              if (a.roomNo !== b.roomNo) {
                return a.roomNo.localeCompare(b.roomNo);
              }
              return a.bedLabel.localeCompare(b.bedLabel);
            })
        );
      } catch (err) {
        console.log(err.message || 'Error fetching data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const viewAgreementHandle = (bedsData) => {
    navigate(
      `/operations/operations-agreement-pdf/${bedsData?.resident_data?.id}`,
      { state: { bedsData, type: 'BedsTable' } }
    );
  };

  const updateBedsDataHandle = (bedsData, status) => {
    status === 'Pending'
      ? navigate(
          `/operations/operations-moveinchecklist-form/${bedsData?.resident_data?.id}`,
          { state: { bedsData } }
        )
      : navigate(`/operations/operations-checklistfeedback-table`, {
          state: { bedsData },
        });
  };

  const generateLink = (bedData) => {
    const params = new URLSearchParams({
      id: bedData?.id,
      roomNo: bedData?.roomNo,
      bedLabel: bedData?.bedLabel,
      residentsName: bedData?.resident_data?.residentsName,
      phoneNumber: bedData?.resident_data?.phoneNumber,
    }).toString();

    return `${window.location.origin}/operations/operations-propertycomplaint-form/${bedData?.resident_data?.id}?${params}`;
  };

  const copyLinkHandle = async (data) => {
    const link = generateLink(data);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        alert('Link copied successfully!');
        return;
      }

      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('Link copied successfully!');
        } else {
          alert('Failed to copy link. Please copy it manually: ' + link);
        }
      } catch (err) {
        alert('Failed to copy link. Please copy it manually: ' + link);
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Copy error:', error);
      alert('Failed to copy link. Please copy it manually: ' + link);
    }
  };

  const moveInStatusBadge = (status) => {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium';
    if (status === 'Completed') return `${base} bg-green-100 text-green-700`;
    return `${base} bg-yellow-100 text-yellow-700`;
  };

  return (
    <DashPage>
      <div className="page-header">
        <h1>View Beds</h1>
        <input
          type="text"
          placeholder="Search…"
          value={searchTerm}
          onChange={handleSearchChange}
          className="form-input w-48 text-xs"
        />
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Property
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Room
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Bed
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Resident
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Move-In Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Agreement
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Complaint Link
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loadingData ? (
                <tr>
                  <td colSpan={9}>
                    <div className="flex justify-center py-6">
                      <div className="spinner" />
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((bedData, i) => (
                  <tr
                    className="hover:bg-gray-50 transition-colors"
                    key={bedData.id}
                  >
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      {startIndex + i + 1}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[200px] truncate">
                      {bedData?.propertyName}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      {bedData?.roomNo}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      {bedData?.bedLabel}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      {bedData?.roomType}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[200px] truncate">
                      {bedData?.resident_data?.residentsName}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={moveInStatusBadge(
                            bedData?.resident_data?.moveInChecklistStatus
                          )}
                        >
                          {bedData?.resident_data?.moveInChecklistStatus ||
                            'Pending'}
                        </span>
                        {bedData?.resident_data?.moveInChecklistStatus ===
                        'Pending' ? (
                          <PlusCircle
                            size={14}
                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                            onClick={() =>
                              updateBedsDataHandle(bedData, 'Pending')
                            }
                          />
                        ) : (
                          <Eye
                            size={14}
                            className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                            onClick={() =>
                              updateBedsDataHandle(bedData, 'Completed')
                            }
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      <Eye
                        size={14}
                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                        onClick={() => viewAgreementHandle(bedData)}
                      />
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      <Copy
                        size={14}
                        className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                        onClick={() => copyLinkHandle(bedData)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-10 text-center text-gray-400"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashPage>
  );
}

export default BedsTable;
