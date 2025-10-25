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
import scenqrvideo2 from '../assets/Student_Attendance_Marked_Successfully.mp4'
import { AnimatedTestimonialsDemo } from '../components/AnimatedTestimonialsDemo'

function Home() {
    const [currentFeature, setCurrentFeature] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState(null)
    const arr = [scenqrvideo2, secanQr]
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
        
        // Generate random number between 1 and 10
        const randomNum = Math.floor(Math.random() * 10) + 1
        
        // Select video based on random number
        // 1-5: first video (arr[0]), 6-10: second video (arr[1])
        const videoIndex = randomNum <= 5 ? 0 : 1
        setSelectedVideo(arr[videoIndex])
        
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
            <section className='px-4'>
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
                                    <video 
                                        src={selectedVideo || secanQr} 
                                        autoPlay 
                                        loop 
                                        muted 
                                        alt="" 
                                        className='rounded-2xl'
                                    ></video>
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
                        <div className='relative mt-10 flex justify-center items-center flex-col w-full'>
                            <h3 
                                className=' text-center p-4 sm:text-2xl text-lg rounded-4xl my-5 font-semibold'
                                style={{ color: darkMode ? '#ffffff' : '#111827' }}
                            >
                                <AnimatText text="*" />Key Features<AnimatText text="*" />
                            </h3>
                            <div 
                                className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-4xl transition-all duration-300 hover:bg-transparent ${darkMode ? 'bg-black/20' : 'bg-white/40'}`}
                                style={{
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className='flex gap-4 items-center border-2 p-2 rounded-2xl hover:scale-105 transition-all duration-300'
                                        style={{
                                            borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(156, 163, 175, 0.3)',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = darkMode ? 'rgba(32, 48, 78, 0.3)' : 'rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <div className='w-40'>
                                            <img src={feature.icon} alt="" className='rounded-2xl'/>
                                        </div>
                                        <div className='font-bold text-lg'>
                                            <h4
                                                style={{ 
                                                    color: darkMode ? '#ffffff' : '#111827'
                                                }}
                                            >
                                                {feature.title}
                                            </h4>
                                            <h3
                                                style={{ 
                                                    color: darkMode ? '#d1d5db' : '#374151',
                                                    fontWeight: 'normal',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
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
                        className=' text-center p-4 sm:text-2xl text-lg rounded-4xl mt-15 font-semibold'
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
            <section className='my-10 px-4'>
                <div className='w-full flex justify-center items-center flex-col'>
                    <div 
                        className='text-3xl font-bold my-10'
                        style={{ color: darkMode ? '#ffffff' : '#111827' }}
                    >
                        How It Works
                    </div>
                    {/* <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4'> */}
                    <div className='flex justify-center items-center flex-wrap gap-4'>
                        {[
                            { step: "01", title: "Scan QR Code", desc: "Students scan the unique QR code displayed by instructors", color: "from-blue-500 to-cyan-500" },
                            { step: "02", title: "Mark Attendance", desc: "System automatically records attendance with timestamp", color: "from-green-500 to-emerald-500" },
                            { step: "03", title: "Generate Reports", desc: "View detailed analytics and generate comprehensive reports", color: "from-purple-500 to-pink-500" }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className='flex flex-col items-center p-6 rounded-2xl transition-all duration-300 hover:scale-105'
                                style={{
                                    backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.2)'}`
                                }}
                            >
                                <div 
                                    className='text-4xl mb-4'
                                    style={{ color: darkMode ? '#60a5fa' : '#3b82f6' }}
                                >
                                    {item.icon || "🔄"}
                                </div>
                                <div 
                                    className='text-2xl font-bold mb-2'
                                    style={{ color: darkMode ? '#fbbf24' : '#f59e0b' }}
                                >
                                    {item.step}
                                </div>
                                <h3 
                                    className='text-lg font-semibold mb-2 text-center'
                                    style={{ color: darkMode ? '#ffffff' : '#111827' }}
                                >
                                    {item.title}
                                </h3>
                                <p 
                                    className='text-sm text-center max-w-xs'
                                    style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}
                                >
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}

export default Home