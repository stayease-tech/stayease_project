// Copyright (c) 2026 Aravind Adari. All rights reserved.

import { useNavigate, useLocation } from "react-router-dom";
import { DashPage } from "../../../shared/Dashboard";

function MoveInFeedbackData() {
    const navigate = useNavigate();
    const location = useLocation();
    const moveInFeedbackData = location.state?.data;

    return (
        <DashPage>
            <div className="max-w-2xl mx-auto py-6">
                <h1 className="text-center text-xl font-semibold mb-6 text-[#D4A017]">MOVE-IN FEEDBACK DATA</h1>

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
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">1. Cleanliness of the room and washroom</p>
                            <p className="text-xs text-gray-800">{moveInFeedbackData?.cleanlinessRoomWashroom} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">2. Functionality of appliances and utilities</p>
                            <p className="text-xs text-gray-800">{moveInFeedbackData?.functionalityAppliancesUtilities} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">3. Comfort and setup of the room</p>
                            <p className="text-xs text-gray-800">{moveInFeedbackData?.comfortSetupRoom} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">4. Staff behavior and check-in experience</p>
                            <p className="text-xs text-gray-800">{moveInFeedbackData?.staffBehaviorCheckinExperience} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">5. Overall first impression of Stayease Harmonia</p>
                            <p className="text-xs text-gray-800">{moveInFeedbackData?.overallImpressionStayease} Star Rating</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Comments</p>
                            <p className="text-xs text-gray-800">{moveInFeedbackData?.overallComments}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashPage>
    );
}

export default MoveInFeedbackData;
