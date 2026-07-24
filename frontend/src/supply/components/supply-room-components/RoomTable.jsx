// Copyright (c) 2026 Aravind Adari. All rights reserved.

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';
import axios from 'axios';
import { DashPage } from '../../../shared/Dashboard';
import Pagination from '../../../shared/Pagination';

function RoomTable() {
  const navigate = useNavigate();
  const location = useLocation();

  const [roomData, setRoomData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { id = 0 } = useParams();
  const owner_id = location.state?.owner_id;
  const propertyId = location.state?.propertyId;

  const filteredData = (roomData || []).filter((item) =>
    Object.entries(item).some(([key, value]) => {
      if (Array.isArray(value)) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    })
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
        const response = await axios.get(`/supply/get-room-data/${id}/`);

        setRoomData(response.data.room_table);
      } catch (err) {
        console.log(err.message || 'Error fetching data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const viewHandle = (room) => {
    if (room.status === 'Pending') {
      navigate(`/supply/supply-room-form/${room?.id}`, {
        state: { roomData: room, owner_id, propertyId, roomId: id },
      });
    } else {
      navigate(`/supply/supply-room-details/${room?.id}`, {
        state: { roomData: room, owner_id, propertyId, roomId: id },
      });
    }
  };

  return (
    <DashPage>
      <div className="page-header">
        <h1>Supply Room Table</h1>
        <div className="flex items-center gap-2">
          {id !== 0 && (
            <button
              className="px-3 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
              onClick={() =>
                propertyId === 0
                  ? navigate(`/supply/supply-property-table`)
                  : navigate(`/supply/supply-property-table/${owner_id}`)
              }
              type="button"
            >
              Prev
            </button>
          )}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-input w-48 text-xs"
          />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  No.
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Property Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Building Level
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  Add / Update
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingData ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-3 py-1.5 text-xs text-gray-800 text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((room, i) => (
                  <tr
                    key={room.pk}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      {startIndex + i + 1}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800 max-w-[180px] truncate">
                      {room.propertyName}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      {room.buildingLevel}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      {room.status}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-800">
                      {room.status === 'Pending' ? (
                        <Plus
                          size={14}
                          className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                          onClick={() => viewHandle(room)}
                        />
                      ) : (
                        <Pencil
                          size={14}
                          className="text-gray-400 hover:text-[#D4A017] cursor-pointer transition-colors"
                          onClick={() => viewHandle(room)}
                        />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-3 py-1.5 text-xs text-gray-800 text-center"
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

export default RoomTable;
