import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traductions adaptées à tous les composants
const resources = {
  en: {
    translation: {
      // Clés communes
      dashboard: "Learner's dashboard",
      coursesList: "List of Courses",
      viewedCourses: "Viewed Courses",
      quizzes: "Quizzes",
      quizCourse: "Course Quiz",
      quizChapter: "Chapter Quiz",
      changeLanguage: "Change Language",
      conversations: "Chat",

      // Clés pour MainContent et Tableau
      eLearningPlatform: "E_Learning",
      platformDescription: "Online training platform from the Ministry of Tourism, providing courses in the field, specially designed for different members of companies.",
      coursesInProgress: "Courses in Progress",
      completedCourses: "Completed Courses",
      TocompleteCourses: "To Complete Courses",
      unreadCourses: "Unread Courses", // MainContent
      notStartedCourses: "Not Started Courses", // Tableau
      numberOfCompanies: "Number of Companies",
      numberOfStaff: "Number of Staff",
      numberOfCourses: "Number of Courses",
      availableCourses: "Available Courses", // Tableau
      followedCourses: "Courses Followed", // Tableau
      courseQuiz: "Course Quiz", // Tableau
      completedQuizzes: "Completed Quizzes", // Tableau
      MinistèreduTourisme: "Ministry of Tourism",

      // Clés pour NavbarMinistere
      home: "Ministry  Admin",
      grades: "Grades",
      users: "Users",
      adminMinistry: "Ministry Admin",
      adminCompany: "Company Admin",
      learner: "Learner",
      companies: "Companies",
      domain: "Domain",
      groups: "Groups",
      courses: "Courses",
      chapters: "Chapters",
      questionList: "Question List",
      staff: "Staff",
      ministryProfile: "Ministry Profile",

      // Nouvelles clés pour NavbarEntreprise
      homeEntreprise: "Company Admin Home",
      subAdmin: "Sub Admin",
    },
  },
  fr: {
    translation: {
      // Clés communes
      dashboard: " Apprenant Tableau de bord",
      coursesList: "Liste des cours",
      viewedCourses: "Cours consultés",
      quizzes: "Quizz",
      quizCourse: "Quizz de Cours",
      quizChapter: "Quizz de Chapitre",
      changeLanguage: "Changer de langue",
      conversations: "Conversations",

      // Clés pour MainContent et Tableau
      eLearningPlatform: "E_Learning",
      platformDescription: "Plateforme de formation en ligne du ministère du tourisme, contenant des formations dans le domaine, destinée spécialement aux différents membres des entreprises.",
      coursesInProgress: "Cours en cours",
      completedCourses: "Cours terminés",
      TocompleteCourses: "reste inCompleté Cours",
      unreadCourses: "Cours non lus", // MainContent
      notStartedCourses: "Cours non entamés", // Tableau
      numberOfCompanies: "Nombre des entreprises",
      numberOfStaff: "Nombre des effectifs",
      numberOfCourses: "Nombre des cours",
      availableCourses: "Cours disponibles", // Tableau
      followedCourses: "Cours suivis", // Tableau
      courseQuiz: "Quiz cours", // Tableau
      completedQuizzes: "Quiz terminés", // Tableau
      MinistèreduTourisme: "Ministère du Tourisme",

      // Clés pour NavbarMinistere
      home: "Admin Ministère ",
      grades: "Grades",
      users: "Utilisateurs",
      adminMinistry: "Admin Ministère",
      adminCompany: "Admin Entreprise",
      learner: "Apprenant",
      companies: "Entreprises",
      domain: "Domaine",
      groups: "Groupes",
      courses: "Cours",
      chapters: "Chapitres",
      questionList: "Liste des Questions",
      staff: "Effectifs",
      ministryProfile: "Profil Ministère",

      // Nouvelles clés pour NavbarEntreprise
      homeEntreprise: "Accueil Admin Entreprise",
      subAdmin: "Sous Admin",
    },
  },
  ar: {
    translation: {
      // Clés communes
      dashboard: " المتعلم لوحة التحكم",
      coursesList: "قائمة الدورات",
      viewedCourses: "الدورات التي تمت مشاهدتها",
      quizzes: "الاختبارات",
      quizCourse: "اختبار الدورة",
      quizChapter: "اختبار الفصل",
      changeLanguage: "تغيير اللغة",
      conversations: "محادثات",

      // Clés pour MainContent et Tableau
      eLearningPlatform: "E_Learning",
      platformDescription: "منصة تدريب عبر الإنترنت من وزارة السياحة تحتوي على دورات في هذا المجال، موجهة خصيصًا لأعضاء الشركات المختلفة.",
      coursesInProgress: "الدورات في التقدم",
      completedCourses: "الدورات المكتملة",
      unreadCourses: "الدورات غير المقروءة", // MainContent
      notStartedCourses: "الدورات غير المبدوءة", // Tableau
      numberOfCompanies: "عدد الشركات",
      numberOfStaff: "عدد الموظفين",
      numberOfCourses: "عدد الدورات",
      availableCourses: "الدورات المتاحة", // Tableau
      followedCourses: "الدورات المتابعة", // Tableau
      courseQuiz: "اختبار الدورة", // Tableau
      completedQuizzes: "الاختبارات المكتملة", // Tableau
      MinistèreduTourisme: "وزارة السياحة",

      // Clés pour NavbarMinistere
      home: " الوزارة إدارة",
      grades: "الدرجات",
      users: "المستخدمون",
      adminMinistry: "إدارة الوزارة",
      adminCompany: "إدارة الشركة",
      learner: "المتعلم",
      companies: "الشركات",
      domain: "المجال",
      groups: "المجموعات",
      courses: "الدورات",
      chapters: "الفصول",
      questionList: "قائمة الأسئلة",
      staff: "الموظفون",
      ministryProfile: "ملف الوزارة",

      // Nouvelles clés pour NavbarEntreprise
      homeEntreprise: " إدارة الشركة",
      subAdmin: "الإدارة الفرعية",
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