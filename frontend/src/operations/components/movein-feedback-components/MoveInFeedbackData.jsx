import { useNavigate, useLocation } from "react-router-dom";
import { DashPage } from "../../../shared/Dashboard";

function MoveInFeedbackData() {
    const navigate = useNavigate();
    const location = useLocation();
    const moveInFeedbackData = location.state?.data;

    return (
        <DashPage>
                    <div className="max-w-3xl mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800">
                        <h1 className="text-center sm:text-xl lg:text-2xl font-semibold lg:mt-0 mb-8 text-[#D4A017]">MOVE-IN FEEDBACK DATA</h1>

                        <div className="sm:flex justify-left">
                            <button
                                className="mb-5 px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm" onClick={() => navigate(`/operations/operations-checklistfeedback-table`)}
                                type="button">Prev</button>
                        </div>

                        <div className="w-full overflow-x-auto">
                            <table className="border-collapse border border-white min-w-full table-auto shadow-md rounded-lg max-sm:text-xs">
                                <tbody>
                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">1. Cleanliness of the room and washroom</th>
                                        <td className="py-1 px-2">{moveInFeedbackData?.cleanlinessRoomWashroom} Star Rating</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">2. Functionality of appliances and utilities</th>
                                        <td className="py-1 px-2">{moveInFeedbackData?.functionalityAppliancesUtilities} Star Rating</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">3. Comfort and setup of the room</th>
                                        <td className="py-1 px-2">{moveInFeedbackData?.comfortSetupRoom} Star Rating</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">4. Staff behavior and check-in experience</th>
                                        <td className="py-1 px-2">{moveInFeedbackData?.staffBehaviorCheckinExperience} Star Rating</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">5. Overall first impression of Stayease Harmonia</th>
                                        <td className="py-1 px-2">{moveInFeedbackData?.overallImpressionStayease} Star Rating</td>
                                    </tr>

                                    <tr className="border-b border-white">
                                        <th className="border-r border-white py-1 px-2 text-[#D4A017] text-left">Comments</th>
                                        <td className="py-1 px-2">{moveInFeedbackData?.overallComments}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
        </DashPage>
    )
}

export default MoveInFeedbackData