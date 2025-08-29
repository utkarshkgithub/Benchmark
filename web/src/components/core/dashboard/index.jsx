import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import IconBTN from '../../common/IconBTN.jsx'
import CTAButton from '../../common/CTAButton.jsx';

function MyProfile() {
  const { user } = useSelector((state) => state.auth);
  console.log(user)
  const navigate = useNavigate();
  return (
    <div className='w-[calc(100vw-270px)] max-h-[calc(100vh-65px)] overflow-scroll'>
      <div className="p-5 flex flex-col gap-6">
        <h1 className="font-extrabold text-4xl">My Profile</h1>

        {/* section-1 */}
        <div className=" flex">
          <div className='flex'>
            <img
              src={`${user?.image}`}
              alt={`profile-${user?.firstName}`}
              className="aspect-square rounded-full w-[100px] object-cover mr-4"
            />
            <div className=" flex flex-col justify-center">
              <p className="text-black font-bold text-xl">{user?.firstName + " " + user?.lastName}</p>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>


        </div>
        {/* section-3 */}

        <div className=" px-2 rounded mb-4 text-black">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Personal Details</h2>
          </div>
          <hr className='text-gray-300 mb-4' />
          <div className='grid md:grid-cols-4 grid-cols-2 max-md:gap-4'>
            <p className='text-gray-500'>First Name</p>
            <p>{user?.firstName}</p>
            <p className='text-gray-500'>Last Name</p>
            <p>{user?.lastName}</p>
          </div>
          <hr className='text-gray-300 my-4' />
          <div className='grid md:grid-cols-4 grid-cols-3 max-md:gap-4'>
            <p className='text-gray-500'>Email</p>
            <p>{user?.email}</p>
          </div>
          <hr className='text-gray-300 my-4' />

        </div>

        {/* section-4 */}
        <div className=" px-2 rounded mb-4 text-black">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Academic Information</h2>
          </div>
          <hr className='text-gray-300 mb-4' />
          <div className='grid md:grid-cols-4 grid-cols-2 max-md:gap-4'>
            <p className='text-gray-500'>Year</p>
            <p>{user?.semester}</p>
            <p className='text-gray-500'>Branch</p>
            <p>{user?.branch}</p>
          </div>
          <hr className='text-gray-300 my-4' />
          <div className='grid md:grid-cols-4 grid-cols-3 max-md:gap-4'>
            <p className='text-gray-500'>Roll Number</p>
            <p>{user?.rollNumber}</p>
          </div>
        </div>
        {/* section 5 */}

      </div>
      <div className='m-4 text-right '>
        <Link to='/dashboard/settings' >
        <CTAButton text="Update Profile" active={true}></CTAButton>
      </Link>
      </div>

    </div>

  );
}

export default MyProfile;