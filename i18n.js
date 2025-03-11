import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traductions adaptées à l'interface
const resources = {
  en: {
    translation: {
      dashboard: "Dashboard",
      coursesList: "List of Courses",
      viewedCourses: "Viewed Courses",
      quizzes: "Quizzes",
      quizCourse: "Course Quiz",
      quizChapter: "Chapter Quiz",
      changeLanguage: "Change Language",
      conversations: "Chat",
      // Ajout des ressources spécifiques pour le composant Tableau
      eLearningPlatform: "E_Learning",
      platformDescription: "Online training platform from the Ministry of Tourism, providing courses in the field, specially designed for different members of companies.",
      courseInProgress: "Courses in Progress (1/1)",
      completedCourses: "Completed Courses (0/1)",
      notStartedCourses: "Not Started Courses (0/1)",
      availableCourses: "Available Courses",
      followedCourses: "Courses Followed",
      courseQuiz: "Course Quiz",
      completedQuizzes: "Completed Quizzes",
      MinistèreduTourisme:" Ministry of Tourism",
    },
  },
  fr: {
    translation: {
      dashboard: "Tableau de bord",
      coursesList: "Liste des cours",
      viewedCourses: "Cours consultés",
      quizzes: "Quizz",
      quizCourse: "Quizz de Cours",
      quizChapter: "Quizz de Chapitre",
      changeLanguage: "Changer de langue",
      conversations: "Conversations",
      // Ajout des ressources spécifiques pour le composant Tableau
      eLearningPlatform: "E_Learning",
      platformDescription: "Plateforme de formation en ligne du ministère de tourisme, contenant des formations dans le domaine, destinée spécialement aux différents membres des entreprises.",
      courseInProgress: "Cours en cours (1/1)",
      completedCourses: "Cours Terminés (0/1)",
      notStartedCourses: "Cours Non Entamés (0/1)",
      availableCourses: "Cours disponible",
      followedCourses: "Cours suivis",
      courseQuiz: "Quiz cours",
      completedQuizzes: "Quiz terminés",
      MinistèreduTourisme:"Ministère du Tourisme",
    },
  },
  ar: {
    translation: {
      dashboard: "لوحة التحكم",
      coursesList: "قائمة الدورات",
      viewedCourses: "الدورات التي تمت مشاهدتها",
      quizzes: "الاختبارات",
      quizCourse: "اختبار الدورة",
      quizChapter: "اختبار الفصل",
      changeLanguage: "تغيير اللغة",
      conversations: "محادثات",
      // Ajout des ressources spécifiques pour le composant Tableau
      eLearningPlatform: "E_Learning",
      platformDescription: "منصة تدريب عبر الإنترنت من وزارة السياحة تحتوي على دورات في هذا المجال ، موجهة خصيصًا لأعضاء الشركات المختلفة.",
      courseInProgress: "الدورات في التقدم (1/1)",
      completedCourses: "الدورات المكتملة (0/1)",
      notStartedCourses: "الدورات غير المبدوءة (0/1)",
      availableCourses: "الدورات المتاحة",
      followedCourses: "الدورات المتابعة",
      courseQuiz: "اختبار الدورة",
      completedQuizzes: "الاختبارات المكتملة",
      MinistèreduTourisme:" وزارة السياحة",
    },
  },
};


i18n
  .use(LanguageDetector) // Détecte la langue du navigateur
  .use(initReactI18next) // Initialise i18next pour React
  .init({
    resources,
    fallbackLng: 'en', // Langue par défaut
    interpolation: {
      escapeValue: false, // Permet l'utilisation de HTML dans les traductions
    },
  });

export default i18n;
