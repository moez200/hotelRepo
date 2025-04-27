import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, PlayCircle, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chapitre, CourType, InteractionResponse, Pause } from '../../types/auth';
import { CoursService } from '../../services/cours.service';
import { CircularProgress, Typography } from '@mui/material';
import ChapitreService from '../../services/chapitres.service';

import { getAuthStore } from '../../store/auth';
import axios from 'axios';
import VideoPlayer from '../AdminMinistere/videoPlayer';

const API_URL = 'http://127.0.0.1:8000/cours';
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
const HF_API_KEY = 'YOUR_HF_API_KEY'; // Replace with your Hugging Face API key

interface TranscriptionEntry {
  time: string;
  text: string;
}

interface TimeSummaries {
  status: string;
  transcriptions?: TranscriptionEntry[];
}

interface ChapitreWithSummaries extends Chapitre {
  time_summaries?: TimeSummaries;
}

function CourseDetail() {
  const { coursId } = useParams<{ coursId: string }>();
  const navigate = useNavigate();
  const [cours, setCours] = useState<CourType | null>(null);
  const [chapitres, setChapitres] = useState<ChapitreWithSummaries[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [courseError, setCourseError] = useState('');
  const { accessToken } = getAuthStore();
  const [error, setError] = useState('');
  const [loading, setIsLoading] = useState(true);
  const [summarizedTranscriptions, setSummarizedTranscriptions] = useState<TranscriptionEntry[]>([]);

  const selectedChapter = chapitres.find((ch) => ch.id === selectedChapterId) || null;

  // API-based summarization function
  const summarizeText = async (text: string, maxLength: number = 20): Promise<string> => {
    if (!text || text === "No speech detected in this segment.") {
      return text;
    }
    try {
      const response = await axios.post(
        HF_API_URL,
        { inputs: text, parameters: { max_length: maxLength, min_length: 5 } },
        { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
      );
      const responseData = response.data as { summary_text: string }[];
      return responseData[0].summary_text.trim();
    } catch (error) {
      console.error('Summarization error:', error);
      // Fallback: rule-based summarization
      const sentences = text
        .split(/(?<=[.!?])\s+/)
        .filter(sentence => sentence.trim().length > 0);
      if (sentences.length === 0) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        return words.slice(0, maxLength).join(' ') + (words.length > maxLength ? '.' : '');
      }
      let summary = '';
      let wordCount = 0;
      for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).filter(word => word.length > 0);
        if (wordCount + sentenceWords.length <= maxLength) {
          summary += sentence + ' ';
          wordCount += sentenceWords.length;
        } else {
          break;
        }
      }
      summary = summary.trim() || sentences[0].trim();
      if (!/[.!?]$/.test(summary)) {
        summary += '.';
      }
      return summary;
    }
  };

  // Summarize transcriptions when selectedChapter changes
  useEffect(() => {
    const summarizeTranscriptions = async () => {
      if (selectedChapter?.time_summaries?.transcriptions) {
        setIsLoading(true);
        try {
          const summaries = await Promise.all(
            selectedChapter.time_summaries.transcriptions.map(async (entry) => ({
              time: entry.time,
              text: await summarizeText(entry.text),
            }))
          );
          setSummarizedTranscriptions(summaries);
        } catch (error) {
          console.error('Error summarizing transcriptions:', error);
          setError('Failed to generate transcription summaries.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setSummarizedTranscriptions([]);
      }
    };
    summarizeTranscriptions();
  }, [selectedChapter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const coursIdNumber = parseInt(coursId!, 10);
        if (isNaN(coursIdNumber)) {
          setCourseError('Invalid course ID');
          return;
        }

        const coursRes = await CoursService.getCoursById(coursIdNumber);
        setCours(coursRes.data);

        const chaptersData = await ChapitreService.getChapitresForCours(coursIdNumber);
        console.log('Chapters Data:', chaptersData);
        const completionResponse = await axios.get<{ video_url: string; is_completed: boolean }[]>(`${API_URL}/completions/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const completions = completionResponse.data;

        if (Array.isArray(chaptersData)) {
          const updatedChapitres = chaptersData.map(ch => {
            const completion = completions.find(c => c.video_url === (ch.video?.startsWith('http') ? ch.video : `${API_URL}${ch.video}`));
            return { ...ch, completed: completion?.is_completed || false };
          }).sort((a, b) => a.id - b.id);

          console.log('Completions Data:', completions);
          console.log('Updated Chapitres:', updatedChapitres);
          setChapitres(updatedChapitres);

          setSelectedChapterId(null);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setCourseError('Error loading course data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [coursId, accessToken]);

  const isChapterAccessible = (chapter: ChapitreWithSummaries) => {
    const sortedChapters = [...chapitres].sort((a, b) => a.id - b.id);
    const completedChapters = sortedChapters.filter(ch => ch.completed);
    const lastCompleted = completedChapters[completedChapters.length - 1];

    if (!lastCompleted) {
      return sortedChapters[0]?.id === chapter.id;
    }

    const currentIndex = sortedChapters.findIndex(ch => ch.id === lastCompleted.id);
    const targetIndex = sortedChapters.findIndex(ch => ch.id === chapter.id);

    return targetIndex === currentIndex + 1 || chapter.completed;
  };

  const handleChapterSelect = (chapterId: number) => {
    const chapter = chapitres.find(ch => ch.id === chapterId);
    if (chapter && isChapterAccessible(chapter)) {
      console.log('Selected chapter:', chapterId);
      setSelectedChapterId(chapterId);
    } else {
      console.log('Locked chapter:', chapterId);
    }
  };

  const handleVideoComplete = (responses: InteractionResponse[], isFullyCompleted: boolean, normalizedPauses: Pause[]) => {
    console.log('handleVideoComplete called - isFullyCompleted:', isFullyCompleted, 'selectedChapter:', selectedChapter);

    if (!selectedChapter) {
      console.log('selectedChapter is null or undefined');
      return;
    }

    if (isFullyCompleted) {
      console.log('Video fully completed, preparing to call handleComplete');
      setChapitres((prev) => {
        const updatedChapitres = prev.map((ch) =>
          ch.id === selectedChapter.id ? { ...ch, completed: true } : ch
        );
        console.log('Updated chapters:', updatedChapitres);
        return updatedChapitres;
      });

      console.log('Before calling handleComplete - Responses:', responses, 'Normalized Pauses:', normalizedPauses);
      handleComplete(responses, isFullyCompleted, normalizedPauses).then(() => {
        console.log('handleComplete executed successfully');
        const sortedChapitres = [...chapitres].sort((a, b) => a.id - b.id);
        const currentIndex = sortedChapitres.findIndex(ch => ch.id === selectedChapter.id);
        const nextChapter = sortedChapitres.find((ch, idx) => idx > currentIndex && !ch.completed);

        console.log('Next chapter found:', nextChapter);
        if (nextChapter) {
          setSelectedChapterId(nextChapter.id);
        } else {
          console.log('No next un下一个 chapitre non complété.');
          setSelectedChapterId(null);
        }
      }).catch(error => {
        console.error('Error in handleComplete:', error);
      });
    } else {
      console.log('Video not fully completed - Responses:', responses);
    }
  };

  const handleComplete = async (responses: InteractionResponse[], isComplete: boolean, normalizedPauses: Pause[]) => {
    console.log('Starting handleComplete - isComplete:', isComplete, 'selectedChapter:', selectedChapter);
    try {
      if (!selectedChapter || !selectedChapter.video) {
        throw new Error('selectedChapter or video is invalid');
      }

      const payload = {
        video_url: selectedChapter.video.startsWith('http')
          ? selectedChapter.video
          : `${API_URL}${selectedChapter.video}`,
        user_responses: responses,
        required_interactions: normalizedPauses.map(pause => {
          if (pause.tempsPause === null || pause.tempsPause === undefined) {
            console.warn('tempsPause is null or undefined for a pause:', pause);
            return "0";
          }
          return pause.tempsPause.toString();
        }).filter(id => id !== ""),
        is_completed: isComplete,
      };

      console.log('Payload to send:', payload);

      const response = await axios.post(`${API_URL}/completions/`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending to server:', (error as any).response ? (error as any).response.data : (error as any).message);
      setError('Failed to save progress: ' + ((error as any).response ? (error as any).response.data : (error as any).message));
      throw error;
    }
  };

  if (loading) {
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
              <>
                <VideoPlayer
                  videoUrl={selectedChapter.video.startsWith('http') ? selectedChapter.video : `${API_URL}${selectedChapter.video}`}
                  pauses={selectedChapter.pauses || []}
                  role="Apprenant"
                  onComplete={(responses: InteractionResponse[], isFullyCompleted: boolean) => handleVideoComplete(responses, isFullyCompleted, selectedChapter.pauses || [])}
                />
                {/* Display Summarized Transcription Below Video */}
                {summarizedTranscriptions.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Résumé de la Transcription</h4>
                    <ul className="space-y-2">
                      {summarizedTranscriptions.map((entry, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          <span className="font-medium">{entry.time}</span>: {entry.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : selectedChapter.time_summaries && selectedChapter.time_summaries.transcriptions ? (
                  <p className="mt-4 text-sm text-gray-500">Résumé en cours de génération...</p>
                ) : null}
              </>
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
          <p className="text-gray-500">Tous les chapitres sont verrouillés. Complétez un chapitre pour commencer.</p>
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
          {chapitres.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => handleChapterSelect(chapter.id)}
              className={`bg-white rounded-lg shadow p-6 transition-shadow
                ${isChapterAccessible(chapter) ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'}
                ${selectedChapterId === chapter.id ? 'border-2 border-blue-600' : 'border-2 border-transparent'}`}
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
                    ) : isChapterAccessible(chapter) ? (
                      <PlayCircle className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <h3 className="font-semibold">{chapter.title}</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {chapter.completed ? 'Complété' : isChapterAccessible(chapter) ? 'Non complété' : 'Verrouillé'}
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