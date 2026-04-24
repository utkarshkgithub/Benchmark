import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
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
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  if (profileLoading || authLoading) {
    return (
      <div 
        className="grid h-full min-w-[220px] items-center rounded-[28px] border"
        style={{
          backgroundColor: darkMode ? '#111827' : '#ffffff',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <div 
        className="flex h-full flex-col justify-between gap-6"
        style={{
          color: 'var(--text-primary)'
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--cb-link)' }}>
            Dashboard
          </p>
          <h2 className="cb-display-tight mt-2 text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
            Workspace
          </h2>
        </div>

        <div className="flex flex-1 flex-col gap-2 box-border">
          {sidebarLinks.map((link) => {
            if (link.type && user?.accountType !== link.type) return null
            return (
              <SidebarLink key={link.id} link={link} iconName={link.icon} />
            )
          })}
        </div>

        <button
          onClick={() => dispatch(logout(navigate))}
          className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
          style={{ borderColor: 'rgba(220, 38, 38, 0.25)' }}
        >
          <VscSignOut className="text-base" />
          Logout
        </button>
      </div>
    </>
  )
}