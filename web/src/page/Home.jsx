import React, { useState, useEffect } from 'react'
import CTAButton from '../components/common/CTAButton'
import { Link } from 'react-router-dom'
import { BackgroundBeams } from '../components/ui/background-beams'

function Home() {
    const [currentFeature, setCurrentFeature] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    const features = [
        {
            title: "QR Code Scanning",
            description: "Quick and contactless attendance marking",
            icon: "📱",
            color: "from-gray-100 to-gray-200"
        },
        {
            title: "Real-time Analytics",
            description: "Instant attendance reports and insights",
            icon: "📊",
            color: "from-gray-100 to-gray-200"
        },
        {
            title: "Multi-role Dashboard",
            description: "Tailored interfaces for everyone",
            icon: "👥",
            color: "from-gray-100 to-gray-200"
        },
        {
            title: "Automated Reports",
            description: "Generate detailed attendance reports",
            icon: "📈",
            color: "from-gray-100 to-gray-200"
        }
    ]

    const stats = [
        { number: "330", label: "Students Enrolled", icon: "🎓" },
        { number: "2", label: "Active Instructors", icon: "👨‍🏫" },
        { number: "99.9%", label: "System Uptime", icon: "⚡" },
        { number: "24/7", label: "Support Available", icon: "🛟" }
    ]

    const testimonials = [
        {
            name: "Dr. Priya Sharma",
            role: "Professor, CSE Department",
            message: "This system has revolutionized how we track attendance. No more paper rolls!",
            avatar: "👩‍🏫"
        },
        {
            name: "Rahul Kumar",
            role: "4th Year Student",
            message: "Super easy to use. Just scan and go! My attendance is always accurate now.",
            avatar: "👨‍🎓"
        },
        {
            name: "Admin Team",
            role: "Academic Office",
            message: "Comprehensive reports and analytics help us make better decisions.",
            avatar: "👨‍💼"
        }
    ]

    useEffect(() => {
        setIsVisible(true)
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden'>
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-10 animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400 to-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-15 animate-bounce-slow"></div>
            </div>

            {/* Hero Section */}
            <section className='relative z-10 flex justify-center items-center min-h-[calc(100vh-67px)] px-4 py-20'>
                <div className='max-w-6xl mx-auto text-center'>
                    {/* Main Content */}
                    <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="mb-8">
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6 animate-fade-in">
                                <span className="text-2xl mr-2">🎓</span>
                                <span className="text-sm font-semibold text-gray-700">IIIT Bhagalpur Digital Initiative</span>
                            </div>
                            
                            <h1 className='text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight'>
                                <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x'>
                                    Modern Attendance
                                </span>
                                <br />
                                <span className='bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-gradient-x' style={{ animationDelay: '0.5s' }}>
                                    System Revolution
                                </span>
                            </h1>
                            
                            <p className='text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed animate-slide-up' style={{ animationDelay: '0.3s' }}>
                                Streamline attendance tracking for students, instructors, and administrators with our 
                                <span className='font-semibold text-blue-600'> comprehensive digital solution</span>. 
                                Experience the future of education technology.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up' style={{ animationDelay: '0.6s' }}>
                            <Link to="/signup" className="transform hover:scale-105 transition-all duration-300">
                                <div className="relative group">
                                    <div className="relative">
                                        <CTAButton text="Get Started" active='true' />
                                    </div>
                                </div>
                            </Link>
                            <Link to="/learn" className="transform hover:scale-105 transition-all duration-300">
                                <CTAButton text="View Demo" active={false}/>
                            </Link>
                        </div>

                        {/* Feature Carousel */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 mb-12 shadow-xl animate-slide-up" style={{ animationDelay: '0.9s' }}>
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Key Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {features.map((feature, index) => (
                                    <div 
                                        key={index}
                                        className={`p-6 rounded-xl transition-all duration-500 transform hover:scale-105 ${
                                            currentFeature === index 
                                                ? `bg-gradient-to-br ${feature.color} text-white shadow-lg scale-105` 
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="text-4xl mb-3">{feature.icon}</div>
                                        <h4 className={`font-bold mb-2 ${currentFeature === index ? 'text-gray-800' : 'text-gray-800'}`}>
                                            {feature.title}
                                        </h4>
                                        <p className={`text-sm ${currentFeature === index ? 'text-gray-600' : 'text-gray-600'}`}>
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 py-20 bg-white/50 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Trusted by Hundreds
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div 
                                key={index} 
                                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="text-4xl mb-3">{stat.icon}</div>
                                <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="relative z-10 py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Scan QR Code", desc: "Students scan the unique QR code displayed by instructors", icon: "🧾", color: "from-blue-500 to-cyan-500" },
                            { step: "02", title: "Mark Attendance", desc: "System automatically records attendance with timestamp", icon: "✅", color: "from-green-500 to-emerald-500" },
                            { step: "03", title: "Generate Reports", desc: "View detailed analytics and generate comprehensive reports", icon: "📊", color: "from-purple-500 to-pink-500" }
                        ].map((item, index) => (
                            <div 
                                key={index}
                                className="relative p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-slide-in-bottom"
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-2xl mb-6 mx-auto shadow-lg`}>
                                    {item.icon}
                                </div>
                                <div className="absolute top-4 left-4 text-6xl font-bold text-gray-100">{item.step}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{item.title}</h3>
                                <p className="text-gray-600 text-center leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            {/* <section className="relative z-10 py-20 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                        What Our Community Says
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div 
                                key={index}
                                className="p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
                                style={{ animationDelay: `${index * 0.3}s` }}
                            >
                                <div className="flex items-center mb-6">
                                    <div className="text-5xl mr-4">{testimonial.avatar}</div>
                                    <div>
                                        <div className="font-bold text-gray-800">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                                    </div>
                                </div>
                                <p className="text-gray-700 italic leading-relaxed">"{testimonial.message}"</p>
                                <div className="flex text-yellow-400 mt-4">
                                    ⭐⭐⭐⭐⭐
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Final CTA Section */}
            {/* <section className="relative z-10 py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Institution?</h2>
                    <p className="text-xl mb-10 opacity-90">Join thousands of educators and students already using our modern attendance system.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="transform hover:scale-105 transition-all duration-300">
                            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                                🚀 Start Free Trial
                            </button>
                        </Link>
                        <Link to="/contact" className="transform hover:scale-105 transition-all duration-300">
                            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all shadow-lg">
                                📞 Contact Sales
                            </button>
                        </Link>
                    </div>
                </div>
            </section> */}

            <style jsx>{`
                @keyframes gradient-x {
                    0%, 100% {
                        background-size: 200% 200%;
                        background-position: left center;
                    }
                    50% {
                        background-size: 200% 200%;
                        background-position: right center;
                    }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }

                @keyframes float-reverse {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(20px) rotate(-5deg); }
                }

                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes slide-in-bottom {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-gradient-x {
                    animation: gradient-x 4s ease infinite;
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .animate-float-reverse {
                    animation: float-reverse 8s ease-in-out infinite;
                }

                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }

                .animate-fade-in {
                    opacity: 0;
                    animation: fade-in 0.8s ease-out forwards;
                }

                .animate-slide-up {
                    opacity: 0;
                    animation: slide-up 0.8s ease-out forwards;
                }

                .animate-slide-in-bottom {
                    opacity: 0;
                    animation: slide-in-bottom 0.8s ease-out forwards;
                }

                .animate-fade-in-up {
                    opacity: 0;
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    )
}

export default Home