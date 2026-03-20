import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function FollowersModal({ isOpen, onClose, userId, type }) {
  const { data: list = [] } = useQuery({
    queryKey: ['followList', userId, type],
    queryFn: async () => {
      if (type === 'followers') {
        return await base44.entities.Follow.filter({ following_id: userId });
      } else {
        return await base44.entities.Follow.filter({ follower_id: userId });
      }
    },
    enabled: isOpen && !!userId,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center"
          style={{ background: 'rgba(8,8,8,0.82)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl px-6 pt-8 pb-12"
            style={{
              backdropFilter: 'blur(40px)',
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(212,175,55,0.2)',
              borderBottom: 'none',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg" style={{ color: '#D4AF37', fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}>
                {type === 'followers' ? 'Followers' : 'Following'}
              </h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <div className="space-y-3">
              {list.map(item => {
                const name = type === 'followers' ? item.follower_name : item.following_name;
                const avatar = type === 'followers' ? item.follower_avatar : item.following_avatar;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="w-10 h-10 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat, sans-serif' }}>{name}</p>
                  </div>
                );
              })}
              {list.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
                  No {type === 'followers' ? 'followers' : 'following'} yet
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}