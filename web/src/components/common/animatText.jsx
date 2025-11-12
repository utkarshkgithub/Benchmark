import React from 'react'

function AnimatText({text,color}) {
  return (
    <div className={`inline-block bg-gradient-to-r from-[#a0b6a9] via-green-500 to-[#a0b6a9] text-transparent bg-clip-text`}>
      {text}
    </div>
  )
}

export default AnimatText
