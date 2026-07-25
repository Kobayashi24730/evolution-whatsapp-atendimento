import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic } from "lucide-react";

export default function UseAudio({m}: { m: any }) {
    const [isPlay, setIsPlay] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duracao, setDuracao] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const formatTime = (secs: Number) => {
        if (isNaN(Number(secs)) || secs === 0) {
            const minutos = Math.floor(Number(secs)/60);
            const segundos = Math.floor(Number(secs) % 60);
            return `${minutos}:${segundos < 10 ? "0" : ""}${segundos}`;
        }
    }
    const mediaUrl = m?.mediaUrl || "";
    const audioSrc = mediaUrl.startsWith("data:") || mediaUrl.startsWith("http")
        ? mediaUrl
        : mediaUrl
            ? `data:audio/ogg;codecs=opus;base64,${mediaUrl}`
            : "";
    const toglePlay  = () => {
        if (!audioRef.current) return;
        if (isPlay) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlay(!isPlay);
    }
    const handleTimeUp = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    }
    const handleLoadeMetaData = () => {
        if (audioRef.current) {
            setDuracao(audioRef.current.duration);
        }
    }
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const  time = Number(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }
    return(
        <div className="mt-1 flex items-center gap-3 p-2 px-3 bg-muted/30 border border-border/40 rounded-2xl max-w-xs sm:max-w-sm w-full select-none">
            <audio
                ref={audioRef}
                src={audioSrc}
                onTimeUpdate={handleTimeUp}
                onLoadedData={handleLoadeMetaData}
                onEnded={() => {
                    setIsPlay(false);
                    setCurrentTime(0);
                }}
                preload="metdata"
                className="hiddem"
            />
            <button type="button" onClick={toglePlay} className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-transform active:scale-95 shrink-0">
                {isPlay ? (
                    <Pause className="w-5 h-5 fill-current" />
                ): (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
            </button>
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <div className="relative flex items-center w-full">
                    <input
                        type="range"
                        min={0}
                        max={duracao || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
                    />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                    <span>{formatTime(isPlay ? currentTime : duracao)}</span>
                    <div className="flex items-center gap-1">
                        <Mic className={`w-3 h-3 ${isPlay ? "text-emerald-500 animate-pulse" : "text-muted-foreground"}`}/>
                    </div>
                </div>
            </div>
        </div>
    );
}