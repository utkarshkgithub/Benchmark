import {  useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { updateDisplayPicture } from "../../../../services/opretions/Settings"
import IconBTN from "../../../common/IconBTN"

export default function ChangeProfilePicture() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.auth)
  const { darkMode } = useSelector((state) => state.theme)
  const dispatch = useDispatch()
  // console.log("11>>11:-",user);
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)

  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file =  e.target.files[0] 
    //// console.log(file)
    if (file) {
      setImageFile(file)
      previewFile(file)
    }
  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  const handleFileUpload = () => {
    try {
      //// console.log("uploading...")
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", imageFile);
      dispatch(updateDisplayPicture(token, formData))
        .then(() => {
          setLoading(false)
          setImageFile(null)
          setPreviewSource(null)
        })
        .catch((error) => {
          console.error("Error updating profile picture:", error)
          setLoading(false)
        })
    } catch (error) {
     // console.log("ERROR MESSAGE - ", error.message)
      setLoading(false)
    }
  }

  return (
  
  <div className="flex items-center justify-between rounded-md p-4" style={{
    backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
    borderColor: darkMode ? '#374151' : '#e5e7eb'
  }}>
    <div className="flex gap-4">
      <img
        src={previewSource || user?.image || "/default-avatar.png"}
        alt={`profile-${user?.firstName || "avatar"}`}
        className="w-24 h-24 rounded-full object-cover"
      />
      <div className="space-y-2">
        <p className="font-medium" style={{
          color: darkMode ? '#ffffff' : '#1f2937'
        }}>Change Profile Picture</p>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/gif, image/jpeg"
          />
          <button
            onClick={handleClick}
            disabled={loading}
            className="rounded-md py-1 px-3 hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: darkMode ? '#374151' : '#6b7280',
              color: '#ffffff'
            }}
          >
            Select
          </button>

          <IconBTN
            active="true"
            text={loading ? "Uploading..." : ""}
            onClick={handleFileUpload}
            disabled={loading || !previewSource}
          >
            {loading ? (
              <span className="animate-pulse"></span>
            ) : (
              <div className="flex items-center gap-1">
                <p>Upload</p>
                <FiUpload className="text-lg" />
              </div>
            )}
          </IconBTN>
        </div>
      </div>
    </div>
  </div>

  )
}