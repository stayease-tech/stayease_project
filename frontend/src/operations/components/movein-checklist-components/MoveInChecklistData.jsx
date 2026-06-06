// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useNavigate, useLocation } from "react-router-dom";
import { DashPage } from "../../../shared/Dashboard";

function MoveInChecklistData() {
    const navigate = useNavigate();
    const location = useLocation();
    const moveInChecklistData = location.state?.data;

    function formatDateToDDMonYYYY(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    return (
        <DashPage>
            <div className="max-w-2xl mx-auto py-6">
                <h1 className="text-center text-xl font-semibold mb-6 text-[#D4A017]">MOVE-IN CHECKLIST DATA</h1>

                <div className="mb-4">
                    <button
                        className="px-4 py-1.5 bg-[#D4A017] text-white text-xs font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                        onClick={() => navigate(`/operations/operations-checklistfeedback-table`)}
                        type="button"
                    >
                        Prev
                    </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="grid grid-cols-2 gap-3 p-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Resident Name</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.residentsName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Flat Number</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.roomNo || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Flat Type</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.roomType || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Room No.</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.bedLabel || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Move-In Date</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.checkIn ? formatDateToDDMonYYYY(moveInChecklistData?.checkIn) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Audit Done By</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.propertyManager || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Property Condition</p>
                            <p className="text-xs text-gray-800">{(moveInChecklistData?.moveInPropertyCondition || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Property Condition Comments</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.moveInPropertyConditionComments || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Electrical Lighting</p>
                            <p className="text-xs text-gray-800">{(moveInChecklistData?.moveInElectricalLighting || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Electrical Lighting Comments</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.moveInElectricalLightingComments || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Furniture Fixtures</p>
                            <p className="text-xs text-gray-800">{(moveInChecklistData?.moveInFurnitureFixtures || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Furniture Fixtures Comments</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.moveInFurnitureFixturesComments || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Kitchen Plumbing</p>
                            <p className="text-xs text-gray-800">{(moveInChecklistData?.moveInKitchenPlumbing || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Kitchen Plumbing Comments</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.moveInKitchenPlumbingComments || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Housekeeping Cleanliness</p>
                            <p className="text-xs text-gray-800">{(moveInChecklistData?.moveInHousekeepingCleanliness || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Housekeeping Cleanliness Comments</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.moveInHousekeepingCleanlinessComments || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Remarks</p>
                            <p className="text-xs text-gray-800">{moveInChecklistData?.moveInRemarks || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashPage>
    );
}

export default MoveInChecklistData;
