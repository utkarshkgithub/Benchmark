import React, { useState, useEffect } from 'react'
import CTAButton from '../components/common/CTAButton'
import { Link } from 'react-router-dom'
import AnimatText from '../components/common/animatText'
import { useSelector } from 'react-redux'
import secanQr from '../assets/Student_Attendance_QR_Code_Scan.mp4'
import quScanImage from '../assets/Gemini_Generated_Image_lftu38lftu38lftu.png'
import multirole from '../assets/Gemini_Generated_Image_83bpgh83bpgh83bp.png'
import realTime from "../assets/Gemini_Generated_Image_hc7b9ahc7b9ahc7b.png"
import automatedREports from '../assets/Gemini_Generated_Image_pw6qdkpw6qdkpw6q.png'

import { AnimatedTestimonialsDemo } from '../components/AnimatedTestimonialsDemo'

function Home() {
    const [currentFeature, setCurrentFeature] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    
    // Get theme state
    const themeState = useSelector((state) => state.theme)
    const darkMode = themeState?.darkMode || false

    const features = [
        {
            title: "QR Code Scanning",
            description: "Quick and contactless attendance marking",
            icon: quScanImage,
        },
        {
            title: "Real-time Analytics",
            description: "Instant attendance reports and insights",
            icon: realTime,
        },
        {
            title: "Multi-role Dashboard",
            description: "Tailored interfaces for everyone",
            icon: multirole,
        },
        {
            title: "Automated Reports",
            description: "Generate detailed attendance reports",
            icon: automatedREports,
        }
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
        <div 
            className='relative min-h-screen overflow-hidden'
            style={{
                background: darkMode 
                    ? 'linear-gradient(to bottom right, #111827, #1f2937, #111827)'
                    : 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #faf5ff)',
                color: darkMode ? '#ffffff' : '#111827'
            }}
        >
            {/* Background Elements */}


            {/* Hero Section */}
            <section>
                <div>
                    {/* Main Content */}
                    <div className='flex flex-col justify-center items-center'>
                        <div className='w-10/12 flex flex-col justify-center items-center mt-10'>
                            <div 
                                className='inline text-center p-4 sm:text-2xl text-lg rounded-4xl my-10 font-medium'
                                style={{
                                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    color: darkMode ? '#ffffff' : '#111827'
                                }}
                            >
                                <span>🎓</span>
                                <span>IIIT Bhagalpur Digital Initiative</span>
                            </div>
                            <div className='grid grid-cols-1 gap-10 my-4'>
                                <div className='flex flex-col justify-center items-center'>
                                    <span 
                                        className='lg:text-7xl sm:text-5xl text-2xl font-bold'
                                        style={{ color: darkMode ? '#ffffff' : '#111827' }}
                                    >
                                        <AnimatText text='Modern Attendance' />
                                    </span>
                                    <span 
                                        className='lg:text-7xl sm:text-5xl text-2xl font-bold'
                                        style={{ color: darkMode ? '#ffffff' : '#111827' }}
                                    >
                                        <AnimatText text="System Revolution" />
                                    </span>
                                    <div className='flex gap-10 mt-10'>
                                        <Link to="/signup">
                                            <div>
                                                <div>
                                                    <CTAButton text="Get Started" active='true' />
                                                </div>
                                            </div>
                                        </Link>
                                        <Link to="/learn">
                                            <CTAButton text="View Demo" active={false} />
                                        </Link>
                                    </div>
                                </div>
                                <div className='rounded-2xl w-full my-10'>
                                    <video src={secanQr} autoPlay loop muted alt="" className='rounded-2xl'></video>
                                </div>
                            </div>


                            <div 
                                className='flex flex-col xl:text-5xl lg:text-4xl sm:text-2xl md:text-3xl text-xl font-bold justify-center items-center'
                                style={{ color: darkMode ? '#ffffff' : '#111827' }}
                            >
                                <div className=' flex gap-2'>
                                    Streamline attendance tracking for <AnimatText text="students," />
                                </div>
                                <div className=' flex gap-2'>
                                    <AnimatText text="instructors, and administrators" /> with our
                                </div>
                                <div className=' flex gap-2'>
                                    comprehensive
                                    <AnimatText text='digital solution.'> </AnimatText>
                                    Experience
                                </div>
                                <div className=' flex gap-2'>
                                    the future of
                                    <AnimatText text="education technology."></AnimatText>
                                </div>

                            </div>
                        </div>




                        {/* Feature Carousel */}
                        <div className='relative mt-10 flex justify-center items-center flex-col'>
                            <h3 
                                className=' text-center p-4 sm:text-2xl text-lg rounded-4xl my-5 font-semibold'
                                style={{ color: darkMode ? '#ffffff' : '#111827' }}
                            >
                                <AnimatText text="*" />Key Features<AnimatText text="*" />
                            </h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-10 w-11/12'>
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className='flex gap-4 items-center border-2 bg-[#203047e1] p-2 rounded-2xl' 
                                    >
                                        <div className='w-40 '>
                                            <img src={feature.icon} alt="" className='rounded-2xl'/>
                                        </div>
                                        <div 
                                            className='font-bold text-lg'
                                            style={{ color: darkMode ? '#ffffff' : '#ffffff' }}
                                        >
                                            <h4>
                                                {feature.title}
                                            </h4>
                                            <h3 >
                                                {feature.description}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section>
                <div className='flex flex-col justify-center items-center'>
                    <div className='w-10/12 flex flex-col justify-center items-center'>
                    <h3 
                        className=' text-center p-4 sm:text-2xl text-lg rounded-4xl my-5 font-semibold'
                        style={{ color: darkMode ? '#ffffff' : '#111827' }}
                    >
                        <AnimatText text="*" />Trusted by Hundreds<AnimatText text="*" />
                    </h3>
                    
                    <div className='flex'>
                        <AnimatedTestimonialsDemo />
                    </div>
                    </div>

                </div>
            </section>

            {/* How It Works Section */}
            {/* <section>
                <div>
                    <h2>
                        How It Works
                    </h2>
                    <div>
                        {[
                            { step: "01", title: "Scan QR Code", desc: "Students scan the unique QR code displayed by instructors", icon: "🧾", color: "from-blue-500 to-cyan-500" },
                            { step: "02", title: "Mark Attendance", desc: "System automatically records attendance with timestamp", icon: "✅", color: "from-green-500 to-emerald-500" },
                            { step: "03", title: "Generate Reports", desc: "View detailed analytics and generate comprehensive reports", icon: "📊", color: "from-purple-500 to-pink-500" }
                        ].map((item, index) => (
                            <div
                                key={index}
                            >
                                <div>
                                    {item.icon}
                                </div>
                                <div>{item.step}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

        </div>
    )
}

export default Home