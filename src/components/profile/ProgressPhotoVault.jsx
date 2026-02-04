import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ChevronLeft, ChevronRight, Ghost, Image } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GoldButton from '@/components/ui/GoldButton';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function ProgressPhotoVault({ photos, onPhotoAdded }) {
  const [showUpload, setShowUpload] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ghostMode, setGhostMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.ProgressPhoto.create({
        date: format(new Date(), 'yyyy-MM-dd'),
        photo_url: file_url,
        pose_type: 'front'
      });

      onPhotoAdded?.();
      setShowUpload(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  const sortedPhotos = [...photos].sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentPhoto = sortedPhotos[currentIndex];
  const previousPhoto = sortedPhotos[currentIndex + 1];

  return (
    <>
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-widest text-[#D4AF37]">Progress Vault</h3>
          <button
            onClick={() => setShowUpload(true)}
            className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center"
          >
            <Camera className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>

        {sortedPhotos.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {sortedPhotos.slice(0, 8).map((photo, index) => (
              <motion.button
                key={photo.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentIndex(index);
                  setShowViewer(true);
                }}
                className="aspect-square rounded-lg overflow-hidden bg-white/5"
              >
                <img
                  src={photo.photo_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Image className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No progress photos yet</p>
            <GoldButton
              variant="outline"
              onClick={() => setShowUpload(true)}
              className="mt-4"
            >
              Add First Photo
            </GoldButton>
          </div>
        )}
      </GlassCard>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-6 w-80" glow>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-lg">Add Progress Photo</h3>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                <GoldButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Select Photo'}
                </GoldButton>

                <p className="text-white/40 text-xs text-center mt-4">
                  Tip: Use consistent lighting and pose for best comparison
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Viewer with Ghost Mode */}
      <AnimatePresence>
        {showViewer && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setShowViewer(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <p className="text-white/50 text-sm">
                {format(new Date(currentPhoto.date), 'MMMM d, yyyy')}
              </p>
              <button
                onClick={() => setGhostMode(!ghostMode)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  ghostMode ? 'bg-[#D4AF37]/30' : 'bg-white/10'
                }`}
              >
                <Ghost className={`w-5 h-5 ${ghostMode ? 'text-[#D4AF37]' : 'text-white/50'}`} />
              </button>
            </div>

            {/* Photo */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              {/* Current Photo */}
              <img
                src={currentPhoto.photo_url}
                alt=""
                className="max-h-full max-w-full object-contain rounded-xl"
              />

              {/* Ghost Overlay (previous photo) */}
              {ghostMode && previousPhoto && (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  src={previousPhoto.photo_url}
                  alt=""
                  className="absolute inset-4 max-h-full max-w-full object-contain rounded-xl pointer-events-none"
                  style={{ filter: 'grayscale(1) contrast(1.2)' }}
                />
              )}

              {/* Navigation */}
              {currentIndex > 0 && (
                <button
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="absolute left-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              )}
              {currentIndex < sortedPhotos.length - 1 && (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="absolute right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            {/* Thumbnails */}
            <div className="p-4">
              <div className="flex gap-2 justify-center overflow-x-auto">
                {sortedPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      index === currentIndex ? 'border-[#D4AF37]' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={photo.photo_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}