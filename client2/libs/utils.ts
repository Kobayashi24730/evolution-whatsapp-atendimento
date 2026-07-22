import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarTempoCorrido(stringData?: string| Date | null) {
  if (!stringData) return '';
  const date = new Date(stringData);
  const agora = new Date();
  const diferenca = Math.floor();
}
