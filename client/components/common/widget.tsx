"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { WidgetProps } from "@/types/types";

export function Widget({
                           title,
                           icon: Icon,
                           children,
                           className = "",
                           onHeaderAction,
                       }: WidgetProps) {
    return (
        <div
            className={`bg-white border border-gray-200/70 rounded-2xl shadow-sm overflow-hidden flex flex-col ${className}`}
        >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={16} className="text-gray-500" />}
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {title}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onHeaderAction}
                    aria-label="Opções do widget"
                    className="p-1 rounded-md hover:bg-gray-200/60 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            <div className="flex-1 overflow-hidden">{children}</div>
        </div>
    );
}