import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';

export function FileUploadModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 5MB maximum limit.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setUploadResult(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('files', selectedFile);

    try {
      const response = await axios.post('/api/v1/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status === 'success') {
        setUploadResult(response.data.data.files[0]);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'File upload failed';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0e121a] border border-[#232d3f] rounded-xl shadow-2xl p-6 text-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">
              Intelligence Dossier & Attachment Uploader
            </h3>
            <p className="text-xs text-gray-400">
              Concept: File Upload Handling (Backend Multipart Form-Data with Multer)
            </p>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#232d3f] hover:border-cyan-500/50 rounded-lg p-6 text-center cursor-pointer transition-all bg-[#080b11]/50 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.json"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3 text-cyan-400">
                {selectedFile.type.includes('image') ? (
                  <ImageIcon className="w-8 h-8" />
                ) : (
                  <FileText className="w-8 h-8" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'file'}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-10 h-10 mx-auto text-gray-500 group-hover:text-cyan-400 transition-colors mb-2" />
                <p className="text-sm text-gray-300 font-medium">
                  Click to select intelligence attachment or drag & drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported: JPEG, PNG, WebP, PDF, JSON (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {uploadResult && (
            <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-300">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Upload successful! File served statically via Express:</span>
              </div>
              <p className="font-mono text-[11px] text-gray-300 break-all bg-black/40 p-1.5 rounded border border-emerald-500/20">
                {uploadResult.url}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white bg-[#151b26] hover:bg-[#1c2433] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-md shadow-cyan-500/20"
            >
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
