import React, { useState, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
// import { Seat } from "lucide-react"; // seat icon
import { LuArmchair } from "react-icons/lu";
// Seat structure (similar to Flutter version)
const seatPerBench = 3;
const seatStructure = [7, 0, 6, 0, 6, 0, 6, 0, 6, 0, 7];

export default function SeatSelector() {
  const [selectedSeat, setSelectedSeat] = useState(null);
  const transformRef = useRef(null);

  // Fit-to-screen button handler
  const fitToScreen = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  // Toggle seat selection
  const toggleSeat = (seatId) => {
    setSelectedSeat(selectedSeat === seatId ? null : seatId);
  };

  // Build the full layout
  const buildSeatLayout = () => (
    <div className="flex justify-center items-start w-screen h-[calc(100vh-100px)] ">
      {seatStructure.map((benchesInColumn, colIndex) =>
        benchesInColumn === 0 ? (
          <div key={colIndex} className="w-[30px]" /> // aisle
        ) : (
          <div key={colIndex} className="flex flex-col">
            {Array.from({ length: benchesInColumn }).map((_, benchIndex) => (
              <div key={benchIndex} className="flex my-1">
                {Array.from({ length: seatPerBench }).map((_, seatIndex) => {
                  const rowLetter = String.fromCharCode(65 + benchIndex);
                  let seatNumber = 1;
                  for (let i = 0; i < colIndex; i++) {
                    if (seatStructure[i] > benchIndex) {
                      seatNumber += seatPerBench;
                    }
                  }
                  seatNumber += seatIndex;
                  const seatId = `${rowLetter}${seatNumber
                    .toString()
                    .padStart(2, "0")}`;
                  const isSelected = selectedSeat === seatId;

                  return (
                    <motion.div
                      key={seatId}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSeat(seatId)}
                      className={`w-10 h-9 m-1 rounded-md border flex flex-col items-center justify-center cursor-pointer shadow-sm ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-400 shadow-md"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      <LuArmchair size={14} className={isSelected ? "text-white" : "text-gray-600"} />
                      <span className="text-[10px] font-bold">{seatId}</span>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* AppBar */}
      <div className="bg-purple-700 text-white p-4 flex justify-between items-center shadow">
        <h1 className="text-lg font-bold">Select Your Seat</h1>
        <button
          onClick={fitToScreen}
          className="px-3 py-1 bg-purple-500 hover:bg-purple-400 rounded-md"
        >
          Fit to Screen
        </button>
      </div>

      {/* Interactive area */}
      <div className="flex-1 overflow-hidden">
        <TransformWrapper ref={transformRef} minScale={0.3} maxScale={4}>
          <TransformComponent>
            {buildSeatLayout()}
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Screen label */}
      <div className="text-center my-4">
        <p className="font-bold text-purple-700 tracking-widest">
          CLASSROOM SCREEN
        </p>
        <div className="mx-auto w-2/3 h-1.5 bg-purple-700 rounded-full shadow-md mt-2" />
      </div>

      {/* Legend */}
      <div className="flex justify-around py-3 border-t bg-gray-50">
        <LegendItem color="bg-gray-200" text="Available" />
        <LegendItem color="bg-purple-600" text="Selected" />
        <LegendItem color="bg-red-500" text="Occupied" />
      </div>
      {/* Summary */}
      <div className="p-4 flex justify-between items-center border-t bg-gray-100">
        <span className="font-semibold">
          {selectedSeat ? `Selected seat: ${selectedSeat}` : "No seat selected"}
        </span>
        <button
          disabled={!selectedSeat}
          className={`px-5 py-2 rounded-lg font-bold shadow ${
            selectedSeat
              ? "bg-purple-600 text-white hover:bg-purple-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={() => alert(`Confirmed seat: ${selectedSeat}`)}
        >
          CONFIRM
        </button>
      </div>
    </div>
  );
}

// Legend item component
function LegendItem({ color, text }) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-5 h-5 rounded ${color} border border-gray-300`} />
      <span className="text-sm">{text}</span>
    </div>
  );
}