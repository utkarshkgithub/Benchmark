import React from 'react'

function CTAButton({ text, active }) {
  return (
    <button
      className={`px-4 py-2 rounded font-medium transition-colors duration-300 ${
        active
          ? "text-white bg-[#1197a8] hover:bg-[#0faabe]"
          : "bg-transparent text-black hover:text-white hover:bg-blue-400 border-[1px] border-black/20"
      }`}
    >
      {text}
    </button>
  )
}

export default CTAButton
