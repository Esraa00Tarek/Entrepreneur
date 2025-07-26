import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import {Store,CheckCircle,Users, TrendingUp, Book, MessageCircle,Menu,ArrowRight,Star,ChevronDown, Mail,Phone, MapPin} from 'lucide-react';

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50;
      setIsNavbarScrolled(window.scrollY > scrollThreshold);
    };

    const animateElements = document.querySelectorAll('.fade-in, .fade-left, .fade-right');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    animateElements.forEach(element => {
      observer.observe(element);
    });

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      animateElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="scroll-smooth font-georgia" style={{fontFamily: 'Georgia, serif'}}>
      <style>{`
        * {
          font-family: 'Georgia', serif;
        }
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-left {
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .fade-left.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .fade-right {
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .fade-right.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .section-card:hover,
        .app-button:hover {
          transform: scale(1.05);
          transition: transform 0.3s ease;
        }
        @media (max-width: 1024px) {
          .navbar-nav-mobile {
            display: none;
          }
          .md\\:grid-cols-2, .md\\:grid-cols-3 {
            grid-template-columns: 1fr;
          }
          .text-4xl {
            font-size: 2rem;
          }
          .text-5xl {
            font-size: 2.5rem;
          }
          .text-3xl {
            font-size: 1.875rem;
          }
          .text-2xl {
            font-size: 1.5rem;
          }
          .text-lg {
            font-size: 1rem;
          }
          .text-base {
            font-size: 0.875rem;
          }
          .max-w-7xl {
            max-width: 100%;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .max-w-5xl {
            max-width: 100%;
          }
          .max-w-3xl {
            max-width: 100%;
          }
        }
        @media (max-width: 768px) {
          #hero {
            background-position: center center;
            background-size: cover;
            background-repeat: no-repeat;
            min-height: 100vh;
          }
          #hero .hero-bg-image {
            object-position: center center;
            object-fit: cover;
            width: 100%;
            height: 100%;
          }
          #hero .hero-overlay {
            background: linear-gradient(to bottom right, rgba(241, 250, 238, 0.95), rgba(168, 218, 220, 0.9), rgba(69, 123, 157, 0.95));
          }
        }
        @media (max-width: 640px) {
          .nav-button {
            width: 100%;
            text-align: center;
            padding: 0.5rem;
          }
          #mobile-menu a {
            font-size: 1rem;
          }
          .p-8 {
            padding: 1.5rem;
          }
          .py-24 {
            padding-top: 3rem;
            padding-bottom: 3rem;
          }
          .px-6 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .text-4xl {
            font-size: 1.75rem;
          }
          .text-5xl {
            font-size: 2rem;
          }
          #cta {
            margin: 2rem 1rem;
            padding: 2rem;
          }
          #cta h2 {
            font-size: 1.75rem;
          }
          #cta p {
            font-size: 1rem;
          }
          #cta a {
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
          }
          .number-circle {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1.25rem;
          }
          #hero {
            padding-top: 4.5rem;
            min-height: 100vh;
            background-position: center center;
            background-size: cover;
            background-repeat: no-repeat;
          }
          #hero .hero-bg-image {
            object-position: center center;
            object-fit: cover;
            width: 100%;
            height: 100%;
          }
          #hero .hero-overlay {
            background: linear-gradient(to bottom right, rgba(241, 250, 238, 0.95), rgba(168, 218, 220, 0.9), rgba(69, 123, 157, 0.95));
          }
          #download-app img {
            max-height: 200px;
          }
        }
        header {
          background-color: transparent !important;
          transition: background-color 0.3s ease;
        }
        header.navbar-scrolled {
          background-color: #457B9D !important;
        }
        header.navbar-scrolled .nav-link {
          color: #FFFFFF !important;
        }
        header.navbar-scrolled .nav-link:hover {
          color: #1D3557 !important;
        }
        header.navbar-scrolled .nav-button {
          border-color: #FFFFFF !important;
          color: #FFFFFF !important;
        }
        header.navbar-scrolled .nav-button:hover {
          background-color: #1D3557 !important;
          color: #FFFFFF !important;
        }
        header.navbar-scrolled .mobile-menu-icon {
          color: #FFFFFF !important;
        }
        #mobile-menu {
          background-color: #457B9D !important;
        }
        #mobile-menu .nav-link {
          color: #FFFFFF !important;
        }
        #mobile-menu .nav-link:hover {
          color: #F1FAEE !important;
        }
        #mobile-menu .nav-button {
          border-color: #FFFFFF !important;
          color: #FFFFFF !important;
        }
        #mobile-menu .nav-button:hover {
          background-color: #1D3557 !important;
          color: #FFFFFF !important;
        }
        #hero {
          background: linear-gradient(to bottom right, #F1FAEE, #A8DADC, #457B9D, #1D3557) !important;
        }
        body, section, footer {
          background-color: #FFFFFF !important;
          color: #1D3557 !important;
        }
        #about, #roles, #how-it-works, #faq, #contact, #features, #download-app {
          background-color: #FFFFFF !important;
        }
        .bg-section-card {
          background-color: #E6F0FA !important;
          border-color: #A8DADC !important;
        }
        #testimonials {
          background-color: #FFFFFF !important;
        }
        #cta {
          background: linear-gradient(to right, #A8DADC, #457B9D) !important;
          color: #FFFFFF !important;
        }
        #cta h2, #cta p {
          color: #FFFFFF !important;
        }
        footer {
          background-color: #457B9D !important;
        }
        footer a, footer p, footer span, footer div, footer i {
          color: #FFFFFF !important;
        }
        footer a:hover {
          color: #1D3557 !important;
        }
        footer .footer-divider {
          border-color: #A8DADC !important;
          width: 60% !important;
          margin: 1rem auto !important;
        }
        hr {
          border-color: #A8DADC !important;
        }
        .text-gray-300, .text-gray-600, .text-gray-700 {
          color: #1D3557 !important;
        }
        .text-white, .text-gray-900, .text-gray-800 {
          color: #1D3557 !important;
        }
        .text-indigo-400 {
          color: #457B9D !important;
        }
        .bg-indigo-600 {
          background-color: #457B9D !important;
        }
        .bg-indigo-600:hover {
          background-color: #1D3557 !important;
        }
        .border-gray-700, .border-gray-600, .border-gray-200 {
          border-color: #A8DADC !important;
        }
        .text-yellow-500 {
          color: #F1C40F !important;
        }
        .nav-button {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 2px solid #1D3557;
          font-size: 0.875rem;
          font-weight: 600;
          transition: background-color 0.3s, color 0.3s;
        }
        .nav-link {
          font-weight: bold;
          transition: color 0.3s;
        }
        /* Override for scrolled navbar */
        header.navbar-scrolled .nav-link {
          color: #FFFFFF !important;
        }
        header.navbar-scrolled .nav-link:hover {
          color: #1D3557 !important;
        }
        /* Override for non-scrolled navbar */
        header:not(.navbar-scrolled) .nav-link {
          color: #1D3557 !important;
        }
        header:not(.navbar-scrolled) .nav-link:hover {
          color:#FFFFFF  !important;
        }
        .nav-button:hover {
          background-color: #1D3557 !important;
          color: white !important;
        }
        .btn-section {
          background-color: #1D3557 !important;
          color: #FFFFFF !important;
        }
        .btn-section:hover {
          background-color: #2C4A76 !important;
        }
        .number-circle {
          background-color: #457B9D !important;
          color: #FFFFFF !important;
        }
        .title-line {
          width: 80px;
          height: 3px;
          background-color: #A8DADC;
          margin: 0.5rem auto 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .app-button {
          background-color: #1D3557 !important;
          color: #FFFFFF !important;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          transition: background-color 0.3s, transform 0.3s;
          text-align: center;
        }
        .app-button:hover {
          background-color: #2C4A76 !important;
        }
        #hero h1, #hero p, #hero a {
          color: #FFFFFF !important;
        }
        .hero-button {
          background-color: #1D3557 !important;
          color: #FFFFFF !important;
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          font-weight: 600;
          transition: background-color 0.3s, transform 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .hero-button:hover {
          background-color: #2C4A76 !important;
          transform: scale(1.05);
        }
        .cta-button {
          background-color: #1D3557 !important;
          color: #FFFFFF !important;
          padding: 0.75rem 2.5rem;
          border-radius: 9999px;
          font-weight: 600;
          transition: background-color 0.3s, transform 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cta-button:hover {
          background-color: #2C4A76 !important;
          transform: scale(1.05);
        }
        .download-section {
          background: linear-gradient(135deg, #E6F0FA 0%, #F1FAEE 100%);
          border: 2px solid #A8DADC;
          box-shadow: 0 10px 30px rgba(69, 123, 157, 0.1);
        }
        .download-content {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .store-button {
          transition: all 0.3s ease;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }
        .store-button:hover {
          transform: translateY(-2px) scale(1.05);
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
        }
        .qr-code {
          background: white;
          padding: 0.75rem;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border: 2px solid #A8DADC;
        }
        .phone-mockup {
          filter: drop-shadow(0 8px 25px rgba(69, 123, 157, 0.3));
          transform: rotate(-5deg);
          transition: transform 0.3s ease;
        }
        .phone-mockup:hover {
          transform: rotate(0deg) scale(1.05);
        }
        .animated-text {
          background: linear-gradient(45deg, #457B9D, #1D3557, #A8DADC, #457B9D);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
       footer a:hover svg,
footer .group:hover svg {
  color: #1D3557 !important;
}
        footer * {
          color: white !important;
        }
        footer a {
          color: white !important;
        }
        footer svg {
          color: white !important;
        }
        footer p, footer span, footer div {
          color: white !important;
        }
        footer .mb-6 a {
          color: white !important;
        }
        footer .space-x-4 a, footer .space-x-6 a {
          color: white !important;
        }
        footer .flex a {
          color: white !important;
        }
        footer a[href^="#"] {
          color: white !important;
        }
        footer a[href*="hero"], footer a[href*="about"], footer a[href*="features"], 
        footer a[href*="how-it-works"], footer a[href*="roles"], footer a[href*="testimonials"], 
        footer a[href*="faq"], footer a[href*="contact"] {
          color: white !important;
        }
        footer a[href*="facebook"]:hover, footer a[href*="instagram"]:hover, 
        footer a[href*="linkedin"]:hover, footer a[href*="x.com"]:hover {
          color: #1D3557 !important;
        }
        footer .text-sm {
          color: white !important;
        }
        footer .opacity-75 {
          color: white !important;
        }
        footer p:contains("©"), footer p:contains("Elevante"), footer p:contains("rights reserved") {
          color: white !important;
        }
        footer a:hover {
          color: #1D3557 !important;
        }
        footer .space-x-4 a:hover, footer .space-x-6 a:hover {
          color: #1D3557 !important;
        }
        footer .flex a:hover {
          color: #1D3557 !important;
        }
        footer a[href^="#"]:hover {
          color: #1D3557 !important;
        }
        footer a[href*="hero"]:hover, footer a[href*="about"]:hover, footer a[href*="features"]:hover, 
        footer a[href*="how-it-works"]:hover, footer a[href*="roles"]:hover, footer a[href*="testimonials"]:hover, 
        footer a[href*="faq"]:hover, footer a[href*="contact"]:hover {
          color: #1D3557 !important;
        }
        
        /* Swiper Carousel Styles */
        .testimonials-swiper {
          padding: 0;
          overflow: hidden;
        }
        .testimonials-swiper .swiper-slide {
          height: auto;
          display: flex;
        }
        .testimonials-swiper .swiper-slide > div {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .swiper-pagination {
          position: relative;
          bottom: 0;
          margin-top: 30px;
        }
        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background-color: #A8DADC;
          opacity: 0.5;
          transition: all 0.3s ease;
          margin: 0 6px;
        }
        .swiper-pagination-bullet-active {
          background-color: #457B9D;
          opacity: 1;
          transform: scale(1.2);
        }
        .custom-swiper-button {
          position: relative;
          top: 0;
          transform: none;
          width: 50px;
          height: 50px;
          margin: 0;
          z-index: 10;
        }
        .custom-swiper-button::after {
          display: none;
        }
        .swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .testimonials-swiper {
            padding: 10px 0;
          }
          .custom-swiper-button {
            width: 40px;
            height: 40px;
          }
          .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            margin: 0 4px;
          }
          .swiper-pagination {
            margin-top: 20px;
          }
        }
        @media (max-width: 640px) {
          .testimonials-swiper {
            padding: 5px 0;
          }
          .custom-swiper-button {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>
      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 py-2 sm:py-3 shadow-lg transition-colors duration-300 ${isNavbarScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <a href="#hero" className="text-2xl font-extrabold shrink-0" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}>
            <img 
              src={isNavbarScrolled ? "/logoname2.png" : "/namelogo.png"} 
              alt="Elevante Logo" 
              className="h-8 sm:h-9"
            />
          </a>
          <nav className="hidden xl:flex flex-1 justify-center items-center space-x-4 xl:space-x-6 text-[#1D3557] mx-12">
            <a href="#hero" className={`nav-link transition duration-300 text-sm xl:text-base ${isNavbarScrolled ? 'text-white hover:text-[#1D3557]' : 'text-[#1D3557] hover:text-[#457B9D]'}`} onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}>Home</a>
            <a href="#about" className={`nav-link transition duration-300 text-sm xl:text-base ${isNavbarScrolled ? 'text-white hover:text-[#1D3557]' : 'text-[#1D3557] hover:text-[#457B9D]'}`} onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }}>About</a>
            <a href="#features" className={`nav-link transition duration-300 text-sm xl:text-base ${isNavbarScrolled ? 'text-white hover:text-[#1D3557]' : 'text-[#1D3557] hover:text-[#457B9D]'}`} onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }}>Features</a>
            <a href="#how-it-works" className={`nav-link transition duration-300 text-sm xl:text-base ${isNavbarScrolled ? 'text-white hover:text-[#1D3557]' : 'text-[#1D3557] hover:text-[#457B9D]'}`} onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }}>How It Works</a>
            <a href="#roles" className={`nav-link transition duration-300 text-sm xl:text-base ${isNavbarScrolled ? 'text-white hover:text-[#1D3557]' : 'text-[#1D3557] hover:text-[#457B9D]'}`} onClick={(e) => { e.preventDefault(); scrollToSection('#roles'); }}>Users</a>
            <a href="#testimonials" className={`nav-link transition duration-300 text-sm xl:text-base ${isNavbarScrolled ? 'text-white hover:text-[#1D3557]' : 'text-[#1D3557] hover:text-[#457B9D]'}`} onClick={(e) => { e.preventDefault(); scrollToSection('#testimonials'); }}>Testimonials</a>
            <a href="#faq" className={`nav-link transition duration-300 text-sm xl:text-base ${isNavbarScrolled ? 'text-white hover:text-[#1D3557]' : 'text-[#1D3557] hover:text-[#457B9D]'}`} onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }}>FAQ</a>
            <a href="#contact" className={`nav-link transition duration-300 text-sm xl:text-base ${isNavbarScrolled ? 'text-white hover:text-[#1D3557]' : 'text-[#1D3557] hover:text-[#457B9D]'}`} onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}>Contact</a>
          </nav>
          <div className="hidden xl:flex space-x-4 shrink-0">
          <a href="/login" className="nav-button bg-transparent text-[#1D3557] hover:bg-[#1D3557] hover:text-white transition duration-300">Login</a>
          <a href="/select-role" className="nav-button bg-transparent text-[#1D3557] hover:bg-[#1D3557] hover:text-white transition duration-300">Register</a>
          </div>
          <div className="xl:hidden ml-auto">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`focus:outline-none mobile-menu-icon ${isNavbarScrolled ? 'text-white' : 'text-[#1D3557]'}`}
            >
              <Menu className="text-xl" />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div id="mobile-menu" className="xl:hidden px-4 pt-2 pb-4 space-y-1">
            <a href="#hero" className="block nav-link py-2" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}>Home</a>
            <a href="#about" className="block nav-link py-2" onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }}>About</a>
            <a href="#features" className="block nav-link py-2" onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }}>Features</a>
            <a href="#how-it-works" className="block nav-link py-2" onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }}>How It Works</a>
            <a href="#roles" className="block nav-link py-2" onClick={(e) => { e.preventDefault(); scrollToSection('#roles'); }}>Users</a>
            <a href="#testimonials" className="block nav-link py-2" onClick={(e) => { e.preventDefault(); scrollToSection('#testimonials'); }}>Testimonials</a>
            <a href="#faq" className="block nav-link py-2" onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }}>FAQ</a>
            <a href="#contact" className="block nav-link py-2" onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}>Contact</a>
            <a href="/login" className="block nav-button bg-transparent text-center mt-4">Login</a>
            <a href="/select-role" className="block nav-button bg-[#457B9D] text-white text-center mt-2">Register</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 overflow-hidden h-screen flex items-center" style={{minHeight: '100vh'}}>
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero.avif" 
            alt="Hero Background" 
            className="hero-bg-image w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="hero-overlay absolute inset-0 bg-gradient-to-br from-[#F1FAEE]/90 via-[#A8DADC]/85 to-[#457B9D]/95"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center w-full">
          <div className="fade-in animate">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 sm:mb-8 text-white drop-shadow-lg">
              Launch Your Dream Business with <span className="text-[#457B9D] drop-shadow-lg animated-text">Elevante</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 text-white max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
              We help entrepreneurs, investors, and suppliers connect, collaborate, and build meaningful ventures through our smart, easy-to-use platform.
            </p>
            <a 
              href="/select-role" 
              className="hero-button inline-flex items-center gap-3 text-lg sm:text-xl md:text-2xl px-8 sm:px-12 py-4 sm:py-6 drop-shadow-xl"
            >
              Get Started
              <ArrowRight className="text-lg sm:text-xl md:text-2xl" />
            </a>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 text-[#1D3557]" id="about">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className="fade-right animate space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-[#457B9D]">About Elevante</h2>
            <p className="text-base sm:text-lg leading-relaxed text-[#1D3557]">
              Elevante, founded by a dedicated team of Rania Abdelnasser, Esraa Tarek, Fatma Alzahraa Hassan, Alaa Ramadan, and Khadija Abdelrahman, is built on a simple yet powerful premise: to empower and connect the entrepreneurial ecosystem.
              We believe in fostering an environment where innovative ideas can flourish, networks can expand organically, and investments can find their most impactful homes.
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-[#1D3557]">
              Our platform is designed to be a catalyst for growth, providing the essential tools and a supportive community for entrepreneurs to navigate the complexities of launching and scaling a successful venture.
            </p>
          </div>
          <div className="fade-left animate grid gap-6">
            <div className="bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl section-card border border-[#A8DADC]">
              <h3 className="text-lg sm:text-2xl font-bold mb-4 text-[#1D3557]">Our Vision</h3>
              <p className="text-[#1D3557] leading-relaxed text-sm sm:text-base">To build a global ecosystem where every entrepreneur has seamless access to the tools, mentorship, and financial support needed to transform their ideas into thriving, impactful businesses.</p>
            </div>
            <div className="bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl section-card border border-[#A8DADC]">
              <h3 className="text-lg sm:text-2xl font-bold mb-4 text-[#1D3557]">Our Mission</h3>
              <p className="text-[#1D3557] leading-relaxed text-sm sm:text-base">To streamline startup processes by providing accessible resources, a rigorously verified network of partners, and direct investment opportunities, ensuring efficiency and success.</p>
            </div>
            <div className="bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl section-card border border-[#A8DADC]">
              <h3 className="text-lg sm:text-2xl font-bold mb-4 text-[#1D3557]">Our Goal</h3>
              <p className="text-[#1D3557] leading-relaxed text-sm sm:text-base">To empower 10,000 entrepreneurs and facilitate their connections with a robust network of investors and suppliers, culminating in the successful launch and growth of their ventures by the end of 2026.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 text-[#1D3557]" id="features">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[#1D3557]">Platform Features</h2>
          <p className="text-base sm:text-lg text-[#1D3557]">Discover the tools that empower your entrepreneurial journey.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto">
          <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <div className="text-[#457B9D] text-4xl sm:text-5xl mb-4 flex justify-center">
              <Store />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Business Marketplace</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Connect with trusted suppliers, branding experts, and service providers.</p>
          </div>
          <div className="fade-in animate delay-100 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <div className="text-[#457B9D] text-4xl sm:text-5xl mb-4 flex justify-center">
              <CheckCircle />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Step-by-Step Guide</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Structured roadmap guiding you from idea to full business launch.</p>
          </div>
          <div className="fade-in animate delay-200 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <div className="text-[#457B9D] text-4xl sm:text-5xl mb-4 flex justify-center">
              <Users />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Provider Portal</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Suppliers can register, build profiles, and directly connect with users.</p>
          </div>
          <div className="fade-in animate delay-300 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <div className="text-[#457B9D] text-4xl sm:text-5xl mb-4 flex justify-center">
              <TrendingUp />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Investor Dashboard</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Browse startup proposals and invest in early-stage businesses.</p>
          </div>
          <div className="fade-in animate delay-400 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <div className="text-[#457B9D] text-4xl sm:text-5xl mb-4 flex justify-center">
              <Book />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Educational Hub</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Explore videos, guides, and templates tailored for entrepreneurs.</p>
          </div>
          <div className="fade-in animate delay-500 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <div className="text-[#457B9D] text-4xl sm:text-5xl mb-4 flex justify-center">
              <MessageCircle />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Messaging System</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Built-in chat to connect entrepreneurs with service providers and investors.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 text-[#1D3557]" id="how-it-works">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[#1D3557]">How It Works</h2>
          <p className="text-base sm:text-lg text-[#1D3557]">Our streamlined process helps you connect and grow with ease.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto text-center">
          <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center section-card">
            <div className="w-12 h-12 sm:w-16 sm:h-16 number-circle rounded-full mx-auto mb-6 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-lg">1</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Choose Your Package</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Select a package tailored to your startup needs, from initial branding to full setup support and ongoing guidance.</p>
          </div>
          <div className="fade-in animate delay-100 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center section-card">
            <div className="w-12 h-12 sm:w-16 sm:h-16 number-circle rounded-full mx-auto mb-6 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-lg">2</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Access Resources</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Utilize our comprehensive guides, extensive supplier network, and cutting-edge educational hub to build and refine your business strategy.</p>
          </div>
          <div className="fade-in animate delay-200 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center section-card">
            <div className="w-12 h-12 sm:w-16 sm:h-16 number-circle rounded-full mx-auto mb-6 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-lg">3</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-[#1D3557]">Connect & Grow</h3>
            <p className="text-[#1D3557] text-sm sm:text-base">Seamlessly link with potential investors and scale your venture with the continuous support of our robust ecosystem.</p>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 text-[#1D3557]" id="roles">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[#1D3557]">Who Is Elevante For?</h2>
          <p className="text-base sm:text-lg text-[#1D3557]">Connecting key players to foster innovation and growth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto">
          <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-[#1D3557]">Entrepreneurs</h3>
            <div className="title-line"></div>
            <p className="text-[#1D3557] text-sm sm:text-base">Launch and manage startups with essential mentorship, powerful tools, and direct exposure to potential investors. We provide the comprehensive support needed from ideation to market.</p>
          </div>
          <div className="fade-in animate delay-100 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-[#1D3557]">Suppliers</h3>
            <div className="title-line"></div>
            <p className="text-[#1D3557] text-sm sm:text-base">Expand your business by connecting with a vibrant network of startups and established businesses eager to discover your products, services, and logistical solutions.</p>
          </div>
          <div className="fade-in animate delay-200 bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] text-center section-card">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-[#1D3557]">Investors</h3>
            <div className="title-line"></div>
            <p className="text-[#1D3557] text-sm sm:text-base">Discover and invest in high-potential startups. Our platform offers curated opportunities and enables you to provide crucial mentorship or capital to shape the next generation of businesses.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 text-[#1D3557]" id="testimonials">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[#1D3557]">What People Say</h2>
          <p className="text-base sm:text-lg text-[#1D3557]">Hear directly from our valued entrepreneurs, investors, and suppliers.</p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={30}
            slidesPerView={3}
            loop={true}
            centeredSlides={false}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination',
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            effect="slide"
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              640: {
                slidesPerView: 1,
                spaceBetween: 25,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 50,
              },
            }}
            className="testimonials-swiper"
          >
            {/* Review 1 */}
            <SwiperSlide>
              <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center text-center section-card h-full">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex text-[#F1C40F] text-2xl sm:text-3xl">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
                  </div>
                </div>
                <p className="mb-6 text-[#1D3557] italic text-sm sm:text-base leading-relaxed flex-grow">"Elevante gave me the structure to launch my food truck business. The mentorship and resources were invaluable, truly a game-changer!"</p>
                <h4 className="text-[#1D3557] font-bold text-lg sm:text-xl mb-1">Amina H.</h4>
                <p className="text-[#1D3557] text-xs sm:text-sm">Entrepreneur</p>
              </div>
            </SwiperSlide>

            {/* Review 2 */}
            <SwiperSlide>
              <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center text-center section-card h-full">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex text-[#F1C40F] text-2xl sm:text-3xl">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
                  </div>
                </div>
                <p className="mb-6 text-[#1D3557] italic text-sm sm:text-base leading-relaxed flex-grow">"The investor dashboard helped me find great projects with high potential. A truly innovative platform that streamlines the investment process."</p>
                <h4 className="text-[#1D3557] font-bold text-lg sm:text-xl mb-1">Khaled M.</h4>
                <p className="text-[#1D3557] text-xs sm:text-sm">Angel Investor</p>
              </div>
            </SwiperSlide>

            {/* Review 3 */}
            <SwiperSlide>
              <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center text-center section-card h-full">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex text-[#F1C40F] text-2xl sm:text-3xl">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
                  </div>
                </div>
                <p className="mb-6 text-[#1D3557] italic text-sm sm:text-base leading-relaxed flex-grow">"Support team resolved my issues quickly and efficiently. Great experience overall as a supplier, the platform truly facilitates connections."</p>
                <h4 className="text-[#1D3557] font-bold text-lg sm:text-xl mb-1">Sara T.</h4>
                <p className="text-[#1D3557] text-xs sm:text-sm">Supplier</p>
              </div>
            </SwiperSlide>

            {/* Review 4 */}
            <SwiperSlide>
              <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center text-center section-card h-full">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex text-[#F1C40F] text-2xl sm:text-3xl">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
                  </div>
                </div>
                <p className="mb-6 text-[#1D3557] italic text-sm sm:text-base leading-relaxed flex-grow">"The step-by-step guide was exactly what I needed. From idea to launch in just 3 months! Elevante made entrepreneurship accessible."</p>
                <h4 className="text-[#1D3557] font-bold text-lg sm:text-xl mb-1">Omar K.</h4>
                <p className="text-[#1D3557] text-xs sm:text-sm">Tech Startup Founder</p>
              </div>
            </SwiperSlide>

            {/* Review 5 */}
            <SwiperSlide>
              <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center text-center section-card h-full">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex text-[#F1C40F] text-2xl sm:text-3xl">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
                  </div>
                </div>
                <p className="mb-6 text-[#1D3557] italic text-sm sm:text-base leading-relaxed flex-grow">"As a venture capitalist, I've found exceptional startups through Elevante. The quality of entrepreneurs and their ideas is outstanding."</p>
                <h4 className="text-[#1D3557] font-bold text-lg sm:text-xl mb-1">Fatima A.</h4>
                <p className="text-[#1D3557] text-xs sm:text-sm">Venture Capitalist</p>
              </div>
            </SwiperSlide>

            {/* Review 6 */}
            <SwiperSlide>
              <div className="fade-in animate bg-section-card p-6 sm:p-8 rounded-xl shadow-2xl border border-[#A8DADC] flex flex-col items-center text-center section-card h-full">
                <div className="mb-4 flex items-center justify-center">
                  <div className="flex text-[#F1C40F] text-2xl sm:text-3xl">
                    {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
                  </div>
                </div>
                <p className="mb-6 text-[#1D3557] italic text-sm sm:text-base leading-relaxed flex-grow">"The educational hub is a goldmine! The templates and guides saved me countless hours. Highly recommended for any entrepreneur."</p>
                <h4 className="text-[#1D3557] font-bold text-lg sm:text-xl mb-1">Layla R.</h4>
                <p className="text-[#1D3557] text-xs sm:text-sm">E-commerce Entrepreneur</p>
              </div>
            </SwiperSlide>
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button className="swiper-button-prev custom-swiper-button bg-[#457B9D] text-white p-3 rounded-full shadow-lg hover:bg-[#1D3557] transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="swiper-pagination"></div>
            <button className="swiper-button-next custom-swiper-button bg-[#457B9D] text-white p-3 rounded-full shadow-lg hover:bg-[#1D3557] transition-colors duration-300">
              <svg className="w-6 h-6" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 text-[#1D3557]" id="faq">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-[#1D3557]">Frequently Asked Questions</h2>
          <p className="text-base sm:text-lg text-[#1D3557]">Have questions? We've got answers.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              question: "Do you provide any free plan?",
              answer: "Yes, we offer a robust free plan with essential features, allowing you to explore our platform before committing to a premium subscription."
            },
            {
              question: "What's the subscription cost?",
              answer: "Our premium plans are competitively priced, starting at $9.99/month, offering advanced features and dedicated support to accelerate your business growth."
            },
            {
              question: "How to contact support?",
              answer: "You can reach our support team via email at support@elevante.com, or utilize our 24/7 live chat feature directly on the platform for immediate assistance."
            },
            {
              question: "Can I customize my startup package?",
              answer: "Yes, we offer flexible customization options for all our startup packages to ensure they perfectly align with your unique business needs and goals."
            },
            {
              question: "How do I find investors on the platform?",
              answer: "Our platform provides a dedicated investor matching tool and a robust network directory to help you connect with suitable investors based on your industry and funding requirements."
            }
          ].map((faq, index) => (
            <div key={index} className={`fade-in animate ${index > 0 ? `delay-${index * 100}` : ''} p-4 sm:p-6 bg-section-card rounded-xl shadow-2xl section-card border border-[#A8DADC]`}>
              <details className="group">
                <summary className="flex justify-between items-center text-base sm:text-lg font-semibold cursor-pointer py-2 text-[#1D3557] group-hover:text-[#457B9D] transition duration-300">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 transition-transform duration-300 transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[#1D3557] leading-relaxed text-sm sm:text-base">{faq.answer}</p>
              </details>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 sm:mt-12 fade-in animate">
          <a href="mailto:support@elevante.com" className="inline-block btn-section px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition duration-300 transform hover:scale-105 shadow-lg">Still have questions? Contact us directly</a>
        </div>
      </section>

      {/* Contact Us */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 text-[#1D3557]" id="contact">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-[#1D3557]">Contact Us</h2>
          <p className="text-[#1D3557] mb-8 sm:mb-12 text-base sm:text-lg">Reach out for support, inquiries, or partnerships. We're here to help.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="fade-in animate p-6 sm:p-8 bg-section-card rounded-xl shadow-2xl section-card border border-[#A8DADC] text-left">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-[#1D3557]">Get in Touch</h3>
              <p className="text-[#1D3557] mb-4 leading-relaxed text-sm sm:text-base">Have a question or a project in mind? Feel free to reach out to us through any of the methods below. We look forward to hearing from you!</p>
              <div className="space-y-3">
                <p className="text-[#1D3557] flex items-center text-sm sm:text-base">
                  <Mail className="text-[#457B9D] text-lg mr-3" />
                  Email: <a href="mailto:support@elevante.com" className="hover:underline text-[#457B9D] ml-1">support@elevante.com</a>
                </p>
                <p className="text-[#1D3557] flex items-center text-sm sm:text-base">
                  <Phone className="text-[#457B9D] text-lg mr-3" />
                  Phone: <a href="tel:+18005551234" className="hover:underline text-[#457B9D] ml-1">+1-800-555-1234</a>
                </p>
                <p className="text-[#1D3557] flex items-center text-sm sm:text-base">
                  <MapPin className="text-[#457B9D] text-lg mr-3" />
                  Address: 123 Startup Lane, Innovate City, IC 45678
                </p>
              </div>
            </div>
            <div className="fade-in animate delay-100 p-6 sm:p-8 bg-section-card rounded-xl shadow-2xl section-card border border-[#A8DADC] text-left">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-[#1D3557]">Send Us a Message</h3>
              <div className="space-y-4 sm:space-y-5">
                <input type="text" placeholder="Your Name" className="w-full p-3 sm:p-4 bg-[#F1FAEE] text-[#1D3557] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] border border-[#A8DADC] text-sm sm:text-base" />
                <input type="email" placeholder="Your Email" className="w-full p-3 sm:p-4 bg-[#F1FAEE] text-[#1D3557] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] border border-[#A8DADC] text-sm sm:text-base" />
                <textarea placeholder="Your Message" className="w-full p-3 sm:p-4 bg-[#F1FAEE] text-[#1D3557] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D] border border-[#A8DADC] text-sm sm:text-base" rows={5}></textarea>
                <button type="button" className="btn-section px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition duration-300 transform hover:scale-105 w-full shadow-lg text-sm sm:text-base">Send Message</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section - Enhanced Professional Design */}
      <section id="download-app" className="py-16 px-6 download-section">
        <div className="max-w-6xl mx-auto">
          <div className="download-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
              {/* Phone Mockup - Hide on mobile */}
              <div className="hidden lg:flex justify-center lg:justify-end">
                <div className="phone-mockup">
                  <img 
                    src="/app.jpg" 
                    alt="Elevante Mobile App" 
                    className="w-64 sm:w-80 rounded-3xl shadow-2xl border-4 border-gray-800"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center lg:text-left space-y-6 text-[#1D3557] w-full">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-bold text-[#1D3557]">
                    Your Business Journey 
                    <span className="block text-[#457B9D]">In Your Pocket</span>
                  </h2>
                  <p className="text-lg text-[#1D3557] max-w-md mx-auto lg:mx-0 leading-relaxed">
                    Access mentorship, connect with investors, browse suppliers, and manage your startup journey anytime, anywhere with the Elevante mobile app.
                  </p>
                </div>
                
                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#457B9D] rounded-full"></div>
                    <span className="text-sm text-[#1D3557]">Real-time notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#457B9D] rounded-full"></div>
                    <span className="text-sm text-[#1D3557]">Investor matching</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#457B9D] rounded-full"></div>
                    <span className="text-sm text-[#1D3557]">Secure messaging</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[#457B9D] rounded-full"></div>
                    <span className="text-sm text-[#1D3557]">Progress tracking</span>
                  </div>
                </div>
                
                {/* App Store Buttons - Always horizontal */}
                <div className="flex flex-row justify-center lg:justify-start gap-4 w-full">
                  <a href="https://www.apple.com/app-store/" target="_blank" className="store-button">
                    <img 
                      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                      alt="Download on App Store" 
                      className="h-14 w-auto"
                    />
                  </a>
                  <a href="https://play.google.com/store" target="_blank" className="store-button">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                      alt="Get it on Google Play" 
                      className="h-14 w-auto"
                    />
                  </a>
                </div>
                
                {/* QR Code */}
                <div className="flex flex-col items-center lg:items-start space-y-3">
                  <p className="text-sm text-[#1D3557] font-medium">Scan to download</p>
                  <div className="qr-code">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png"
                      alt="QR Code for App Download" 
                      className="w-20 h-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="py-16 sm:py-20 px-6 text-center rounded-lg shadow-xl mx-auto max-w-5xl my-12 sm:my-16 p-10 sm:p-16 section-card" style={{background: 'linear-gradient(to right, #A8DADC, #457B9D)'}}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 leading-tight text-white">Join the Elevante Movement Today!</h2>
        <p className="text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed text-white">Empowering thousands of startups and innovators across the region. Don't miss out on your opportunity to connect, collaborate, and grow with us.</p>
        <a href="/select-role" className="cta-button">
          Create Your Free Account
          <ArrowRight className="text-sm" />
        </a>
      </section>

      <footer className="bg-secondary py-8 sm:py-12 px-4 sm:px-6 text-center">
        <div className="max-w-7xl mx-auto">
          {/* Social Links */}
          <div className="mb-6 flex justify-center space-x-4 sm:space-x-6">
      <a
        href="https://www.facebook.com/elevante"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="group p-2 rounded-full transition-colors duration-300
                   hover:bg-white hover:bg-opacity-10"
      >
        <FaFacebookF className="text-white text-[24px] group-hover:text-[#1D3557] transition-colors" />
      </a>

      <a
        href="https://www.instagram.com/elevante"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="group p-2 rounded-full transition-colors duration-300
                   hover:bg-white hover:bg-opacity-10"
      >
        <FaInstagram className="text-white text-[24px] group-hover:text-[#1D3557] transition-colors" />
      </a>

      <a
        href="https://www.linkedin.com/company/elevante"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="group p-2 rounded-full transition-colors duration-300
                   hover:bg-white hover:bg-opacity-10"
      >
        <FaLinkedinIn className="text-white text-[24px] group-hover:text-[#1D3557] transition-colors" />
      </a>

      <a
        href="https://x.com/elevante"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
        className="group p-2 rounded-full transition-colors duration-300
                   hover:bg-white hover:bg-opacity-10"
      >
        <FaXTwitter className="text-white text-[24px] group-hover:text-[#1D3557] transition-colors" />
      </a>
    </div>

          {/* Footer Navigation */}
          <div className="mb-6 space-x-4 sm:space-x-6 flex flex-wrap justify-center py-2">
            <a
              href="#hero"
              className="text-white hover:text-[#1D3557] transition-colors duration-300 text-sm sm:text-base font-semibold mb-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}
            >
              Home
            </a>
            <a
              href="#about"
              className="text-white hover:text-[#1D3557] transition-colors duration-300 text-sm sm:text-base font-semibold mb-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }}
            >
              About
            </a>
            <a
              href="#features"
              className="text-white hover:text-[#1D3557] transition-colors duration-300 text-sm sm:text-base font-semibold mb-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('#features'); }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-white hover:text-[#1D3557] transition-colors duration-300 text-sm sm:text-base font-semibold mb-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('#how-it-works'); }}
            >
              How It Works
            </a>
            <a
              href="#roles"
              className="text-white hover:text-[#1D3557] transition-colors duration-300 text-sm sm:text-base font-semibold mb-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('#roles'); }}
            >
              Users
            </a>
            <a
              href="#testimonials"
              className="text-white hover:text-[#1D3557] transition-colors duration-300 text-sm sm:text-base font-semibold mb-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('#testimonials'); }}
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-white hover:text-[#1D3557] transition-colors duration-300 text-sm sm:text-base font-semibold mb-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('#faq'); }}
            >
              FAQ
            </a>
            <a
              href="#contact"
              className="text-white hover:text-[#1D3557] transition-colors duration-300 text-sm sm:text-base font-semibold mb-2"
              onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}
            >
              Contact
            </a>
          </div>

          {/* Divider */}
          <hr className="border-light-blue mb-4 sm:mb-6 opacity-50" />

          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-white">
              <img src="/logowhite.png" alt="Elevante Logo" className="h-8 sm:h-10 mx-auto mb-2" />
              <p className="text-sm">Empowering Entrepreneurs Worldwide</p>
            </div>

            {/* Copyright */}
            <p className="text-sm text-white">
              © {new Date().getFullYear()} Elevante. All rights reserved.
            </p>

            {/* Additional Links */}
            <div className="flex justify-center space-x-6 text-xs text-white">
              <a href="/privacy" className="hover:text-[#1D3557] transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-[#1D3557] transition-colors duration-300">
                Terms of Service
              </a>
              <a href="/support" className="hover:text-[#1D3557] transition-colors duration-300">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;