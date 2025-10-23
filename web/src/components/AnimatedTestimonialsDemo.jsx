import { AnimatedTestimonials } from "./ui/animated-testimonials";
import studentEnrolledImage from '../assets/Studentenrollcount.png'
import uptime99 from '../assets/uptime99.png'
import Supportsimage from '../assets/24Supports.png'
import activeInstructor from '../assets/ActiveInstructor.png'

export function AnimatedTestimonialsDemo() {

const stats = [
        { number: "2", label: "", },
        { number: "99.9%", label: "",},
        { number: "24/7", label: ""}
    ]

  const testimonials = [
    {
      quote:"This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Students Enrolled",
      designation: "studentEnrolledImage",
      src: studentEnrolledImage,
    },
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Active Instructors",
      designation: "Operations Director at CloudScale",
      src: activeInstructor,
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "System Uptime",
      designation: "Engineering Lead at DataPro",
      src: uptime99,
    },
    {
      quote:
        "The scalability and performance have been game-changing for our organization. Highly recommend to any growing business.",
      name: "Support Available",
      designation: "VP of Technology at FutureNet",
      src: Supportsimage,
    },
  ];
  return <AnimatedTestimonials testimonials={testimonials} />;
}
