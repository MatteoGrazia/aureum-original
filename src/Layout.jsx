import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { House, Utensils, Dumbbell, Activity, User } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Dashboard', icon: House, page: 'Dashboard' },
    { name: 'Nutrition', icon: Utensils, page: 'Nutrition' },
    { name: 'Workouts', icon: Dumbbell, page: 'Workouts' },
    { name: 'Activity', icon: Activity, page: 'Activity' },
    { name: 'Profile', icon: User, page: 'Profile' },
  ];

  return (
    <div className="min-h-screen text-white" style={{
      background: '#080808',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.03) 0%, #080808 50%)'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500&family=Montserrat:wght@200;300;400;500&display=swap" rel="stylesheet" />
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
          backdrop-filter: blur(25px) saturate(160%);
          background: rgba(255, 255, 255, 0.05);
          border: 0.5px solid rgba(212, 175, 55, 0.2);
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
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
        }
        
        .font-medium {
          font-weight: 400;
        }
        
        .font-semibold, .font-bold {
          font-weight: 500;
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
        
        /* Safe area insets for mobile */
        @supports (padding: max(0px)) {
          body {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      <main className="pb-24 min-h-screen" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </main>

      {/* Premium Frosted Bottom Navigation - Icon Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-6 rounded-2xl glass-card overflow-hidden" style={{ marginBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="flex items-center justify-around py-4 px-2">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 relative ${
                    isActive 
                      ? 'bg-gradient-to-t from-[#D4AF37]/20 to-transparent' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <Icon 
                    className={`w-6 h-6 transition-all duration-300 ${
                      isActive ? 'text-[#D4AF37]' : 'text-[#9C7E46]'
                    }`}
                    strokeWidth={1}
                  />
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