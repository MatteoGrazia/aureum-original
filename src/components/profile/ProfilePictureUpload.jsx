import React, { useRef, useState } from 'react';
import { User, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProfilePictureUpload({ user, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // Update auth record
      await base44.auth.updateMe({ profile_picture: file_url });
      // Sync to AthleteIdentity so feed cards, PulseRow & comments show the new picture
      const identities = await base44.entities.AthleteIdentity.filter({});
      if (identities.length > 0) {
        await base44.entities.AthleteIdentity.update(identities[0].id, { avatar_url: file_url });
      }
      onUpdate?.();
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="relative w-16 h-16 rounded-2xl group overflow-hidden"
        style={{
          background: user?.profile_picture 
            ? 'transparent' 
            : 'linear-gradient(to bottom right, rgba(212,175,55,0.3), rgba(212,175,55,0.1))'
        }}
      >
        {user?.profile_picture ? (
          <img 
            src={user.profile_picture} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-8 h-8 text-[#D4AF37] absolute inset-0 m-auto" />
        )}
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
        
        {uploading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#D4AF37]/40 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        )}
      </button>
    </>
  );
}