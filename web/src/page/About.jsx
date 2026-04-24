import React from 'react'

const pillars = [
  {
    title: 'Trust and Accuracy',
    description: 'Every attendance event is validated with timing controls and role-aware permissions.'
  },
  {
    title: 'Operational Clarity',
    description: 'Stakeholders can move from session activity to reports without fragmented tooling.'
  },
  {
    title: 'Institutional Scale',
    description: 'The architecture supports multi-role usage while keeping workflows simple for daily use.'
  },
  {
    title: 'Continuous Improvement',
    description: 'We refine the platform based on campus feedback and real operational requirements.'
  }
]

const stats = [
  { value: '330+', label: 'Students in active use' },
  { value: '2+', label: 'Faculty roles supported' },
  { value: '99.9%', label: 'Service availability target' },
  { value: '2025', label: 'Benchmark pilot launched' }
]

const teamMembers = [
  {
    name: 'Amit Usara',
    role: 'Full Stack Developer',
    department: 'B.Tech CSE, IIIT Bhagalpur',
    image: 'https://avatars.githubusercontent.com/u/153491957?v=4',
    bio: 'Builds core frontend and backend product flows with a focus on user clarity and reliable execution.',
    expertise: ['React.js', 'Node.js', 'MongoDB', 'Express.js'],
    email: 'amit3.230101023@iiitbh.ac.in',
    github: 'https://github.com/AMIT-USARA',
    linkedin: 'https://www.linkedin.com/in/amit-usara-8a4416293/'
  },
  {
    name: 'Utkarsh Kumar',
    role: 'DevOps and Flutter Developer',
    department: 'B.Tech CSE, IIIT Bhagalpur',
    image: 'https://avatars.githubusercontent.com/u/152621458?v=4',
    bio: 'Designs deployment pipelines and mobile experiences to keep Benchmark consistent across platforms.',
    expertise: ['DevOps', 'Flutter', 'CI/CD', 'Cloud Infrastructure'],
    email: 'utkarsh2.230101147@iiitbh.ac.in',
    github: 'https://github.com/utkarshkgithub',
    linkedin: 'https://www.linkedin.com/in/utkarshk27/'
  }
]

const technologies = [
  'React.js',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Tailwind CSS',
  'Flutter',
  'Dart',
  'JWT'
]

function About() {
  return (
    <main className="pb-16">
      <section
        className="border-b py-16"
        style={{
          borderColor: 'var(--border-subtle)',
          background:
            'radial-gradient(circle at 84% 18%, rgba(0, 82, 255, 0.10), transparent 30%), radial-gradient(circle at 12% 88%, rgba(10, 11, 13, 0.08), transparent 36%), var(--surface-primary)'
        }}
      >
        <div className="cb-container">
          <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--cb-link)' }}>
            About Benchmark
          </p>
          <h1 className="cb-display-tight mt-3 max-w-4xl text-4xl font-medium sm:text-6xl" style={{ color: 'var(--text-primary)' }}>
            A professional attendance system built for transparent academic operations.
          </h1>
          <p className="mt-5 max-w-3xl text-base md:text-lg" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Benchmark is developed at IIIT Bhagalpur to modernize attendance workflows through QR-driven check-ins,
            real-time visibility, and dependable reporting. The platform emphasizes reliability, clean user flows, and
            administrative confidence.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="cb-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="cb-card rounded-2xl p-5">
              <h2 className="cb-display-tight text-4xl font-medium" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {stat.label}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--surface-dark)' }}>
        <div className="cb-container">
          <h2 className="cb-display-tight text-3xl font-medium text-white md:text-5xl">Core Principles</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="cb-dark-card rounded-3xl p-6">
                <h3 className="text-2xl font-medium text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm text-white/75" style={{ lineHeight: 1.6 }}>
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="cb-container">
          <div className="mb-8 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--cb-link)' }}>
              Team
            </p>
            <h2 className="cb-display-tight text-3xl font-medium md:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Built by students focused on quality execution
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {teamMembers.map((member) => (
              <article key={member.name} className="cb-card rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <img src={member.image} alt={member.name} className="h-16 w-16 rounded-full object-cover" />
                  <div>
                    <h3 className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
                      {member.name}
                    </h3>
                    <p className="text-sm font-semibold" style={{ color: 'var(--cb-link)' }}>
                      {member.role}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {member.department}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {member.bio}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {member.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border px-3 py-1 text-xs font-semibold"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', background: 'var(--surface-secondary)' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex gap-4 text-sm">
                  <a className="cb-link" href={`mailto:${member.email}`}>
                    Email
                  </a>
                  <a className="cb-link" href={member.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a className="cb-link" href={member.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="cb-container cb-card rounded-[32px] p-8 md:p-10">
          <h2 className="cb-display-tight text-3xl font-medium md:text-4xl" style={{ color: 'var(--text-primary)' }}>
            Technology Profile
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', background: 'var(--surface-secondary)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
