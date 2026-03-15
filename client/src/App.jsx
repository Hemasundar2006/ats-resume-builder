import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Lazy load components for performance optimization (FCP/LCP)
const LandingPage = lazy(() => import('./components/LandingPage'));
const TemplateGallery = lazy(() => import('./components/TemplateGallery'));
const BuilderPage = lazy(() => import('./components/BuilderPage'));
const Analytics = lazy(() => import("@vercel/analytics/react").then(mod => ({ default: mod.Analytics })));

axios.defaults.baseURL = 'https://ats-resume-builder-7xio.onrender.com';

const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-[#ccff00] border-t-transparent rounded-full"
    />
  </div>
);

export default function App() {
  const [appState, setAppState] = useState('landing'); // 'landing', 'selection', 'builder'
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  return (
    <>
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>

      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          {appState === 'landing' && (
            <motion.div 
              key="landing" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} 
              transition={{ duration: 0.5 }}
            >
              <LandingPage onStart={() => setAppState('selection')} />
            </motion.div>
          )}

          {appState === 'selection' && (
            <motion.div 
              key="selection" 
              initial={{ opacity: 0, x: 100 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4 }}
            >
              <TemplateGallery 
                onSelect={(id) => { setSelectedTemplate(id); setAppState('builder'); }} 
                onBack={() => setAppState('landing')}
              />
            </motion.div>
          )}

          {appState === 'builder' && (
            <motion.div 
              key="builder" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <BuilderPage 
                initialTemplate={selectedTemplate} 
                onBack={() => setAppState('selection')}
              />
            </motion.div>
          )}
        </Suspense>
      </AnimatePresence>
    </>
  );
}
