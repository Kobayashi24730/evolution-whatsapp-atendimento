export default function UseAudio(m: any) {
    return(
        <audio
            controls
            preload="metdata"
            className="w-full h-10 accent-primary [&::-webkit-media-controls-panel]:bg-transparent [&::-webkit-media-controls-current-time-display]:text-xs [&::-webkit-media-controls-time-remaining-display]:text-xs">
            <source
                src={m.mediaUrl.startsWith("data:") ? m.mediaUrl : `data:audio/ogg;codecs=opus;base64,${m.mediaUrl}`}
                type="audio/ogg; codecs=opus"
            />
            <source
                src={m.mediaUrl.startsWith("data:") ? m.mediaUrl : `data:audio/mpeg/base64,${m.mediaUrl}`}
                type="audio/mpeg"
            />
            Seu navegador nao suporta aúdio
        </audio>
    );
}