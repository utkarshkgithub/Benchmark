import React from 'react'
import CTAButton from '../components/common/CTAButton'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <div className='flex justify-center '>
            <div className='w-[760px] flex flex-col items-center justify-center gap-4 py-20 '>
                <p className='text-5xl font-bold text-center'>Modern Attendance System of IIIT BHAGALPUR</p>
                <p className='text-2xl text-center text-gray-500'>Streamline attendance tracking for students, instructors, and administrators with our comprehensive digital solution.</p>
                <div className='flex gap-4'>
                    <Link to="/signup">
                        <CTAButton text="Get Started" active='true' />
                    </Link>
                    <Link to="/learn">
                        <CTAButton text="View Demo" active={false} />
                    </Link>

                </div>
            </div>
        </div>
    )
}

export default Home
