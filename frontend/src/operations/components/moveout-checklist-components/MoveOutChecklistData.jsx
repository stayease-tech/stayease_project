// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useNavigate, useLocation } from "react-router-dom";
import { DashPage } from "../../../shared/Dashboard";

function MoveOutChecklistData() {
    const navigate = useNavigate();
    const location = useLocation();
    const moveOutChecklistData = location.state?.data;

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
                <h1 className="text-center text-xl font-semibold mb-6 text-[#D4A017]">MOVE-OUT CHECKLIST DATA</h1>

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
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.residentsName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Flat Number</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.roomNo || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Flat Type</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.roomType || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Room No.</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.bedLabel || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Move-Out Date</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.checkOut ? formatDateToDDMonYYYY(moveOutChecklistData?.checkOut) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Audit Done By</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.propertyManager || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Property Condition</p>
                            <p className="text-xs text-gray-800">{(moveOutChecklistData?.moveOutPropertyCondition || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Property Condition Comments</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.moveOutPropertyConditionComments || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Electrical Lighting</p>
                            <p className="text-xs text-gray-800">{(moveOutChecklistData?.moveOutElectricalLighting || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Electrical Lighting Comments</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.moveOutElectricalLightingComments || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Furniture Fixtures</p>
                            <p className="text-xs text-gray-800">{(moveOutChecklistData?.moveOutFurnitureFixtures || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Furniture Fixtures Comments</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.moveOutFurnitureFixturesComments || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Kitchen Plumbing</p>
                            <p className="text-xs text-gray-800">{(moveOutChecklistData?.moveOutKitchenPlumbing || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Kitchen Plumbing Comments</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.moveOutKitchenPlumbingComments || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Housekeeping Cleanliness</p>
                            <p className="text-xs text-gray-800">{(moveOutChecklistData?.moveOutHousekeepingCleanliness || '').replace("[", "").replace("]", "") || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Housekeeping Cleanliness Comments</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.moveOutHousekeepingCleanlinessComments || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Remarks</p>
                            <p className="text-xs text-gray-800">{moveOutChecklistData?.moveOutRemarks || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashPage>
    );
}

export default MoveOutChecklistData;
