import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import { getQuestionsByQuizz } from '../../services/questionchapitre';
import { QuestionChapitre } from '../../types/auth';

function ChapterQuestion() {
  const { coursId, chapterId } = useParams();
  const { QuizzId } = useParams<{ QuizzId: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionChapitre[]>([]);

  useEffect(() => {
    if (QuizzId) {
      fetchQuestions();
    
    } else {
      setError("quizz ID is missing.");
    }
  }, [QuizzId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const quizzIdNumber = parseInt(QuizzId!, 10);
      if (isNaN(quizzIdNumber)) {
        setError("Invalid quiz ID");
        return;
      }

      const response = await getQuestionsByQuizz(quizzIdNumber);
      if (Array.isArray(response)) {
        setQuestions(response);
      } else {
        setError("Les questions ne sont pas au bon format.");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des questions:", error);
      setError("Erreur lors du chargement des questions");
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

  const handleSubmit = () => {
    // Calculer le score
    const correctAnswers = questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.rep ? 1 : 0);
    }, 0);
  
    const score = Math.round((correctAnswers / questions.length) * 100);
  
    // Préparer les données de feedback
    const feedback = questions.map((question, index) => ({
      question: question.title,
      userAnswer: answers[index] || "Pas de réponse",
      correctAnswer: question.rep, // Inclure la réponse correcte
      correct: answers[index] === question.rep,
      explanation: "Pas d'explication disponible.", // Vous pouvez ajouter une explication si disponible
    }));
  
    // Naviguer vers la page des résultats avec les données
    navigate(`/course/${coursId}/chapter/${chapterId}/quiz/result`, {
      state: {
        score,
        correctAnswers,
        totalQuestions: questions.length,
        feedback,
      },
    });
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR'; // Set language to French
    utterance.rate = 0.9; // Slightly slower rate for better comprehension
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des questions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="text-center py-8">Aucune question disponible pour ce quiz.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Quiz du Chapitre {chapterId}</h2>
            <span className="text-gray-500">
              Question {currentQuestion + 1} sur {questions.length}
            </span>
          </div>
  
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
  
        <div className="mb-8">
          {/* Affichage de l'image si elle existe */}
          {questions[currentQuestion].imagecour && (
            <div className="mb-4 flex justify-center">
              <img
                src={questions[currentQuestion].imagecour}
                alt="Illustration de la question"
                className="max-w-full h-48 object-contain rounded-lg shadow-md"
              />
            </div>
          )}
  
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl">{questions[currentQuestion].title}</h3>
            <button
              onClick={() => speakText(questions[currentQuestion].title)}
              className="p-2 hover:bg-blue-100 rounded-full transition-colors"
              title="Écouter la question"
            >
              <Volume2 className="h-5 w-5 text-blue-600" />
            </button>
          </div>
  
          <div className="space-y-3">
            {[
              questions[currentQuestion].op1,
              questions[currentQuestion].op2,
              questions[currentQuestion].op3,
              questions[currentQuestion].op4,
            ].map((option, index) => (
              <button
                key={index}
                className={`group w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQuestion] === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAnswer(option)}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(option);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded-full transition-all"
                    title="Écouter l'option"
                  >
                    <Volume2 className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
  
        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/course/${coursId}/chapter/${chapterId}`)}
            className="text-gray-600 hover:text-gray-800"
          >
            Retour au chapitre
          </button>
  
          {currentQuestion === questions.length - 1 && answers.length === questions.length && (
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Terminer le quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
  
}

export default ChapterQuestion;