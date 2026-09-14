import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  ArrowRight, 
  Check, 
  X,
  FileCheck, 
  AlertCircle,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileCode2,
  ChevronDown,
  Lock,
  Target
} from 'lucide-react';
import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'https://ats-resume-builder-1-5se3.onrender.com';
const aiClient = axios.create({ baseURL: AI_SERVICE_URL });

const FEATURED_TEMPLATES = [
  { 
    id: 'ats_pro', 
    name: 'ATS Pro Standard', 
    category: 'Engineering & Tech',
    matchRate: '99.8%',
    desc: 'Engineered for maximum parser compliance with clean hierarchical section tags.', 
    image: 'template_ats_pro_2024.png' 
  },
  { 
    id: 'classic', 
    name: 'Classic Editorial', 
    category: 'Corporate & Legal',
    matchRate: '99.4%',
    desc: 'Printed serif balance with high readability for both scanning OCR and executive human review.', 
    image: 'template_classic_ats_1773575577224.png' 
  },
  { 
    id: 'google', 
    name: 'Tech Giant Format', 
    category: 'Big Tech & Systems',
    matchRate: '99.6%',
    desc: 'Single-column engineering specification layout favored across Google, Meta, and Amazon.', 
    image: 'template_google_style_1773576109412.png' 
  },
  { 
    id: 'executive', 
    name: 'Executive Header', 
    category: 'Leadership & VP',
    matchRate: '99.1%',
    desc: 'Balanced typographic hierarchy designed for senior leaders, partners, and directors.', 
    image: 'template_executive_pro_1773575594518.png' 
  },
  { 
    id: 'consultant', 
    name: 'Strategy Practice', 
    category: 'Management Advisory',
    matchRate: '99.5%',
    desc: 'Data-dense, bullet-first formatting modeled on top tier McKinsey and BCG advisory standards.', 
    image: 'template_mckinsey_style_1773576127656.png' 
  },
  { 
    id: 'ivy', 
    name: 'Academic Traditional', 
    category: 'Research & Academia',
    matchRate: '99.2%',
    desc: 'Classic academic balance with publication and credential parsing optimization.', 
    image: 'template_harvard_style_1773576145088.png' 
  }
];

const FAQ_ITEMS = [
  {
    q: "What makes a resume ATS-friendly?",
    a: "Applicant tracking systems convert resumes into plaintext database records. Traditional resumes with tables, text boxes, and multi-column layouts cause parsers to interleave lines or drop content entirely. ResuSolve structures resumes as a single sequential stream with standard semantic headers, ensuring 100% character fidelity."
  },
  {
    q: "Can I upload my existing PDF or Word resume?",
    a: "Yes. Use 'Upload & Build' on the landing page or in the builder. Our optical extraction service parses your work history, skills, and education into structured fields and loads them into your chosen template in seconds."
  },
  {
    q: "How does the job description match score work?",
    a: "Paste any target job description into the Match Score tool alongside your resume. The engine cross-references required hard skills, credentials, and semantic keywords, highlighting matched terms and missing requirements before you submit."
  },
  {
    q: "Do I need a credit card or subscription to get started?",
    a: "No. You can build, edit, and export your resume without entering credit card details. All foundational templates and manual editing tools are completely free to use."
  }
];

