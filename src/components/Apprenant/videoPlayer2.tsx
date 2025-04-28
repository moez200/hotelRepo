
import { useState, useRef, useEffect } from 'react';
import {
  Play, Pause as PauseIcon, Maximize, Minimize, Volume2, VolumeX, Rewind, FastForward,
} from 'lucide-react';
import { getAuthStore } from '../../store/auth';
import { ClickableRegion, ClickableZone, InteractionResponse2 } from '../../types/auth';

interface VideoPlayerProps {
  videoUrl: string;
  clickable_regions?: ClickableRegion[];
  clickable_zones?: ClickableZone[];
  onInteraction?: (responses: InteractionResponse2[]) => void;
  onEnded?: () => void;
  role?: string;
  width?: string | number; // Nouvelle prop pour la largeur
  height?: string | number; // Nouvelle prop pour la hauteur
}

function VideoPlayer({
  videoUrl,
  clickable_regions = [],
  clickable_zones = [],
  onInteraction,
  onEnded,
  role = getAuthStore((state) => state.role) ?? 'defaultRole',
  width = '896px', // Valeur par défaut équivalent à max-w-3xl
  height = 'auto', // Par défaut, respecte le rapport d'aspect
}: VideoPlayerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const markingRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [markedZones, setMarkedZones] = useState<ClickableZone[]>(
    clickable_zones.filter((zone) =>
      typeof zone.x === 'number' &&
      typeof zone.y === 'number' &&
      typeof zone.radius === 'number' &&
      typeof zone.time === 'number'
    )
  );

  const isAdmin = role === 'Admin Ministère';

  const [interactionResponses, setInteractionResponses] = useState<InteractionResponse2[]>([
    ...clickable_regions.map((region) => ({ region, clicked: false, isValid: false })),
    ...markedZones.map((zone) => ({ region: zone, clicked: false, isValid: false })),
  ]);

  const CIRCLE_DIAMETER_PX = 150;
  const CLICK_RADIUS = CIRCLE_DIAMETER_PX / 2;
  const TIME_TOLERANCE = 3;

  useEffect(() => {
    console.log('VideoPlayer - Rôle récupéré:', { role, isAdmin });
    console.log('VideoPlayer - Props reçues:', { videoUrl, clickable_regions, clickable_zones, role, width, height });
  }, [videoUrl, clickable_regions, clickable_zones, role, width, height]);

  useEffect(() => {
    setInteractionResponses([
      ...clickable_regions.map((region) => ({ region, clicked: false, isValid: false })),
      ...markedZones.map((zone) => ({ region: zone, clicked: false, isValid: false })),
    ]);
  }, [clickable_regions, markedZones]);

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

      const allRegions = [...clickable_regions, ...markedZones];
      allRegions.forEach((region) => {
        if (
          time > region.time + TIME_TOLERANCE &&
          !interactionResponses.find((r) => r.region === region)?.clicked
        ) {
          setInteractionResponses((prev) =>
            prev.map((r) =>
              r.region === region ? { ...r, clicked: false, isValid: false } : r
            )
          );
        }
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onInteraction) {
        console.log('VideoPlayer - Vidéo terminée, envoi des interactions:', interactionResponses);
        onInteraction(interactionResponses);
      }
      if (onEnded) {
        console.log('VideoPlayer - Appel de onEnded');
        onEnded();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadeddata', () => setDuration(video.duration));
    video.addEventListener('error', () => setVideoError('Erreur de chargement vidéo'));
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadeddata', () => {});
      video.removeEventListener('error', () => {});
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl, clickable_regions, markedZones, interactionResponses, onInteraction, onEnded]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAdmin || !videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log('Admin - MouseDown:', { x, y, time: videoRef.current.currentTime });
    setStartPos({ x, y });
    setIsMarking(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMarking || !startPos || !videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const radius = Math.sqrt((currentX - startPos.x) ** 2 + (currentY - startPos.y) ** 2);
    console.log('Admin - MouseMove:', { currentX, currentY, radius });
    if (markingRef.current) {
      markingRef.current.style.left = `${startPos.x - radius}px`;
      markingRef.current.style.top = `${startPos.y - radius}px`;
      markingRef.current.style.width = `${radius * 2}px`;
      markingRef.current.style.height = `${radius * 2}px`;
      markingRef.current.style.borderRadius = '50%';
      markingRef.current.style.display = 'block';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMarking || !startPos || !videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const time = videoRef.current.currentTime;
    const radius = Math.sqrt((endX - startPos.x) ** 2 + (endY - startPos.y) ** 2);
    if (isNaN(radius) || isNaN(startPos.x) || isNaN(startPos.y) || isNaN(time)) {
      console.error('Admin - MouseUp - Données invalides pour la nouvelle zone:', { startPos, radius, time });
      setIsMarking(false);
      setStartPos(null);
      if (markingRef.current) {
        markingRef.current.style.display = 'none';
      }
      return;
    }
    const newZone: ClickableZone = { x: startPos.x, y: startPos.y, radius, time };
    console.log('Admin - MouseUp - Nouvelle zone:', newZone);
    setMarkedZones((prev) => [...prev, newZone]);
    setInteractionResponses((prev) => [...prev, { region: newZone, clicked: false, isValid: false }]);
    setIsMarking(false);
    setStartPos(null);
    if (markingRef.current) {
      markingRef.current.style.display = 'none';
    }
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current || role !== 'Apprenant') return;
    const rect = videoRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const clickTime = videoRef.current.currentTime;

    console.log('VideoPlayer - Clic détecté:', { clickX, clickY, clickTime, clickable_zones });

    const adjustedRadius = CLICK_RADIUS * (window.devicePixelRatio || 1);
    const matchingRegion = clickable_regions.find((region) => {
      const distance = Math.sqrt((clickX - region.x) ** 2 + (clickY - region.y) ** 2);
      const timeDiff = Math.abs(clickTime - region.time);
      return distance <= adjustedRadius && timeDiff <= TIME_TOLERANCE;
    });

    let updatedResponses = interactionResponses;

    if (matchingRegion) {
      updatedResponses = interactionResponses.map((r) =>
        r.region === matchingRegion
          ? { ...r, clicked: true, isValid: true, clickTime, clickX, clickY }
          : r
      );
      setPopupMessage('Interaction correcte !');
      setTimeout(() => setPopupMessage(null), 2000);
    }

    const matchingZone = markedZones.find((zone) => {
      const timeDiff = Math.abs(clickTime - zone.time);
      const distance = Math.sqrt((clickX - zone.x) ** 2 + (clickY - zone.y) ** 2);
      return timeDiff <= TIME_TOLERANCE && distance <= zone.radius;
    });

    if (matchingZone) {
      updatedResponses = interactionResponses.map((r) =>
        r.region === matchingZone
          ? { ...r, clicked: true, isValid: true, clickTime, clickX, clickY }
          : r
      );
      setPopupMessage('Interaction correcte !');
      setTimeout(() => setPopupMessage(null), 2000);
    } else {
      updatedResponses = updatedResponses.map((r) => ({
        ...r,
        clicked: r.clicked || true,
        isValid: r.isValid || false,
        clickTime: r.clickTime || clickTime,
        clickX: r.clickX || clickX,
        clickY: r.clickY || clickY,
      }));
      setPopupMessage('Clic hors de la zone cible.');
      setTimeout(() => setPopupMessage(null), 2000);
    }

    setInteractionResponses(updatedResponses);

    if (onInteraction) {
      console.log('VideoPlayer - Envoi des interactions après clic:', updatedResponses);
      onInteraction(updatedResponses);
    }
  };

  const isRegionActive = (region: ClickableRegion | ClickableZone) => {
    const timeDiff = Math.abs(currentTime - region.time);
    return timeDiff <= TIME_TOLERANCE;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error('Playback error:', error);
          setVideoError('Cliquez pour démarrer la vidéo');
        });
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen().catch((err) => console.error('Fullscreen failed:', err));
    } else {
      document.exitFullscreen().catch((err) => console.error('Exit fullscreen failed:', err));
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Normaliser les valeurs de width et height
  const normalizedWidth = typeof width === 'number' ? `${width}px` : width;
  const normalizedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden"
      style={{ width: normalizedWidth, height: normalizedHeight }}
    >
      {videoError ? (
        <p className="text-red-500 p-4">{videoError}</p>
      ) : (
        <>
          <div
            style={{ position: 'relative' }}
            onMouseDown={isAdmin ? handleMouseDown : undefined}
            onMouseMove={isAdmin ? handleMouseMove : undefined}
            onMouseUp={isAdmin ? handleMouseUp : undefined}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={videoUrl}
              controls={false}
              playsInline
              webkit-playsinline="true"
              muted={isMuted}
              onClick={role === 'Apprenant' ? handleVideoClick : undefined}
            />
            {isAdmin &&
              clickable_regions.map((region, index) => (
                <div
                  key={`region-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${region.x - CLICK_RADIUS}px`,
                    top: `${region.y - CLICK_RADIUS}px`,
                    width: `${CIRCLE_DIAMETER_PX}px`,
                    height: `${CIRCLE_DIAMETER_PX}px`,
                    backgroundColor: isRegionActive(region) ? 'rgba(0, 128, 255, 0.3)' : 'transparent',
                    border: isRegionActive(region) ? '2px solid blue' : 'none',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    animation: isRegionActive(region) ? 'pulse 1s infinite' : 'none',
                  }}
                >
                  {isRegionActive(region) && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '2px 5px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {`(${region.x.toFixed(0)}, ${region.y.toFixed(0)}, ${region.time.toFixed(2)}s)`}
                    </span>
                  )}
                </div>
              ))}
            {isAdmin &&
              markedZones.map((zone, index) => {
                if (
                  typeof zone.x !== 'number' ||
                  typeof zone.y !== 'number' ||
                  typeof zone.radius !== 'number' ||
                  typeof zone.time !== 'number'
                ) {
                  console.error('Zone invalide détectée:', zone);
                  return null;
                }
                return (
                  <div
                    key={`zone-${index}`}
                    style={{
                      position: 'absolute',
                      left: `${zone.x - zone.radius}px`,
                      top: `${zone.y - zone.radius}px`,
                      width: `${zone.radius * 2}px`,
                      height: `${zone.radius * 2}px`,
                      border: '2px solid red',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '2px 5px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {`(${zone.x.toFixed(0)}, ${zone.y.toFixed(0)}, ${zone.time.toFixed(2)}s, r:${zone.radius.toFixed(0)})`}
                    </span>
                  </div>
                );
              })}
            {role === 'Apprenant' &&
              markedZones.map((zone, index) => {
                if (
                  typeof zone.x !== 'number' ||
                  typeof zone.y !== 'number' ||
                  typeof zone.radius !== 'number' ||
                  typeof zone.time !== 'number'
                ) {
                  console.error('Zone invalide détectée:', zone);
                  return null;
                }
                return (
                  <div
                    key={`zone-${index}`}
                    style={{
                      position: 'absolute',
                      left: `${zone.x - zone.radius}px`,
                      top: `${zone.y - zone.radius}px`,
                      width: `${zone.radius * 2}px`,
                      height: `${zone.radius * 2}px`,
                      border: isRegionActive(zone) ? '2px solid green' : 'none',
                      backgroundColor: isRegionActive(zone) ? 'rgba(0, 255, 0, 0.2)' : 'transparent',
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      animation: isRegionActive(zone) ? 'pulse 1s infinite' :'none'
                    }}
                  />
                );
              })}
            {isMarking && (
              <div
                ref={markingRef}
                style={{
                  position: 'absolute',
                  border: '2px dashed blue',
                  pointerEvents: 'none',
                  display: 'none',
                  borderRadius: '50%',
                }}
              />
            )}
          </div>
          {popupMessage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-75 text-white p-4 rounded-lg z-50">
              {popupMessage}
            </div>
          )}
          <style>
            {`
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}
          </style>
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