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
                    <div className="max-w-3xl mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800">
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">MOVE-OUT CHECKLIST DATA</h1>

                        <div className="sm:flex justify-left">
                            <button
                                className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/operations/operations-checklistfeedback-table`)}
                                type="button">Prev</button>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                <tbody>
                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Resident Name</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.residentsName || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Flat Number</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.roomNo || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Flat Type</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.roomType || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Room No.</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.bedLabel || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Move-Out Date</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.checkOut ? formatDateToDDMonYYYY(moveOutChecklistData?.checkOut) : '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Audit Done By</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.propertyManager || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Property Condition</th>
                                        <td className="py-1 px-2">{(moveOutChecklistData?.moveOutPropertyCondition || '').replace("[", "").replace("]", "") || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.moveOutPropertyConditionComments || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Electrical Lighting</th>
                                        <td className="py-1 px-2">{(moveOutChecklistData?.moveOutElectricalLighting || '').replace("[", "").replace("]", "") || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.moveOutElectricalLightingComments || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Furniture Fixtures</th>
                                        <td className="py-1 px-2">{(moveOutChecklistData?.moveOutFurnitureFixtures || '').replace("[", "").replace("]", "") || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.moveOutFurnitureFixturesComments || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Kitchen Plumbing</th>
                                        <td className="py-1 px-2">{(moveOutChecklistData?.moveOutKitchenPlumbing || '').replace("[", "").replace("]", "") || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.moveOutKitchenPlumbingComments || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Housekeeping Cleanliness</th>
                                        <td className="py-1 px-2">{(moveOutChecklistData?.moveOutHousekeepingCleanliness || '').replace("[", "").replace("]", "") || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.moveOutHousekeepingCleanlinessComments || '-'}</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Remarks</th>
                                        <td className="py-1 px-2">{moveOutChecklistData?.moveOutRemarks || '-'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
        </DashPage>
    )
}

export default MoveOutChecklistData