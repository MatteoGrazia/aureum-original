import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { House, Utensils, Dumbbell, Activity, User, Sun, Moon, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeProvider, useTheme } from '@/components/shared/ThemeContext';

function LayoutInner({ children, currentPageName }) {
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', icon: House, page: 'Dashboard' },
    { name: 'Nutrition', icon: Utensils, page: 'Nutrition' },
    { name: 'Workouts', icon: Dumbbell, page: 'Workouts' },
    { name: 'Community', icon: Users, page: 'Community' },
    { name: 'Activity', icon: Activity, page: 'Activity' },
    { name: 'Profile', icon: User, page: 'Profile' },
  ];

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        backgroundColor: isDarkMode ? '#080808' : '#F5F5F7',
        backgroundImage: isDarkMode
          ? `radial-gradient(ellipse 1200px 800px at 30% 20%, rgba(180,180,180,0.15) 0%, transparent 60%),
             radial-gradient(ellipse 1000px 600px at 70% 60%, rgba(200,200,200,0.12) 0%, transparent 60%),
             radial-gradient(ellipse 800px 500px at 50% 90%, rgba(160,160,160,0.1) 0%, transparent 60%)`
          : `radial-gradient(ellipse 1200px 800px at 30% 20%, rgba(212,175,55,0.07) 0%, transparent 60%),
             radial-gradient(ellipse 1000px 600px at 70% 60%, rgba(225,193,110,0.05) 0%, transparent 60%)`,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&family=Montserrat:wght@200;300;400;500&display=swap"
        rel="stylesheet"
      />
      <style>{`
        :root {
          --gold: #D4AF37;
          --bronze: #BFA68F;
          --muted-bronze: #9C7E46;
          --gold-light: rgba(212, 175, 55, 0.2);
          --gold-glow: rgba(212, 175, 55, 0.4);
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(212, 175, 55, 0.2);
          --void-black: #080808;
        }

        .glass-card {
          backdrop-filter: blur(12px) saturate(140%);
          background: rgba(255, 255, 255, 0.05);
          border: 0.5px solid rgba(212, 175, 55, 0.2);
          transition: background 0.18s ease, border-color 0.18s ease;
          will-change: auto;
          transform: translateZ(0);
        }

        .gold-text { color: var(--gold); }

        .gold-gradient {
          background: linear-gradient(135deg, #D4AF37 0%, #D4AF37 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glow-gold {
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1);
        }

        * { font-family: 'Montserrat', sans-serif; font-weight: 400; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Montserrat', sans-serif; font-weight: 400; }
        .font-medium { font-weight: 400; }
        .font-semibold, .font-bold { font-weight: 500; }

        input, textarea, select {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(212, 175, 55, 0.2) !important;
        }
        input:focus, textarea:focus, select:focus {
          border-color: var(--gold) !important;
          outline: none;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 4px; }

        @supports (padding: max(0px)) {
          body { padding-bottom: env(safe-area-inset-bottom); }
        }

        /* ============================================
           ALABASTER LIGHT MODE OVERRIDES
        ============================================ */

        html[data-theme="light"] .glass-card {
          background: rgba(255, 255, 255, 0.88) !important;
          border: 0.5px solid rgba(225, 193, 110, 0.45) !important;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05) !important;
          transition: background 0.18s ease, border-color 0.18s ease !important;
        }

        /* Page backgrounds — override all dark bg references */
        html[data-theme="light"] [class*="bg-[#080808]"],
        html[data-theme="light"] [style*="background: #080808"],
        html[data-theme="light"] [style*="background-color: #080808"],
        html[data-theme="light"] [style*="background: rgb(8, 8, 8)"] {
          background-color: #F8F8F6 !important;
          background-image: none !important;
        }

        /* The #0a0a0a used in ExercisePicker */
        html[data-theme="light"] [style*="background: #0a0a0a"] {
          background-color: #F8F8F6 !important;
        }

        /* Hide animated void/star backgrounds */
        html[data-theme="light"] .void-bg-container {
          display: none !important;
        }

        /* === WHITE TEXT → DEEP CHARCOAL === */
        html[data-theme="light"] [class*="text-white"] {
          color: #1D1D1F !important;
          transition: color 0.18s ease !important;
        }
        /* Opacity variants — declared AFTER general rule so they override */
        html[data-theme="light"] [class*="text-white/10"] { color: rgba(29,29,31,0.10) !important; }
        html[data-theme="light"] [class*="text-white/15"] { color: rgba(29,29,31,0.15) !important; }
        html[data-theme="light"] [class*="text-white/20"] { color: rgba(29,29,31,0.20) !important; }
        html[data-theme="light"] [class*="text-white/25"] { color: rgba(29,29,31,0.25) !important; }
        html[data-theme="light"] [class*="text-white/30"] { color: rgba(29,29,31,0.30) !important; }
        html[data-theme="light"] [class*="text-white/35"] { color: rgba(29,29,31,0.35) !important; }
        html[data-theme="light"] [class*="text-white/40"] { color: rgba(29,29,31,0.40) !important; }
        html[data-theme="light"] [class*="text-white/50"] { color: rgba(29,29,31,0.50) !important; }
        html[data-theme="light"] [class*="text-white/60"] { color: rgba(29,29,31,0.60) !important; }
        html[data-theme="light"] [class*="text-white/70"] { color: rgba(29,29,31,0.70) !important; }
        html[data-theme="light"] [class*="text-white/80"] { color: rgba(29,29,31,0.80) !important; }

        /* Syndicate Sage token */
        :root { --syndicate-sage: #98AB8F; }

        /* White bg overlays → subtle dark equivalents */
        html[data-theme="light"] [class*="bg-white/5"]  { background-color: rgba(0,0,0,0.03) !important; }
        html[data-theme="light"] [class*="bg-white/10"] { background-color: rgba(0,0,0,0.05) !important; }
        html[data-theme="light"] [class*="bg-white/20"] { background-color: rgba(0,0,0,0.08) !important; }

        /* Inputs in light mode */
        html[data-theme="light"] input,
        html[data-theme="light"] textarea,
        html[data-theme="light"] select {
          color: #1D1D1F !important;
          background: rgba(255, 255, 255, 0.82) !important;
          border-color: rgba(225, 193, 110, 0.4) !important;
        }

        /* Gold elements: add shadow so they pop on alabaster */
        html[data-theme="light"] [class*="text-[#D4AF37]"] {
          filter: drop-shadow(0 1px 6px rgba(212, 175, 55, 0.35));
        }

        /* Scrollbar */
        html[data-theme="light"] ::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.5) !important;
        }

        /* Border overrides */
        html[data-theme="light"] [class*="border-white/"] {
          border-color: rgba(225, 193, 110, 0.3) !important;
        }

        /* FAB sidebar */
        html[data-theme="light"] {
          --fab-sidebar-bg: linear-gradient(135deg, rgba(248,248,246,0.95) 0%, rgba(255,255,255,0.9) 100%);
        }

        /* AureumPulse & VoidCard light body text */
        html[data-theme="light"] .text-white\\/60,
        html[data-theme="light"] .text-white\\/40 {
          color: rgba(29,29,31,0.55) !important;
        }

        /* Dashboard & page section headers */
        html[data-theme="light"] h1,
        html[data-theme="light"] h2,
        html[data-theme="light"] h3,
        html[data-theme="light"] p,
        html[data-theme="light"] span {
          /* only override elements that still have dark-mode white color */
        }

        /* Explicit white text in inline styles → charcoal in light mode */
        html[data-theme="light"] [style*="color: #FFFFFF"],
        html[data-theme="light"] [style*="color: white"],
        html[data-theme="light"] [style*="color: rgb(255, 255, 255)"] {
          color: #1D1D1F !important;
        }
        html[data-theme="light"] [style*="color: rgba(255,255,255,0.4)"] { color: rgba(29,29,31,0.4) !important; }
        html[data-theme="light"] [style*="color: rgba(255,255,255,0.3)"] { color: rgba(29,29,31,0.3) !important; }
        html[data-theme="light"] [style*="color: rgba(255,255,255,0.2)"] { color: rgba(29,29,31,0.2) !important; }
        html[data-theme="light"] [style*="color: rgba(255,255,255,0.35)"] { color: rgba(29,29,31,0.35) !important; }
        html[data-theme="light"] [style*="color: rgba(255,255,255,0.5)"] { color: rgba(29,29,31,0.5) !important; }
        html[data-theme="light"] [style*="color: rgba(255,255,255,0.6)"] { color: rgba(29,29,31,0.6) !important; }
      `}</style>

      {/* ── Theme Toggle: fixed top-right, 48×48 tap target ── */}
      <motion.button
        onClick={toggleTheme}
        className="fixed top-5 right-5 z-50 flex items-center justify-center rounded-full"
        style={{
          width: 48,
          height: 48,
          background: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.78)',
          border: `0.5px solid ${isDarkMode ? 'rgba(212,175,55,0.3)' : 'rgba(225,193,110,0.55)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0,0,0,0.5)'
            : '0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(225,193,110,0.15)',
          transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
        whileTap={{ scale: 0.88 }}
      >
        <motion.div
          animate={{ rotate: isDarkMode ? 0 : 180 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {isDarkMode ? (
            /* In dark mode: show Moon icon → tap to go light */
            <Moon className="w-[18px] h-[18px]" style={{ color: '#D4AF37' }} strokeWidth={1.5} />
          ) : (
            /* In light mode: show Sun icon (gold) → tap to go dark */
            <Sun className="w-[18px] h-[18px]" style={{ color: '#D4AF37' }} strokeWidth={1.5} />
          )}
        </motion.div>
      </motion.button>

      <main
        className="pb-24 min-h-screen"
        style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {children}
      </main>

      {/* ── Premium Frosted Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ display: 'var(--hide-nav, block)' }}>
        <div
          className="mx-4 mb-3 rounded-2xl glass-card overflow-hidden"
          style={{ marginBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex items-center justify-around py-4 px-2">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              const Icon = item.icon;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className="flex items-center justify-center p-3 relative transition-all duration-300"
                >
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive ? 'text-[#D4AF37]' : 'text-[#9C7E46]'
                    }`}
                    strokeWidth={1}
                  />
                  {isActive && (
                    <div
                      className="absolute -bottom-1 w-8 h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                        boxShadow: '0 0 8px rgba(212,175,55,0.7), 0 0 16px rgba(212,175,55,0.3)'
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <LayoutInner children={children} currentPageName={currentPageName} />
    </ThemeProvider>
  );
}