export const LandingPage = ({ 
  onStart, 
  onAIUpload, 
  onScore, 
  onResumeScore,
  onSelectTemplate 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [aiHealthy, setAiHealthy] = useState(true);
  const [activeFaq, setActiveFaq] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Scanner stage refs
  const scannerContainerRef = useRef(null);
  const scannerStageRef = useRef(null);

  // Check AI health on mount
  useEffect(() => {
    let mounted = true;
    aiClient.get('/')
      .then(() => { if (mounted) setAiHealthy(true); })
      .catch(() => { if (mounted) setAiHealthy(false); });
    return () => { mounted = false; };
  }, []);

  // --- Signature Scroll Moment: Scanner Stage scroll listener ---
  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) {
      if (scannerStageRef.current) {
        scannerStageRef.current.style.setProperty('--fan', '1');
        scannerStageRef.current.style.setProperty('--sweep', '0');
        scannerStageRef.current.style.setProperty('--reveal', '1');
      }
      return;
    }

    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!scannerContainerRef.current || !scannerStageRef.current) return;

        const rect = scannerContainerRef.current.getBoundingClientRect();
        const totalDistance = rect.height - window.innerHeight;
        if (totalDistance <= 0) return;

        // Raw progress through the 350vh section: 0 to 1
        const progress = Math.min(Math.max(-rect.top / totalDistance, 0), 1);

        // Map progress to phases using clamp and mapRange
        // Phase 1: Fan (0 to 0.32)
        const fan = Math.min(Math.max(progress / 0.32, 0), 1);

        // Phase 2: Sweep (0.22 to 0.72)
        const sweep = Math.min(Math.max((progress - 0.22) / (0.72 - 0.22), 0), 1);

        // Phase 3: Reveal (0.68 to 1.0)
        const reveal = Math.min(Math.max((progress - 0.68) / (1.0 - 0.68), 0), 1);

        // Track scrollytelling step pill index (0: Ingestion, 1: Audit, 2: Alignment, 3: Verification)
        if (progress < 0.25) setCurrentStepIndex(0);
        else if (progress < 0.55) setCurrentStepIndex(1);
        else if (progress < 0.75) setCurrentStepIndex(2);
        else setCurrentStepIndex(3);

        scannerStageRef.current.style.setProperty('--fan', fan.toFixed(4));
        scannerStageRef.current.style.setProperty('--sweep', sweep.toFixed(4));
        scannerStageRef.current.style.setProperty('--reveal', reveal.toFixed(4));
        scannerStageRef.current.style.setProperty('--progress', progress.toFixed(4));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // --- Template Cards One-Time Tilt In Transition (IntersectionObserver) ---
  useEffect(() => {
    const cards = document.querySelectorAll('.template-tilt-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await aiClient.post('/api/v1/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onAIUpload(response.data);
    } catch (err) {
      console.error('AI Extraction failed:', err);
      alert('Failed to extract resume data. Please verify the document or start manually.');
    } finally {
      setIsUploading(false);
    }
  };

  const scrollToScanner = () => {
    if (scannerContainerRef.current) {
      scannerContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EBF8F1] via-[#FFFFFF] to-[#FFF2EC] text-[#0F172A] font-sans selection:bg-[#FF8E72]/30 selection:text-[#0F172A]">
      {/* Hidden file input for AI resume upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.docx"
      />

      {/* Ambient background glows in light green and light peach */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-200/35 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/6 w-[550px] h-[550px] bg-orange-200/35 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* --- Top Product Navigation Bar (Light Theme) --- */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF8E72] to-[#FF7556] p-0.5 shadow-[0_2px_12px_rgba(255,142,114,0.3)] flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <FileCode2 size={18} className="text-[#FF8E72]" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-[#0F172A]">ResuSolve</span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ATS v2.4
                </span>
              </div>
              <span className="text-[11px] text-slate-500 -mt-0.5">Physical document precision</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button 
              onClick={scrollToScanner} 
              className="hover:text-emerald-700 transition-colors cursor-pointer text-left"
            >
              The scanner stage
            </button>
            <button 
              onClick={onScore} 
              className="hover:text-emerald-700 transition-colors cursor-pointer text-left"
            >
              Match score
            </button>
            <button 
              onClick={onResumeScore} 
              className="hover:text-emerald-700 transition-colors cursor-pointer text-left"
            >
              Quality audit
            </button>
            <button 
              onClick={onStart} 
              className="hover:text-emerald-700 transition-colors cursor-pointer text-left"
            >
              Templates
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onStart}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors cursor-pointer"
            >
              Open studio
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-semibold bg-gradient-to-r from-[#FF8E72] to-[#FF7556] hover:brightness-105 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(255,142,114,0.3)] active:scale-[0.98]"
            >
              <Upload size={14} />
              <span>{isUploading ? 'Parsing document...' : 'Upload resume'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* AI offline banner */}
      {!aiHealthy && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center justify-center gap-2">
          <AlertCircle size={14} className="text-amber-600" />
          <span>AI extraction service offline at {AI_SERVICE_URL}. Manual builder and template export remain active.</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1 — HERO
          ========================================================================= */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 px-6 sm:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl text-left mb-12">
          
          {/* Release Status Tag */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-xs font-medium mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            <span className="text-emerald-800 font-semibold">99.4% First-Pass Parse Rate</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Single-Stream OCR Engine</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-[1.14] mb-6">
            Resumes engineered for applicant scanners.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8 font-normal">
            Craft a clean, machine-readable document that sails past Workday, Taleo, and Greenhouse filters without formatting corruption.
          </p>

          {/* Two CTAs side by side */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 mb-5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-gradient-to-r from-[#FF8E72] to-[#FF7556] hover:brightness-105 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all shadow-[0_4px_22px_rgba(255,142,114,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Upload size={16} />
              <span>{isUploading ? 'Extracting text...' : 'Upload & Build'}</span>
            </button>

            <button
              onClick={onStart}
              className="text-sm font-semibold text-slate-800 hover:text-[#FF7556] py-3.5 px-2 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Create manually</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Trust markers row: plain text separated by dots */}
          <div className="text-xs text-slate-500 font-normal tracking-wide">
            No card required &nbsp;·&nbsp; Export anytime &nbsp;·&nbsp; Your data stays private
          </div>
        </div>

        {/* Large Product Builder Visual Mockup */}
        <div className="relative mt-8">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden">
            
            {/* Window Chrome Header */}
            <div className="h-11 border-b border-slate-200/80 bg-[#F8FAFC] px-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]/80 inline-block" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                <span>alexander_wright_resume.pdf</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  ATS 99% Pass
                </span>
              </div>
              <div className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                Single-Stream
              </div>
            </div>

            {/* Builder Canvas with Paper Document Inside */}
            <div className="p-6 sm:p-12 bg-[#EDF7F2]/60 flex items-center justify-center relative">
              <div className="w-full max-w-[540px] bg-white rounded-lg border border-slate-200 p-6 sm:p-8 text-[#0F172A] shadow-xl flex flex-col justify-between select-none">
                <div>
                  <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
                    <div>
                      <div className="font-serif font-bold text-xl sm:text-2xl text-[#0F172A]">Alexander Wright</div>
                      <div className="text-xs text-slate-500 tracking-wide mt-0.5">Staff Distributed Systems Architect • Seattle, WA</div>
                    </div>
                    <div className="w-8 h-8 rounded border border-emerald-200 flex items-center justify-center bg-emerald-50">
                      <FileText size={16} className="text-emerald-700" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-[9px] font-bold tracking-wider text-slate-400 mb-1.5">QUALIFICATIONS & FOCUS</div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-slate-900 rounded-full w-full" />
                      <div className="h-2 bg-slate-700 rounded-full w-[92%]" />
                      <div className="h-2 bg-slate-400 rounded-full w-[75%]" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-[9px] font-bold tracking-wider text-slate-400 mb-1.5">ENGINEERING EXPERIENCE</div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className="h-2.5 bg-slate-900 rounded-sm w-[45%]" />
                        <div className="h-2 bg-slate-400 rounded-sm w-[22%]" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-slate-700 rounded-full w-[96%]" />
                        <div className="h-2 bg-slate-400 rounded-full w-[84%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="h-2.5 bg-slate-900 rounded-sm w-[40%]" />
                        <div className="h-2 bg-slate-400 rounded-sm w-[18%]" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-slate-700 rounded-full w-[90%]" />
                        <div className="h-2 bg-slate-400 rounded-full w-[70%]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <div className="text-[9px] font-bold tracking-wider text-slate-400 mb-1">EDUCATION</div>
                      <div className="h-2 bg-slate-800 rounded-sm w-[75%] mb-1" />
                      <div className="h-1.5 bg-slate-400 rounded-sm w-[60%]" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold tracking-wider text-slate-400 mb-1">TECHNICAL SKILLS</div>
                      <div className="h-2 bg-slate-800 rounded-full w-full mb-1" />
                      <div className="h-2 bg-slate-400 rounded-full w-[80%]" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 mt-5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Plaintext Hierarchy: 100% Parse Rate</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">ISO/IEC 29500</span>
                </div>
              </div>
            </div>

            {/* Bottom ribbon */}
            <div className="h-11 border-t border-slate-200/80 bg-[#F8FAFC] px-6 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Parser validated • Zero dropped characters across Workday & Taleo</span>
              </div>
              <button 
                onClick={onStart}
                className="text-[#FF7556] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Edit in Studio</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Cue to next section */}
          <div className="text-center mt-6">
            <button 
              onClick={scrollToScanner} 
              className="text-xs text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer font-mono inline-flex items-center gap-1"
            >
              <span>Scroll to see how scoring works ↓</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — LOGO / TOOL MARQUEE (Old workflow callout)
          ========================================================================= */}
      <section className="py-20 border-t border-emerald-100/90 overflow-hidden bg-[#F3FAF5]">
        <div className="max-w-5xl mx-auto px-6 text-center mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">
            One app instead of eight tabs.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Stop juggling disconnected tools to patch together an ATS-compliant resume.
          </p>
        </div>

        {/* Marquee Row 1: Leftward infinite loop */}
        <div className="relative w-full overflow-hidden mb-4 pause-hover">
          <div className="animate-marquee-left flex items-center gap-4">
            {[
              "Word templates", 
              "Grammarly", 
              "Canva exports", 
              "ChatGPT tabs", 
              "PDF repair tools", 
              "LinkedIn 'Easy Apply'",
              "Word templates", 
              "Grammarly", 
              "Canva exports", 
              "ChatGPT tabs", 
              "PDF repair tools", 
              "LinkedIn 'Easy Apply'"
            ].map((tool, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 text-slate-700 text-xs font-mono px-4 py-2 rounded-lg shrink-0 select-none shadow-xs"
              >
                {tool}
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2: Rightward infinite loop */}
        <div className="relative w-full overflow-hidden pause-hover">
          <div className="animate-marquee-right flex items-center gap-4">
            {[
              "Spreadsheet trackers", 
              "Recruiter email threads", 
              "Jobscan credits", 
              "ATS test checkers", 
              "Multi-column layout traps", 
              "Font converters",
              "Spreadsheet trackers", 
              "Recruiter email threads", 
              "Jobscan credits", 
              "ATS test checkers", 
              "Multi-column layout traps", 
              "Font converters"
            ].map((tool, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 text-slate-700 text-xs font-mono px-4 py-2 rounded-lg shrink-0 select-none shadow-xs"
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — BEFORE / AFTER COMPARISON
          ========================================================================= */}
      <section className="py-24 px-6 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="max-w-3xl mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
            Why traditional resume workflows fail scans
          </h2>
          <p className="text-sm text-slate-600">
            Side-by-side comparison of old fragmented methods versus ResuSolve's compiled single-stream pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: The Old Way */}
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                  <X size={14} />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-700">The old way</h3>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span>Formatting breaks when exported to PDF or parsed by Workday.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span>No way to know if your resume will be rejected by ATS bots.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span>Guessing keywords manually by re-reading job descriptions.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span>Juggling 10 different Word files with broken alignment.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold mt-0.5">✕</span>
                  <span>Zero feedback until automated rejection emails weeks later.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 text-[11px] text-slate-400 font-mono">
              Result: 70%+ rejection rate prior to human review
            </div>
          </div>

          {/* Column 2: The ResuSolve Way */}
          <div className="bg-white border-2 border-emerald-400 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <Check size={14} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0F172A]">The ResuSolve way</h3>
              </div>

              <div className="space-y-4 text-xs text-[#0F172A] leading-relaxed font-normal">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Single-stream vector layout guarantees 100% character fidelity.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Real-time optical scanner simulation scores your resume before applying.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Instant job description matcher extracts missing technical tokens.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>14 engineered, ATS-tested templates ready to customize in one click.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span>Actionable ATS parse score and diagnostic fixes in under 3 seconds.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-emerald-100 mt-6 text-[11px] text-emerald-700 font-mono flex items-center gap-1.5 font-semibold">
              <CheckCircle2 size={13} />
              <span>Result: 99.4% verified machine parse accuracy</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — SCROLLYTELLING CASE STUDY (Extended Scanner Stage)
          ========================================================================= */}
      <section 
        ref={scannerContainerRef} 
        className="scanner-pinned-container border-t border-slate-200/80"
      >
        <div 
          ref={scannerStageRef}
          className="scanner-sticky-viewport flex flex-col items-center justify-center relative px-6"
        >
          {/* Top Section Headline & Pill Timeline */}
          <div className="text-center max-w-xl mx-auto mb-6 z-20">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
              The candidate journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              Scroll through the pipeline to see how an unformatted resume transforms into an ATS-certified document.
            </p>

            {/* Step Timeline Pills: I, II, III, IV */}
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-full text-xs font-mono shadow-xs">
              {[
                { id: 0, label: "I: Ingestion" },
                { id: 1, label: "II: Scanner Audit" },
                { id: 2, label: "III: Keyword Match" },
                { id: 3, label: "IV: Verification" }
              ].map((step) => (
                <div
                  key={step.id}
                  className={`px-3 py-1 rounded-full transition-all duration-300 ${
                    currentStepIndex === step.id
                      ? "bg-[#FF8E72] text-white font-bold shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>

          {/* 3D Stack Stage */}
          <div className="scanner-stack">
            
            {/* Sheet 2 (Bottom layer) */}
            <div className="scanner-sheet scanner-sheet-2 p-5 flex flex-col justify-between select-none">
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                  <div className="h-3 bg-slate-900 rounded-sm w-28" />
                  <div className="h-2 bg-slate-400 rounded-sm w-16" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-2 bg-slate-700 rounded-full w-full" />
                  <div className="h-2 bg-slate-400 rounded-full w-4/5" />
                  <div className="h-2 bg-slate-500 rounded-full w-3/4" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-slate-600 rounded-full w-5/6" />
                  <div className="h-2 bg-slate-400 rounded-full w-2/3" />
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                <span>Credentials & Publications</span>
                <span className="text-emerald-600 font-semibold">Semantic Verified</span>
              </div>
            </div>

            {/* Sheet 1 (Middle layer) */}
            <div className="scanner-sheet scanner-sheet-1 p-5 flex flex-col justify-between select-none">
              <div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                  <div className="h-3 bg-slate-900 rounded-sm w-36" />
                  <div className="h-2 bg-slate-400 rounded-sm w-20" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-2 bg-slate-800 rounded-full w-full" />
                  <div className="h-2 bg-slate-600 rounded-full w-[88%]" />
                  <div className="h-2 bg-slate-400 rounded-full w-[70%]" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-slate-700 rounded-full w-[94%]" />
                  <div className="h-2 bg-slate-400 rounded-full w-[65%]" />
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-500 flex justify-between">
                <span>Experience Timeline</span>
                <span className="text-emerald-600 font-semibold">Linear Hierarchy</span>
              </div>
            </div>

            {/* Sheet 0 (Top layer) */}
            <div className="scanner-sheet scanner-sheet-0 p-5 sm:p-6 flex flex-col justify-between select-none">
              <div>
                <div className="border-b border-slate-200 pb-3 mb-3">
                  <div className="h-3.5 bg-slate-900 rounded-sm w-32 mb-1.5" />
                  <div className="h-2 bg-slate-500 rounded-sm w-44" />
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="h-2 bg-slate-800 rounded-full w-full" />
                  <div className="h-2 bg-slate-600 rounded-full w-[90%]" />
                  <div className="h-2 bg-slate-500 rounded-full w-[75%]" />
                </div>
                <div className="border-t border-slate-200 pt-2 mb-2">
                  <div className="h-2.5 bg-slate-900 rounded-sm w-24 mb-2" />
                  <div className="space-y-1.5">
                    <div className="h-2 bg-slate-700 rounded-full w-[95%]" />
                    <div className="h-2 bg-slate-500 rounded-full w-[80%]" />
                  </div>
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-500 flex justify-between pt-2 border-t border-slate-200">
                <span>Header Anchor</span>
                <span className="text-emerald-600 font-semibold">Single-Stream Mapped</span>
              </div>
            </div>

            {/* Glowing Peach Scanbeam line */}
            <div className="scanner-beam" />

            {/* Floating verification labels in Light Green */}
            <div className="absolute -right-4 sm:-right-44 top-12 flex flex-col gap-3 z-30 pointer-events-none">
              <div 
                className="bg-white border border-emerald-200 text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5 transition-opacity duration-300"
                style={{
                  opacity: 'calc(clamp(0, (var(--sweep, 0) - 0.2) * 5, 1))'
                }}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={12} />
                </div>
                <span className="font-semibold text-slate-800">Formatting parsed</span>
              </div>

              <div 
                className="bg-white border border-emerald-200 text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5 transition-opacity duration-300"
                style={{
                  opacity: 'calc(clamp(0, (var(--sweep, 0) - 0.45) * 5, 1))'
                }}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={12} />
                </div>
                <span className="font-semibold text-slate-800">Keywords matched</span>
              </div>

              <div 
                className="bg-white border border-emerald-200 text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5 transition-opacity duration-300"
                style={{
                  opacity: 'calc(clamp(0, (var(--sweep, 0) - 0.7) * 5, 1))'
                }}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check size={12} />
                </div>
                <span className="font-semibold text-slate-800">Section order fixed</span>
              </div>
            </div>

            {/* Floating "ATS Score" Reveal Card (Phase 3 / Step IV) */}
            <div className="scanner-score-card w-[300px] sm:w-[330px] bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 border border-emerald-200 shadow-sm">
                <ShieldCheck size={26} />
              </div>
              <div className="font-serif text-3xl font-bold text-[#0F172A] mb-1">
                99 / 100
              </div>
              <div className="text-xs font-semibold text-emerald-700 mb-2.5 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Machine-readable certified
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-5">
                Zero parsing errors across Workday, Taleo, Greenhouse, and Lever filters. Ready for submission.
              </p>
              <button
                onClick={onStart}
                className="w-full py-2.5 bg-gradient-to-r from-[#FF8E72] to-[#FF7556] hover:brightness-105 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-[0_3px_14px_rgba(255,142,114,0.3)]"
              >
                Build your document
              </button>
            </div>

          </div>

          {/* Bottom telemetry text */}
          <div className="mt-8 text-center text-xs text-slate-500 font-mono z-20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8E72] animate-pulse" />
            <span>Scroll progress linked • Case study timeline</span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — TRUST / SECURITY TICKER
          ========================================================================= */}
      <section className="py-5 border-t border-b border-orange-100 bg-[#FFF7F2] overflow-hidden">
        <div className="animate-marquee-slow flex items-center gap-12 text-xs text-slate-600 font-mono select-none">
          {[1, 2, 3].map((loopIdx) => (
            <React.Fragment key={loopIdx}>
              <span className="flex items-center gap-2 shrink-0">
                <Lock size={12} className="text-[#FF8E72]" />
                Resumes parsed locally in memory
              </span>
              <span className="shrink-0 text-slate-300">·</span>
              <span className="flex items-center gap-2 shrink-0">
                <FileCheck size={12} className="text-emerald-600" />
                Exports generated on demand
              </span>
              <span className="shrink-0 text-slate-300">·</span>
              <span className="flex items-center gap-2 shrink-0">
                <ShieldCheck size={12} className="text-[#FF8E72]" />
                No resume data sold or shared
              </span>
              <span className="shrink-0 text-slate-300">·</span>
              <span className="flex items-center gap-2 shrink-0">
                <Check size={12} className="text-emerald-600" />
                Delete your document anytime
              </span>
              <span className="shrink-0 text-slate-300">·</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CURATED TEMPLATES SHOWCASE (With One-Time 3D Tilt Cards)
          ========================================================================= */}
      <section className="py-24 px-6 sm:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-800 font-semibold">Tested Across 20+ Enterprise Parsers</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-4">
            Engineered document templates
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Every layout conforms strictly to standardized typographic grids, avoiding column traps, unanchored floating boxes, or symbols that cause parser dropouts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {FEATURED_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="template-tilt-card group bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xl rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xs"
            >
              <div>
                <div className="aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden mb-5 border border-slate-200/80 relative">
                  <img 
                    src={`/${tpl.image}`} 
                    alt={tpl.name}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-800 border border-emerald-200/80 font-semibold">
                    {tpl.category}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button
                      onClick={() => onSelectTemplate ? onSelectTemplate(tpl.id) : onStart()}
                      className="w-full py-2.5 bg-gradient-to-r from-[#FF8E72] to-[#FF7556] hover:brightness-105 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Use this template
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-serif text-lg font-bold text-[#0F172A]">
                    {tpl.name}
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    {tpl.matchRate}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {tpl.desc}
                </p>
              </div>

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-slate-600">
                  <CheckCircle2 size={12} className="text-emerald-500" /> Verified Vector
                </span>
                <button
                  onClick={() => onSelectTemplate ? onSelectTemplate(tpl.id) : onStart()}
                  className="text-[#FF7556] hover:underline font-semibold cursor-pointer"
                >
                  Select format &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 px-6 py-3.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <span>View all 14 ATS templates</span>
            <ArrowRight size={15} className="text-[#FF8E72]" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — PRICING CARDS (01 / 02 / 03 Numerical Index)
          ========================================================================= */}
      <section className="py-24 px-6 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="max-w-3xl mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
            Transparent, straightforward pricing
          </h2>
          <p className="text-sm text-slate-600">
            Build freely with no surprises. Upgrade when you need unlimited AI parsing and premium vector PDF exports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan 01 — Free Starter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-xs">
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2">01</div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A] mb-1">Starter</h3>
              <p className="text-xs text-slate-500 mb-6">Foundational builder tools for job seekers starting out.</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[#0F172A]">$0</span>
                <span className="text-xs text-slate-500">forever free</span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Manual resume builder editor</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>3 foundational ATS templates</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Unlimited high-res PNG image exports</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Basic section ordering checker</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStart}
              className="w-full mt-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Start building free
            </button>
          </div>

          {/* Plan 02 — Pro Pass (Most Popular) */}
          <div className="bg-white border-2 border-[#FF8E72] rounded-2xl p-7 flex flex-col justify-between relative shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF8E72] to-[#FF7556] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
              Most popular
            </div>

            <div>
              <div className="text-xs font-mono text-[#FF8E72] font-semibold mb-2">02</div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A] mb-1">Pro Pass</h3>
              <p className="text-xs text-slate-500 mb-6">Complete suite with AI extraction, scoring, and all templates.</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[#0F172A]">$9</span>
                <span className="line-through text-slate-400 text-base font-normal">$29</span>
                <span className="text-xs text-[#FF8E72] font-semibold font-mono">launch price</span>
              </div>

              <div className="space-y-3 text-xs text-slate-800 pt-6 border-t border-slate-100 font-medium">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>All 14 engineered ATS templates</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>AI resume document upload & parsing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Unlimited vector PDF downloads</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Job description match score tool</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Resume content quality score audit</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStart}
              className="w-full mt-8 py-3 bg-gradient-to-r from-[#FF8E72] to-[#FF7556] hover:brightness-105 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              Get Pro access
            </button>
          </div>

          {/* Plan 03 — Lifetime Executive */}
          <div className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between shadow-xs">
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2">03</div>
              <h3 className="font-serif text-xl font-bold text-[#0F172A] mb-1">Lifetime Executive</h3>
              <p className="text-xs text-slate-500 mb-6">Permanent access for career transitions and executives.</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-[#0F172A]">$29</span>
                <span className="line-through text-slate-400 text-base font-normal">$79</span>
                <span className="text-xs text-slate-500 font-mono">one-time</span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Lifetime access to all future updates</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Priority AI token allocation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>McKinsey & Harvard executive formats</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-600" />
                  <span>Direct creator support channel</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStart}
              className="w-full mt-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Get Lifetime pass
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — FOUNDER / TRUST QUOTE
          ========================================================================= */}
      <section className="py-20 px-6 sm:px-8 max-w-4xl mx-auto border-t border-slate-200/80 text-center">
        <div className="bg-white border border-emerald-100/90 rounded-3xl p-8 sm:p-12 shadow-md">
          <blockquote className="font-serif text-lg sm:text-2xl text-[#0F172A] leading-relaxed italic mb-8">
            "I built ResuSolve after watching qualified candidates get automatically filtered out by applicant tracking systems simply because their resume used tables or non-standard fonts. A resume should be treated like an engineering specification: beautiful to human recruiters and flawless to parsers."
          </blockquote>

          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8E72] to-[#FF7556] text-white font-serif font-bold text-base flex items-center justify-center shadow-xs">
              HM
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm text-[#0F172A]">Hemasundar Maroti</div>
              <div className="text-xs text-slate-500">Creator & Engineer, ResuSolve</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8 — FAQ ACCORDION
          ========================================================================= */}
      <section className="py-24 px-6 sm:px-8 max-w-4xl mx-auto border-t border-slate-200/80">
        <div className="mb-14 text-left">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight mb-3">
            Frequently asked questions
          </h2>
          <p className="text-sm text-slate-600">
            Clear answers about parser compliance, security, and exports.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-all duration-200 shadow-xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                className="w-full py-4 px-6 text-left flex items-center justify-between text-sm font-semibold text-[#0F172A] hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${
                    activeFaq === idx ? "rotate-180 text-[#FF8E72]" : ""
                  }`} 
                />
              </button>

              {activeFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 9 — SITEMAP FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 bg-[#F8FAF9] py-16 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12 text-xs">
          
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-[#0F172A]">ResuSolve</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Physical document precision engineered to pass automated applicant tracking systems.
            </p>
            <div className="text-[11px] text-emerald-700 font-mono font-medium">
              v2.4 Production Release
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-[#0F172A] mb-4">Product</h4>
            <ul className="space-y-2.5 text-slate-600">
              <li>
                <button onClick={onStart} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  Resume Builder Studio
                </button>
              </li>
              <li>
                <button onClick={onScore} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  Job Match Score
                </button>
              </li>
              <li>
                <button onClick={onResumeScore} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  Quality Audit Checker
                </button>
              </li>
              <li>
                <button onClick={scrollToScanner} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  Optical Scanner Stage
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Templates */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-[#0F172A] mb-4">Templates</h4>
            <ul className="space-y-2.5 text-slate-600">
              <li>
                <button onClick={() => onSelectTemplate ? onSelectTemplate('ats_pro') : onStart()} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  ATS Pro Standard
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTemplate ? onSelectTemplate('google') : onStart()} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  Tech Giant Format
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTemplate ? onSelectTemplate('classic') : onStart()} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  Classic Editorial
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTemplate ? onSelectTemplate('consultant') : onStart()} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  Strategy Practice
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTemplate ? onSelectTemplate('ivy') : onStart()} className="hover:text-emerald-700 transition-colors cursor-pointer">
                  Academic Traditional
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Standards & Security */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-[#0F172A] mb-4">Standards</h4>
            <ul className="space-y-2.5 text-slate-600">
              <li>
                <span className="text-slate-800">ISO/IEC 29500 Compliant</span>
              </li>
              <li>
                <span className="text-slate-800">Single-Stream Layout Vector</span>
              </li>
              <li>
                <span className="text-slate-800">In-Memory PDF Generation</span>
              </li>
              <li>
                <span className="text-slate-800">Zero Third-Party Data Sharing</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 ResuSolve. All rights reserved.
          </div>
          <div>
            Designed and developed by <span className="text-[#0F172A] font-semibold">Hemasundar Maroti</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
