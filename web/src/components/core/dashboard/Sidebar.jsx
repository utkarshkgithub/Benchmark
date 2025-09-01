import { useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import ConfirmationModal from "../../common/ConfirmationModal"
import { logout } from "../../../services/opretions/Auth"
import {sidebarLinks} from "../../../data/dashboard-links"
import SidebarLink from "./SidebarLink"
export default function Sidebar() {
  const { loading: profileLoading } = useSelector(
    (state) => state.profile
  )
  const { user } = useSelector(
    (state) => state.auth
  )
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)

  if (profileLoading || authLoading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <div className="">
        <div className="flex flex-col box-border">
          {sidebarLinks.map((link) => {
            if (link.type && user?.accountType !== link.type) return null
            // console.log(user?.accountType);
            return (
              <SidebarLink key={link.id} link={link} iconName={link.icon} />
            )
          })}
        </div>
        
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}