import React from 'react'
import { Link } from 'react-router-dom'

function Student() {
  return (
    <div>
      {/* <h1>Welcome {User.firstName} {user.lastName}</h1> */}
      <Link to='/dashboard/registration'>register</Link>
    </div>
  )
}

export default Student
