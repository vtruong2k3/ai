'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, FileText, X } from 'lucide-react';
import Image from 'next/image';

interface AttachedFile {
    file: File;
    preview?: string;
    base64?: string;
    type: 'image' | 'document';
}

interface FileUploadProps {
    onFilesChange: (files: AttachedFile[]) => void;
}

export function FileUpload({ onFilesChange }: FileUploadProps) {
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        const newFilesPromises = files.map((file) => {
            return new Promise<AttachedFile>((resolve) => {
                const isImage = file.type.startsWith('image/');

                if (isImage) {
                    // Convert to base64 for Ollama
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        // Extract just the base64 part (remove "data:image/png;base64," prefix)
                        const base64Data = base64String.split(',')[1];

                        resolve({
                            file,
                            preview: base64String, // Keep full data URL for preview
                            base64: base64Data, // Store clean base64 for API
                            type: 'image',
                        });
                    };
                    reader.readAsDataURL(file);
                } else {
                    // For documents, just store file info
                    resolve({
                        file,
                        type: 'document',
                    });
                }
            });
        });

        const newFiles = await Promise.all(newFilesPromises);
        const updated = [...attachedFiles, ...newFiles];
        setAttachedFiles(updated);
        onFilesChange(updated);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        const updated = attachedFiles.filter((_, i) => i !== index);

        // Revoke preview URL to free memory
        const removed = attachedFiles[index];
        if (removed.preview && removed.preview.startsWith('blob:')) {
            URL.revokeObjectURL(removed.preview);
        }

        setAttachedFiles(updated);
        onFilesChange(updated);
    };

    return (
        <div className="space-y-2">
            {/* File previews */}
            {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="relative group rounded-lg border border-slate-300 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800"
                        >
                            {file.type === 'image' && file.preview ? (
                                <div className="relative w-20 h-20">
                                    <Image
                                        src={file.preview}
                                        alt={file.file.name}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-2">
                                    <FileText className="h-8 w-8 text-slate-500" />
                                    <span className="text-xs max-w-[100px] truncate">
                                        {file.file.name}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload button */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
            >
                <ImagePlus className="h-4 w-4" />
                <span className="text-xs">Attach files</span>
            </Button>
        </div>
    );
}
