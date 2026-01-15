'use client'

import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiX, FiLoader } from 'react-icons/fi';
import { supabase } from '@/lib/supabase/client';
import { createPortal } from 'react-dom';

type CoverPhotoProps = {
  coverPhotoUrl: string | null;
  onUpload: (url: string) => void;
};

export default function CoverPhoto({ coverPhotoUrl, onUpload }: CoverPhotoProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial preview URL
  useEffect(() => {
    if (coverPhotoUrl) {
      // If it's already a full URL, use it directly
      if (coverPhotoUrl.startsWith('http')) {
        setPreviewUrl(coverPhotoUrl);
      } else {
        // Otherwise, get the public URL from Supabase
        const { data: { publicUrl } } = supabase.storage
          .from('cover-photos')
          .getPublicUrl(coverPhotoUrl);
        setPreviewUrl(publicUrl);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [coverPhotoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) throw new Error('User not authenticated');
      
      // Sanitize email for use in path
      const userFolder = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileExt = file.name.split('.').pop();
      const fileName = `${userFolder}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('cover_photo')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get the public URL directly from the response
      const { data: { publicUrl } } = supabase.storage
        .from('cover_photo')
        .getPublicUrl(fileName);

      // Call the onUpload callback with the public URL
      onUpload(publicUrl);
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      // Revert the preview on error
      setPreviewUrl(coverPhotoUrl);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  const handleRemovePhoto = async () => {
    try {
      if (!coverPhotoUrl) return;
      
      // Extract the file path from the URL
      const url = new URL(coverPhotoUrl);
      const pathParts = url.pathname.split('/');
      // The path should be something like /storage/v1/object/public/cover_photo/...
      const filePath = pathParts.slice(4).join('/'); // Remove '/storage/v1/object/public/cover_photo/'
      
      if (!filePath) return;

      // Delete the file from storage
      const { error } = await supabase.storage
        .from('cover_photo')
        .remove([filePath]);

      if (error) throw error;

      // Clear the preview and call onUpload with empty string
      setPreviewUrl(null);
      onUpload('');
    } catch (error) {
      console.error('Error removing cover photo:', error);
    }
  };

  // Handle click on the cover photo to open modal
  const handleCoverPhotoClick = () => {
    if (previewUrl) {
      setIsModalOpen(true);
    }
  };

  // Close modal when clicking outside the image
  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="h-72 bg-gray-200 relative">
      {/* Edit Button - Always Visible */}
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition-colors"
          title="Change cover photo"
        >
          <FiCamera className="h-5 w-5" />
        </button>
      </div>
      
      {/* Hover Overlay */}
      <div 
        className="h-full w-full cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleCoverPhotoClick}
      >
      {/* Cover Photo */}
      {previewUrl ? (
        <div className="absolute inset-0">
          <img
            src={previewUrl.startsWith('blob:') ? previewUrl : `${previewUrl}?t=${Date.now()}`}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Focus. Play. Become a Champion.</h2>
          </div>
        </div>
      )}

      {/* Overlay with action buttons */}
      <div 
        className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-md transition-colors"
            disabled={isUploading}
            title="Upload cover photo"
          >
            {isUploading ? (
              <FiLoader className="h-5 w-5 animate-spin" />
            ) : (
              <FiCamera className="h-5 w-5" />
            )}
          </button>
          
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="bg-white/90 hover:bg-white text-red-600 rounded-full p-3 shadow-md transition-colors"
              title="Remove cover photo"
              disabled={isUploading}
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Cover Photo Modal */}
      {isModalOpen && previewUrl && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={handleModalClick}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
              }}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2"
            >
              <FiX className="h-6 w-6" />
            </button>
            <img
              src={previewUrl.startsWith('blob:') ? previewUrl : `${previewUrl}?t=${Date.now()}`}
              alt="Cover Preview"
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
