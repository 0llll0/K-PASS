'use client';

import { useRef, useState } from 'react';

/**
 * UploadBox — mobile-friendly file/image upload area
 */
export default function UploadBox({ onFileSelect, preview }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect?.(file);
  };

  return (
    <div
      id="upload-box"
      onClick={handleClick}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
        dragOver
          ? 'border-[#1a2b4a] bg-[#eef1f8]'
          : preview
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 bg-white'
      }`}
      style={{ minHeight: '200px' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={handleChange}
        capture="environment"
      />

      {preview ? (
        <div className="flex flex-col items-center justify-center h-full p-4 gap-3 min-h-[200px]">
          <img
            src={preview}
            alt="Uploaded document"
            className="max-h-40 object-contain rounded-xl shadow"
          />
          <p className="text-xs text-green-600 font-medium">✓ Image selected — tap to change</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[200px]">
          {/* Camera + File icons */}
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-[#eef1f8] rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-[#1a2b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="w-14 h-14 bg-[#eef1f8] rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-[#1a2b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <p className="font-semibold text-[#1a2b4a] text-base">Tap to scan or select file</p>
            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, PDF · Max 10MB</p>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#1a2b4a] flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
