import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CTAButton from '../../common/CTAButton.jsx';
import ChangeProfilePicture from './Settings/ChangeProfilePicture.jsx';

function MyProfile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className='w-[calc(100vw-270px)] max-h-[calc(100vh-69px)] overflow-scroll'>
      <div className="p-5 flex flex-col gap-6">
        <h1 className="font-extrabold text-4xl">My Profile</h1>

        {/* section-1 (Image + Name + Email) */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* 👇 Yaha ChangeProfilePicture add kar diya */}
          <ChangeProfilePicture /> 

          
        </div>

        {/* section-3 Personal Details */}
        <div className="px-2 rounded mb-4 text-black">
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

        {/* section-4 Academic Information */}
        <div className="px-2 rounded mb-4 text-black">
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
      </div>
    </div>
  );
}

export default MyProfile;
