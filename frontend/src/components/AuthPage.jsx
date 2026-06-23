import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AuthPage({ onBack, onLogin }) {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <div className="min-h-screen bg-[#f4f3ec] flex items-center justify-center p-4 lg:p-8 relative font-sans overflow-hidden">
      {/* Back to Home Button */}
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-sm font-bold text-gray-500 hover:text-gray-900 transition flex items-center gap-2 z-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Platform
      </button>

      {/* Main Auth Card Container */}
      <div className="relative w-full max-w-[1000px] h-[600px] bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] flex overflow-hidden">
        
        {/* The Animated Forms Container (Moves Left/Right) */}
        <motion.div 
          className="absolute top-0 h-full bg-white z-10 flex flex-col justify-center px-8 lg:px-16"
          style={{ width: '50%' }}
          initial={false}
          animate={{ x: isSignUp ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.8 }}
        >
          <div className="w-full max-w-[340px] mx-auto">
            <div className="mb-8">
              {/* Orange asterisk icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                <path d="M12 2v20M17 5l-10 14M7 5l10 14M2 12h20"/>
              </svg>
              
              <motion.h2 
                key={isSignUp ? "signup" : "signin"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[32px] font-bold tracking-tight text-[#16171d] mb-2 leading-tight"
              >
                {isSignUp ? "Create an account" : "Welcome back"}
              </motion.h2>
              
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                {isSignUp 
                  ? "Access your dashboard, manage infrastructure, and keep everything flowing in one place." 
                  : "Enter your details to securely sign in to your command center."}
              </p>
            </div>

            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#16171d] mb-1.5 tracking-wide">Your email</label>
                <input 
                  type="email" 
                  placeholder="admin@akshatcyber.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#16171d] mb-1.5 tracking-wide">
                  {isSignUp ? "Create password" : "Password"}
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition placeholder:text-gray-300"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <button type="button" onClick={onLogin} className="w-full bg-[#111827] hover:bg-[#1f2937] text-white font-semibold py-3.5 rounded-xl text-sm mt-2 transition shadow-lg shadow-gray-900/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                {isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-gray-100 flex-1"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or continue with</span>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>

            {/* Google option */}
            <a 
              href="http://localhost/api/auth/google"
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#16171d] font-semibold py-3.5 rounded-xl text-sm transition cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </a>

            <p className="text-center text-[13px] font-medium text-gray-500 mt-6">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#ea580c] hover:underline font-bold transition"
              >
                {isSignUp ? "Sign in" : "Register"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* The Animated Gradient Panel (Moves Right/Left) */}
        <motion.div 
          className="absolute top-0 h-full z-20 pointer-events-none p-4"
          style={{ width: '50%' }}
          initial={false}
          animate={{ x: isSignUp ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.8 }}
        >
          {/* Beautiful Peach/Orange Gradient following BrightNest reference */}
          <div className="w-full h-full bg-gradient-to-br from-[#fdfbf9] via-[#ffcdb2] to-[#ff8c5a] rounded-2xl p-10 flex flex-col justify-between text-[#16171d] shadow-inner relative overflow-hidden">
            
            {/* Soft decorative glow */}
            <div className="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] bg-white/40 blur-[80px] rounded-full mix-blend-overlay" />
            
            {/* Logo */}
            <div className="flex items-center gap-2 relative z-10">
              <div className="bg-[#1c2135] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs italic shadow-md">
                ACC
              </div>
              <span className="font-bold text-base tracking-tight">Akshat Cyber Cloud</span>
            </div>

            {/* Bottom Text */}
            <div className="relative z-10 max-w-[280px]">
               <p className="text-[13px] font-semibold mb-3 opacity-70 tracking-wide text-[#16171d]">
                 You can easily
               </p>
               <motion.h2 
                 key={isSignUp ? "signup-text" : "signin-text"}
                 initial={{ opacity: 0, x: isSignUp ? -10 : 10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ duration: 0.3, delay: 0.1 }}
                 className="text-[34px] font-bold leading-[1.05] tracking-tight text-[#16171d]"
               >
                 {isSignUp 
                   ? "Get access your personal hub for clarity and productivity." 
                   : "Secure and orchestrate your autonomous infrastructure."}
               </motion.h2>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
