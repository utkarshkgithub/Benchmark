import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { updateProfile } from "../../../../services/operations/SettingsAPI";
import IconBtn from "../../../comman/IconBtn";

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"];

export default function EditProfile() {
  const { user } = useSelector((state) => state.auth);
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitProfileForm = async (data) => {
    // Convert dateOfBirth to the desired format
    

    // console.log("Form Data - ", data);

    try {
      dispatch(updateProfile(token, data,navigate));
    } catch (error) {
      // console.log("ERROR MESSAGE - ", error.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitProfileForm)}>
        {/* Profile Information */}
        <div className="my-10 flex flex-col gap-y-6 rounded-md border p-8 px-12" style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderColor: darkMode ? '#374151' : '#e5e7eb'
        }}>
          <h2 className="text-lg font-semibold" style={{
            color: darkMode ? '#ffffff' : '#1f2937'
          }}>
            Profile Information
          </h2>
          
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="dateOfBirth" className="text-sm font-medium" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                className="px-2 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}
                {...register("dateOfBirth", {
                  required: {
                    value: true,
                    message: "Please enter your Date of Birth.",
                  },
                  max: {
                    value: new Date().toISOString().split("T")[0],
                    message: "Date of Birth cannot be in the future.",
                  },
                })}
                defaultValue={user?.additionalDetails?.dateOfBirth}
              />
              {errors.dateOfBirth && (
                <span className="-mt-1 text-[12px] text-red-500">
                  {errors.dateOfBirth.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="gender" className="text-sm font-medium" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                Gender
              </label>
              <select
                type="text"
                name="gender"
                id="gender"
                className="px-2 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}
                {...register("gender", { required: true })}
                defaultValue={user?.additionalDetails?.gender}
              >
                {genders.map((ele, i) => {
                  return (
                    <option key={i} value={ele}>
                      {ele}
                    </option>
                  );
                })}
              </select>
              {errors.gender && (
                <span className="-mt-1 text-[12px] text-red-500">
                  Please enter your Gender.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="contectNumber" className="text-sm font-medium" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                Contact Number
              </label>
              <input
                type="tel"
                name="contectNumber"
                id="contectNumber"
                placeholder="Enter Contact Number"
                className="px-2 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}
                {...register("contectNumber", {
                  required: {
                    value: true,
                    message: "Please enter your Contact Number.",
                  },
                  maxLength: { value: 12, message: "Invalid Contact Number" },
                  minLength: { value: 10, message: "Invalid Contact Number" },
                })}
                defaultValue={user?.additionalDetails?.contectNumber}
              />
              {errors.contectNumber && (
                <span className="-mt-1 text-[12px] text-red-500">
                  {errors.contectNumber.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="about" className="text-sm font-medium" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                About
              </label>
              <input
                type="text"
                name="about"
                id="about"
                placeholder="Enter Bio Details"
                className="px-2 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}
                {...register("about", { required: true })}
                defaultValue={user?.additionalDetails?.about}
              />
              {errors.about && (
                <span className="-mt-1 text-[12px] text-red-500">
                  Please enter your About.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              navigate("/dashboard/my-profile");
            }}
            className="cursor-pointer rounded-md py-2 px-5 font-semibold border"
            style={{
              backgroundColor: darkMode ? '#374151' : '#f3f4f6',
              borderColor: darkMode ? '#4b5563' : '#d1d5db',
              color: darkMode ? '#ffffff' : '#1f2937'
            }}
          >
            Cancel
          </button>
          <IconBtn type="submit" text="Save" />
        </div>
      </form>
    </>
  );
}