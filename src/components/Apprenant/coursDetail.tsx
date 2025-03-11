import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chapitre, CourType, InteractionResponse, VideoInteraction } from '../../types/auth';
import { CoursService } from '../../services/cours.service';
import { CircularProgress, Typography } from '@mui/material';
import ChapitreService from '../../services/chapitres.service';
import VideoPlayer from '../AdminMinistere/videoPlayer'; // Assurez-vous que le chemin est correct
import { getAuthStore } from '../../store/auth';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/cours';
const API_URL1 = 'http://127.0.0.1:8000/users';

function CourseDetail() {
  const { coursId } = useParams<{ coursId: string }>();
  const navigate = useNavigate();
  const [cours, setCours] = useState<CourType | null>(null);
  const [chapitres, setChapitres] = useState<Chapitre[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [courseError, setCourseError] = useState('');
  const [interactions, setInteractions] = useState<VideoInteraction[]>([]);
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(true);
  const { accessToken } = getAuthStore();
  const [error, setError] = useState('');
  const [loading, setIsLoading] = useState(true);

  const selectedChapter = chapitres.find((ch) => ch.id === selectedChapterId) || null;

  useEffect(() => {
    const fetchCours = async () => {
      try {
        setIsLoading(true);
        const coursIdNumber = parseInt(coursId!, 10);
        if (isNaN(coursIdNumber)) {
          setCourseError('Invalid course ID');
          return;
        }
        const res = await CoursService.getCoursById(coursIdNumber);
        setCours(res.data);
      } catch (error) {
        console.error('Erreur lors du chargement du cours :', error);
        setCourseError('Impossible de charger le cours.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchChapitres = async () => {
      try {
        setIsLoading(true);
        const coursIdNumber = parseInt(coursId!, 10);
        if (isNaN(coursIdNumber)) {
          setCourseError('Invalid course ID');
          return;
        }
        const data = await ChapitreService.getChapitresForCours(coursIdNumber);
        if (Array.isArray(data)) {
          const initializedChapitres = data.map((ch) => ({
            ...ch,
            completed: ch.completed ?? false,
          }));
          setChapitres(initializedChapitres);
          if (initializedChapitres.length > 0) {
            setSelectedChapterId(initializedChapitres[0].id);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des chapitres :', error);
        setCourseError('Erreur lors du chargement des chapitres.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCours();
    fetchChapitres();
  }, [coursId]);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        if (!selectedChapter || !selectedChapter.video) {
          setError('Aucune vidéo trouvée pour ce chapitre.');
          return;
        }

        const response = await axios.get(`${API_URL}/interactions/?video_url=${selectedChapter.video}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log('Fetched interactions:', response.data);
        setInteractions(response.data as VideoInteraction[]);
      } catch (err) {
        setError((err as any).message);
      } finally {
        setIsLoadingInteractions(false);
      }
    };

    if (accessToken && selectedChapter?.video) {
      fetchInteractions();
    } else {
      setError('Token d\'authentification manquant ou vidéo non sélectionnée');
      setIsLoadingInteractions(false);
    }
  }, [accessToken, selectedChapter]);

  const isSelectable = (index: number) => {
    for (let i = 0; i < index; i++) {
      if (!chapitres[i].completed) return false;
    }
    return true;
  };

  const handleChapterSelect = (chapterId: number) => {
    console.log('Chapitre sélectionné:', chapterId);
    const index = chapitres.findIndex((ch) => ch.id === chapterId);
    if (isSelectable(index)) {
      setSelectedChapterId(chapterId);
    }
  };

  const handleVideoComplete = (responses: InteractionResponse[], isFullyCompleted: boolean) => {
    console.log('User Responses:', responses);
    if (isFullyCompleted && selectedChapter) {
      setChapitres((prev) => {
        const newChapitres = prev.map((ch) =>
          ch.id === selectedChapter.id ? { ...ch, completed: true } : ch
        );
        const currentIndex = newChapitres.findIndex((ch) => ch.id === selectedChapter.id);
        const nextIndex = currentIndex + 1;
        if (nextIndex < newChapitres.length && isSelectable(nextIndex)) {
          setSelectedChapterId(newChapitres[nextIndex].id);
        }
        return newChapitres;
      });
      console.log('Vidéo complétée avec succès ! Passage au chapitre suivant.');
    } else {
      console.log('Vous devez revoir la vidéo.');
    }

    // Sauvegarde des interactions
    if (selectedChapter) {
      handleComplete(responses, isFullyCompleted);
    }
  };

  const handleComplete = async (responses: InteractionResponse[], isComplete: boolean) => {
    try {
      const payload = {
        video_url: selectedChapter?.video && selectedChapter.video.startsWith('http') ? selectedChapter.video : `${API_URL}${selectedChapter?.video ?? ''}`,
        user_responses: responses,
        required_interactions: interactions
          .filter((i) => i.interaction_type === 'click')
          .map((i) => i.id),
        is_completed: isComplete,
      };
      console.log('Payload envoyé:', payload);
      const response = await axios.post(`${API_URL1}/completions/`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log('Réponse serveur:', response.data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Impossible de sauvegarder la progression.');
    }
  };

  if (isLoadingInteractions || loading) {
    return <CircularProgress />;
  }

  if (courseError) {
    return <Typography color="error">{courseError}</Typography>;
  }

  if (!cours) {
    return <Typography>Ce cours n'existe pas.</Typography>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex gap-6">
      <div className="w-[400px] bg-white rounded-xl shadow-lg p-6">
        {selectedChapter ? (
          <>
            <h3 className="text-xl font-semibold mb-4">{selectedChapter.title}</h3>
            <p className="text-gray-600 mb-4">{selectedChapter.description}</p>
            {selectedChapter.video ? (
              <VideoPlayer
                videoUrl={selectedChapter.video.startsWith('http') ? selectedChapter.video : `${API_URL}${selectedChapter.video}`}
                pauses={selectedChapter.pauses || []}
                role="Apprenant"
                onComplete={handleVideoComplete}
              />
            ) : selectedChapter.pdf || selectedChapter.pptx ? (
              <div className="text-center">
                <a
                  href={selectedChapter.pdf?.startsWith('http') ? selectedChapter.pdf : `${API_URL}${selectedChapter.pdf || selectedChapter.pptx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Télécharger {selectedChapter.pdf ? 'le PDF' : 'le PPTX'}
                </a>
              </div>
            ) : (
              <p className="text-gray-500">Aucun contenu disponible pour ce chapitre.</p>
            )}
            <button
              onClick={() => navigate(`/course/${coursId}/chapitre/${selectedChapter.id}/quizz`)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Passer le Quiz
            </button>
          </>
        ) : (
          <p className="text-gray-500">Sélectionnez un chapitre pour voir ses détails.</p>
        )}
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Détails du Cours</h2>
            <button
              onClick={() => navigate(`/course/${coursId}/quizz/`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Passer le Quiz Final
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Chapitres</p>
                <p className="font-semibold">{chapitres.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Titre du cours</p>
                <p className="font-semibold">{cours.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-semibold">{cours.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {chapitres.map((chapter, index) => (
            <div
              key={chapter.id}
              onClick={() => handleChapterSelect(chapter.id)}
              className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-shadow ${
                isSelectable(index) ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'
              } ${selectedChapterId === chapter.id ? 'border-2 border-blue-600' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      chapter.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {chapter.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <PlayCircle className="h-5 w-5" />
                    )}
                  </div>
                  <h3 className="font-semibold">{chapter.title}</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {chapter.completed ? 'Complété' : 'Non complété'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;