import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle } from 'lucide-react';
import ChapitreService from "../../services/chapitres.service";
import { Chapitre } from "../../types/auth";
import VideoPlayer from "../AdminMinistere/videoPlayer";

const API_URL = "http://127.0.0.1:8000/cours";
function ChapterDetail() {
  const { coursId, chapterId } = useParams();
  const navigate = useNavigate();33333333333
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chapitre, setChapitre] = useState<Chapitre | null>(null);
  const [chapterCompleted, setChapterCompleted] = useState(false);

  useEffect(() => {
    const fetchChapitre = async () => {
      try {
        setLoading(true);
        const chapitreIdNumber = parseInt(chapterId!, 10);

        if (isNaN(chapitreIdNumber)) {
          setError("ID de chapitre invalide");
          return;
        }

        const res = await ChapitreService.getChapitreById(chapitreIdNumber);
        setChapitre(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement du chapitre :", error);
        setError("Impossible de charger le chapitre.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapitre();
  }, [chapterId]);

  const handleVideoCompletion = () => {
    setChapterCompleted(true);  // Met à jour l'état une fois que la vidéo est terminée
  };

  const handleNextChapter = () => {
    if (chapterCompleted) {
      const nextChapterId = parseInt(chapterId!, 10) + 1;  // Logique pour le chapitre suivant
      navigate(`/course/${coursId}/chapter/${nextChapterId}`);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!chapitre) return <p className="text-gray-500">Chapitre introuvable</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Affichage de la vidéo ou des fichiers PDF/PPTX */}
        <div className="aspect-video bg-gray-900 relative">
          {chapitre.video ? (
            <VideoPlayer
              videoUrl={`${API_URL}${chapitre.video}`}
          
         

            />
          ) : chapitre.pdf || chapitre.pptx ? (
            <div className="p-6 text-center">
              <a
                href={`${API_URL}${chapitre.pdf || chapitre.pptx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Télécharger {chapitre.pdf ? "le PDF" : "le PPTX"}
              </a>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white opacity-80">Aucun fichier disponible</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">{chapitre.title}</h2>
          <p className="text-gray-600 mb-6">{chapitre.description}</p>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={() => navigate(`/course/${coursId}`)}
              className="text-gray-600 hover:text-gray-800"
            >
              Retour au cours
            </button>
            
            <button
              onClick={() => navigate(`/course/${coursId}/chapitre/${chapterId}/quizz`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Passer le Quiz
            </button>

            <button
              onClick={handleNextChapter}  // Passer au chapitre suivant
              disabled={!chapterCompleted}  // Désactive le bouton si le chapitre n'est pas terminé
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              Chapitre suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterDetail;
