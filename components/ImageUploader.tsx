import React, { useState, useCallback } from 'react';
import { getImageDescription } from '../services/geminiService';
import { AlertTriangleIcon, ImageIcon, UploadCloudIcon, SparklesIcon } from './icons';

interface ImageUploaderProps {
  apiKey: string;
}

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = (error) => reject(error);
    });
};

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-5 h-5 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
        <span className="text-gray-300">Analyzing image...</span>
    </div>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ apiKey }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setResult('');
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setError('Please select a valid image file.');
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, dragState: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragState);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const { base64, mimeType } = await fileToBase64(file);
            const description = await getImageDescription(apiKey, base64, prompt, mimeType);
            if (description.startsWith('Error:')) {
                setError(description);
            } else {
                setResult(description);
            }
        } catch (err) {
            setError('Failed to process the image. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRemoveImage = () => {
        setFile(null);
        setPreview(null);
        setResult('');
        setError(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <ImageIcon className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold">Describe an Image</h2>
                <p className="text-gray-400 mt-2">Upload an image and ask a question, or get a detailed description.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Uploader and Prompt */}
                <div className="space-y-6">
                    {!preview ? (
                        <div>
                             <label
                                htmlFor="file-upload"
                                onDragEnter={(e) => handleDragEvents(e, true)}
                                onDragLeave={(e) => handleDragEvents(e, false)}
                                onDragOver={(e) => handleDragEvents(e, true)}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    isDragging ? 'border-cyan-500 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                                }`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloudIcon className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-400">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP</p>
                                </div>
                                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
                            </label>
                        </div>
                    ) : (
                        <div className="relative group">
                            <img src={preview} alt="Image preview" className="w-full h-auto rounded-lg shadow-lg" />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
                                title="Remove image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    )}

                    <div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Optional: Ask a question about the image..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            rows={3}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!file || isLoading}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 inline-flex items-center justify-center space-x-2"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span>{isLoading ? 'Analyzing...' : 'Generate Description'}</span>
                    </button>
                </div>

                {/* Right Column: Result */}
                <div className="w-full min-h-[16rem] bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 flex items-center justify-center text-center border border-gray-700 shadow-inner">
                    {error && (
                        <div className="flex flex-col items-center text-red-400">
                            <AlertTriangleIcon className="w-8 h-8 mb-2"/>
                            <p className="font-semibold">{error}</p>
                        </div>
                    )}
                    {!error && isLoading && <LoadingSpinner />}
                    {!error && !isLoading && !result && (
                        <p className="text-gray-400">The description will appear here.</p>
                    )}
                    {!error && !isLoading && result && (
                        <p className="text-lg text-white leading-relaxed text-left whitespace-pre-wrap">{result}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageUploader;