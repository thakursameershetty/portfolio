import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { 
  Figma, Code, ArrowUpRight, Github, Mail, Linkedin, Dribbble, 
  Smartphone, Wallet, Music, CreditCard, Compass, Brain, ChevronDown, PenTool, Layout, X, User, Download 
} from 'lucide-react';
import './App.css'; 

// --- CUSTOM CURSOR ---
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    const handleMouseOver = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('.spotlight-card') || e.target.closest('.social-link') || e.target.closest('.about-btn')) {
        setHovered(true);
      }
    };
    const handleMouseOut = () => setHovered(false);
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);
  return <div ref={cursorRef} className={`custom-cursor ${hovered ? 'hovered' : ''}`} />;
};

// --- TILTED CARD ---
const springValues = { damping: 30, stiffness: 100, mass: 2 };
const TiltedCard = ({ imageSrc, altText, captionText, containerHeight, containerWidth, imageHeight, imageWidth, scaleOnHover, rotateAmplitude, showMobileWarning, showTooltip, overlayContent, displayOverlayContent }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 });
  const [lastY, setLastY] = useState(0);

  function handleMouse(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;
    rotateX.set(rotationX); rotateY.set(rotationY);
    x.set(e.clientX - rect.left); y.set(e.clientY - rect.top);
    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }
  function handleMouseEnter() { scale.set(scaleOnHover); opacity.set(1); }
  function handleMouseLeave() { opacity.set(0); scale.set(1); rotateX.set(0); rotateY.set(0); rotateFigcaption.set(0); }

  return (
    <figure ref={ref} className="tilted-card-figure" style={{ height: containerHeight, width: containerWidth }} onMouseMove={handleMouse} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <motion.div className="tilted-card-inner" style={{ width: imageWidth, height: imageHeight, rotateX, rotateY, scale }}>
        <motion.img src={imageSrc} alt={altText} className="tilted-card-img" style={{ width: imageWidth, height: imageHeight }} />
        {displayOverlayContent && overlayContent && <motion.div className="tilted-card-overlay">{overlayContent}</motion.div>}
      </motion.div>
      {showTooltip && <motion.figcaption className="tilted-card-caption" style={{ x, y, opacity, rotate: rotateFigcaption }}>{captionText}</motion.figcaption>}
    </figure>
  );
};

// --- SPOTLIGHT CARD ---
const SpotlightCard = ({ children, onClick, mediaType, mediaSrc, style = {} }) => {
  const divRef = useRef(null);
  const videoRef = useRef(null);
  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
  };
  const handleMouseEnter = () => { if (mediaType === 'video' && videoRef.current) videoRef.current.play().catch(e => console.log(e)); };
  const handleMouseLeave = () => { if (mediaType === 'video' && videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } };

  return (
    <motion.div ref={divRef} onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick} className="spotlight-card" layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} style={style}>
      <div className="media-wrapper">
        <div className="media-overlay" />
        {mediaType === 'video' ? <video ref={videoRef} src={mediaSrc} className="media-preview" loop muted playsInline /> : <img src={mediaSrc} alt="Preview" className="media-preview" />}
      </div>
      {children}
    </motion.div>
  );
};

// --- STICKER COMPONENT ---
const Sticker = ({ children, top, left, right, bottom, rotate = 0, className }) => {
  return (
    <motion.div 
      className={`hero-sticker ${className || ''}`} // Add class for mobile hiding
      drag dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }} 
      whileHover={{ scale: 1.1, cursor: 'grab', zIndex: 150 }} 
      whileTap={{ scale: 0.9, cursor: 'grabbing' }} 
      initial={{ opacity: 0, y: 20, rotate: rotate }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ type: "spring", stiffness: 200, damping: 20 }} 
      style={{ position: 'absolute', top, left, right, bottom, zIndex: 50, filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.2))' }}
    >
      {children}
    </motion.div>
  );
};

