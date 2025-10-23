import React from 'react'

function AnimatText({text,color}) {
  return (
    <div className={`inline-block bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 text-transparent bg-clip-text`}>
      {text}
    </div>
  )
}

export default AnimatText
