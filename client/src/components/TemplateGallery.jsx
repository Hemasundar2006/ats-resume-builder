import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { TEMPLATES } from '../constants';

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
        <h2 className="text-gray-400 text-lg max-w-2xl mx-auto font-normal">
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
                loading="lazy"
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

export default TemplateGallery;
