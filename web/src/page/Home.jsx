import React from 'react'
import { Link } from 'react-router-dom'
import CTAButton from '../components/common/CTAButton'
import quScanImage from '../assets/quScanImage.jpg'
import multirole from '../assets/multirole.jpg'
import realTime from '../assets/realTime.jpg'
import automatedReports from '../assets/automatedReports.jpg'

const features = [
    {
        title: 'QR-based Check-in',
        description: 'Mark attendance in seconds with secure, time-aware QR validation.',
        image: quScanImage
    },
    {
        title: 'Real-time Analytics',
        description: 'Track daily attendance trends instantly across classes and semesters.',
        image: realTime
    },
    {
        title: 'Role-specific Dashboards',
        description: 'Student, instructor, and admin experiences are optimized for each workflow.',
        image: multirole
    },
    {
        title: 'Automated Reporting',
        description: 'Generate attendance summaries with audit-ready consistency.',
        image: automatedReports
    }
]

const steps = [
    {
        step: '01',
        title: 'Generate Session QR',
        description: 'Instructors launch a session and display a rotating QR code tied to time and location.'
    },
    {
        step: '02',
        title: 'Students Check In',
        description: 'Students scan once, and attendance is validated and captured with metadata.'
    },
    {
        step: '03',
        title: 'Monitor and Export',
        description: 'Faculty and admins review dashboards and export actionable attendance insights.'
    }
]

const metrics = [
    { value: '99.9%', label: 'Attendance data accuracy' },
    { value: '3x', label: 'Faster than manual rolls' },
    { value: '24/7', label: 'Institutional visibility' }
]

function Home() {
    return (
        <main className="overflow-hidden pb-16">
            <section
                className="relative border-b pb-20 pt-16"
                style={{
                    borderColor: 'var(--border-subtle)',
                    background:
                        'radial-gradient(circle at 15% 12%, rgba(0, 82, 255, 0.10), transparent 42%), radial-gradient(circle at 80% 18%, rgba(10, 11, 13, 0.06), transparent 36%), var(--surface-primary)'
                }}
            >
                <div className="cb-container grid gap-10  lg:items-center">
                    <div className="reveal-up">
                        <p
                            className="inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em]"
                            style={{ background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                        >
                            IIIT Bhagalpur Digital Initiative
                        </p>

                        <h1 className="cb-display-tight mt-6 text-4xl font-medium sm:text-6xl lg:text-7xl" style={{ color: 'var(--text-primary)' }}>
                            ATTENDANCE OPERATIONS,<br></br> REBUILT FOR INSTITUTIONS.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg" style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                            Benchmark is a professional attendance platform for modern campuses. It removes manual friction,
                            improves compliance confidence, and gives departments a trusted operational view of participation.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/signup">
                                <CTAButton text="Get Started" active='true' />
                            </Link>
                            <Link to="/learn">
                                <CTAButton text="Explore Platform" active={false} />
                            </Link>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {metrics.map((item) => (
                                <div key={item.label} className="cb-card rounded-2xl p-4">
                                    <p className="cb-display-tight text-3xl font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {item.value}
                                    </p>
                                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <div className="cb-card reveal-up rounded-3xl p-7" style={{ animationDelay: '120ms' }}>
                        <h2 className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
                            Operational snapshot
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            One system for session control, student check-in, and reporting.
                        </p>

                        <div className="mt-6 space-y-4">
                            {features.slice(0, 3).map((feature) => (
                                <div
                                    key={feature.title}
                                    className="flex items-center gap-3 rounded-2xl border p-3"
                                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-secondary)' }}
                                >
                                    <img src={feature.image} alt={feature.title} className="h-14 w-14 rounded-xl object-cover" />
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {feature.title}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}
                </div>
            </section>

            <section className="py-16">
                <div className="cb-container">
                    <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--cb-link)' }}>
                                Capabilities
                            </p>
                            <h2 className="cb-display-tight mt-2 text-3xl font-medium md:text-5xl" style={{ color: 'var(--text-primary)' }}>
                                Purpose-built for professional academic operations
                            </h2>
                        </div>
                        <p className="max-w-xl text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                            Every module is designed for reliability, governance, and speed. Blue is used only where action and
                            focus matter.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {features.map((feature) => (
                            <article key={feature.title} className="flex gap-5 cb-card rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1">
                                <img src={feature.image} alt={feature.title} className="h-40 w-40 rounded-2xl object-cover" />
                                <div>
                                    <h3 className="mt-4 text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                                        {feature.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16" style={{ background: 'var(--surface-dark)' }}>
                <div className="cb-container">
                    <p className="text-xs font-semibold uppercase tracking-[0.13em] text-white/70">Workflow</p>
                    <h2 className="cb-display-tight mt-2 text-3xl font-medium text-white md:text-5xl">How Benchmark Works</h2>
                    <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                        A tight, transparent flow for every session from generation to review.
                    </p>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {steps.map((item) => (
                            <article key={item.step} className="cb-dark-card rounded-3xl p-6">
                                <p className="text-sm font-semibold" style={{ color: '#9cb7ff' }}>
                                    Step {item.step}
                                </p>
                                <h3 className="mt-2 text-2xl font-medium text-white">{item.title}</h3>
                                <p className="mt-3 text-sm text-white/75" style={{ lineHeight: 1.55 }}>
                                    {item.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="cb-container cb-card rounded-[32px] p-8 md:p-12">
                    <h2 className="cb-display-tight text-3xl font-medium md:text-5xl" style={{ color: 'var(--text-primary)' }}>
                        Bring consistency to attendance operations
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                        Move from fragmented processes to a unified platform trusted by students, instructors, and administrators.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link to="/signup">
                            <CTAButton text="Start Now" active='true' />
                        </Link>
                        <Link to="/learn">
                            <CTAButton text="Learn More" active={false} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Home