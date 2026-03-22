import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const haptic = () => { if (navigator.vibrate) navigator.vibrate([8]); };

export default function SyndicateConnectionButton({ 
  targetUser,
  currentUser,
  isFollowing,
  isPending,
  onUpdate
}) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleToggleConnection = async () => {
    if (loading || !currentUser || !targetUser) return;
    
    haptic();
    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const connections = await base44.entities.Follow.filter({ 
          follower_id: currentUser.email, 
          following_id: targetUser.created_by 
        });
        if (connections[0]) {
          await base44.entities.Follow.delete(connections[0].id);
        }
      } else {
        // Follow/Request
        const status = targetUser.is_private ? 'pending' : 'accepted';
        
        await base44.entities.Follow.create({
          follower_id: currentUser.email,
          following_id: targetUser.created_by,
          follower_name: currentUser.full_name,
          following_name: targetUser.username || targetUser.display_name,
          follower_avatar: currentUser.avatar_url || '',
          following_avatar: targetUser.avatar_url || '',
          status
        });

        // Create notification
        await base44.entities.SyndicateNotification.create({
          recipient_id: targetUser.created_by,
          sender_id: currentUser.email,
          sender_name: currentUser.full_name,
          sender_avatar: currentUser.avatar_url || '',
          type: targetUser.is_private ? 'connection_request' : 'syndicate_join',
          message: targetUser.is_private 
            ? `${currentUser.full_name} wants to join your Syndicate`
            : `${currentUser.full_name} joined your Syndicate`,
          link: '/Community'
        });
      }

      queryClient.invalidateQueries(['followStats']);
      queryClient.invalidateQueries(['performanceFeed']);
      onUpdate?.();
    } catch (error) {
      console.error('Connection toggle failed:', error);
    }

    setLoading(false);
  };

  if (isPending) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '0.5px solid rgba(229,229,231,0.2)',
          color: '#E5E5E7',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 400,
          opacity: 0.6
        }}
      >
        <Clock className="w-4 h-4" />
        REQUESTED
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleToggleConnection}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-all"
      style={{
        background: isFollowing 
          ? 'rgba(255,255,255,0.05)' 
          : 'linear-gradient(135deg, #B2D8D8, #8BBCBC)',
        border: isFollowing 
          ? '0.5px solid rgba(229,229,231,0.2)' 
          : '0.5px solid rgba(178,216,216,0.4)',
        color: isFollowing ? '#E5E5E7' : '#0a0a0a',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 500,
        letterSpacing: '0.08em',
        boxShadow: isFollowing ? 'none' : '0 0 16px rgba(178,216,216,0.2)'
      }}
    >
      {isFollowing ? (
        <>
          <Check className="w-4 h-4" />
          IN SYNDICATE
        </>
      ) : (
        <>
          <Zap className="w-4 h-4" />
          JOIN SYNDICATE
        </>
      )}
    </motion.button>
  );
}