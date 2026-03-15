import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, AlignLeft, Briefcase, GraduationCap, Code, Star, Award, Layout, Sparkles, Edit3, Eye, Plus, Trash2, X, Download, FileText, CheckCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePDF } from './ResumePDF';
import { TEMPLATES } from '../constants';

const BuilderPage = ({ initialTemplate, onBack }) => {
  const resumeRef = useRef(null);

  const [personalInfo, setPersonalInfo] = useState({ fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' });
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState([{ company: '', jobTitle: '', startDate: '', endDate: '', description: '' }]);
  const [education, setEducation] = useState([{ institution: '', degree: '', fieldOfStudy: '', graduationYear: '', gpa: '' }]);
  const [projects, setProjects] = useState([{ title: '', technologies: '', description: '', link: '' }]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [certifications, setCertifications] = useState(['']);
  const [achievements, setAchievements] = useState(['']);

  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate || 'classic');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

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
        description: e.description ? e.description.split('\n').filter(l => l.trim().length > 0) : []
      })),
      education: education.filter(e => e.institution || e.degree),
      projects: projects.filter(p => p.title).map(p => ({
        ...p,
        technologies: p.technologies ? p.technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
        description: p.description ? p.description.split('\n').filter(l => l.trim().length > 0) : []
      })),
      skills,
      certifications: certifications.filter(c => c.trim().length > 0),
      achievements: achievements.filter(a => a.trim().length > 0)
    };
  };
  const dataPayload = getFormattedData();

  const downloadImage = async () => {
    if (resumeRef.current === null) return;
    try {
      const dataUrl = await toPng(resumeRef.current, { 
        quality: 1, 
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: { transform: 'scale(1)', borderRadius: '0' }
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      const canvasWidth = img.width;
      const canvasHeight = img.height;
      const pageHeight = Math.floor((canvasWidth / 210) * 297);
      const totalPages = Math.ceil(canvasHeight / pageHeight);
      const fileNameBase = `${dataPayload.personalInfo.fullName.replace(/\s+/g, '_') || 'Resume'}_${dataPayload.experience[0]?.jobTitle.replace(/\s+/g, '_') || 'Professional'}_ResuSolve`;
      if (totalPages <= 1) {
        download(dataUrl, `${fileNameBase}.png`);
      } else {
        for (let i = 0; i < totalPages; i++) {
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvasWidth;
          pageCanvas.height = pageHeight;
          const ctx = pageCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasWidth, pageHeight);
          ctx.drawImage(img, 0, i * pageHeight, canvasWidth, pageHeight, 0, 0, canvasWidth, pageHeight);
          download(pageCanvas.toDataURL('image/png', 1.0), `${fileNameBase}_Page_${i + 1}.png`);
        }
      }
    } catch (err) { console.error('Image export failed:', err); }
  };

  const inputStyle = "w-full mt-1.5 bg-gray-900/40 border border-gray-700/50 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ccff00]/50 focus:border-[#ccff00] outline-none transition-all shadow-inner backdrop-blur-sm";
  const labelStyle = "text-xs font-bold text-gray-300 uppercase tracking-widest pl-1";

  const tabContentVariants = {
    hidden: { opacity: 0, x: -30, rotateY: 10 },
    visible: { opacity: 1, x: 0, rotateY: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, x: 30, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-black flex flex-col md:flex-row font-sans text-white relative overflow-hidden">
      <div className="w-full md:w-1/2 md:h-screen md:overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#ccff00]/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 md:py-5 shadow-2xl">
          <div className="flex justify-between items-center">
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors -ml-2">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className="hidden md:block text-[#ccff00]" /> Resume Builder
            </h1>
            <button onClick={() => setShowMobilePreview(!showMobilePreview)} className="md:hidden flex items-center gap-2 bg-[#ccff00] text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
              {showMobilePreview ? <><Edit3 size={14}/> Edit</> : <><Eye size={14}/> Preview</>}
            </button>
          </div>
          <div className="flex gap-2 mt-5 overflow-x-auto pb-2 custom-scrollbar hide-scroll">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-300 ${activeTab === tab.id ? 'bg-[#ccff00] text-black shadow-[0_5px_15px_rgba(204,255,0,0.3)] translate-y-[-2px]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}>
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className={`p-4 md:p-8 relative z-10 ${showMobilePreview ? 'hidden md:block' : 'block'}`}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={tabContentVariants} initial="hidden" animate="visible" exit="exit" className="bg-gray-800/20 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] 3d-card">
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
              {activeTab === 'summary' && (
                <div>
                  <h3 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Professional Summary</h3>
                  <label className={labelStyle}>Write your pitch</label>
                  <textarea placeholder="Craft a compelling summary..." rows="8" maxLength="1000" className={inputStyle} value={summary} onChange={(e) => setSummary(e.target.value)} />
                  <p className="text-right text-xs text-gray-400 mt-2 font-mono">{summary.length} / 1000</p>
                </div>
              )}
              {activeTab === 'experience' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-white">Experience</h3>
                    <button onClick={() => addItem(setExperience, experience, { company: '', jobTitle: '', startDate: '', endDate: '', description: '' })} className="flex items-center gap-1 text-sm bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 font-bold px-4 py-2 rounded-xl transition">
                      <Plus size={16}/> Add Role
                    </button>
                  </div>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="bg-gray-900/50 border border-gray-700/50 p-6 rounded-2xl mb-6 relative shadow-lg">
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
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'education' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Education</h3>
                    <button onClick={() => addItem(setEducation, education, { institution: '', degree: '', fieldOfStudy: '', graduationYear: '', gpa:'' })} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold px-4 py-2 rounded-xl transition">
                      <Plus size={16}/> Add School
                    </button>
                  </div>
                  {education.map((edu, idx) => (
                    <div key={idx} className="bg-gray-900/50 border border-gray-700/50 p-6 rounded-2xl mb-6 relative shadow-lg">
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
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'projects' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Projects</h3>
                    <button onClick={() => addItem(setProjects, projects, { title: '', technologies: '', description: '', link: '' })} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold px-4 py-2 rounded-xl transition">
                      <Plus size={16}/> Add Project
                    </button>
                  </div>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="bg-gray-900/50 border border-gray-700/50 p-6 rounded-2xl mb-6 relative shadow-lg">
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
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'skills' && (
                <div>
                  <h3 className="text-2xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Technical Skills</h3>
                  <p className="text-gray-400 mb-6 text-sm">Type a skill and hit enter.</p>
                  <form onSubmit={handleAddSkill} className="flex gap-3 mb-8">
                    <input type="text" placeholder="e.g. Next.js, Python, AWS" className={`${inputStyle} mt-0 flex-1 border-white/10`} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
                    <button type="submit" className="bg-[#ccff00] hover:bg-[#aaff00] text-black font-black px-8 py-3 rounded-xl shadow-[0_0_15px_rgba(204,255,0,0.4)] transition-all"> Add </button>
                  </form>
                  <div className="flex flex-wrap gap-3 p-6 bg-gray-900/40 border border-gray-700/50 rounded-2xl min-h-[150px] shadow-inner items-start content-start">
                    {skills.length === 0 && <span className="text-gray-500 italic w-full text-center py-4">Your technological arsenal awaits...</span>}
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 bg-gradient-to-r from-[#ccff00]/10 to-[#ccff00]/20 border border-[#ccff00]/30 px-4 py-2 rounded-full text-sm font-black text-[#ccff00] shadow-md backdrop-blur-md">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-[#ccff00]/60 hover:text-white bg-[#ccff00]/20 hover:bg-red-500/60 rounded-full p-1 transition"><X size={12}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'awards' && (
                <div>
                  <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Certifications</h3>
                      <button onClick={() => addItem(setCertifications, certifications, '')} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold px-4 py-2 rounded-xl transition">
                        <Plus size={16}/> Add Item
                      </button>
                    </div>
                    {certifications.map((cert, idx) => (
                      <div key={`cert-${idx}`} className="flex gap-3 mb-3">
                        <input type="text" className={`${inputStyle} mt-0`} placeholder="e.g. AWS Certified..." value={cert} onChange={(e) => { const newArr = [...certifications]; newArr[idx] = e.target.value; setCertifications(newArr); }} />
                        <button onClick={() => removeItem(setCertifications, certifications, idx)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-4 rounded-xl transition"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Achievements</h3>
                      <button onClick={() => addItem(setAchievements, achievements, '')} className="flex items-center gap-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold px-4 py-2 rounded-xl transition">
                        <Plus size={16}/> Add Item
                      </button>
                    </div>
                    {achievements.map((achieve, idx) => (
                      <div key={`achieve-${idx}`} className="flex gap-3 mb-3">
                        <input type="text" className={`${inputStyle} mt-0`} placeholder="e.g. 1st Place..." value={achieve} onChange={(e) => { const newArr = [...achievements]; newArr[idx] = e.target.value; setAchievements(newArr); }} />
                        <button onClick={() => removeItem(setAchievements, achievements, idx)} className="text-red-400 hover:text-red-300 bg-red-500/10 p-4 rounded-xl transition"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'templates' && (
                <div>
                   <h3 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Switch Themes</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {TEMPLATES.map((tpl) => (
                      <div key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)} className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${selectedTemplate === tpl.id ? 'border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'border-white/5'}`}>
                        <div className="aspect-[3/4] bg-white relative">
                          <img src={`/${tpl.image}`} alt={tpl.name} className="w-full h-full object-cover" loading="lazy" />
                          {selectedTemplate === tpl.id && <div className="absolute inset-0 bg-[#ccff00]/20 flex items-center justify-center"><CheckCircle className="text-black bg-[#ccff00] rounded-full" size={24} /></div>}
                        </div>
                        <div className="p-3 bg-gray-900/90 text-center"><p className="text-[10px] font-black uppercase text-white truncate">{tpl.name}</p></div>
                      </div>
                    ))}
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className={`w-full md:w-1/2 p-4 md:p-10 bg-black md:h-screen md:overflow-y-auto flex flex-col items-center relative z-20 custom-scrollbar border-l border-white/5 ${showMobilePreview ? 'fixed inset-0 z-50 flex' : 'hidden md:flex'}`}>
        <button onClick={() => setShowMobilePreview(false)} className="md:hidden absolute top-6 right-6 z-50 p-3 bg-black border border-white/10 rounded-full"><Edit3 size={20} className="text-[#ccff00]" /></button>
        <div ref={resumeRef} className={`w-full max-w-[210mm] bg-white text-gray-900 shadow-2xl min-h-[297mm] flex ${selectedTemplate === 'sidebar' ? 'flex-row' : 'flex-col'} overflow-visible relative`}>
          <div className="absolute top-[297mm] left-0 w-full border-t border-dashed border-gray-200 pointer-events-none z-50 print:hidden opacity-50" title="Page Break Guide" />
          {selectedTemplate === 'sidebar' && (
            <div className="w-[30%] bg-[#1e293b] text-white p-10 flex flex-col">
              <h1 className="text-2xl font-black mb-10 leading-tight uppercase font-sans">{dataPayload.personalInfo.fullName || 'YOUR NAME'}</h1>
              <div className="space-y-8">
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/20 pb-2 mb-4">Contact</h4>
                   <div className="text-[9px] space-y-2 opacity-80 break-all">
                     <p>{dataPayload.personalInfo.email}</p>
                     <p>{dataPayload.personalInfo.phone}</p>
                   </div>
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/20 pb-2 mb-4">Skills</h4>
                   <div className="text-[9px] space-y-2 opacity-80">{dataPayload.skills.slice(0, 10).map(s => <p key={s}>• {s}</p>)}</div>
                </div>
              </div>
            </div>
          )}
          <div className={`${selectedTemplate === 'sidebar' ? 'w-[70%] p-10' : 'p-10 sm:p-14'}`}>
            {selectedTemplate !== 'sidebar' && (
              <div className={`pb-6 mb-8 ${['executive', 'ivy', 'classic'].includes(selectedTemplate) ? 'text-center' : 'text-left'} ${['modern', 'minimal', 'google'].includes(selectedTemplate) ? 'border-none' : 'border-b-2 border-black'}`}>
                <h1 className={`font-black text-black mb-4 ${selectedTemplate === 'modern' ? 'text-blue-600 text-5xl font-sans' : 'text-4xl'}`}>{dataPayload.personalInfo.fullName || 'YOUR NAME'}</h1>
                <p className={`text-black text-[10px] sm:text-xs font-bold opacity-80 leading-relaxed ${['executive', 'ivy', 'classic'].includes(selectedTemplate) ? 'mx-auto text-center' : 'text-left'}`}>
                  {[dataPayload.personalInfo.email, dataPayload.personalInfo.phone, dataPayload.personalInfo.linkedin?.replace(/^(https?:\/\/)?(www\.)?/, ''), dataPayload.personalInfo.github?.replace(/^(https?:\/\/)?(www\.)?/, '')].filter(Boolean).join(' | ')}
                </p>
              </div>
            )}
            <div className="space-y-8">
               {dataPayload.summary && (
                 <div><h2 className="text-[11px] font-black uppercase border-b border-black text-black pb-1 mb-3">Summary</h2><p className="text-[10px] text-gray-800">{dataPayload.summary}</p></div>
               )}
               {dataPayload.experience.length > 0 && (
                 <div><h2 className="text-[11px] font-black uppercase border-b border-black text-black pb-1 mb-4">Experience</h2>{dataPayload.experience.map((exp, i) => (<div key={i} className="mb-4"><div className="flex justify-between font-bold text-black text-[11px]"><span>{exp.jobTitle.toUpperCase()}</span><span className="font-normal text-gray-600">{exp.startDate} - {exp.endDate}</span></div><div className="text-[10px] italic font-bold mb-1">{exp.company}</div><ul className="list-disc pl-4">{exp.description.map((l, j) => <li key={j} className="text-[10px]">{l}</li>)}</ul></div>))}</div>
               )}
               {dataPayload.education.length > 0 && (
                 <div><h2 className="text-[11px] font-black uppercase border-b border-black text-black pb-1 mb-2">Education</h2>{dataPayload.education.map((edu, i) => (<div key={i} className="flex justify-between items-start mb-2"><div><div className="font-bold text-black text-[10px]">{edu.institution}</div><div className="text-[9px]">{edu.degree} in {edu.fieldOfStudy} {edu.gpa && `| GPA: ${edu.gpa}`}</div></div><span className="text-[10px] opacity-70">{edu.graduationYear}</span></div>))}</div>
               )}
               {dataPayload.skills.length > 0 && (
                 <div><h2 className="text-[11px] font-black uppercase border-b border-black text-black pb-1 mb-2">Skills</h2><p className="text-[10px] font-bold">{dataPayload.skills.join(' • ')}</p></div>
               )}
            </div>
          </div>
        </div>
        <div className="sticky bottom-6 w-full max-w-[210mm] mt-auto flex flex-col sm:flex-row gap-4 p-4 md:p-0">
          <PDFDownloadLink document={<ResumePDF data={dataPayload} templateId={selectedTemplate} />} fileName="Resume.pdf" className="flex-1 h-14 flex items-center justify-center gap-3 bg-gray-900 text-white rounded-2xl shadow-xl font-black uppercase tracking-wider backdrop-blur-md border border-white/10 transition-all hover:scale-[1.02]">
            {({ loading }) => loading ? 'Preparing...' : <><Download size={18} /> Export PDF</>}
          </PDFDownloadLink>
          <button onClick={downloadImage} className="flex-1 h-14 flex items-center justify-center gap-3 bg-[#ccff00] text-black rounded-2xl shadow-xl font-black uppercase tracking-wider hover:scale-[1.02]">
            <FileText size={18} /> Export Image
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BuilderPage;
