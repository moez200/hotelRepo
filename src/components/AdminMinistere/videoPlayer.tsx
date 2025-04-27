import { useState, useRef, useEffect } from 'react';
import { Pause, InteractionResponse } from '../../types/auth';
import {
  Play, Pause as PauseIcon, Maximize, Minimize, Volume2, VolumeX, Rewind, FastForward,
} from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  pauses: Pause[];
  role: string;
  onComplete?: (responses: InteractionResponse[], isFullyCompleted: boolean, normalizedPauses: Pause[]) => void;
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
  const [updatedPauses, setUpdatedPauses] = useState<Pause[]>([]);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [completedPauses, setCompletedPauses] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
       
  const isAdmin = role === 'Admin Ministère';

  // Normalisation des pauses
  const normalizedPauses: Pause[] = pauses.map((pause: any) => ({
    tempsPause: pause.temps_pause || 0,
    information: pause.information || "",
    correctGrid: pause.correct_grid_row !== null && pause.correct_grid_row !== undefined &&
                 pause.correct_grid_col !== null && pause.correct_grid_col !== undefined
      ? { row: pause.correct_grid_row, col: pause.correct_grid_col }
      : undefined,
  }));

  useEffect(() => {
    setUpdatedPauses(normalizedPauses);
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

      // Trouver la prochaine pause non complétée
      const nextPause = normalizedPauses.find(p => 
        p.tempsPause !== null && 
        time >= p.tempsPause - 0.5 && // Tolérance augmentée
        time <= p.tempsPause + 0.5 &&
        !completedPauses.includes(p.tempsPause)
      );

      // Débogage
      console.log("Temps courant:", time, "Pause détectée:", nextPause?.tempsPause, "Completed:", completedPauses, "Active:", activePause);

      if (nextPause && !activePause) { // Supprimer la condition isPlaying
        setActivePause(nextPause);
        if (isAdmin) {
          setPopupMessage("Sélectionnez la grille correcte pour cette pause");
        } else {
          setPopupMessage("Cliquez sur la bonne grille");
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', () => setDuration(video.duration));
    video.addEventListener('error', () => setVideoError('Erreur de chargement vidéo'));

    // Optionnel : démarrer la vidéo automatiquement au montage
    // video.play().then(() => setIsPlaying(true)).catch(err => console.error('Auto-play failed:', err));

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', () => {});
      video.removeEventListener('error', () => {});
    };
  }, [videoUrl, normalizedPauses, activePause, isAdmin, hasInteracted, completedPauses]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleGridClick = (rowIndex: number, colIndex: number) => {
    if (!activePause || !videoRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setHasInteracted(true);
    setCompletedPauses(prev => [...prev, activePause.tempsPause!]);

    if (isAdmin) {
      const newUpdatedPauses = updatedPauses.map(pause =>
        pause.tempsPause === activePause.tempsPause
          ? { ...pause, correctGrid: { row: rowIndex, col: colIndex } }
          : pause
      );
      setUpdatedPauses(newUpdatedPauses);
      setAdminClickCount(prev => prev + 1);

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
    } else {
      const isCorrectGrid = activePause.correctGrid &&
                           activePause.correctGrid.row === rowIndex &&
                           activePause.correctGrid.col === colIndex;

      const response: InteractionResponse = {
        interactionId: activePause.tempsPause ? activePause.tempsPause.toString() : '',
        timestamp: Date.now(),
        success: isCorrectGrid ?? false,
        position: { row: rowIndex, col: colIndex }
      };

      setUserResponses(prev => [...prev, response]);

      if (isCorrectGrid) {
        videoRef.current.pause();
        setIsPlaying(false);
        setPopupMessage(activePause.information);

        timeoutRef.current = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsPlaying(true);
                setPopupMessage(null);
                setActivePause(null);
              })
              .catch(error => {
                console.error('Erreur de lecture:', error);
                setPopupMessage("Cliquez pour continuer");
              });
          }
        }, 3000);
      } else {
        setPopupMessage("Mauvaise réponse, attendez...");
        setTimer(0);
        let progress = 0;
        timerIntervalRef.current = setInterval(() => {
          progress += 3.33;
          setTimer(progress);
          if (progress >= 100) {
            clearInterval(timerIntervalRef.current!);
            timerIntervalRef.current = null;
            setPopupMessage(null);
            setActivePause(null);
            setTimer(0);
          }
        }, 100);
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
    } else {
      if (videoRef.current.currentTime === 0 || videoRef.current.ended) {
        setUserResponses([]);
        setActivePause(null);
        setPopupMessage(null);
        setHasInteracted(false);
        setCompletedPauses([]);
        setTimer(0);
      }
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('Playback error:', error);
          setVideoError('Cliquez pour démarrer la vidéo');
        });
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen().catch(err => console.error('Fullscreen failed:', err));
    } else {
      document.exitFullscreen().catch(err => console.error('Exit fullscreen failed:', err));
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

    const successfulResponses = userResponses.filter(r => r.success);
    const hasAllCorrect = normalizedPauses.length === successfulResponses.length;
    onComplete(userResponses, hasAllCorrect, normalizedPauses);
    setShowSummary(true);
  };

  const renderSummary = () => {
    const correctResponses = userResponses.filter(r => r.success);

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-90 text-white p-6 flex flex-col items-center justify-center z-50">
        <h2 className="text-2xl font-bold mb-4">Résumé</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Bonnes réponses: {correctResponses.length}/{normalizedPauses.length}</h3>
          {correctResponses.length > 0 ? (
            <ul className="list-disc pl-5">
              {correctResponses.map((response, index) => (
                <li key={index} className="mb-1">
                  {formatTime(parseFloat(response.interactionId))} - Grille ({response.position.row}, {response.position.col})
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucune bonne réponse</p>
          )}
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            setShowSummary(false);
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              togglePlay();
            }
          }}
        >
          Recommencer
        </button>
      </div>
    );
  };

  const TimerCircle = ({ progress }: { progress: number }) => {
    return (
      <div className="flex justify-center items-center">
        <div className="relative">
          <svg width="100" height="100" viewBox="0 0 100 100" className="rotate-90">
            <circle cx="50" cy="50" r="45" stroke="#e6e6e6" strokeWidth="10" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#ff0000"
              strokeWidth="10"
              fill="none"
              strokeDasharray="283"
              strokeDashoffset={(1 - progress / 100) * 283}
              style={{ transition: 'stroke-dashoffset 0.1s ease' }}
            />
          </svg>
          <span className="absolute top-0 left-0 w-full h-full flex justify-center items-center text-white font-bold">
            {Math.floor(progress)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative bg-black rounded-xl overflow-hidden" style={{ width: '100%', height: 'auto' }}>
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
            webkit-playsinline="true"
            muted={isMuted}
            onEnded={handleVideoEnd}
          />
          {renderGrids()}
          {popupMessage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg z-50">
              {popupMessage}
              {timer > 0 && timer < 100 && <TimerCircle progress={timer} />}
            </div>
          )}
          {showSummary && renderSummary()}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button onClick={togglePlay} className="p-1">
                {isPlaying ? <PauseIcon size={20} /> : <Play size={20} />}
              </button>
              <button onClick={toggleMute} className="p-1">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20"
              />
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={seekBackward} className="p-1">
                <Rewind size={20} />
              </button>
              <button onClick={seekForward} className="p-1">
                <FastForward size={20} />
              </button>
              <button onClick={toggleFullscreen} className="p-1">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoPlayer;