
import React from 'react'
import * as Icons from 'react-icons/vsc'
import { NavLink } from 'react-router-dom';
function SidebarLink({ link, iconName }) {
    const Icon = Icons[iconName];

    return (
        <NavLink
            to={link.path}
            className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                        ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
                }`
            }
        >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-primary)] shadow-sm" style={{ border: '1px solid var(--border-subtle)' }}>
                {Icon ? <Icon className="text-lg" /> : null}
            </span>
            <span className="flex-1">{link.name}</span>
            <span className="h-2 w-2 rounded-full bg-[var(--cb-blue)] opacity-0 transition-opacity group-hover:opacity-100" />
        </NavLink>
    )
}

export default SidebarLink