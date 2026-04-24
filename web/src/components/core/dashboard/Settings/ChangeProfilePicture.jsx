import { useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { updateDisplayPicture } from "../../../../services/opretions/Settings"

export default function ChangeProfilePicture() {
  const { token, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(null)

  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
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

  const handleFileUpload = async () => {
    if (!imageFile) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", imageFile)
      await dispatch(updateDisplayPicture(token, formData))
      setImageFile(null)
      setPreviewSource(null)
    } catch (error) {
      console.error("Error updating profile picture:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl border p-4 md:p-5"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--surface-secondary)"
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={previewSource || user?.image || "/default-avatar.png"}
            alt={`profile-${user?.firstName || "avatar"}`}
            className="h-20 w-20 rounded-full border object-cover"
            style={{ borderColor: "var(--border-subtle)" }}
          />

          <div>
            <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Change Profile Picture
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Supported formats: PNG, JPG, GIF
            </p>
            {imageFile && (
              <p className="mt-1 text-xs" style={{ color: "var(--cb-link)" }}>
                Selected: {imageFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
            className={`cb-pill-btn cb-pill-secondary !min-h-[40px] !px-4 !py-2 ${loading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            Choose File
          </button>

          <button
            onClick={handleFileUpload}
            disabled={loading || !previewSource}
            className={`cb-pill-btn cb-pill-primary !min-h-[40px] !px-4 !py-2 ${
              loading || !previewSource ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <span className="flex items-center gap-2">
              {loading ? "Uploading..." : "Upload Photo"}
              {!loading && <FiUpload className="text-base" />}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}