import Location from "../models/Location.js";
import User from "../models/User.js";

// Create a new location
export const createLocation = async (req, res) => {
  try {
    const { name, address, coordinates } = req.body;

    if (!name || !address || !coordinates) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const { latitude, longitude } = coordinates;
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return res.status(400).json({ success: false, message: "Invalid coordinates" });
    }

    const createdBy = req.user?.id || null;

    const location = await Location.create({
      name: name.trim(),
      address: address.trim(),
      coordinates: { latitude, longitude },
      createdBy,
    });

    return res.status(201).json({ success: true, message: "Location created", data: location });
  } catch (error) {
    console.error("createLocation error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Fetch all locations (admin or general)
export const fetchLocations = async (req, res) => {
  try {
    const locations = await Location.find({}).populate("createdBy", "firstName lastName email").lean();
    return res.status(200).json({ success: true, data: locations });
  } catch (error) {
    console.error("fetchLocations error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
