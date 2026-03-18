import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, CheckCircle, XCircle, User, Briefcase, GraduationCap, Code, Star, AlignLeft, Plus, Trash2, X, ChevronRight, Sparkles, Award, ArrowLeft, Eye, Edit3, Layout, Upload, Zap } from 'lucide-react';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePDF } from './components/ResumePDF';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { useRef, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";

axios.defaults.baseURL = 'https://ats-resume-builder-7xio.onrender.com';
const AI_SERVICE_URL = 'http://localhost:8000';

const TEMPLATES = [
  { id: 'classic', name: 'Classic ATS', desc: 'Standard serif, high parseability', image: 'template_classic_ats_1773575577224.png' },
  { id: 'executive', name: 'Executive', desc: 'Centered header, professional borders', image: 'template_executive_pro_1773575594518.png' },
  { id: 'modern', name: 'Modern Tech', desc: 'Blue accents, sans-serif, energetic', image: 'template_modern_tech_1773575608386.png' },
  { id: 'sidebar', name: 'Premium Sidebar', desc: 'Sophisticated two-column layout', image: 'template_sidebar_premium_1773575628002.png' },
  { id: 'academic', name: 'Academic CV', desc: 'Data-dense, multi-page optimized', image: 'template_academic_cv_1773575647187.png' },
  { id: 'minimal', name: 'Ultra Minimalist', desc: 'Clean, spacious, modern feel', image: 'template_minimalist_clean_1773575665286.png' },
  { id: 'google', name: 'Tech Giant', desc: 'Inspired by Google/Amazon tech formats', image: 'template_google_style_1773576109412.png' },
  { id: 'consultant', name: 'Big Four', desc: 'Sophisticated McKinsey-style strategy layout', image: 'template_mckinsey_style_1773576127656.png' },
  { id: 'ivy', name: 'Ivy League', desc: 'Prestigious Harvard-style classic format', image: 'template_harvard_style_1773576145088.png' },
  { id: 'creative', name: 'Creative Media', desc: 'Dynamic energetic layout for media pros', image: 'template_creative_media_1773576165549.png' },
  { id: 'healthcare', name: 'Healthcare Pro', desc: 'Clinical, structured medical format', image: 'template_healthcare_pro_1773576182642.png' },
  { id: 'sales', name: 'Sales Ninja', desc: 'High-impact metric focused achievement layout', image: 'template_sales_ninja_1773576200547.png' }
];

// --- Landing Page Component ---
const LandingPage = ({ onStart, onAIUpload }) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/extract`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onAIUpload(response.data);
    } catch (err) {
      console.error('AI Extraction failed:', err);
      alert('Failed to extract data. Please try again or start manually.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden font-sans perspective-1000">
      
      {/* 3D Background Elements */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[30%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-br from-[#ccff00]/10 to-transparent blur-[120px]"
      />
      <motion.div 
        animate={{ rotate: -360, scale: [1, 1.3, 1] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-[#ccff00]/5 to-transparent blur-[150px]"
      />

      <div className="z-10 flex flex-col items-center justify-center text-center px-6 max-w-5xl text-white">
        
        <motion.div
          initial={{ opacity: 0, y: -50, rotateX: -45 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="mb-6 flex items-center justify-center space-x-4"
        >
          <div className="p-4 bg-gradient-to-br from-[#ccff00] to-[#99ff00] rounded-2xl shadow-[0_0_50px_rgba(204,255,0,0.4)] border border-white/10">
            <FileText size={48} className="text-black drop-shadow-lg" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-[#ccff00] to-gray-500 drop-shadow-2xl"
        >
          Next-Gen ATS <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#00ffcc]">Resume Builder</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl font-medium leading-relaxed"
        >
          Beat the bots with our AI-powered structuring engine. Craft your resume in real-time or upload your old one to instantly switch to a perfect ATS-friendly layout.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.docx"
          />
          
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
            whileHover={{ scale: 1.05, translateY: -5, boxShadow: "0px 20px 40px rgba(204, 255, 0, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className="group relative px-10 py-5 bg-white text-black font-bold text-xl flex items-center gap-3 overflow-hidden border border-white/20 shadow-xl transition-all rounded-2xl"
          >
            <span className="relative z-10 flex items-center gap-2 font-black italic">
              {isUploading ? <span className="animate-spin text-[#ccff00]"><Zap size={20}/></span> : <Upload size={20} />} 
              {isUploading ? "Reading..." : "Upload & Build with AI"}
            </span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, type: "spring", bounce: 0.5 }}
            whileHover={{ scale: 1.05, translateY: -5, boxShadow: "0px 20px 40px rgba(204, 255, 0, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative px-10 py-5 bg-[#ccff00] rounded-2xl text-black font-bold text-xl flex items-center gap-3 overflow-hidden border border-[#ccff00]/20 shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-all"
          >
            <span className="relative z-10 flex items-center gap-2 font-black italic">Create Manually <ChevronRight className="group-hover:translate-x-1 transition-transform" /></span>
          </motion.button>
        </div>
      </div>

      {/* Developer Credit Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 md:bottom-10 w-full text-center px-6 text-gray-600 font-bold uppercase tracking-[0.15em] md:tracking-[0.4em] text-[9px] md:text-[10px] z-20"
      >
        Designed and developed by <span className="text-[#ccff00]">Hemasundar Maroti</span>
      </motion.footer>

    </div>
  );
};


// --- Template Gallery Stage ---
const TemplateGallery = ({ onSelect, onBack }) => {
  return (
    <div className="min-h-screen bg-black p-6 md:p-20 overflow-y-auto custom-scrollbar relative">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto text-center mb-16"
      >
        <span className="text-[#ccff00] font-black uppercase tracking-[0.3em] text-xs">Step 1: Choose Your Style</span>
        <h1 className="text-5xl md:text-7xl font-black text-white mt-4 mb-6 tracking-tighter">
          Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#00ffaa]">Foundation</span>
        </h1>
        <h2 className="text-gray-400 text-lg max-w-2xl mx-auto">
          Every template is engineered to bypass ATS filters and wow human recruiters. Select a design to start building.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {TEMPLATES.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => onSelect(tpl.id)}
            className="group cursor-pointer"
          >
            <div className="aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative mb-6 transition-all group-hover:shadow-blue-500/20">
              <img 
                src={`/${tpl.image}`} 
                alt={tpl.name} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end p-8 opacity-0 group-hover:opacity-100 transition-all">
                <button className="w-full py-4 bg-[#ccff00] text-black font-black uppercase tracking-widest rounded-xl shadow-[0_10px_30px_rgba(204,255,0,0.3)] transform translate-y-4 group-hover:translate-y-0 transition-all">
                  Get Started
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">{tpl.name}</h3>
            <p className="text-gray-500 text-sm tracking-tight">{tpl.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


// --- Builder Page Component ---
const BuilderPage = ({ initialTemplate, initialData, onBack }) => {
  const resumeRef = useRef(null);

  const downloadImage = async () => {
    if (resumeRef.current === null) return;
    
    try {
      // Step 1: Capture the entire content at high resolution
      const dataUrl = await toPng(resumeRef.current, { 
        quality: 1, 
        pixelRatio: 3, // High quality for professional use
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          borderRadius: '0'
        }
      });
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const canvasWidth = img.width;
      const canvasHeight = img.height;
      
      // Calculate A4 Proportion Height (210mm x 297mm)
      const pageHeight = Math.floor((canvasWidth / 210) * 297);
      const totalPages = Math.ceil(canvasHeight / pageHeight);
      
      const fileNameBase = `${dataPayload.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_${dataPayload.experience[0]?.jobTitle.replace(/\s+/g, '_') || 'Professional'}_ResuSolve`;

      if (totalPages <= 1) {
        // Just download the single page if it fits
        download(dataUrl, `${fileNameBase}.png`);
      } else {
        // Loop through and split into multiple A4-sized images
        for (let i = 0; i < totalPages; i++) {
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvasWidth;
          pageCanvas.height = pageHeight;
          const ctx = pageCanvas.getContext('2d');
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasWidth, pageHeight);
          
          ctx.drawImage(
            img,
            0, i * pageHeight, canvasWidth, pageHeight, // Source Rect
            0, 0, canvasWidth, pageHeight // Dest Rect
          );
          
          const pageDataUrl = pageCanvas.toDataURL('image/png', 1.0);
          download(pageDataUrl, `${fileNameBase}_Page_${i + 1}.png`);
        }
      }
    } catch (err) {
      console.error('High-quality image export failed:', err);
    }
  };

  // Tabs Navigation
  const tabs = [
    { id: 'personal', name: 'Personal', icon: <User size={16} /> },
    { id: 'summary', name: 'Summary', icon: <AlignLeft size={16} /> },
    { id: 'experience', name: 'Experience', icon: <Briefcase size={16} /> },
    { id: 'education', name: 'Education', icon: <GraduationCap size={16} /> },
    { id: 'projects', name: 'Projects', icon: <Code size={16} /> },
    { id: 'skills', name: 'Skills', icon: <Star size={16} /> },
    { id: 'awards', name: 'Awards', icon: <Award size={16} /> },
    { id: 'templates', name: 'Themes', icon: <Layout size={16} /> }
  ];
  const [activeTab, setActiveTab] = useState('personal');

  // Schema States
  const [personalInfo, setPersonalInfo] = useState(initialData?.personalInfo || { fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' });
  const [summary, setSummary] = useState(initialData?.summary || '');
  
  // Normalize array-based descriptions to newline strings for the UI
  const [experience, setExperience] = useState(() => {
    if (!initialData?.experience) return [{ company: '', jobTitle: '', startDate: '', endDate: '', description: '' }];
    return initialData.experience.map(exp => ({
      ...exp,
      description: Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || '')
    }));
  });

  const [education, setEducation] = useState(initialData?.education || [{ institution: '', degree: '', fieldOfStudy: '', graduationYear: '', gpa: '' }]);
  
  const [projects, setProjects] = useState(() => {
    if (!initialData?.projects) return [{ title: '', technologies: '', description: '', link: '' }];
    return initialData.projects.map(proj => ({
      ...proj,
      technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || ''),
      description: Array.isArray(proj.description) ? proj.description.join('\n') : (proj.description || '')
    }));
  });

  const [skills, setSkills] = useState(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [certifications, setCertifications] = useState(initialData?.certifications || ['']);
  const [achievements, setAchievements] = useState(initialData?.achievements || ['']);

  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.selectedTemplate || initialTemplate || 'classic');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineFormat, setRefineFormat] = useState('balanced');

  const handleRefineSummary = async () => {
    if (!summary.trim()) return;
    setIsRefining(true);
    try {
      // Calling the local Python AI service directamente
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/refine-summary`, {
        summary,
        target_role: experience[0]?.jobTitle || "Professional",
        format: refineFormat
      });
      
      if (response.data.refined_summary) {
        setSummary(response.data.refined_summary);
      }
    } catch (err) {
      console.error('Refinement failed:', err);
      alert('AI Refinement failed. Please ensure the Python AI service is running at ' + AI_SERVICE_URL);
    } finally {
      setIsRefining(false);
    }
  };


  const handleArrayChange = (setter, array, index, field, value) => {
    const newArr = [...array];
    newArr[index][field] = value;
    setter(newArr);
  };
  const addItem = (setter, array, emptyItem) => setter([...array, emptyItem]);
  const removeItem = (setter, array, index) => setter(array.filter((_, i) => i !== index));

  const handleAddSkill = (e) => {
    e.preventDefault();
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => setSkills(skills.filter(s => s !== skillToRemove));

  const getFormattedData = () => {
    return {
      personalInfo,
      summary,
      experience: experience.filter(e => e.company || e.jobTitle).map(e => ({
        ...e,
        description: typeof e.description === 'string' 
          ? e.description.split('\n').filter(l => l.trim().length > 0) 
          : (Array.isArray(e.description) ? e.description : [])
      })),
      education: education.filter(e => e.institution || e.degree),
      projects: projects.filter(p => p.title).map(p => ({
        ...p,
        technologies: typeof p.technologies === 'string'
          ? p.technologies.split(',').map(t => t.trim()).filter(Boolean)
          : (Array.isArray(p.technologies) ? p.technologies : []),
        description: typeof p.description === 'string' 
          ? p.description.split('\n').filter(l => l.trim().length > 0)
          : (Array.isArray(p.description) ? p.description : [])
      })),
      skills,
      certifications: certifications.filter(c => c.trim().length > 0),
      achievements: achievements.filter(a => a.trim().length > 0)
    };
  };
  const dataPayload = getFormattedData();

  // Reusable 3D Input Style
  const inputStyle = "w-full mt-1.5 bg-gray-900/40 border border-gray-700/50 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner backdrop-blur-sm";
  const labelStyle = "text-xs font-bold text-gray-300 uppercase tracking-widest pl-1";

  // Framer Motion variants for tab content
  const tabContentVariants = {
    hidden: { opacity: 0, x: -30, rotateY: 10 },
    visible: { opacity: 1, x: 0, rotateY: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, x: 30, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black flex flex-col md:flex-row font-sans text-white relative overflow-hidden"
    >
      
      {/* 3D Glassmorphic Form Column */}
      <div className="w-full md:w-1/2 md:h-screen md:overflow-y-auto custom-scrollbar relative">
        
        {/* Abstract Background for Form */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#ccff00]/5 blur-[100px] rounded-full point-events-none" />

        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 md:py-5 shadow-2xl">
          <div className="flex justify-between items-center">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors -ml-2"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className="hidden md:block text-[#ccff00]" /> Resume Builder
            </h1>
            <button 
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="md:hidden flex items-center gap-2 bg-[#ccff00] text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
            >
              {showMobilePreview ? <><Edit3 size={14}/> Edit</> : <><Eye size={14}/> Preview</>}
            </button>
          </div>
          
          <div className="flex gap-2 mt-5 overflow-x-auto pb-2 custom-scrollbar hide-scroll">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id 
                  ? 'bg-[#ccff00] text-black shadow-[0_5px_15px_rgba(204,255,0,0.3)] translate-y-[-2px]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className={`p-4 md:p-8 relative z-10 ${showMobilePreview ? 'hidden md:block' : 'block'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gray-800/20 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] 3d-card"
            >
              
              {/* 1. PERSONAL INFO */}
              {activeTab === 'personal' && (
                <div>
                  <h2 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[{ label: "Full Name", field: "fullName", type: "text", p: "John Doe" }, { label: "Email Address", field: "email", type: "email", p: "john@example.com" }, { label: "Phone Number", field: "phone", type: "text", p: "(555) 123-4567" }, { label: "LinkedIn URL", field: "linkedin", type: "text", p: "linkedin.com/..." }, { label: "GitHub URL", field: "github", type: "text", p: "github.com/..." }, { label: "Portfolio URL", field: "portfolio", type: "text", p: "johndoe.com" }].map((item, idx) => (
                      <div key={idx} className="flex flex-col">
                        <label className={labelStyle}>{item.label}</label>
                        <input type={item.type} placeholder={item.p} className={inputStyle} value={personalInfo[item.field]} onChange={(e) => setPersonalInfo({...personalInfo, [item.field]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. SUMMARY */}
              {activeTab === 'summary' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Professional Summary</h2>
                    <div className="flex items-center gap-2 bg-gray-900/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                      <select 
                        value={refineFormat} 
                        onChange={(e) => setRefineFormat(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-[#ccff00] outline-none cursor-pointer px-2"
                      >
                        <option value="balanced" className="bg-black">Balanced</option>
                        <option value="impactful" className="bg-black">Impactful</option>
                        <option value="concise" className="bg-black">Concise</option>
                        <option value="technical" className="bg-black">Technical</option>
                      </select>
                      <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={handleRefineSummary}
                        disabled={isRefining || !summary.trim()}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                          isRefining 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-[#ccff00] to-[#00ffcc] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]'
                        }`}
                      >
                        {isRefining ? <span className="animate-spin"><Zap size={14}/></span> : <Sparkles size={14} />}
                        {isRefining ? "Refining..." : "Refine"}
                      </motion.button>
                    </div>
                  </div>
                  <label className={labelStyle}>Write your pitch</label>
                  <textarea 
                    placeholder="Craft a compelling summary..." 
                    rows="8" 
                    maxLength="1000" 
                    className={`${inputStyle} ${isRefining ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    value={summary} 
                    onChange={(e) => setSummary(e.target.value)} 
                    disabled={isRefining}
                  />
                  <p className="text-right text-xs text-gray-400 mt-2 font-mono">{summary.length} / 1000</p>
                </div>
              )}

              {/* 3. EXPERIENCE */}
              {activeTab === 'experience' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-white">Experience</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addItem(setExperience, experience, { company: '', jobTitle: '', startDate: '', endDate: '', description: '' })} className="flex items-center gap-1 text-sm bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 font-bold px-4 py-2 rounded-xl transition">
                      <Plus size={16}/> Add Role
                    </motion.button>
                  </div>
                  {experience.map((exp, idx) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={idx} className="bg-gray-900/50 border border-gray-700/50 p-6 rounded-2xl mb-6 relative group overflow-hidden shadow-lg">
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="font-bold text-lg text-white">Position {idx + 1}</h3>
                        <button onClick={() => removeItem(setExperience, experience, idx)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-lg transition"> <Trash2 size={16}/> </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <div><label className={labelStyle}>Job Title</label><input type="text" className={inputStyle} value={exp.jobTitle} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'jobTitle', e.target.value)} /></div>
                        <div><label className={labelStyle}>Company</label><input type="text" className={inputStyle} value={exp.company} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'company', e.target.value)} /></div>
                        <div><label className={labelStyle}>Start Date</label><input type="text" placeholder="Jan 2022" className={inputStyle} value={exp.startDate} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'startDate', e.target.value)} /></div>
                        <div><label className={labelStyle}>End Date</label><input type="text" placeholder="Present" className={inputStyle} value={exp.endDate} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'endDate', e.target.value)} /></div>
                      </div>
                      <div><label className={labelStyle}>Description (Bullet points on new lines)</label><textarea rows="5" className={inputStyle} value={exp.description} onChange={(e) => handleArrayChange(setExperience, experience, idx, 'description', e.target.value)} /></div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 4. EDUCATION */}
              {activeTab === 'education' && (
               <div>
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Education</h2>
                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addItem(setEducation, education, { institution: '', degree: '', fieldOfStudy: '', graduationYear: '', gpa: '' })} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold px-4 py-2 rounded-xl transition">
                     <Plus size={16}/> Add School
                   </motion.button>
                 </div>
                 {education.map((edu, idx) => (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={idx} className="bg-gray-900/50 border border-gray-700/50 p-6 rounded-2xl mb-6 relative shadow-lg">
                     <div className="flex justify-between items-center mb-5">
                       <h3 className="font-bold text-lg text-white">Institution {idx + 1}</h3>
                       <button onClick={() => removeItem(setEducation, education, idx)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-lg transition"><Trash2 size={16}/></button>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2"><label className={labelStyle}>Institution Name</label><input type="text" className={inputStyle} value={edu.institution} onChange={(e) => handleArrayChange(setEducation, education, idx, 'institution', e.target.value)} /></div>
                        <div><label className={labelStyle}>Degree</label><input type="text" placeholder="e.g. B.S." className={inputStyle} value={edu.degree} onChange={(e) => handleArrayChange(setEducation, education, idx, 'degree', e.target.value)} /></div>
                        <div><label className={labelStyle}>Field of Study</label><input type="text" placeholder="Computer Science" className={inputStyle} value={edu.fieldOfStudy} onChange={(e) => handleArrayChange(setEducation, education, idx, 'fieldOfStudy', e.target.value)} /></div>
                        <div><label className={labelStyle}>Graduation Year</label><input type="text" className={inputStyle} value={edu.graduationYear} onChange={(e) => handleArrayChange(setEducation, education, idx, 'graduationYear', e.target.value)} /></div>
                        <div><label className={labelStyle}>GPA</label><input type="text" className={inputStyle} value={edu.gpa} onChange={(e) => handleArrayChange(setEducation, education, idx, 'gpa', e.target.value)} /></div>
                     </div>
                   </motion.div>
                 ))}
               </div>
              )}

              {/* 5. PROJECTS */}
              {activeTab === 'projects' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Projects</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addItem(setProjects, projects, { title: '', technologies: '', description: '', link: '' })} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold px-4 py-2 rounded-xl transition">
                      <Plus size={16}/> Add Project
                    </motion.button>
                  </div>
                  {projects.map((proj, idx) => (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={idx} className="bg-gray-900/50 border border-gray-700/50 p-6 rounded-2xl mb-6 relative shadow-lg">
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="font-bold text-lg text-white">Project {idx + 1}</h3>
                        <button onClick={() => removeItem(setProjects, projects, idx)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-2 rounded-lg transition"><Trash2 size={16}/></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <div><label className={labelStyle}>Project Title</label><input type="text" className={inputStyle} value={proj.title} onChange={(e) => handleArrayChange(setProjects, projects, idx, 'title', e.target.value)} /></div>
                        <div><label className={labelStyle}>Link / URL</label><input type="text" className={inputStyle} value={proj.link} onChange={(e) => handleArrayChange(setProjects, projects, idx, 'link', e.target.value)} /></div>
                        <div className="sm:col-span-2"><label className={labelStyle}>Technologies (comma separated)</label><input type="text" placeholder="React, Node.js" className={inputStyle} value={proj.technologies} onChange={(e) => handleArrayChange(setProjects, projects, idx, 'technologies', e.target.value)} /></div>
                      </div>
                      <div><label className={labelStyle}>Description (Bullet points on new lines)</label><textarea rows="4" className={inputStyle} value={proj.description} onChange={(e) => handleArrayChange(setProjects, projects, idx, 'description', e.target.value)} /></div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* 6. SKILLS */}
              {activeTab === 'skills' && (
                <div>
                  <h2 className="text-2xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Technical Skills</h2>
                  <p className="text-gray-400 mb-6 text-sm">Type a skill and hit enter.</p>
                  
                  <form onSubmit={handleAddSkill} className="flex gap-3 mb-8">
                    <input type="text" placeholder="e.g. Next.js, Python, AWS" className={`${inputStyle} mt-0 flex-1 border-white/10`} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="bg-[#ccff00] hover:bg-[#aaff00] text-black font-black px-8 py-3 rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)] transition-all"> Add </motion.button>
                  </form>

                  <div className="flex flex-wrap gap-3 p-6 bg-gray-900/40 border border-gray-700/50 rounded-2xl min-h-[150px] shadow-inner items-start content-start">
                    <AnimatePresence>
                      {skills.length === 0 && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500 italic w-full text-center py-4">Your technological arsenal awaits...</motion.span>
                      )}
                      {skills.map((skill, idx) => (
                        <motion.div 
                          key={skill}
                          initial={{ opacity: 0, scale: 0.5, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: -10 }}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#ccff00]/10 to-[#ccff00]/20 border border-[#ccff00]/30 px-4 py-2 rounded-full text-sm font-black text-[#ccff00] shadow-md backdrop-blur-md"
                        >
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="text-[#ccff00]/60 hover:text-white bg-[#ccff00]/20 hover:bg-red-500/60 rounded-full p-1 transition"><X size={12}/></button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* 7. AWARDS & CERTS */}
              {activeTab === 'awards' && (
                <div>
                  <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Certifications</h2>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addItem(setCertifications, certifications, '')} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold px-4 py-2 rounded-xl transition">
                        <Plus size={16}/> Add Item
                      </motion.button>
                    </div>
                    {certifications.map((cert, idx) => (
                      <div key={`cert-${idx}`} className="flex gap-3 mb-3">
                        <input type="text" className={`${inputStyle} mt-0`} placeholder="e.g. AWS Certified Solutions Architect" value={cert} onChange={(e) => { const newArr = [...certifications]; newArr[idx] = e.target.value; setCertifications(newArr); }} />
                        <button onClick={() => removeItem(setCertifications, certifications, idx)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-4 rounded-xl transition"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Achievements</h2>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addItem(setAchievements, achievements, '')} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold px-4 py-2 rounded-xl transition">
                        <Plus size={16}/> Add Item
                      </motion.button>
                    </div>
                    {achievements.map((achieve, idx) => (
                      <div key={`achieve-${idx}`} className="flex gap-3 mb-3">
                        <input type="text" className={`${inputStyle} mt-0`} placeholder="e.g. 1st Place Global Hackathon" value={achieve} onChange={(e) => { const newArr = [...achievements]; newArr[idx] = e.target.value; setAchievements(newArr); }} />
                        <button onClick={() => removeItem(setAchievements, achievements, idx)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-4 rounded-xl transition"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. TEMPLATE PICKER */}
              {activeTab === 'templates' && (
                <div>
                  <h2 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Switch Themes</h2>
                  <p className="text-gray-400 mb-8 text-sm italic">Switch styles instantly without losing your progress.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {TEMPLATES.map((tpl) => (
                      <motion.div
                        key={tpl.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all group relative ${
                          selectedTemplate === tpl.id ? 'border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-white relative">
                          <img src={`/${tpl.image}`} alt={tpl.name} className="w-full h-full object-cover opacity-80" />
                          {selectedTemplate === tpl.id && (
                            <div className="absolute inset-0 bg-[#ccff00]/20 flex items-center justify-center">
                              <CheckCircle className="text-black bg-[#ccff00] rounded-full" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-900/90">
                          <p className="text-[10px] font-black uppercase text-white truncate">{tpl.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* Live PDF View / Right Column */}
      <div className={`w-full md:w-1/2 p-4 md:p-10 bg-black md:h-screen md:overflow-y-auto flex flex-col items-center relative z-20 custom-scrollbar border-l border-white/5 transition-transform duration-500 ${showMobilePreview ? 'flex fixed inset-0 z-50 md:relative md:z-20' : 'hidden md:flex'}`}>
        
        {/* Mobile Close Preview Button */}
        <button 
          onClick={() => setShowMobilePreview(false)}
          className="md:hidden absolute top-6 right-6 z-50 p-3 bg-black border border-white/10 rounded-full"
        >
          <Edit3 size={20} className="text-[#ccff00]" />
        </button>
        
        {/* Glow behind paper */}
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-[#ccff00]/5 blur-[120px] rounded-full point-events-none" />

        {/* Live Preview Paper */}
        <motion.div 
          ref={resumeRef}
          key={selectedTemplate}
          initial={{ opacity: 0, rotateX: 10, y: 30 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className={`w-full max-w-[210mm] bg-white text-gray-900 rounded-[2px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.05)] text-sm min-h-[297mm] transform-gpu flex ${selectedTemplate === 'sidebar' ? 'flex-row' : 'flex-col'} overflow-visible relative`}
        >
          {/* Visual Page Break Guide (Hidden in export) */}
          <div className="absolute top-[297mm] left-0 w-full border-t border-dashed border-gray-200 pointer-events-none z-50 print:hidden opacity-50" title="Page Break Guide"></div>
          {/* Sidebar Part */}
          {selectedTemplate === 'sidebar' && (
            <div className="w-[30%] bg-[#1e293b] text-white p-6 sm:p-10 flex flex-col">
              <h1 className="text-2xl font-black mb-10 leading-tight uppercase font-sans">{dataPayload.personalInfo.fullName || 'YOUR NAME'}</h1>
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/20 pb-2 mb-4">Contact</h4>
                  <div className="text-[9px] space-y-2 opacity-80 break-all">
                    {dataPayload.personalInfo.email && <p>{dataPayload.personalInfo.email}</p>}
                    {dataPayload.personalInfo.phone && <p>{dataPayload.personalInfo.phone}</p>}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/20 pb-2 mb-4">Core Skills</h4>
                  <div className="text-[9px] space-y-2 opacity-80">
                    {dataPayload.skills.slice(0, 10).map(s => <p key={s}>• {s}</p>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`${selectedTemplate === 'sidebar' ? 'w-[70%] p-10' : 'p-10 sm:p-14'}`}>
            {/* Header logic */}
            {selectedTemplate !== 'sidebar' && (
              <div className={`pb-6 mb-8 
                ${selectedTemplate === 'executive' || selectedTemplate === 'ivy' || selectedTemplate === 'classic' ? 'text-center' : 'text-left'} 
                ${selectedTemplate === 'modern' || selectedTemplate === 'minimal' || selectedTemplate === 'google' ? 'border-none' : 'border-b-2 border-black'}
                ${selectedTemplate === 'google' ? 'border-b border-gray-100 pb-2' : ''}
              `}>
                <h1 className={`font-black text-black mb-4 leading-tight
                  ${selectedTemplate === 'modern' ? 'text-blue-600 text-5xl font-sans' : 
                    selectedTemplate === 'executive' ? 'text-4xl uppercase tracking-[0.2em]' : 
                    selectedTemplate === 'minimal' ? 'text-5xl font-light font-sans text-black tracking-tighter' : 
                    selectedTemplate === 'google' ? 'text-2xl text-[#1a73e8]' :
                    selectedTemplate === 'consultant' ? 'text-xl uppercase tracking-tighter' :
                    selectedTemplate === 'creative' ? 'text-6xl tracking-tighter' :
                    selectedTemplate === 'sales' ? 'text-3xl uppercase bg-black text-white p-2 inline-block' :
                    'text-4xl'}`}>
                  {dataPayload.personalInfo.fullName || 'YOUR NAME'}
                </h1>
                <p className={`text-black text-[10px] sm:text-xs font-bold opacity-80 leading-relaxed max-w-2xl ${selectedTemplate === 'executive' || selectedTemplate === 'ivy' || selectedTemplate === 'classic' ? 'mx-auto text-center' : 'text-left'}`}>
                  {[
                    dataPayload.personalInfo.email,
                    dataPayload.personalInfo.phone,
                    dataPayload.personalInfo.linkedin?.replace(/^(https?:\/\/)?(www\.)?/, ''),
                    dataPayload.personalInfo.github?.replace(/^(https?:\/\/)?(www\.)?/, ''),
                    dataPayload.personalInfo.portfolio?.replace(/^(https?:\/\/)?(www\.)?/, '')
                  ].filter(Boolean).join(selectedTemplate === 'modern' || selectedTemplate === 'google' ? ' • ' : ' | ')}
                </p>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-8">
              {dataPayload.summary && (
                <div>
                  <h2 className={`text-[11px] font-black uppercase pb-1 mb-3 
                    ${selectedTemplate === 'modern' ? 'text-blue-600 border-b border-blue-100' : 
                      selectedTemplate === 'google' ? 'text-[#1a73e8] border-b border-gray-100 pb-2' :
                      selectedTemplate === 'consultant' ? 'text-black border-b border-black pb-1' :
                      selectedTemplate === 'ivy' ? 'text-black border-b border-black pb-1 text-center' :
                      selectedTemplate === 'creative' ? 'text-[#d97706] text-sm lowercase' :
                      selectedTemplate === 'healthcare' ? 'text-[#0891b2] border-l-4 border-[#0891b2] pl-2' :
                      selectedTemplate === 'sales' ? 'text-white bg-[#b91c1c] p-1 px-2' :
                      selectedTemplate === 'executive' ? 'border-b border-t border-black py-1' : 
                      selectedTemplate === 'minimal' ? 'text-gray-400 tracking-[0.3em]' : 'border-b border-black text-black'}`}>
                    Profile Summary
                  </h2>
                  <p className="text-[10px] leading-relaxed text-gray-800">{dataPayload.summary}</p>
                </div>
              )}

              {dataPayload.experience.length > 0 && (
                <div>
                  <h2 className={`text-[11px] font-black uppercase pb-1 mb-4 
                    ${selectedTemplate === 'modern' ? 'text-blue-600 border-b border-blue-100' : 
                      selectedTemplate === 'google' ? 'text-[#1a73e8] border-b border-gray-100 pb-2' :
                      selectedTemplate === 'consultant' ? 'text-black border-b border-black pb-1' :
                      selectedTemplate === 'ivy' ? 'text-black border-b border-black pb-1 text-center' :
                      selectedTemplate === 'creative' ? 'text-[#d97706] text-sm lowercase' :
                      selectedTemplate === 'healthcare' ? 'text-[#0891b2] border-l-4 border-[#0891b2] pl-2' :
                      selectedTemplate === 'sales' ? 'text-white bg-[#b91c1c] p-1 px-2' :
                      selectedTemplate === 'executive' ? 'border-b border-t border-black py-1' : 
                      selectedTemplate === 'minimal' ? 'text-gray-400 tracking-[0.3em]' : 'border-b border-black text-black'}`}>
                    Work Experience
                  </h2>
                  {dataPayload.experience.map((exp, i) => (
                    <div key={i} className="mb-4">
                      <div className="flex justify-between font-bold text-black text-[11px]">
                        <span>{exp.jobTitle.toUpperCase()}</span>
                        <span className="font-normal text-gray-600">{exp.startDate} — {exp.endDate}</span>
                      </div>
                      <div className="text-[10px] italic font-bold text-gray-700 mb-1">{exp.company}</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {exp.description.slice(0, 3).map((l, j) => <li key={j} className="text-[10px] leading-tight">{l}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {dataPayload.education.length > 0 && (
                <div>
                   <h2 className={`text-[11px] font-black uppercase pb-1 mb-2 
                    ${selectedTemplate === 'modern' ? 'text-blue-600 border-b border-blue-100' : 
                      selectedTemplate === 'google' ? 'text-[#1a73e8] border-b border-gray-100 pb-2' :
                      selectedTemplate === 'consultant' ? 'text-black border-b border-black pb-1' :
                      selectedTemplate === 'ivy' ? 'text-black border-b border-black pb-1 text-center' :
                      selectedTemplate === 'creative' ? 'text-[#d97706] text-sm lowercase' :
                      selectedTemplate === 'healthcare' ? 'text-[#0891b2] border-l-4 border-[#0891b2] pl-2' :
                      selectedTemplate === 'sales' ? 'text-white bg-[#b91c1c] p-1 px-2' :
                      selectedTemplate === 'executive' ? 'border-b border-t border-black py-1' : 
                      selectedTemplate === 'minimal' ? 'text-gray-400 tracking-[0.3em]' : 'border-b border-black text-black'}`}>
                    Education
                  </h2>
                  {dataPayload.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-black text-[10px]">{edu.institution}</div>
                        <div className="text-[9px]">{edu.degree} in {edu.fieldOfStudy} {edu.gpa && `| GPA: ${edu.gpa}`}</div>
                      </div>
                      <span className="text-[10px] text-gray-600">{edu.graduationYear}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedTemplate !== 'sidebar' && dataPayload.skills.length > 0 && (
                <div>
                   <h2 className={`text-[11px] font-black uppercase pb-1 mb-2 
                    ${selectedTemplate === 'modern' ? 'text-blue-600 border-b border-blue-100' : 
                      selectedTemplate === 'google' ? 'text-[#1a73e8] border-b border-gray-100 pb-2' :
                      selectedTemplate === 'consultant' ? 'text-black border-b border-black pb-1' :
                      selectedTemplate === 'ivy' ? 'text-black border-b border-black pb-1 text-center' :
                      selectedTemplate === 'creative' ? 'text-[#d97706] text-sm lowercase' :
                      selectedTemplate === 'healthcare' ? 'text-[#0891b2] border-l-4 border-[#0891b2] pl-2' :
                      selectedTemplate === 'sales' ? 'text-white bg-[#b91c1c] p-1 px-2' :
                      selectedTemplate === 'executive' ? 'border-b border-t border-black py-1' : 
                      selectedTemplate === 'minimal' ? 'text-gray-400 tracking-[0.3em]' : 'border-b border-black text-black'}`}>
                    Skills
                  </h2>
                  <p className="text-[10px] font-bold text-black">{dataPayload.skills.join(' • ')}</p>
                </div>
              )}

              {dataPayload.certifications.length > 0 && (
                <div>
                   <h2 className={`text-[11px] font-black uppercase pb-1 mb-2 
                    ${selectedTemplate === 'modern' ? 'text-blue-600 border-b border-blue-100' : 
                      selectedTemplate === 'google' ? 'text-[#1a73e8] border-b border-gray-100 pb-2' :
                      selectedTemplate === 'consultant' ? 'text-black border-b border-black pb-1' :
                      selectedTemplate === 'ivy' ? 'text-black border-b border-black pb-1 text-center' :
                      selectedTemplate === 'creative' ? 'text-[#d97706] text-sm lowercase' :
                      selectedTemplate === 'healthcare' ? 'text-[#0891b2] border-l-4 border-[#0891b2] pl-2' :
                      selectedTemplate === 'sales' ? 'text-white bg-[#b91c1c] p-1 px-2' :
                      selectedTemplate === 'executive' ? 'border-b border-t border-black py-1' : 
                      selectedTemplate === 'minimal' ? 'text-gray-400 tracking-[0.3em]' : 'border-b border-black text-black'}`}>
                    Certifications
                  </h2>
                  <ul className="list-disc pl-4 space-y-1">
                    {dataPayload.certifications.map((c, i) => <li key={i} className="text-[10px] leading-tight">{c}</li>)}
                  </ul>
                </div>
              )}

              {dataPayload.achievements.length > 0 && (
                <div>
                   <h2 className={`text-[11px] font-black uppercase pb-1 mb-2 
                    ${selectedTemplate === 'modern' ? 'text-blue-600 border-b border-blue-100' : 
                      selectedTemplate === 'google' ? 'text-[#1a73e8] border-b border-gray-100 pb-2' :
                      selectedTemplate === 'consultant' ? 'text-black border-b border-black pb-1' :
                      selectedTemplate === 'ivy' ? 'text-black border-b border-black pb-1 text-center' :
                      selectedTemplate === 'creative' ? 'text-[#d97706] text-sm lowercase' :
                      selectedTemplate === 'healthcare' ? 'text-[#0891b2] border-l-4 border-[#0891b2] pl-2' :
                      selectedTemplate === 'sales' ? 'text-white bg-[#b91c1c] p-1 px-2' :
                      selectedTemplate === 'executive' ? 'border-b border-t border-black py-1' : 
                      selectedTemplate === 'minimal' ? 'text-gray-400 tracking-[0.3em]' : 'border-b border-black text-black'}`}>
                    Achievements
                  </h2>
                  <ul className="list-disc pl-4 space-y-1">
                    {dataPayload.achievements.map((a, i) => <li key={i} className="text-[10px] leading-tight">{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 3D Export Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="sticky bottom-6 w-full max-w-[210mm] mt-auto z-50 perspective-500"
        >
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[210mm]">
            <PDFDownloadLink 
              document={<ResumePDF data={dataPayload} templateId={selectedTemplate} />} 
              fileName={`${dataPayload.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_${dataPayload.experience[0]?.jobTitle.replace(/\s+/g, '_') || 'Professional'}_ResuSolve.pdf`}
              className="flex-1 h-14 flex items-center justify-center gap-3 bg-gradient-to-t from-gray-900 via-gray-800 to-gray-700 text-white text-sm rounded-2xl shadow-xl font-black uppercase tracking-wider backdrop-blur-md transition-all group border border-white/10"
            >
              {({ loading }) => (
                loading ? <span className="animate-pulse">Preparing...</span> : 
                <motion.span whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
                  <Download size={18} /> Export PDF
                </motion.span>
              )}
            </PDFDownloadLink>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadImage}
              className="flex-1 h-14 flex items-center justify-center gap-3 bg-[#ccff00] text-black text-sm rounded-2xl shadow-xl font-black uppercase tracking-wider transition-all border border-[#ccff00]/30"
            >
              <FileText size={18} /> Export Image
            </motion.button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

// --- Main App Logic Switch ---
export default function App() {
  const [appState, setAppState] = useState('landing'); // 'landing', 'selection', 'builder'
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [initialResumeData, setInitialResumeData] = useState(null);

  const handleAIUpload = (data) => {
    setInitialResumeData(data);
    setSelectedTemplate(data.selectedTemplate || 'classic');
    setAppState('builder');
  };

  return (
    <>
      <Analytics />
      <AnimatePresence mode="wait">
        {appState === 'landing' && (
          <motion.div key="landing" exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} transition={{ duration: 0.5 }}>
            <LandingPage 
              onStart={() => setAppState('selection')} 
              onAIUpload={handleAIUpload}
            />
          </motion.div>
        )}
        {appState === 'selection' && (
          <motion.div key="selection" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }}>
            <TemplateGallery 
              onSelect={(id) => { setSelectedTemplate(id); setAppState('builder'); }} 
              onBack={() => setAppState('landing')}
            />
          </motion.div>
        )}
        {appState === 'builder' && (
          <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <BuilderPage 
              initialTemplate={selectedTemplate} 
              initialData={initialResumeData}
              onBack={() => {
                setInitialResumeData(null);
                setAppState('selection');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
