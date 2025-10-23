import { combineReducers} from "@reduxjs/toolkit";
import authReducer from "../Slices/authSlice.js"
import profileReducer from '../Slices/profileSlice.js'
import themeReducer from '../Slices/themeSlice.js'
// import cartReducer from '../Slices/cartSlice'
// import courseReducer from '../Slices/courseSlice'
// import viewCourseReducer from '../Slices/viewCourseSlice'
export const rootReducer = combineReducers({
    auth: authReducer,
    profile:profileReducer,
    theme: themeReducer,
    // cart:cartReducer,
    // course:courseReducer,
    // viewCourse:viewCourseReducer,
});