import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { LayoutDashboard, Utensils, Dumbbell, Activity, User } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Nutrition', icon: Utensils, page: 'Nutrition' },
    { name: 'Workouts', icon: Dumbbell, page: 'Workouts' },
    { name: 'Activity', icon: Activity, page: 'Activity' },
    { name: 'Profile', icon: User, page: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <style>{`
        :root {
          --gold: #D4AF37;
          --gold-light: rgba(212, 175, 55, 0.2);
          --gold-glow: rgba(212, 175, 55, 0.4);
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(212, 175, 55, 0.2);
        }
        
        .glass-card {
          backdrop-filter: blur(20px);
          background: var(--glass-bg);
          border: 0.5px solid var(--glass-border);
        }
        
        .gold-text {
          color: var(--gold);
        }
        
        .gold-gradient {
          background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glow-gold {
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3), 0 0 40px rgba(212, 175, 55, 0.1);
        }
        
        * {
          font-weight: 200;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-weight: 200;
        }
        
        .font-medium {
          font-weight: 300;
        }
        
        .font-semibold, .font-bold {
          font-weight: 400;
        }
        
        input, textarea, select {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(212, 175, 55, 0.2) !important;
        }
        
        input:focus, textarea:focus, select:focus {
          border-color: var(--gold) !important;
          outline: none;
        }
        
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 4px;
        }
      `}</style>

      <main className="pb-24 min-h-screen">
        {children}
      </main>

      {/* Premium Frosted Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-4 rounded-2xl glass-card overflow-hidden">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-t from-[#D4AF37]/20 to-transparent' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon 
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-[#D4AF37]' : 'text-white/50'
                    }`}
                    strokeWidth={1.5}
                  />
                  <span 
                    className={`text-[10px] tracking-wider uppercase transition-all duration-300 ${
                      isActive ? 'text-[#D4AF37]' : 'text-white/50'
                    }`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" />
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