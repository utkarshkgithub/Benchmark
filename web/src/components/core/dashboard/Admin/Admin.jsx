import React from 'react'
import { Link } from 'react-router-dom'

function Admin() {
  return (
    <div>
        <Link to="/dashboard/create-subject">Add Subject</Link>
    </div>
  )
}

export default Admin
