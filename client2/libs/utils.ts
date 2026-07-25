import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {

  return twMerge(clsx(inputs))
}

export function formatarTempoCorrido(stringData?: string| Date | null) {
  if (!stringData) return '';
  const date = new Date(stringData);
  const agora = new Date();
  const diferenca = Math.floor((agora.getTime() - date.getTime())/1000);
  if (diferenca < 60) return 'agora';
  const minutos = Math.floor(diferenca / 60);
  if (minutos < 60) return `Há ${minutos} min`
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Há ${horas} horas`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `Há ${dias} dias`;
  if (dias > 7) return `${date}`
}
