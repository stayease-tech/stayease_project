import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollYProgress } = useScroll();
  
  const heroImages = [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  ];

  const properties = [
    {
      title: 'STAYEASE - HARMONIA',
      location: 'Electronic City, Bengaluru',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    },
    {
      title: 'STAYEASE - HARMONIA',
      location: 'Electronic City, Bengaluru',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    },

    {
      title: 'STAYEASE - HARMONIA',
      location: 'Electronic City, Bengaluru',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  
  // ScrollFadeIn Component
  const ScrollFadeIn = ({ children, direction = "up", delay = 0, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { 
      once: true, // This ensures animation only happens ONCE
      amount: 0.2, // Require 20% of element to be visible
      margin: "-50px" // Trigger animation 50px before element enters viewport
    });
    
    const variants = {
      up: { 
        initial: { opacity: 0, y: 30 }, 
        animate: { opacity: 1, y: 0 } 
      },
      left: { 
        initial: { opacity: 0, x: -30 }, 
        animate: { opacity: 1, x: 0 } 
      },
      right: { 
        initial: { opacity: 0, x: 30 }, 
        animate: { opacity: 1, x: 0 } 
      },
      scale: { 
        initial: { opacity: 0, scale: 0.95 }, 
        animate: { opacity: 1, scale: 1 } 
      }
    };
    
    return (
      <motion.div
        ref={ref}
        initial={variants[direction].initial}
        animate={isInView ? variants[direction].animate : variants[direction].initial}
        transition={{ 
          duration: 0.6, 
          delay, 
          ease: [0.25, 0.1, 0.25, 1] // Custom easing for smoother animation
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="bg-[#1c1c1c] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-[#1c1c1c] mt-20 min-h-screen flex">
        {/* Left Side - Content Area */}
        <div className="w-full lg:w-2/5 bg-[#1c1c1c] flex flex-col justify-between min-h-screen">
          {/* Tagline */}
          <motion.div 
            className="px-4 sm:px-6 lg:px-12 pt-12 lg:pt-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-xs sm:text-sm font-medium tracking-[0.3em] text-gray-300 uppercase">
              - LUXURY WITHIN REACH
            </p>
          </motion.div>

          {/* Main Heading */}
          <motion.div 
            className="px-4 sm:px-6 lg:px-12 flex-grow flex items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[0.9] font-light">
              <motion.span 
                className="text-white block"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                EXPERIENCE 
              </motion.span>
              <motion.span 
                className="text-[#eba312] italic font-light block"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                co-living
              </motion.span>
              <motion.span 
                className="text-white font-bold block"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                LIKE NEVER BEFORE
              </motion.span>
            </h1>
          </motion.div>

          {/* CTA Button */}
          <motion.div 
            className="px-4 sm:px-6 lg:px-12 mb-8 flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <motion.button 
              className="border border-[#eba312] text-white hover:bg-[#eba312] px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              MAKE AN ENQUIRY
            </motion.button>
          </motion.div>

          {/* Bottom Section with Image and Description */}
          <motion.div 
            className="flex h-48 sm:h-56 lg:h-64"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <div className="w-3/5">
              <motion.img 
                src='https://images.unsplash.com/photo-1631679706909-1844bbd07221?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
                alt="Preview" 
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="w-2/5 bg-[#eba312] flex items-center px-4 sm:px-6 lg:px-8">
              <p className="text-white text-sm sm:text-base lg:text-lg leading-relaxed">
                Experience a new way of living with a vibrant community and all-inclusive amenities designed for modern lifestyles.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Image Carousel */}
        <div className="hidden lg:flex lg:w-3/5 flex-col min-h-screen">
          {/* Main Image */}
          <div className="overflow-hidden flex-1">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSlide}
                src={heroImages[currentSlide]} 
                alt="Hero image" 
                className="w-full h-[90%] object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7 }}
              />
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="flex space-x-3 items-center justify-center w-full py-4 mt-5">
              {heroImages.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-[#eba312]' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </div>
            
          {/* Navigation Controls */}
          <div className="bg-white border-t border-gray-200">
            <div className="flex">
              <motion.button 
                onClick={prevSlide}
                className="flex-1 flex items-center justify-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors py-4 sm:py-6 border-r border-gray-200"
                whileHover={{ backgroundColor: "#f9fafb" }}
              >
                <div className="w-6 sm:w-8 h-px bg-gray-600"></div>
                <span className="text-xs uppercase tracking-wider font-medium">PREVIOUS IMAGE</span>
              </motion.button>
              
              <motion.button 
                onClick={nextSlide}
                className="flex-1 flex items-center justify-center space-x-3 text-gray-600 hover:text-gray-800 transition-colors py-4 sm:py-6"
                whileHover={{ backgroundColor: "#f9fafb" }}
              >
                <span className="text-xs uppercase tracking-wider font-medium">NEXT IMAGE</span>
                <div className="w-6 sm:w-8 h-px bg-gray-600"></div>
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Text Banner */}
      <div className="bg-[#1c1c1c] border-t border-b border-gray-600 py-6 lg:py-8 overflow-hidden">
        <motion.div 
          className="whitespace-nowrap flex"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-light text-white tracking-[0.3em] mx-12 lg:mx-12">
                ABOUT STAYEASE
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl text-[#eba312] mx-12 lg:mx-12">✱</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* About Section */}
      <section className="bg-[#1c1c1c] border-b border-gray-600">
        <div className="grid lg:grid-cols-3 min-h-screen">
          
          {/* Left Image */}
          <ScrollFadeIn direction="left" className="border-r border-gray-600 p-4 sm:p-6 lg:p-8">
            <div className="w-full h-[60vh] lg:h-[80vh] overflow-hidden">
              <motion.img 
                src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="People in meeting" 
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </ScrollFadeIn>

          {/* Center Content */}
          <ScrollFadeIn direction="up" className="border-r border-gray-600 flex flex-col justify-center items-center px-6 sm:px-8 lg:px-12 xl:px-20 py-12 lg:py-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-light text-white mb-8 lg:mb-16 leading-tight text-center tracking-wide">
              OUR STORY
            </h2>
            
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed mb-8 lg:mb-16 text-center max-w-2xl">
              At Stayease, We Redefine modern living with premium coliving spaces, luxury PG accommodations, and fully furnished homestays & shortstays in prime locations across Bangalore. Whether you're a working professional, student, or traveler, our spaces blend comfort, style, and Stayease community to create unforgettable living experiences.
            </p>
            
            <motion.button 
              className="border border-[#eba312] text-white hover:bg-[#eba312] hover:text-black px-8 sm:px-10 lg:px-12 py-4 lg:py-5 text-xs sm:text-sm font-medium uppercase tracking-[0.3em] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              READ MORE
            </motion.button>
          </ScrollFadeIn>

          {/* Right Content with Circular Text */}
          <ScrollFadeIn direction="right" className="flex items-center justify-center py-12 lg:py-20 px-6 lg:px-8">
            <div className="relative w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72">
              <motion.div 
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                <svg className="w-full h-full" viewBox="0 0 288 288">
                  <defs>
                    <path
                      id="circle-path"
                      d="M 144, 144 m -120, 0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0"
                    />
                  </defs>
                  <text className="text-xs fill-[#eba312] font-medium tracking-[0.2em] uppercase">
                    <textPath href="#circle-path" startOffset="0%">
                      WHERE QUALITY • MEETS COMFORT • WHERE QUALITY • MEETS COMFORT • 
                    </textPath>
                  </text>
                </svg>
              </motion.div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 sm:w-36 lg:w-44 h-32 sm:h-36 lg:h-44 overflow-hidden">
                  <motion.img 
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Modern workspace" 
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="bg-[#1c1c1c] mt-12 lg:mt-20 border-y border-gray-600">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          
          {/* Left Section with Featured Properties Text */}
          <ScrollFadeIn direction="left" className="border-r border-gray-600 flex items-center justify-center p-6 lg:p-8">
            <div className="relative">
              <div className="w-48 sm:w-56 lg:w-64 h-48 sm:h-56 lg:h-64 border border-gray-600 rounded-full flex items-center justify-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white text-center leading-tight tracking-wide">
                  FEATURED<br />PROPERTIES
                </h2>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Property Cards */}
          {properties.map((property, index) => (
            <ScrollFadeIn 
              key={index}
              direction="up"
              delay={index * 0.1}
              className={`${index < 3 ? 'border-r border-gray-600' : ''} flex flex-col`}
            >
              <div className="flex-1 p-6 lg:p-8 flex flex-col">
                <div className="bg-gray-200 h-64 sm:h-72 lg:h-80 mb-6 overflow-hidden">
                  <motion.img 
                    src={property.image}
                    alt={`StayEase property ${index}`}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-light text-white mb-2 tracking-wide">
                    {property.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1">{property.location}</p>
                  <p className="text-gray-400 text-sm">
                    {property.price} / month
                  </p>
                </div>
              </div>
              
              <div className="p-6 pt-0">
                <motion.button 
                  className="w-full border border-[#eba312] text-white hover:bg-[#eba312] hover:text-black py-3 lg:py-4 text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  BOOK NOW
                </motion.button>
              </div>
            </ScrollFadeIn>
          ))}
        </div>

        {/* Navigation Controls */}
        <ScrollFadeIn direction="up" className="border-y border-gray-600 flex justify-between items-center px-6 lg:px-8 py-4 lg:py-6">
          <motion.button 
            className="flex items-center space-x-4 text-gray-400 hover:text-white transition-colors group"
            whileHover={{ x: -3 }}
          >
            <div className="w-10 lg:w-12 h-10 lg:h-12 border border-gray-600 rounded-full flex items-center justify-center group-hover:border-[#eba312] transition-colors">
              <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-medium">PREVIOUS</span>
          </motion.button>

          <motion.button 
            className="flex items-center space-x-4 text-gray-400 hover:text-white transition-colors group"
            whileHover={{ x: 3 }}
          >
            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-medium">NEXT</span>
            <div className="w-10 lg:w-12 h-10 lg:h-12 border border-gray-600 rounded-full flex items-center justify-center group-hover:border-[#eba312] transition-colors">
              <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        </ScrollFadeIn>
      </section>

      {/* Accommodations Section */}
      <section className="bg-[#1c1c1c] -mt-px">
        <ScrollFadeIn direction="up" className="text-center py-12 lg:py-16 px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-6 lg:mb-8 tracking-wide">
            OUR ACCOMMODATIONS
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-5xl mx-auto">
            We understand that everyone has different needs when it comes to living space. That's why we offer a variety of accommodation options to suit your style and budget. No matter which option you choose, you'll benefit from all the advantages of the Stayease living experience.
          </p>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[60vh] lg:min-h-screen">
          
          {/* Left Side Image */}
          <ScrollFadeIn direction="left" className="lg:col-span-1 relative">
            <motion.img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Modern living space"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5 }}
            />
          </ScrollFadeIn>

          {/* Center Large Image */}
          <ScrollFadeIn direction="up" className="lg:col-span-3 relative">
            <motion.img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Private room with balcony"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5 }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 px-8 sm:px-10 lg:px-12 py-4 lg:py-6">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-black tracking-[0.3em] text-center">
                  PRIVATE WITH BALCONY
                </h3>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Right Side Image */}
          <ScrollFadeIn direction="right" className="lg:col-span-1 relative">
            <motion.img 
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Building exterior"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5 }}
            />
          </ScrollFadeIn>
        </div>

        {/* Navigation Controls */}
        <ScrollFadeIn direction="up" className="flex justify-center items-center py-8 lg:py-12 space-x-8">
          <div className="flex items-center space-x-4">
            <motion.button 
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex space-x-1">
                <div className="w-1 h-6 lg:h-8 bg-current"></div>
                <div className="w-1 h-6 lg:h-8 bg-current"></div>
                <div className="w-1 h-6 lg:h-8 bg-current"></div>
              </div>
            </motion.button>
            
            <div className="w-12 lg:w-16 h-px bg-gray-600"></div>
            
            <motion.button 
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 lg:w-8 h-6 lg:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </motion.button>
          </div>
        </ScrollFadeIn>
      </section>

      {/* Services Section */}
      <section className="bg-[#1c1c1c] py-12 lg:py-20 -mt-px border-b border-gray-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollFadeIn direction="up" className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-[0.2em] mb-4">
              OUR SERVICES
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto">
              Quick access to resident services and support
            </p>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Service 1: Resident Login */}
            <ScrollFadeIn direction="left" delay={0} className="relative group">
              <div className="relative border border-gray-600 p-8 lg:p-10 bg-gradient-to-br from-[#eba312]/5 to-transparent hover:border-[#eba312] transition-all duration-300">
                <div className="absolute top-0 left-0 w-0 h-0 border-l-4 border-t-4 border-[#eba312] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-4 border-b-4 border-[#eba312] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <motion.div 
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-[#eba312] flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 lg:w-10 h-8 lg:h-10 text-[#eba312]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </motion.div>
                
                <h3 className="text-xl sm:text-2xl font-light text-white text-center mb-3 tracking-wide">
                  RESIDENT LOGIN
                </h3>
                <p className="text-gray-400 text-center text-sm mb-6">
                  Access your account, view rent history, KYC status, and manage your profile
                </p>
                
                <Link to="/resident-login">
                  <motion.button 
                    className="w-full border border-[#eba312] text-[#eba312] hover:bg-[#eba312] hover:text-black py-3 lg:py-4 text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    SIGN IN
                  </motion.button>
                </Link>
              </div>
            </ScrollFadeIn>

            {/* Service 2: Property Enquiry */}
            <ScrollFadeIn direction="up" delay={0.1} className="relative group">
              <div className="relative border border-gray-600 p-8 lg:p-10 hover:border-[#eba312] transition-all duration-300">
                <div className="absolute top-0 left-0 w-0 h-0 border-l-4 border-t-4 border-[#eba312] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-4 border-b-4 border-[#eba312] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <motion.div 
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-gray-600 flex items-center justify-center mb-6 mx-auto group-hover:border-[#eba312] group-hover:scale-110 transition-all"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 lg:w-10 h-8 lg:h-10 text-gray-400 group-hover:text-[#eba312] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                
                <h3 className="text-xl sm:text-2xl font-light text-white text-center mb-3 tracking-wide">
                  PROPERTY ENQUIRY
                </h3>
                <p className="text-gray-400 text-center text-sm mb-6">
                  Have questions about a property? Send us your enquiry and we'll respond quickly
                </p>
                
                <motion.button 
                  className="w-full border border-gray-600 text-white hover:border-[#eba312] hover:text-[#eba312] py-3 lg:py-4 text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const enquirySection = document.querySelector('[data-enquiry-section]');
                    if (enquirySection) enquirySection.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  SEND ENQUIRY
                </motion.button>
              </div>
            </ScrollFadeIn>

            {/* Service 3: Contact Support */}
            <ScrollFadeIn direction="right" delay={0.2} className="relative group">
              <div className="relative border border-gray-600 p-8 lg:p-10 hover:border-[#eba312] transition-all duration-300">
                <div className="absolute top-0 left-0 w-0 h-0 border-l-4 border-t-4 border-[#eba312] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-4 border-b-4 border-[#eba312] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <motion.div 
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-2 border-gray-600 flex items-center justify-center mb-6 mx-auto group-hover:border-[#eba312] group-hover:scale-110 transition-all"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-8 lg:w-10 h-8 lg:h-10 text-gray-400 group-hover:text-[#eba312] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </motion.div>
                
                <h3 className="text-xl sm:text-2xl font-light text-white text-center mb-3 tracking-wide">
                  CONTACT SUPPORT
                </h3>
                <p className="text-gray-400 text-center text-sm mb-6">
                  Need help? Connect with our support team for assistance
                </p>
                
                <motion.a 
                  href="mailto:support@stayease.com"
                  className="block w-full border border-gray-600 text-white text-center hover:border-[#eba312] hover:text-[#eba312] py-3 lg:py-4 text-sm font-medium uppercase tracking-[0.2em] transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  GET HELP
                </motion.a>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-[#1c1c1c] py-12 lg:py-20 -mt-px">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollFadeIn direction="up" className="relative border border-gray-600 p-8 sm:p-12 lg:p-16">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-6 lg:w-8 h-6 lg:h-8 border-l-2 border-t-2 border-gray-600 -translate-x-px -translate-y-px"></div>
            <div className="absolute top-0 right-0 w-6 lg:w-8 h-6 lg:h-8 border-r-2 border-t-2 border-gray-600 translate-x-px -translate-y-px"></div>
            <div className="absolute bottom-0 left-0 w-6 lg:w-8 h-6 lg:h-8 border-l-2 border-b-2 border-gray-600 -translate-x-px translate-y-px"></div>
            <div className="absolute bottom-0 right-0 w-6 lg:w-8 h-6 lg:h-8 border-r-2 border-b-2 border-gray-600 translate-x-px translate-y-px"></div>

            <div className="text-center mb-16 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-[0.2em]">
                OUR OFFERINGS & AMENITIES
              </h2>
            </div>

            {/* Amenities Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-8 lg:gap-8">
              
              {/* Amenity items */}
              {[
                { title: "PRIME", subtitle: "LOCATIONS", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
                { title: "FULLY", subtitle: "FURNISHED", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" },
                { title: "PARKING", subtitle: "SPACE", icon: "M19 9l-7 7-7-7 M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4" },
                { title: "REGULAR", subtitle: "HOUSEKEEPING", icon: "M19 14l-7 7m0 0l-7-7m7 7V3" },
                { title: "FREE", subtitle: "WIFI", icon: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" },
                { title: "MODULAR", subtitle: "KITCHEN", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
                { title: "CCTV", subtitle: "SURVEILLANCE", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
                { title: "WASHING", subtitle: "MACHINE", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" },
                { title: "WORKSPACE", subtitle: "SETUP", icon: "M2 4h20v16H2V4zm2 2v12h16V6H4zm2 2h.01M10 8h.01M14 8h.01" },
                { title: "COMMON", subtitle: "AREA", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                { title: "DIGITAL LOCK", subtitle: "ACCESS", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
                { title: "WATER", subtitle: "PURIFIER", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
                { title: "OTT", subtitle: "SUBSCRIPTIONS", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                { title: "COMMUNITY", subtitle: "INTERCOM", icon: "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 6a9 9 0 1018 0 9 9 0 00-18 0zm9-1a1 1 0 100-2 1 1 0 000 2z" }
              ].map((amenity, index) => (
                <ScrollFadeIn 
                  key={index}
                  direction="up"
                  delay={index * 0.05}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div 
                    className="w-16 sm:w-18 lg:w-20 h-16 sm:h-18 lg:h-20 border-2 border-gray-600 rounded-full flex items-center justify-center mb-4 lg:mb-6 group hover:border-[#eba312] transition-colors"
                    whileHover={{ scale: 1.05, borderColor: "#f97316" }}
                  >
                    <svg className="w-8 sm:w-9 lg:w-10 h-8 sm:h-9 lg:h-10 text-gray-400 group-hover:text-[#eba312] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={amenity.icon} />
                    </svg>
                  </motion.div>
                  <h3 className="text-[#eba312] text-xs sm:text-sm font-medium tracking-wider uppercase mb-1">{amenity.title}</h3>
                  <p className="text-[#eba312] text-xs sm:text-sm font-medium tracking-wider uppercase">{amenity.subtitle}</p>
                </ScrollFadeIn>
              ))}
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-[#1c1c1c] py-12 lg:py-20 -mt-px">
        <ScrollFadeIn direction="up" className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-[0.3em]">
            GALLERY
          </h2>
        </ScrollFadeIn>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-8 items-center min-h-[50vh] lg:min-h-[70vh]">
            
            {/* Left Side Images */}
            <ScrollFadeIn direction="left" className="lg:col-span-1 space-y-6 lg:space-y-8">
              <div className="aspect-square overflow-hidden">
                <motion.img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Gallery image 1"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="aspect-square overflow-hidden">
                <motion.img 
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Gallery image 2"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </ScrollFadeIn>

            {/* Vertical Text */}
            <ScrollFadeIn direction="up" className="lg:col-span-1 flex items-center justify-center py-8 lg:py-0">
              <div className="transform -rotate-90">
                <p className="text-[#eba312] text-xs sm:text-sm font-medium tracking-[0.3em] uppercase">
                  OUR VISION - LUXURY LIFESTYLE WITH AFFORDABLE RATES
                </p>
              </div>
            </ScrollFadeIn>

            {/* Center Main Image */}
            <ScrollFadeIn direction="up" delay={0.2} className="lg:col-span-3 relative">
              <div className="aspect-video overflow-hidden">
                <motion.img 
                  src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Main gallery image"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.5 }}
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white px-8 sm:px-10 lg:px-12 py-4 lg:py-6 bg-black/20 backdrop-blur-sm">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-white tracking-[0.4em] text-center">
                      STAYEASE
                    </h3>
                  </div>
                </div>
              </div>

              <motion.div 
                className="mt-6 lg:mt-8 bg-[#eba312] p-6 lg:p-8"
                whileHover={{ y: -1 }}
              >
                <p className="text-white text-base sm:text-lg leading-relaxed">
                  Peek into the world of Stayease through our gallery! We invite you to envision yourself living in complete comfort, connection, and convenience. Here, you'll discover the spaces that make up our unique co-living experience.
                </p>
              </motion.div>
            </ScrollFadeIn>

            {/* Right Side Image */}
            <ScrollFadeIn direction="right" className="lg:col-span-1 space-y-6 lg:space-y-8">
              <div className="aspect-[3/4] overflow-hidden relative">
                <motion.img 
                  src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Gallery image 3"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="absolute bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2">
                  <motion.button 
                    className="bg-black/80 backdrop-blur-sm text-white px-6 lg:px-8 py-3 lg:py-4 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] hover:bg-[#eba312] transition-all duration-300 border border-white hover:border-[#eba312]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    EXPLORE MORE
                  </motion.button>
                </div>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>
    
      {/* Contact/Enquiry Section - WHITE BACKGROUND */}
      <section className="w-full bg-white py-12 lg:py-20" data-enquiry-section>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[60vh] lg:min-h-[80vh]">
            
            {/* Left Side - Text Content */}
            <ScrollFadeIn direction="left" className="space-y-8 lg:space-y-12">
              <div className="relative">
                <div className="absolute -top-3 lg:-top-4 -left-3 lg:-left-4 w-12 lg:w-16 h-12 lg:h-16 border-l-2 border-t-2 border-[#eba312]"></div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-6 lg:mb-8 tracking-wide leading-tight">
                  SEND US YOUR ENQUIRY
                </h2>
              </div>

              <div className="space-y-6 lg:space-y-8">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-900 leading-relaxed">
                  Connect with StayEase
                </h3>
                
                <p className="text-lg sm:text-xl lg:text-2xl font-light text-gray-700 leading-relaxed">
                  Drop your concern, query or feedback
                </p>
              </div>

              <div className="relative pt-12 lg:pt-16">
                <div className="absolute -bottom-3 lg:-bottom-4 -left-3 lg:-left-4 w-12 lg:w-16 h-12 lg:h-16 border-l-2 border-b-2 border-[#eba312]"></div>
              </div>
            </ScrollFadeIn>

            {/* Right Side - Contact Form */}
            <ScrollFadeIn direction="right" className="relative">
              <div className="relative bg-white p-8 sm:p-10 lg:p-12 border-2 border-[#eba312] shadow-xl">
                {/* Corner decorations */}
                <div className="absolute -top-2 -left-2 w-6 lg:w-8 h-6 lg:h-8 border-l-2 border-t-2 border-[#eba312]"></div>
                <div className="absolute -top-2 -right-2 w-6 lg:w-8 h-6 lg:h-8 border-r-2 border-t-2 border-[#eba312]"></div>
                <div className="absolute -bottom-2 -left-2 w-6 lg:w-8 h-6 lg:h-8 border-l-2 border-b-2 border-[#eba312]"></div>
                <div className="absolute -bottom-2 -right-2 w-6 lg:w-8 h-6 lg:h-8 border-r-2 border-b-2 border-[#eba312]"></div>

                <div className="space-y-6 lg:space-y-8">
                  {/* Form Fields */}
                  {[
                    { label: "Name", type: "text", border: "border-[#eba312]" },
                    { label: "Email", type: "email", border: "border-gray-300" },
                    { label: "Phone", type: "tel", border: "border-gray-300" },
                    { label: "Your Requirements", type: "textarea", border: "border-gray-300" }
                  ].map((field, index) => (
                    <ScrollFadeIn 
                      key={index}
                      direction="up"
                      delay={index * 0.05}
                      className="space-y-2 lg:space-y-3"
                    >
                      <label className="block text-gray-900 text-base lg:text-lg font-light">{field.label}</label>
                      <div className="relative">
                        {field.type === "textarea" ? (
                          <textarea 
                            rows="2"
                            className={`w-full bg-white text-gray-900 text-lg lg:text-xl font-light pb-3 border-b-2 ${field.border} focus:outline-none focus:border-[#eba312] transition-colors resize-none`}
                          />
                        ) : (
                          <input 
                            type={field.type}
                            className={`w-full bg-white text-gray-900 text-lg lg:text-xl font-light pb-3 border-b-2 ${field.border} focus:outline-none focus:border-[#eba312] transition-colors`}
                          />
                        )}
                      </div>
                    </ScrollFadeIn>
                  ))}

                  {/* Submit Button */}
                  <ScrollFadeIn direction="up" delay={0.3} className="pt-6 lg:pt-8">
                    <motion.button 
                      className="w-full border border-[#eba312] text-white bg-[#eba312] hover:bg-white hover:text-[#eba312] py-3 lg:py-4 text-base lg:text-lg font-medium uppercase tracking-[0.2em] transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      SEND ENQUIRY
                    </motion.button>
                  </ScrollFadeIn>
                </div>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Resident Login CTA Section */}
      <section className="w-full bg-gradient-to-r from-[#eba312] to-[#d4a017] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4 lg:mb-6">
            Already a Resident?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl font-light text-white/90 mb-8 lg:mb-10">
            Access your portal, view rent history, KYC status, and manage your account
          </p>
          <Link to="/resident-login">
            <motion.button 
              className="inline-block bg-white text-[#eba312] px-8 lg:px-12 py-4 lg:py-5 text-base lg:text-lg font-semibold uppercase tracking-[0.2em] hover:bg-gray-100 transition-all duration-300 border-2 border-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In to Your Account
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;