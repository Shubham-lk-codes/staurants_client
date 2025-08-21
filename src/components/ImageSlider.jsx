import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageSlider() {
  const images = [
    "/images/main.jpg",
    "/images/food1.jpg",
    "/images/food2.jpg",
    "/images/food3.jpg",
    "/images/food4.jpg",
    "/images/food5.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto change every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="flex justify-center relative w-full h-[55vh] overflow-hidden rounded-3xl shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt="Slider Food"
          className="w-full h-full object-cover absolute"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </div>
  );
}
