import React from "react";

function NoOfFloors({ propertyData, setPropertyData }) {
    const handleFloorIncrement = () => {
        setPropertyData(prev => {
            const newFloorNos = prev.floorNos + 1;

            return {
                ...prev,
                floorNos: newFloorNos,
                roomsPerFloor: Array.from({ length: newFloorNos }, (_, i) => {
                    const existingFloor = prev.roomsPerFloor.find(f => f.floor === i);
                    return existingFloor || { floor: i, rooms: 0 };
                })
            };
        });
    };

    const handleFloorDecrement = () => {
        setPropertyData(prev => {
            const newFloorNos = Math.max(0, prev.floorNos - 1);

            return {
                ...prev,
                floorNos: newFloorNos,
                roomsPerFloor: prev.roomsPerFloor
                    .filter(f => f.floor >= 0 && f.floor < newFloorNos)
                    .map(f => ({ ...f }))
            };
        });
    };

    const handleFloorChange = (e) => {
        const { value } = e.target;

        if (/^\d*$/.test(value)) {
            setPropertyData(prev => {
                const num = value === "" ? 0 : Math.max(0, parseInt(value, 10));

                return {
                    ...prev,
                    floorNos: num,
                    roomsPerFloor: Array.from({ length: num }, (_, i) => {
                        const existingFloor = prev.roomsPerFloor.find(f => f.floor === i);
                        return existingFloor || { floor: i, rooms: 0 };
                    })
                };
            });
        }
    };

    const handleRoomIncrement = (floor) => {
        setPropertyData(
            {
                ...propertyData,
                roomsPerFloor: propertyData.roomsPerFloor.map((f) =>
                    f.floor === floor
                        ? { ...f, rooms: f.rooms + 1 }
                        : f
                ),
            }
        );
    };

    const handleRoomDecrement = (floor) => {
        setPropertyData(
            {
                ...propertyData,
                roomsPerFloor: propertyData.roomsPerFloor.map((f) =>
                    f.floor === floor
                        ? { ...f, rooms: Math.max(0, f.rooms - 1) }
                        : f
                ),
            }
        );
    };

    const handleRoomInputChange = (e, floor) => {
        const { value } = e.target;

        const newValue = Math.max(0, Number(value) || 0);

        setPropertyData({
            ...propertyData,
            roomsPerFloor: propertyData.roomsPerFloor.map((f) =>
                f.floor === floor ? { ...f, rooms: newValue } : f
            ),
        });
    };

    return (
        <div className="mb-[20px]">
            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">Add Floor Details</h3>

            <label htmlFor='floorNos' className="block text-[#D4A017] max-sm:text-sm"><strong>Add Number of Floors:</strong></label>

            <div className="flex my-3 items-center">
                <button
                    onClick={handleFloorDecrement}
                    className="px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                    type="button"
                >
                    -
                </button>

                <input
                    type="text"
                    id='floorNos'
                    value={propertyData.floorNos}
                    onChange={handleFloorChange}
                    className="text-black w-full p-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs mx-2 text-center text-xs sm:text-sm"
                    name='floorNos'
                    placeholder="Enter the number of Floors"
                    required
                />

                <button
                    onClick={handleFloorIncrement}
                    className="px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                    type="button"
                >
                    +
                </button>
            </div>

            {propertyData.floorNos !== -1 && <hr className="my-5 sm:my-10" />}

            <label htmlFor="roomNos" className="block text-[#D4A017] text-center max-sm:text-sm"><strong>Add Number of Rooms:</strong></label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {propertyData.roomsPerFloor.map((room) => (
                    <div className="sm:my-3" key={room.floor}>
                        <label htmlFor="roomNos" className="block text-[#D4A017] text-center max-sm:text-sm"><strong>Floor {room.floor}:</strong></label>

                        <div className="flex my-3 items-center">
                            <button
                                onClick={() => handleRoomDecrement(room.floor)}
                                className="px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                                type="button"
                            >
                                -
                            </button>

                            <input
                                type="text"
                                id="roomNos"
                                value={room.rooms}
                                onChange={(e) => handleRoomInputChange(e, room.floor)}
                                className="text-black w-full p-2 border border-gray-300 rounded text-sm placeholder-gray-400 placeholder:text-xs mx-2 text-center text-xs sm:text-sm"
                                name="roomNos"
                                placeholder="Enter the number of Rooms"
                                required
                            />

                            <button
                                onClick={() => handleRoomIncrement(room.floor)}
                                className="px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
                                type="button"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {propertyData.floorNos !== -1 && <hr className="mt-5 sm:mt-10" />}
        </div>
    );
}

export default NoOfFloors;
