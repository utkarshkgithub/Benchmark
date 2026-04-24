import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/core/dashboard/Sidebar';

function DashBoard() {
  const { loading: authLoading } = useSelector((state) => state.auth);
  const { loading: profileLoading } = useSelector((state) => state.profile);
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  if (authLoading || profileLoading) {
    return (
      <div className="cb-auth-page">
        <div className="cb-card rounded-3xl px-6 py-5 text-center" style={{ color: darkMode ? '#f5f7fb' : '#0a0b0d' }}>
          Loading dashboard...
        </div>
      </div>
    )
  }
  return (
    <div
      className='min-h-[calc(100vh-80px)] w-full'
      style={{
        background:
          'radial-gradient(circle at 12% 18%, rgba(0, 82, 255, 0.08), transparent 32%), radial-gradient(circle at 86% 84%, rgba(10, 11, 13, 0.08), transparent 30%), var(--surface-primary)'
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1600px]">
        <aside
          className="hidden w-72 shrink-0 border-r px-4 py-6 lg:flex"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: darkMode ? '#0f172a' : '#f8fafc'
          }}
        >
          <div className="flex h-full w-full flex-col rounded-[28px] border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <Sidebar />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="px-4 py-6 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashBoard;

// import React from 'react'

// function DashBoard() {
//   return (
//     <div>
//       DashBoard
//     </div>
//   )
// }

// export default DashBoard
