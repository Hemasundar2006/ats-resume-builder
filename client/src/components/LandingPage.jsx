import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight } from 'lucide-react';

const LandingPage = ({ onStart }) => {
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
          ResuSolve <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#00ffcc]">ATS Resume Builder</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl font-medium leading-relaxed"
        >
          Beat the bots with our AI-powered structuring engine. Craft your resume in real-time, instantly score it against real job descriptions, and export to a perfectly parseable format.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
          whileHover={{ scale: 1.05, translateY: -5, boxShadow: "0px 20px 40px rgba(204, 255, 0, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="group relative px-10 py-5 bg-[#ccff00] rounded-full text-black font-bold text-xl flex items-center gap-3 overflow-hidden border border-[#ccff00]/20 shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-all"
        >
          <span className="relative z-10 flex items-center gap-2 font-black italic">Build My Resume <ChevronRight className="group-hover:translate-x-1 transition-transform" /></span>
          
          <motion.div 
            initial={{ x: "-100%" }}
            whileHover={{ x: "200%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-45deg]"
          />
        </motion.button>
      </div>

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

export default LandingPage;
