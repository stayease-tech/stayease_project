import React from "react";

function NoOfBasements({ propertyData, setPropertyData }) {
    const handleBasementIncrement = () => {
        setPropertyData(prev => {
            const newBasementNos = prev.basementNos + 1;

            return {
                ...prev,
                basementNos: newBasementNos,
                roomsPerBasement: Array.from({ length: newBasementNos }, (_, i) => {
                    const existingBasement = prev.roomsPerBasement.find(b => b.basement === i + 1);
                    return existingBasement || { basement: i + 1, rooms: 0 };
                })
            };
        });
    };

    const handleBasementDecrement = () => {
        setPropertyData(prev => {
            const newBasementNos = Math.max(0, prev.basementNos - 1);

            return {
                ...prev,
                basementNos: newBasementNos,
                roomsPerBasement: prev.roomsPerBasement.slice(0, newBasementNos)
            };
        });
    };

    const handleBasementChange = (e) => {
        const { value } = e.target;

        if (/^\d*$/.test(value)) {
            setPropertyData(prev => {
                const num = value === "" ? 0 : Math.max(0, parseInt(value, 10));

                return {
                    ...prev,
                    basementNos: num,
                    roomsPerBasement: Array.from({ length: num }, (_, i) => {
                        const existingBasement = prev.roomsPerBasement[i];
                        return existingBasement || { basement: i + 1, rooms: 0 };
                    })
                };
            });
        }
    };

    const handleRoomIncrement = (basement) => {
        setPropertyData(
            {
                ...propertyData,
                roomsPerBasement: propertyData.roomsPerBasement.map((b) =>
                    b.basement === basement
                        ? { ...b, rooms: b.rooms + 1 }
                        : b
                ),
            }
        );
    };

    const handleRoomDecrement = (basement) => {
        setPropertyData(
            {
                ...propertyData,
                roomsPerBasement: propertyData.roomsPerBasement.map((b) =>
                    b.basement === basement
                        ? { ...b, rooms: Math.max(0, b.rooms - 1) }
                        : b
                ),
            }
        );
    };

    const handleRoomChange = (e, basement) => {
        const { value } = e.target;

        const newValue = Math.max(0, Number(value) || 0);

        setPropertyData({
            ...propertyData,
            roomsPerBasement: propertyData.roomsPerBasement.map((b) =>
                b.basement === basement ? { ...b, rooms: newValue } : b
            ),
        });
    };

    return (
        <div>
            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Add Basement Details</h3>

            <label htmlFor={`basementNos`} className="block text-[#D4A017] max-sm:text-sm"><strong>Add Number of Basements:</strong></label>

            <div className="flex my-3 items-center">
                <button
                    onClick={handleBasementDecrement}
                    className="px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                    type="button"
                >
                    -
                </button>

                <input
                    type="text"
                    id={`basementNos`}
                    value={propertyData.basementNos}
                    onChange={handleBasementChange}
                    className="text-black w-full p-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs mx-2 text-center text-xs sm:text-sm"
                    name={`basementNos`}
                    placeholder="Enter the number of Floors"
                    required
                />

                <button
                    onClick={handleBasementIncrement}
                    className="px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                    type="button"
                >
                    +
                </button>
            </div>

            {propertyData.basementNos !== 0 && <hr className="my-10" />}

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {propertyData.roomsPerBasement.map((room, i) => (
                    <div className="my-3" key={i}>
                        <label htmlFor="roomNos" className="block text-[#D4A017]"><strong>Add Number of Rooms (Basement {room.basement}):</strong></label>

                        <div className="flex my-3 items-center">
                            <button
                                onClick={() => handleRoomDecrement(room.basement)}
                                className="px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                                type="button"
                            >
                                -
                            </button>

                            <input
                                type="text"
                                id="roomNos"
                                value={room.rooms}
                                onChange={(e) => handleRoomChange(e, room.basement)}
                                className="text-black w-full p-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs mx-2 text-center"
                                name="roomNos"
                                placeholder="Enter the number of Rooms"
                                required
                            />

                            <button
                                onClick={() => handleRoomIncrement(room.basement)}
                                className="px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B]"
                                type="button"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {propertyData.basementNos !== 0 && <hr className="mt-10" />}
        </div>
    );
}

export default NoOfBasements;
