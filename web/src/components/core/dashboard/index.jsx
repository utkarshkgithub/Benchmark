import React from 'react'
import { useSelector } from 'react-redux'
import ChangeProfilePicture from './Settings/ChangeProfilePicture.jsx'

function DetailItem({ label, value }) {
  const finalValue = value && `${value}`.trim() ? value : 'Not Added'

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-secondary)' }}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <p className="mt-1 text-base font-semibold break-words" style={{ color: 'var(--text-primary)' }}>
        {finalValue}
      </p>
    </div>
  )
}

function MyProfile() {
  const { user } = useSelector((state) => state.auth)

  return (
    <section
      className="min-h-[calc(100vh-80px)] py-8"
      style={{
        background:
          'radial-gradient(circle at 12% 18%, rgba(0, 82, 255, 0.10), transparent 34%), radial-gradient(circle at 86% 80%, rgba(10, 11, 13, 0.08), transparent 32%), var(--surface-primary)'
      }}
    >
      <div className="cb-container space-y-6">
        <header className="cb-card rounded-3xl p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--cb-link)' }}>
            Profile
          </p>
          <h1 className="cb-display-tight mt-2 text-4xl font-medium md:text-5xl" style={{ color: 'var(--text-primary)' }}>
            My Profile
          </h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            Manage your account details and academic information.
          </p>
        </header>

        <article className="cb-card rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-medium md:text-3xl" style={{ color: 'var(--text-primary)' }}>
            Profile Photo
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Upload a clear profile photo for easier identity verification.
          </p>
          <div className="mt-5">
            <ChangeProfilePicture />
          </div>
        </article>

        <article className="cb-card rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-medium md:text-3xl" style={{ color: 'var(--text-primary)' }}>
            Personal Details
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailItem label="First Name" value={user?.firstName} />
            <DetailItem label="Last Name" value={user?.lastName} />
            <DetailItem label="Email" value={user?.email} />
            <DetailItem label="Role" value={user?.accountType} />
          </div>
        </article>

        {user?.accountType === 'Student' && (
          <article className="cb-card rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-medium md:text-3xl" style={{ color: 'var(--text-primary)' }}>
              Academic Information
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem label="Branch" value={user?.branch} />
              <DetailItem label="Semester" value={user?.semester} />
              <DetailItem label="Roll Number" value={user?.rollNumber} />
              {/* <DetailItem label="Device ID" value={user?.deviceId} /> */}
            </div>
          </article>
        )}

        {user?.accountType === 'Instructor' && (
          <article className="cb-card rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-medium md:text-3xl" style={{ color: 'var(--text-primary)' }}>
              Academic Information
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Department" value={user?.department} />
              <DetailItem label="Role" value={user?.accountType} />
            </div>
          </article>
        )}
      </div>
    </section>
  )
}

export default MyProfile
