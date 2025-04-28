import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import {
  Button, Radio, RadioGroup, FormControlLabel, FormControl, Typography, Box, LinearProgress,
} from '@mui/material';
import { QuestionCour, InteractionResponse2 } from '../../types/auth';
import questionService from '../../services/questions.service';
import VideoPlayer from './videoPlayer2';

function ChapterQuestion() {
  const { coursId, chapterId, QuizzId } = useParams<{
    coursId: string;
    chapterId: string;
    QuizzId: string;
  }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionCour[]>([]);
  const [videoResponses, setVideoResponses] = useState<InteractionResponse2[][]>([]);
  const [interactedZones, setInteractedZones] = useState<Set<number>>(new Set());
  const [isVideoEnded, setIsVideoEnded] = useState<boolean[]>([]); // Nouvel état pour suivre la fin de la vidéo

  useEffect(() => {
    if (QuizzId) {
      fetchQuestions();
    } else {
      setError('Quizz ID is missing.');
    }
  }, [QuizzId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const quizzIdNumber = parseInt(QuizzId!, 10);
      if (isNaN(quizzIdNumber)) {
        setError('Invalid quiz ID');
        return;
      }

      const response = await questionService.getAllQuestions(quizzIdNumber);
      if (Array.isArray(response)) {
        setQuestions(response);
        setVideoResponses(new Array(response.length).fill([]));
        setAnswers(new Array(response.length).fill(''));
        setIsVideoEnded(new Array(response.length).fill(false)); // Initialiser l'état pour chaque question
        console.log('Questions chargées:', response.map(q => ({
          title: q.title,
          clickable_regions: q.clickable_regions || [],
          clickable_zones: q.clickable_zones || [],
        })));
      } else {
        setError('Les questions ne sont pas au bon format.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      setError('Erreur lors du chargement des questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleVideoInteraction = (questionIndex: number, responses: InteractionResponse2[]) => {
    console.log(`Interactions vidéo détectées pour la question ${questionIndex + 1}:`, responses);
    responses.forEach((response, index) => {
      console.log(`Zone/Région ${index + 1} - Clicked: ${response.clicked}, IsValid: ${response.isValid}, ClickTime: ${response.clickTime || 'N/A'}`);
    });

    const newVideoResponses = [...videoResponses];
    newVideoResponses[questionIndex] = responses;
    setVideoResponses(newVideoResponses);
    responses.forEach((response) => {
      if (response.clicked && response.clickTime) {
        setInteractedZones((prev) => new Set(prev).add(response.clickTime as number));
      }
    });
  };

  const handleVideoEnded = (questionIndex: number) => {
    console.log(`Vidéo terminée pour la question ${questionIndex + 1}`);
    const newIsVideoEnded = [...isVideoEnded];
    newIsVideoEnded[questionIndex] = true;
    setIsVideoEnded(newIsVideoEnded);
  };

  const handleSubmit = () => {
    const allInteractionsSuccessful = questions.every((question, index) => {
      if (question.video && ((question.clickable_regions?.length ?? 0) > 0 || (question.clickable_zones?.length ?? 0) > 0)) {
        const responses = videoResponses[index];
        const expectedLength = (question.clickable_zones?.length || 0) + (question.clickable_regions?.length || 0);
        const isComplete = responses.length === expectedLength && responses.every((response) => response.clicked);
        console.log(`Question ${index + 1} - Interactions vidéo complètes: ${isComplete}, Responses:`, responses, `Expected: ${expectedLength}`);
        return isComplete && isVideoEnded[index]; // Ajouter la vérification de fin de vidéo
      }
      return true;
    });

    if (!allInteractionsSuccessful) { 
      setError('Vous devez cliquer sur tous les objets définis et terminer la vidéo pour soumettre le quiz.');
      return;
    }

    const hasUnansweredTextQuestions = questions.some((question, index) => {
      const hasOptions = [question.op1, question.op2, question.op3, question.op4].some((opt) => opt);
      return hasOptions && !answers[index];
    });

    if (hasUnansweredTextQuestions) {
      setError('Veuillez répondre à toutes les questions avant de soumettre.');
      return;
    }

    const correctAnswers = questions.reduce((acc, question, index) => {
      const isVideoQuestion = question.video && ((question.clickable_regions?.length ?? 0) > 0 || (question.clickable_zones?.length ?? 0) > 0);
      if (isVideoQuestion) {
        return acc + (videoResponses[index].every((response) => response.isValid) ? 1 : 0);
      }
      return acc + (answers[index] === question.rep ? 1 : 0);
    }, 0);

    const score = Math.round((correctAnswers / questions.length) * 100);

    const feedback = questions.map((question, index) => ({
      question: question.title,
      userAnswer: answers[index] || 'Pas de réponse',
      correctAnswer: question.rep || 'Interaction vidéo',
      correct: question.video
        ? videoResponses[index].every((response) => response.isValid)
        : answers[index] === question.rep,
      explanation: question.video
        ? 'Vous deviez cliquer dans la zone cible à l\'heure spécifiée.'
        : 'Pas d’explication disponible.',
      videoResponses: videoResponses[index],
    }));

    navigate(`/course/${coursId}/quiz/result`, {
      state: {
        score,
        correctAnswers,
        totalQuestions: questions.length,
        feedback,
      },
    });
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('La synthèse vocale n’est pas prise en charge par ce navigateur.');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Chargement des questions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="text-center py-8 text-gray-600">Aucune question disponible pour ce quiz.</div>;
  }

  const current = questions[currentQuestion];
  const videoUrl =
    typeof current.video === 'string' ? current.video : current.video ? URL.createObjectURL(current.video) : '';
  const options = [current.op1, current.op2, current.op3, current.op4].filter((opt) => opt);

  console.log(`Question ${currentQuestion + 1} - Config:`, {
    hasVideo: !!current.video,
    clickableRegions: current.clickable_regions || [],
    clickableZones: current.clickable_zones || [],
    videoResponses: videoResponses[currentQuestion],
    isVideoEnded: isVideoEnded[currentQuestion],
  });

  const isVideoInteractionComplete =
    current.video && ((current.clickable_regions?.length ?? 0) > 0 || (current.clickable_zones?.length ?? 0) > 0)
      ? videoResponses[currentQuestion].length === (current.clickable_zones?.length || 0) + (current.clickable_regions?.length || 0) &&
        videoResponses[currentQuestion].every((response) => response.clicked) &&
        isVideoEnded[currentQuestion] // Ajouter la vérification de fin de vidéo
      : true;

  const isSubmitEnabled = options.length > 0 ? !!answers[currentQuestion] : isVideoInteractionComplete;

  console.log(`Question ${currentQuestion + 1} - Submit enabled: ${isSubmitEnabled}, Video complete: ${isVideoInteractionComplete}, Text answer: ${answers[currentQuestion] || 'N/A'}`);

  return (
    <div className="quiz-container p-6">
      <div className="bg-white rounded-xl shadow-lg p-8" style={{ width: '800px', boxSizing: 'border-box' }}>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Quiz du Chapitre {chapterId}</h2>
            <span className="text-gray-500">
              Question {currentQuestion + 1} sur {questions.length}
            </span>
          </div>
          <LinearProgress
            variant="determinate"
            value={((currentQuestion + 1) / questions.length) * 100}
            sx={{ height: 8, borderRadius: 4, backgroundColor: '#e5e7eb', '& .MuiLinearProgress-bar': { backgroundColor: '#3b82f6' } }}
          />
        </div>
  
        <div className="mb-8">
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h6" className="font-semibold text-gray-800">
              {current.title}
            </Typography>
            <Button
              onClick={() => speakText(current.title)}
              aria-label="Lire la question à voix haute"
              sx={{ ml: 2, color: '#3b82f6' }}
            >
              <Volume2 size={20} />
            </Button>
          </Box>
  
          {current.imagecour ? (
            <div className="mb-4 flex justify-center">
              <img
                src={
                  typeof current.imagecour === 'string'
                    ? current.imagecour
                    : URL.createObjectURL(current.imagecour)
                }
                alt="Illustration de la question"
                className="max-w-[768px] h-48 object-contain rounded-lg shadow-md"
              />
            </div>
          ) : current.video && videoUrl ? (
            <div className="mb-4 flex justify-center">
              <div className="relative bg-black rounded-xl" style={{ width: '768px' }}>
                <VideoPlayer
                  videoUrl={videoUrl}
                  clickable_regions={current.clickable_regions || []}
                  clickable_zones={(current.clickable_zones || []).map((zone) => {
                    if ('width' in zone && 'height' in zone) {
                      return {
                        x: zone.x,
                        y: zone.y,
                        radius: Math.min(zone.width as number, zone.height as number) / 2,
                        time: zone.time,
                      };
                    }
                    return zone;
                  })}
                  onInteraction={(responses: InteractionResponse2[]) => handleVideoInteraction(currentQuestion, responses)}
                  onEnded={() => handleVideoEnded(currentQuestion)}
                  role="Apprenant"
                  width="768px"
                  height="auto"
                />
              </div>
            </div>
          ) : null}
  
          {options.length > 0 && (
            <FormControl component="fieldset">
              <RadioGroup
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
              >
                {options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#3b82f6' } }} />}
                    label={
                      <Box display="flex" alignItems="center">
                        <Typography className="text-gray-700">{option}</Typography>
                        <Button
                          onClick={() => speakText(option)}
                          aria-label={`Lire l'option ${option} à voix haute`}
                          sx={{ ml: 1, color: '#3b82f6' }}
                        >
                          <Volume2 size={16} />
                        </Button>
                      </Box>
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </div>
  
        <div className="flex justify-between">
          <Button
            variant="contained"
            sx={{ backgroundColor: '#6b7280', '&:hover': { backgroundColor: '#4b5563' } }}
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
          >
            Précédent
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button
              variant="contained"
              sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!isSubmitEnabled}
            >
              Suivant
            </Button>
          ) : (
            <Button
              variant="contained"
              sx={{ backgroundColor: '#3b82f6', '&:hover': { backgroundColor: '#2563eb' } }}
              onClick={handleSubmit}
              disabled={!isSubmitEnabled}
            >
              Soumettre
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterQuestion;