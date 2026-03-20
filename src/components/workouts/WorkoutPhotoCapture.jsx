import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WorkoutPhotoCapture({ photos = [], onPhotosChange }) {
  const [uploading, setUploading] = useState(false);

  const handleCapture = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setUploading(false);
    onPhotosChange([...photos, ...uploaded]);
  };

  const removePhoto = (url) => {
    onPhotosChange(photos.filter(p => p !== url));
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
        Workout Photos
      </p>
      
      <div className="flex gap-3 flex-wrap">
        {photos.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(url)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        
        <label className="w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95"
          style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(212,175,55,0.25)' }}>
          <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handleCapture} disabled={uploading} />
          {uploading ? (
            <div className="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          ) : (
            <>
              <Camera className="w-5 h-5 mb-1" style={{ color: 'rgba(212,175,55,0.6)' }} />
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}>Add</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}