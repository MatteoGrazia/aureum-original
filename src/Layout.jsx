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