// --- 3D BOOK MODAL ---
const BookModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="book-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="book-container" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>

          {/* LEFT PAGE */}
          <motion.div 
            className="book-left"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: -180 }}
            transition={{ duration: 1.2, type: "spring", stiffness: 50 }}
          >
            <div className="book-cover-front">
              <div style={{ border: '2px solid #fff', padding: '20px', borderRadius: '4px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', margin: 0, lineHeight: 1 }}>PORTFOLIO</h2>
                <p style={{ color: '#888', marginTop: '10px', letterSpacing: '2px' }}>2025 EDITION</p>
              </div>
              <p style={{ position: 'absolute', bottom: '30px', color: '#666', fontSize: '0.8rem' }}>TAP TO OPEN</p>
            </div>

            <div className="book-inside-left">
              <div style={{ borderBottom: '2px solid #ddd', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#222', margin: 0 }}>Thakur Sameer Shetty</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>UI/UX Designer & Developer</p>
              </div>
              
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#444' }}>
                <p style={{ marginBottom: '15px' }}><b>About Me:</b><br/>I bridge the gap between design and code.</p>
                <p style={{ marginBottom: '15px' }}><b>Education:</b><br/>B.Tech CSE (85.4%)<br/><span style={{ fontSize: '0.8rem', color: '#666' }}>Gayatri Vidya Parishad</span></p>
                <p><b>Stack:</b><br/>React, Three.js, Python, Figma</p>
              </div>
              <div style={{ marginTop: 'auto' }}><p style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>Visakhapatnam, India</p></div>
            </div>
          </motion.div>

          {/* RIGHT PAGE */}
          <motion.div 
            className="book-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
             <iframe src="/assets/Tammana_Thakur_Sameer_Shetty_Resume.pdf#view=FitH&toolbar=0&navpanes=0&scrollbar=0" className="resume-frame" title="Resume PDF" />
             <div className="pdf-action-bar">
                <a href="/assets/Tammana_Thakur_Sameer_Shetty_Resume.pdf" download="Tammana_Thakur_Resume.pdf" className="download-pill">
                   <Download size={16} /> Save PDF
                </a>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- DATA ---
const projects = [
  { id: 0, title: "Nova App Redesign", category: "Figma", description: "Fintech UI redesign featuring glassmorphism, 'Quick Send' flows, and reduced visual noise.", icon: <CreditCard size={28} />, color: "#3b82f6", link: "https://www.figma.com/proto/Y5b1PizrZbKH9M3IvgLDs9/Nova-App-Redesign", mediaType: "video", mediaSrc: "/assets/Nova App.mov" },
  { id: 1, title: "UI Components Kit", category: "Figma", description: "High-fidelity library of interactive components (carousels, loaders) focusing on micro-interactions.", icon: <Layout size={28} />, color: "#8b5cf6", link: "https://www.figma.com/design/418FHfFGm3hTKFwvSiEhg4/UI-Components-Kit?node-id=0-1&t=twx4pL3RIyKd2eAW-1", mediaType: "image", mediaSrc: "/assets/uicomponents.png" },
  { id: 2, title: "Gesture Shop", category: "Development", description: "Immersive spatial e-commerce experience using Three.js and hand-tracking.", icon: <Code size={28} />, color: "#61dafb", link: "https://gesture-shop.vercel.app", mediaType: "video", mediaSrc: "/assets/guestureshop.mp4" },
  { id: 3, title: "Aura Player", category: "Development", description: "Futuristic 3D music player interface with spatial audio visualizations.", icon: <Music size={28} />, color: "#a855f7", link: "https://aura-player-neon.vercel.app", mediaType: "video", mediaSrc: "/assets/auraplayer.mp4" },
  { id: 4, title: "Greeting Cards Maker", category: "Development", description: "Aesthetic, customizable UI allowing users to craft personal e-cards.", icon: <PenTool size={28} />, color: "#ef4444", link: "https://www.linkedin.com/posts/thakur-sameer-shetty-tammana_miniproject-databasemanagement-webdevelopment-activity-7312475852766691331-md4P?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEUvQ6MBdWcS07pVwwfK76b0tcDDFKUgq6E", mediaType: "video", mediaSrc: "/assets/Greeting Cards Maker.mp4" },
  { id: 5, title: "MindBridge", category: "Development", description: "Accessibility-first platform bridging the gap for neurodiverse users.", icon: <Brain size={28} />, color: "#ec4899", link: "https://mind-bridge-ashen.vercel.app/index.html", mediaType: "video", mediaSrc: "/assets/mindbridge.mp4" },
  { id: 6, title: "Lumina Wallet", category: "Development", description: "Next-gen fintech wallet interface.", icon: <Wallet size={28} />, color: "#f59e0b", link: "https://lumina-wallet-fawn.vercel.app", mediaType: "video", mediaSrc: "/assets/luminawallet.mov" },
  { id: 7, title: "Solo Traveler App", category: "Figma", description: "High-fidelity wireframes solving safety pain points for solo travelers.", icon: <Figma size={28} />, color: "#ff75c3", link: "https://www.figma.com/proto/Ngtg3qmmrWMMwt0Fd7CtOz", mediaType: "video", mediaSrc: "/assets/solotravelapp.mp4" },
  { id: 8, title: "Coastal Compass", category: "Figma", description: "Travel companion UI designed for coastal exploration and route planning.", icon: <Compass size={28} />, color: "#06b6d4", link: "https://www.figma.com/proto/BDs6MPDg3y4TbsetQ1M4x9/CostalCompass", mediaType: "video", mediaSrc: "/assets/costalcompass.mov" },
  { id: 9, title: "Savvy Saver", category: "Development", description: "Personal finance tracker.", icon: <Smartphone size={28} />, color: "#14b8a6", link: "https://savvysaver.vercel.app", mediaType: "image", mediaSrc: "/assets/savvysaver.png" }
];

export default function App() {
  const [filter, setFilter] = useState("All");
  const [isBookOpen, setIsBookOpen] = useState(false);
  const filtered = filter === "All" ? projects : projects.filter(p => p.category === filter);
  const handleScrollDown = () => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  // Hook to check for mobile screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const styles = {
    // We moved most styles to CSS classes for responsiveness, but kept these for dynamic overrides if needed
    tabBtn: { padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255, 255, 255, 0.03)', color: '#888', cursor: 'pointer', transition: 'all 0.3s', fontFamily: 'Space Grotesk, sans-serif', marginRight: '10px', marginBottom: '10px' },
    activeTab: { background: '#a855f7', color: 'white', borderColor: '#a855f7', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' },
  };

  return (
    <div>
      <CustomCursor />
      <BookModal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} />

      {/* Added className for responsive targeting */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '2rem 5%', alignItems: 'center', zIndex: 20, position: 'relative' }} className="nav-container">
        <div style={{ fontWeight: '700', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em' }}>
          <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 15px #22c55e' }} />
          Thakur Sameer Shetty
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setIsBookOpen(true)} className="about-btn" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 20px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'Space Grotesk', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} /> About
            </button>

            <div className="social-container">
              <a href="https://github.com/thakursameershetty" target="_blank" rel="noreferrer" className="social-link github"><Github size={20} /><span className="social-text">GitHub</span></a>
              <a href="https://linkedin.com/in/thakur-sameer-shetty-tammana" target="_blank" rel="noreferrer" className="social-link linkedin"><Linkedin size={20} /><span className="social-text">LinkedIn</span></a>
              <a href="https://dribbble.com/thakur5002" target="_blank" rel="noreferrer" className="social-link dribbble"><Dribbble size={20} /><span className="social-text">Dribbble</span></a>
              <a href="mailto:thakursst5002810@gmail.com" className="social-link mail"><Mail size={20} /><span className="social-text">Email</span></a>
            </div>
        </div>
      </nav>

      {/* Hero Section with Responsive Classes */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto', zIndex: 10, position: 'relative', minHeight: '85vh' }} className="hero-section">
        
        <div style={{ flex: '1 1 500px', zIndex: 10, position: 'relative' }} className="hero-left">
          {/* Stickers hidden on mobile via CSS class 'hero-sticker' */}
          <Sticker top={-40} left={250} rotate={15}><div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px rgba(255,0,0,0.5))' }}>❤️</div></Sticker>
          <Sticker top={120} left={-40} rotate={-10}><div style={{ background: '#FFE600', color: 'black', padding: '12px 20px', fontWeight: 'bold', fontFamily: 'Space Grotesk', fontSize: '1.2rem', transform: 'rotate(-5deg)', boxShadow: '5px 5px 0px rgba(255,255,255,0.2)', border: 'none' }}>HIRE ME!</div></Sticker>
          <Sticker bottom={100} right={50} rotate={20}><div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}>✨</div></Sticker>
          <Sticker top={-60} left={0} rotate={-5}>
            <div style={{ background: '#1e1e1e', padding: '1rem', borderRadius: '16px', border: '1px solid #333', display: 'flex', gap: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}><span style={{fontSize: '1.5rem'}}>⚛️</span><span style={{fontSize: '1.5rem'}}>🎨</span><span style={{fontSize: '1.5rem'}}>🧠</span></div>
          </Sticker>

          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
            <h1 style={{fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: '700', lineHeight: '1', letterSpacing: '-2px', marginBottom: '1.5rem', background: 'linear-gradient(to bottom right, #fff, #888)', WebkitBackgroundClip: 'text', color: 'transparent'}}>MAKING <br /> INTERACTIVE <br /> MAGIC.</h1>
          </motion.div>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} style={{ maxWidth: '600px', color: '#888', fontSize: '1.25rem', lineHeight: '1.6' }}>
            I'm a UI/UX Designer & Developer based in Visakhapatnam. <br/> I blend <b>Figma</b> aesthetics with <b>MERN stack</b> logic to build experiences that feel alive.
          </motion.p>
          <div style={{ marginTop: '3rem', display: 'flex', flexWrap: 'wrap' }}>
            {["All", "Figma", "Development"].map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)} style={{ ...styles.tabBtn, ...(filter === tab ? styles.activeTab : {}) }}>{tab}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 350px', display: 'flex', justifyContent: 'center', zIndex: 10 }} className="hero-right">
            <TiltedCard 
              imageSrc="/assets/photo.jpg" 
              altText="Thakur Sameer Shetty" 
              captionText="Thakur Sameer Shetty • UI/UX & Dev" 
              // Responsive Dimensions
              containerHeight={isMobile ? "350px" : "450px"} 
              containerWidth={isMobile ? "100%" : "350px"} 
              imageHeight={isMobile ? "380px" : "450px"} 
              imageWidth={isMobile ? "280px" : "350px"} 
              rotateAmplitude={12} 
              scaleOnHover={1.05} 
              showMobileWarning={false} 
              showTooltip={true} 
              displayOverlayContent={true} 
              overlayContent={<div className="my-custom-overlay"><p className="overlay-name">Thakur Sameer Shetty</p><p className="overlay-sub">UI/UX & Developer</p></div>} 
            />
        </div>
        <div className="scroll-indicator" onClick={handleScrollDown}><span>SCROLL DOWN</span><ChevronDown size={24} /></div>
      </header>

      <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem', padding: '2rem 5%', paddingBottom: '8rem', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }} className="grid-section">
        {filtered.map((project) => (
          <SpotlightCard key={project.id} onClick={() => window.open(project.link, '_blank')} mediaType={project.mediaType} mediaSrc={project.mediaSrc}>
            <div className="spotlight-content">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', opacity: 0.9 }}>
                  <div style={{ color: project.color, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>{project.icon}</div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}><ArrowUpRight size={20} /></div>
                </div>
                <h3 style={{ fontSize: '2rem', margin: '0 0 15px 0', fontWeight: '700', letterSpacing: '-0.02em', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{project.title}</h3>
                <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>{project.description}</p>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <span style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '500', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', backdropFilter: 'blur(5px)' }}>{project.category}</span>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </motion.div>
    </div>
  );
}