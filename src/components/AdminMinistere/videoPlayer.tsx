import { useState, useRef, useEffect } from 'react';
import { Pause, InteractionResponse } from '../../types/auth';
import {
  Play, Pause as PauseIcon, Maximize, Minimize, Volume2, VolumeX, Rewind, FastForward,
} from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  pauses: Pause[];
  role: string;
  onComplete?: (responses: InteractionResponse[], isFullyCompleted: boolean) => void;
  onGridSelect?: (tempsPause: number, row: number, col: number, updatedPauses: Pause[]) => void;
}

function VideoPlayer({ videoUrl, pauses, role, onComplete, onGridSelect }: VideoPlayerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [userResponses, setUserResponses] = useState<InteractionResponse[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [activePause, setActivePause] = useState<Pause | null>(null);
  const [updatedPauses, setUpdatedPauses] = useState<Pause[]>([]); // Store updated pauses
  const [adminClickCount, setAdminClickCount] = useState(0); // Track admin clicks

  const isAdmin = role === 'Admin Ministère';

  const normalizedPauses: Pause[] = pauses.map((pause: any) => ({
    tempsPause: pause.temps_pause || 0,
    information: pause.information || "",
    correctGrid: pause.correct_grid_row !== null && pause.correct_grid_row !== undefined &&
                 pause.correct_grid_col !== null && pause.correct_grid_col !== undefined
      ? { row: pause.correct_grid_row, col: pause.correct_grid_col }
      : undefined,
  }));

  useEffect(() => {
    console.log('Raw Pauses:', pauses);
    console.log('Normalized Pauses:', normalizedPauses);
    setUpdatedPauses(normalizedPauses); // Initialize with normalized pauses
  }, [pauses]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);

      const pause = normalizedPauses.find(p =>
        time >= (p.tempsPause as number) - 0.1 &&
        time <= (p.tempsPause as number) + 0.1
      );
      if (pause && !activePause && isPlaying) {
        video.pause();
        setIsPlaying(false);
        setActivePause(pause);
        if (isAdmin) {
          setPopupMessage("Sélectionnez la grille correcte pour cette pause");
        } else {
          setPopupMessage("Cliquez sur la bonne grille pour continuer");
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', () => setDuration(video.duration));
    video.addEventListener('error', () => setVideoError('Erreur de chargement vidéo'));
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', () => {});
      video.removeEventListener('error', () => {});
    };
  }, [videoUrl, normalizedPauses, isPlaying, activePause, isAdmin]);

  const handleGridClick = (rowIndex: number, colIndex: number) => {
    if (!activePause) return;

    if (isAdmin) {
      console.log(`Admin selected grid (${rowIndex}, ${colIndex}) for pause at ${activePause.tempsPause}s`);
      const newUpdatedPauses = updatedPauses.map(pause =>
        pause.tempsPause === activePause.tempsPause
          ? { ...pause, correctGrid: { row: rowIndex, col: colIndex } }
          : pause
      );
      setUpdatedPauses(newUpdatedPauses); // Update state progressively
      setAdminClickCount(prev => prev + 1); // Increment click count

      // Check if admin has clicked as many times as there are pauses
      if (adminClickCount + 1 === normalizedPauses.length && onGridSelect) {
        newUpdatedPauses.forEach(pause => {
          if (pause.correctGrid) {
            onGridSelect(
              pause.tempsPause as number,
              pause.correctGrid.row,
              pause.correctGrid.col,
              newUpdatedPauses
            );
          }
        });
        setPopupMessage("Toutes les pauses ont été mises à jour avec succès !");
      } else {
        setPopupMessage(`Grille (${rowIndex}, ${colIndex}) définie pour la pause à ${activePause.tempsPause}s`);
      }

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
          setActivePause(null);
          setPopupMessage(null);
        }
      }, 2000);
    } else {
      const isCorrectGrid = activePause.correctGrid &&
                           activePause.correctGrid.row === rowIndex &&
                           activePause.correctGrid.col === colIndex;

      const response: InteractionResponse = {
        interactionId: activePause.tempsPause.toString(),
        timestamp: Date.now(),
        success: isCorrectGrid ?? false,
        position: { row: rowIndex, col: colIndex }
      };

      setUserResponses(prev => [...prev, response]);

      if (isCorrectGrid) {
        setPopupMessage(activePause.information);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
            setActivePause(null);
            setPopupMessage(null);
          }
        }, 4000);
      } else {
        setPopupMessage("Mauvaise grille )😜");
        setTimeout(() => setPopupMessage("Cliquez sur la bonne grille pour continuer"), 1000);
      }
    }
  };

  const renderGrids = () => {
    const GRID_SIZE = 8;
    const gridWidth = 100 / GRID_SIZE;
    const gridHeight = 100 / GRID_SIZE;

    const grids = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        grids.push(
          <div
            key={`${row}-${col}`}
            className={`absolute cursor-pointer ${activePause ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              left: `${col * gridWidth}%`,
              top: `${row * gridHeight}%`,
              width: `${gridWidth}%`,
              height: `${gridHeight}%`,
              background: isAdmin && activePause ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              border: isAdmin && activePause ? '1px solid rgba(255, 255, 255, 0.5)' : 'none',
            }}
            onClick={() => handleGridClick(row, col)}
          />
        );
      }
    }

    return (
      <div className="absolute inset-0">
        {grids}
      </div>
    );
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else if (!activePause) {
      videoRef.current.play().catch(() => setVideoError('Erreur de lecture'));
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) setVolume(0);
    else setVolume(1);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const seekForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
  };

  const seekBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoEnd = () => {
    if (!onComplete) return;

    const pauseIds = normalizedPauses.map(p => p.tempsPause.toString());
    const successfulResponses = userResponses.filter(r => r.success);
    const hasAllCorrect = pauseIds.every(id =>
      successfulResponses.some(r => r.interactionId === id)
    );

    onComplete(userResponses, hasAllCorrect);
  };

  return (
    <div ref={containerRef} className="relative bg-black rounded-xl" style={{ width: '100%', height: 'auto' }}>
      {videoError ? (
        <p className="text-red-500 p-4">{videoError}</p>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full aspect-video"
            src={videoUrl}
            controls={false}
            playsInline
            onEnded={handleVideoEnd}
          />
          {renderGrids()}
          {popupMessage && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg z-50"
              style={{ pointerEvents: 'none' }}
            >
              {popupMessage}
            </div>
          )}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 bg-gray-800 bg-opacity-75 p-2 rounded-t z-50">
            <button onClick={seekBackward}><Rewind /></button>
            <button onClick={togglePlay}>{isPlaying ? <PauseIcon /> : <Play />}</button>
            <button onClick={seekForward}><FastForward /></button>
            <button onClick={toggleMute}>{isMuted ? <VolumeX /> : <Volume2 />}</button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-48"
            />
            <button onClick={toggleFullscreen}>{isFullscreen ? <Minimize /> : <Maximize />}</button>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoPlayer;