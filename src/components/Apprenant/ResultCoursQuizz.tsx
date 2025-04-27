import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { quizService } from '../../services/responseQuizz';
import { CourseQuizResponse, InteractionResponse2 } from '../../types/auth';

function CourQuizResult() {
  const { coursId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer les résultats passés depuis ChapterQuestion
  const { score, correctAnswers, totalQuestions, feedback } = location.state || {
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    feedback: [],
  };

  // État pour stocker la réponse de l'API
  const [quizResponse, setQuizResponse] = useState<CourseQuizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isCreatingRef = useRef(false); // Verrou pour empêcher les doubles appels

  // Fonction pour créer une nouvelle réponse
  const createCourseQuizResponse = async () => {
    if (isCreatingRef.current) {
      console.log('Création déjà en cours, ignorée');
      return;
    }

    try {
      isCreatingRef.current = true;
      const status = score === 100 ? 'Completed' : 'In Progress';
      const quizResponseData: Partial<CourseQuizResponse> = {
        course: parseInt(coursId!),
        title: `Cours ${coursId} Quiz`,
        score: score,
        status: status,
      };

      const response = await quizService.createCourseQuizResponse(quizResponseData);
      setQuizResponse(response);
      setError(null);
    } catch (error: any) {
      setError('Erreur lors de la création du QuizResponse');
      console.error('Erreur dans le composant:', error);
    } finally {
      isCreatingRef.current = false;
    }
  };

  // Appeler la fonction lors du montage du composant
  useEffect(() => {
    handleCreateQuizResponse();
  }, []);

  const handleCreateQuizResponse = async () => {
    await createCourseQuizResponse();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Résultats du Quiz</h2>
          <div className="text-6xl font-bold mb-2">{score}%</div>
          <p className="text-blue-100">
            {correctAnswers} réponses correctes sur {totalQuestions} questions
          </p>
        </div>

        <div className="p-8">
          {quizResponse && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
              <p>Résultat enregistré avec succès :</p>
              <p>Cours: {quizResponse.course}</p>
              <p>Titre: {quizResponse.title}</p>
              <p>Score: {quizResponse.score}</p>
              <p>Statut: {quizResponse.status}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {feedback.map(
              (
                item: {
                  correct: boolean;
                  question: string;
                  userAnswer: string;
                  correctAnswer: string;
                  explanation: string;
                  videoResponses: InteractionResponse2[];
                },
                index: number
              ) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    {item.correct ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mt-1" />
                    )}
                    <div>
                      <h3 className="font-semibold mb-2">{item.question}</h3>
                      {item.userAnswer && (
                        <p className="text-gray-600 mb-2">Votre réponse: {item.userAnswer}</p>
                      )}
                      {!item.correct && item.correctAnswer && (
                        <p className="text-green-600 mb-2">
                          Réponse correcte: {item.correctAnswer}
                        </p>
                      )}
                      {item.videoResponses && item.videoResponses.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Interactions vidéo :</p>
                          {item.videoResponses.map((response, idx) => (
                            <div key={idx} className="ml-4 mt-1">
                              <p>
                                Clic à {response.clickTime?.toFixed(2)}s (
                                X: {response.clickX?.toFixed(0)}, Y: {response.clickY?.toFixed(0)}
                                ) -{' '}
                                {response.isValid ? (
                                  <span className="text-green-600">Valide</span>
                                ) : (
                                  <span className="text-red-600">Non valide</span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-500">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={() => navigate(`/course`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Continuer le cours
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourQuizResult;