import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

function About() {
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const teamMembers = [
    {
      name: "Amit Usara",
      role: "Full Stack Web Developer",
      department: "B.Tech CSE, IIIT Bhagalpur",
      image: "https://avatars.githubusercontent.com/u/153491957?v=4",
      bio: "Full-stack developer passionate about creating innovative solutions for educational technology. Specializes in MERN stack development and modern web technologies.",
      expertise: ["React.js", "Node.js", "MongoDB", "Express.js", "JavaScript", "UI/UX"],
      email: "amit3.230101023@iiitbh.ac.in",
      github: "https://github.com/AMIT-USARA",
      linkedin: "https://www.linkedin.com/in/amit-usara-8a4416293/"
    },
    {
      name: "Utkarsh Kumar",
      role: "DevOps Developer & Flutter Developer",
      department: "B.Tech CSE, IIIT Bhagalpur",
      image: "https://avatars.githubusercontent.com/u/152621458?v=4",
      bio: "Expert in DevOps practices and mobile application development. Passionate about creating scalable infrastructure and intuitive mobile experiences.",
      expertise: ["DevOps", "Flutter", "Docker", "CI/CD", "Cloud Infrastructure", "Mobile Development"],
      email: "utkarsh2.230101147@iiitbh.ac.in",
      github: "https://github.com/utkarshkgithub",
      linkedin: "https://www.linkedin.com/in/utkarshk27/"
    }
  ]

  const features = [
    {
      icon: "🎯",
      title: "Mission",
      description: "To revolutionize attendance management in educational institutions through innovative QR code technology and real-time analytics."
    },
    {
      icon: "👁️",
      title: "Vision", 
      description: "Creating a paperless, efficient, and transparent attendance ecosystem that benefits students, faculty, and administrators."
    },
    {
      icon: "⚡",
      title: "Innovation",
      description: "Leveraging cutting-edge technology to solve traditional problems with modern, scalable solutions."
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "Building bridges between technology and education through collaborative development and continuous improvement."
    }
  ]

  const stats = [
    { number: "330+", label: "Active Students", icon: "." },
    { number: "2+", label: "Faculty Members", icon: ".." },
    { number: "99.9%", label: "System Uptime", icon: "..." },
    { number: "2025", label: "Year", icon: "...." }
  ]

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
      style={{
        background: darkMode 
          ? 'linear-gradient(to bottom right, #1f2937, #111827, #0f172a)'
          : 'linear-gradient(to bottom right, #f9fafb, #ffffff, #f3f4f6)'
      }}
    >
      {/* Hero Section */}
      <motion.section 
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        initial="initial"
        animate="animate"
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={fadeInUp} className="mb-8">
            <span 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold mb-6"
              style={{
                background: darkMode 
                  ? 'linear-gradient(to right, #1e40af, #7c3aed)'
                  : 'linear-gradient(to right, #dbeafe, #e9d5ff)',
                color: darkMode ? '#e0e7ff' : '#1e40af'
              }}
            >
              🏛️ About IIITBH Benchmark
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 bg-clip-text text-transparent mb-6"
            style={{
              lineHeight: '1.2'
            }}
          >
            Transforming Education Through Technology
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            style={{
              color: darkMode ? '#d1d5db' : '#4b5563'
            }}
          >
            The IIITBH Benchmark project represents a revolutionary cross-platform approach to attendance management, 
            combining innovative QR code technology with real-time analytics to create a seamless 
            educational experience. Available as both a responsive web application and native mobile apps 
            for iOS and Android, ensuring accessibility across all devices for students, faculty, and administrators.
          </motion.p>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 bg-white/50 backdrop-blur-sm"
        style={{
          backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)'
        }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="text-center group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div 
                  className="text-gray-600 font-medium"
                  style={{
                    color: darkMode ? '#d1d5db' : '#4b5563'
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Mission & Vision Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            >
              Our Foundation
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                style={{
                  backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)'
                }}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 
                  className="text-xl font-bold text-gray-900 mb-4"
                  style={{
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-gray-600 leading-relaxed"
                  style={{
                    color: darkMode ? '#d1d5db' : '#4b5563'
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-blue-50 to-purple-50"
        style={{
          background: darkMode 
            ? 'linear-gradient(to bottom right, #17213f, #17212f)'
            : 'linear-gradient(to bottom right, #eff6ff, #17212f)'
        }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-black-100 text-blue-800 rounded-full text-sm font-semibold mb-6"
              style={{
                background: darkMode 
                  ? 'linear-gradient(to right, #1e40af, #7c3aed)'
                  : 'linear-gradient(to right, #dbeafe, #e9d5ff)',
                color: darkMode ? '#e0e7ff' : '#1e40af'
              }}
            >
              👥 Meet Our Team
            </span>
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            >
              The Minds Behind the Innovation
            </h2>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              style={{
                color: darkMode ? '#d1d5db' : '#4b5563'
              }}
            >
              A dedicated team of educators, developers, and innovators working together 
              to transform the educational experience at IIIT Bhagalpur.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                style={{
                  backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.5)'
                }}
              >
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                  </div>
                </div>

                <div className="text-center">
                  <h3 
                    className="text-xl font-bold text-gray-900 mb-1"
                    style={{
                      color: darkMode ? '#f9fafb' : '#111827'
                    }}
                  >
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-semibold mb-2">{member.role}</p>
                  <p 
                    className="text-sm text-gray-500 mb-4"
                    style={{
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    {member.department}
                  </p>
                  <p 
                    className="text-gray-600 text-sm leading-relaxed mb-4"
                    style={{
                      color: darkMode ? '#d1d5db' : '#4b5563'
                    }}
                  >
                    {member.bio}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.expertise.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="px-2 py-1 text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                      title="Email"
                    >
                      📧
                    </a>
                    {member.github && (
                      <a 
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-700 transition-colors duration-200"
                        title="GitHub"
                      >
                        💻
                      </a>
                    )}
                    {member.linkedin && (
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        title="LinkedIn"
                      >
                        💼
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              style={{
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            >
              Cross-Platform Technology Stack
            </h2>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              style={{
                color: darkMode ? '#d1d5db' : '#4b5563'
              }}
            >
              Our comprehensive platform leverages cutting-edge technologies to deliver a robust, 
              scalable experience across web and mobile platforms. Available as both a responsive 
              web application and native mobile app for iOS and Android.
            </p>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center mb-12"
          >
            {[
              { 
                name: "React.js", 
                image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K", 
                category: "Web Frontend" 
              },
              { 
                name: "Node.js", 
                image: "https://avatars.githubusercontent.com/u/9950313?s=48&v=4", 
                category: "Backend" 
              },
              { 
                name: "MongoDB", 
                icon: "🍃", 
                category: "Database" 
              },
              { 
                name: "Tailwind CSS", 
                icon: "🎨", 
                category: "Web Styling" 
              },
              { 
                name: "Express.js", 
                image: "https://avatars.githubusercontent.com/u/5658226?s=48&v=4", 
                category: "Web Framework" 
              },
              { 
                name: "JWT", 
                image: "https://www.jwt.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fjwt-flower.f20616b0.png&w=1920&q=75", 
                category: "Authentication" 
              }
            ].map((tech, index) => (
              <div 
                key={index}
                className="text-center group hover:scale-110 transition-transform duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {tech.image ? (
                    <img 
                      src={tech.image} 
                      alt={tech.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <div className="text-3xl">{tech.icon}</div>
                  )}
                </div>
                <div 
                  className="font-medium text-sm"
                  style={{
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}
                >
                  {tech.name}
                </div>
                <div 
                  className="text-xs mt-1"
                  style={{
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  {tech.category}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Mobile Technologies Section */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              style={{
                color: darkMode ? '#f9fafb' : '#111827'
              }}
            >
              Mobile App Technologies
            </h3>
            <p 
              className="text-lg text-gray-600 mb-8"
              style={{
                color: darkMode ? '#d1d5db' : '#4b5563'
              }}
            >
              Native mobile experience powered by Flutter and Dart
            </p>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center"
          >
            {[
              { 
                name: "Flutter", 
                image: "https://storage.googleapis.com/cms-storage-bucket/flutter-logo.6a07d8a62f4308d2b854.svg", 
                category: "Mobile Framework" 
              },
              { 
                name: "Dart", 
                image: "https://dart.dev/assets/img/logo/dart-192.svg", 
                category: "Programming Language" 
              },
              { 
                name: "C++", 
                image: "https://imgs.search.brave.com/ZYt-WaIZyyRlFZAWZXe-qJnupHj97wlyQoRKKOgShUA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9kdG12/YW1haHM0MHV4LmNs/b3VkZnJvbnQubmV0/L3B1YmxpYy9jb3Vy/c2UvY291cnNlLTMx/NzYtTGVhcm5DUHJv/Z3JhbW1pbmcucG5n", 
                category: "Native Integration" 
              },
              { 
                name: "Swift", 
                image: "https://developer.apple.com/assets/elements/icons/swift/swift-64x64_2x.png", 
                category: "iOS Native" 
              }
            ].map((tech, index) => (
              <div 
                key={index}
                className="text-center group hover:scale-110 transition-transform duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src={tech.image} 
                    alt={tech.name}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div 
                  className="font-medium text-sm"
                  style={{
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}
                >
                  {tech.name}
                </div>
                <div 
                  className="text-xs mt-1"
                  style={{
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  {tech.category}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      
    </div>
  )
}

export default About
