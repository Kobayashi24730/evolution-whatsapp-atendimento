"use client";

import React, { useRef } from "react";
import { Image, Paperclip, FileText, Film, Download, Trash2, Files } from "lucide-react";
import type {MediaAttachmentProps} from "@/types/types";

export default function MediaAttachment({
    files = [],
    onUpload,
    onSelectFile,
    mode = "full",
    className = "",
}: MediaAttachmentProps) {
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "media" | "document"
    ) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload?.(e.target.files, type);
            e.target.value = "";
        }
    };

    const renderUploadActions = () => (
        <div>
            <input
                type="file"
                ref={mediaInputRef}
                onChange={(e) => handleFileChange(e, "media")}
                accept="image/*,video/*"
                multiple
                className="hidden"
            />
            <input 
                type="file"
                ref={docInputRef}
                onChange={(e) => handleFileChange(e, "document")}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                multiple
                className="hidden"
            />
            <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                title="Enviar Mídia (Foto/Vídeo)"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
                <Image className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                title="Enviar Arquivo"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
                <Paperclip size={18} />
            </button>
        </div>
    )

    const renderList = () => (
        <div className={`flex flex-col divide-y divide-gray-100 ${className}`}>
            {Files.length === 0 ? (
                <div className="p-4 text-conter text-xs text-gray-400">
                    Nenhum anexo encontrado neste atendimento.
                </div>
            ) : (
                files.map((file: any) => (
                    <div
                        key={file.id}
                        onClick={() => onSelectFile && onSelectFile(file)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="relative w-8 h-8">
                                {file.type === "image" && <Image size={16} />}
                                {file.type === "video" && <Film size={16} />}
                                {file.type === "document" && <FileText size={16} />}
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                </span>
                                {file.size.size && (
                                    <span className="text-[10px] text-gray-400">{file.size}</span>
                                )}
                            </div>
                        </div>

                        <a
                            href={file.url}
                            download={file.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100"
                        >
                            <Download size={14} />
                        </a>
                    </div>
                ))
            )}
        </div>
    );

    if (mode === "upload-actions") return renderUploadActions();
    if (mode === "list") return renderList();
    return (
        <div className={`flex flex-col divide-y divide-gray-100 ${className}`}>
            <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-medium text-gray-900">Ações</span>
                {renderUploadActions()}
            </div>
            {renderList()}
        </div>
    )
}
    