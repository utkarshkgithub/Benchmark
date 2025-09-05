import { ACCOUNT_TYPE } from "../utils/constants";
export const sidebarLinks = [
  {
    id: 1,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
  {
    id: 2,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 3,
    name: "Dashboard",
    path: "/dashboard/student",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscDashboard",
  },
  {
    id: 4,
    name: "Dashboard",
    path: "/dashboard/admin",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscDashboard",
  },
  {
    id: 5,
    name: "My Subjects",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 4,
    name: "Take Attendance",
    path: "/dashboard/take-attendance",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },
//   {
//     id: 5,
//     name: "Enrolled Courses",
//     path: "/dashboard/enrolled-courses",
//     type: ACCOUNT_TYPE.STUDENT,
//     icon: "VscArchive",
//   },
//   {
//     id: 7,
//     name: "Wishlist",
//     path: "/dashboard/wishlist",
//     type: ACCOUNT_TYPE.STUDENT,
//     icon: "VscBookmark",
//   },
  
//   {
//     id: 8,
//     name: "Courses",
//     path: "/dashboard/all-courses",
//     type: ACCOUNT_TYPE.STUDENT,
//     icon: "VscMortarBoard",
//   },
];