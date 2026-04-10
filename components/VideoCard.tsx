import React, { useState, useEffect, useCallback } from 'react';
import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { filesize } from 'filesize';
import { Clock, Download } from 'lucide-react';

dayjs.extend(relativeTime);

export interface Video {
  id: string;
  title: string;
  description: string | null;
  publicId: string;
  originalSize: string;
  compressedSize: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: 'fill',
      gravity: 'auto',
      format: 'jpg',
      quality: 'auto',
      assetType: 'video'
    });
  }, []);

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080
    });
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"]
    });
  }, []);

  const formatSize = useCallback((size: number) => {
    return filesize(size, { standard: 'jedec' }) as string;
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const compressionPercentage = Math.round(
    (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
  );

  useEffect(() => {
    setPreviewError(false);
  }, [isHovered]);

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-video relative bg-gray-200 dark:bg-gray-800">
        {isHovered ? (
          previewError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-red-500 font-medium text-sm">Preview not available</span>
            </div>
          ) : (
            <video
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onError={handlePreviewError}
            />
          )
        ) : (
          <img
            src={getThumbnailUrl(video.publicId)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1.5 rounded-md flex items-center shadow-md font-medium tracking-wide">
          <Clock size={12} className="mr-1.5" />
          {formatDuration(video.duration)}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1" title={video.title}>
            {video.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
            {video.description || "No description provided."}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Size</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {formatSize(Number(video.compressedSize))}
            </span>
            {compressionPercentage > 0 && (
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                Saved {compressionPercentage}%
              </span>
            )}
          </div>
          <button
            onClick={() => onDownload(getFullVideoUrl(video.publicId), video.title)}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none"
          >
            <Download size={16} className="mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;