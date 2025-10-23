import { useSelector } from 'react-redux';
import IconBtn from "./IconBTN";

export default function ConfirmationModal({ modalData }) {
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  return (
    <div 
      className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm"
      style={{
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div 
        className="w-11/12 max-w-[350px] rounded-lg border border-richblack-400 bg-richblack-800 p-6"
        style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderColor: darkMode ? '#4b5563' : '#d1d5db'
        }}
      >
        <p 
          className="text-2xl font-semibold text-gray-900"
          style={{
            color: darkMode ? '#f9fafb' : '#111827'
          }}
        >
          {modalData?.text1}
        </p>
        <p 
          className="mt-3 mb-5 leading-6 text-gray-800"
          style={{
            color: darkMode ? '#d1d5db' : '#1f2937'
          }}
        >
          {modalData?.text2}
        </p>
        <div className="flex items-center gap-x-4">
          <IconBtn
            active={true}
            onClick={modalData?.btn1Handler}
            text={modalData?.btn1Text}
          />
          <button
            className="cursor-pointer rounded-md bg-gray-600 py-[8px] px-[20px] font-semibold text-gray-100"
            style={{
              backgroundColor: darkMode ? '#4b5563' : '#6b7280',
              color: darkMode ? '#f3f4f6' : '#f9fafb'
            }}
            onClick={modalData?.btn2Handler}
          >
            {modalData?.btn2Text}
          </button>
        </div>
      </div>
    </div>
  )
}