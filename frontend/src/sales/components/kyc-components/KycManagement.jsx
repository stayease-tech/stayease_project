// src/operations/components/kyc-components/KycManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropdowns } from '../../../shared/DropdownContext';
import { DashPage } from '../../../shared/Dashboard';
import Pagination from '../../../shared/Pagination';

const PAGE_SIZE = 10;

const STATUS_BADGE = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
};

function KycManagement() {
    const { getOptions, loaded: dropdownsLoaded } = useDropdowns();
    const TABS = getOptions('kyc_approval_statuses') || ['Pending', 'Approved', 'Rejected'];
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Pending");
    const [currentPage, setCurrentPage] = useState(1);

    console.log('🔍 Dropdowns loaded:', dropdownsLoaded);
    console.log('🔍 TABS:', TABS);

    const fetchResidents = (status) => {
        setLoading(true);
        setCurrentPage(1);
        console.log('🔍 Fetching residents with status:', status);
        
        axios.get(`/operations/kyc-pending/?status=${status}`, {
            withCredentials: true
        })
        .then((res) => {
            console.log('📦 Response:', res.data);
            if (res.data.success) {
                setResidents(res.data.residents || []);
            }
        })
        .catch((err) => {
            console.error('❌ Error fetching residents:', err);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchResidents(filter);
    }, [filter]);

    // Wait for dropdowns to load
    if (!dropdownsLoaded) {
        return <div>Loading dropdowns...</div>;
    }

    // Pagination
    const totalPages = Math.ceil((residents || []).length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedData = (residents || []).slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <DashPage>
            <div className="page-header">
                <div>
                    <h1>KYC Management</h1>
                    <p>Review and approve resident KYC documents</p>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                            filter === tab
                                ? "bg-[#D4A017] text-white border-[#D4A017]"
                                : "bg-white text-gray-600 border-gray-300 hover:border-[#D4A017] hover:text-[#D4A017]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Property</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-3 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((resident, index) => (
                                    <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2 text-gray-800">{startIndex + index + 1}</td>
                                        <td className="px-3 py-2 text-gray-800">{resident.residentsName}</td>
                                        <td className="px-3 py-2 text-gray-800">{resident.phoneNumber}</td>
                                        <td className="px-3 py-2 text-gray-800">{resident.propertyName}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[resident.kycApprovalStatus] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                {resident.kycApprovalStatus}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <button className="text-[#D4A017] hover:text-[#B8860B] text-sm font-medium">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-3 py-4 text-center text-gray-500">No residents found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </DashPage>
    );
}

export default KycManagement;