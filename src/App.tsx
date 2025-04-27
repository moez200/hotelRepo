import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import  { useEffect} from 'react';
import AdminEntreprise from './components/AdminMinistere/admin_entreprise';
import Apprenant from './components/AdminMinistere/apprenant';
import ChapitreComponent from './components/AdminMinistere/ChapitreComponent';
import CoursComponent from './components/AdminMinistere/Cours';
import Domaine from './components/AdminMinistere/domaine';
import Entreprise from './components/AdminMinistere/Entreprise';
import Grades from './components/AdminMinistere/Grades';
import Groupes from './components/AdminMinistere/Groupes';
import Header from './components/AdminMinistere/header';
import ListCours from './components/AdminMinistere/listcoursquizz';
import MinistereProfile from './components/AdminMinistere/ministerProfile';
import QuestionList from './components/AdminMinistere/questionQuizzCour';
import QuizzChapitre from './components/AdminMinistere/QuizzChapitre';
import QuizzCour from './components/AdminMinistere/quizzCour';
import Signup from './components/AdminMinistere/signup';
import NavbarMinistere from './components/AdminMinistere/navBar';
import { useAuth } from './components/hook/useAuth';
import GradesE from './components/AdminEntreprise/grade';
import EffectifsE from './components/AdminEntreprise/effectis';
import EffectifsM from './components/AdminMinistere/effectif';
import AdminEntrepriseE from './components/AdminEntreprise/adminEntreprise';
import ApprenantE from './components/AdminEntreprise/apprenants';
import CourrielE from './components/AdminEntreprise/Courriel';
import DomaineE from './components/AdminEntreprise/domaine';
import EntreprisesE from './components/AdminEntreprise/entreprise';
import GestionGroupesE from './components/AdminEntreprise/groupe';
import NavbarEntreprise from './components/AdminEntreprise/Navbar';
import Login from './components/AdminMinistere/login';
import UsersE from './components/AdminEntreprise/utilisateurs';
import Users from './components/AdminMinistere/Utilisateurs';
import QuestionsChapitre from './components/AdminMinistere/questionsChapitre';
import NavbarApprenant from './components/Apprenant/navbar';
import CoursA from './components/Apprenant/listCours';
import Tableau from './components/Apprenant/Tableau';
import CourseDetail from './components/Apprenant/coursDetail';
import ChapterQuizResult from './components/Apprenant/ResultChapiterQuizz';
import QuestionQuiz from './components/Apprenant/QuestionsCourQuizz';
import ChapterQuestion from './components/Apprenant/QuestionsChapitre';
import QuizzChapitreA from './components/Apprenant/QuizzChapitre';
import QuizResponsesList from './components/Apprenant/ListquizzResponse';
import QuizzCourA from './components/Apprenant/QuizzCourA';
import CourQuizResult from './components/Apprenant/ResultCoursQuizz';
import QuizCourResponsesList from './components/Apprenant/coursResponseQuizz';
import ConsultedCourses from './components/Apprenant/CoursConsultés';
import ErrorBoundary from './components/Error';
import Chat from './components/chat/Chat';
import MailingPage from './components/mail/mailingPage';
import MainContent from './components/AdminMinistere/Acceuil';







const App = () => {
    const navigate = useNavigate();
      const { role } = useAuth();
    
  const location = useLocation(); // Récupère l'emplacement actuel
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/login'); // Redirige vers la page de connexion si l'URL est '/'
    }
  }, [location.pathname, navigate]);

  const routes = [
   
    { path: '/login', element: <Login /> },
    { path: '/acceuil', element: <MainContent /> },
    { path: '/grades', element: <Grades /> },
   
    { path: '/cours/:coursId/chapitres', element: <ChapitreComponent /> },
    { path: '/entreprises', element: <Entreprise /> },
    { path: '/groupes', element: <Groupes /> },
    { path: '/cours', element: <CoursComponent /> },
  
    { path: '/entreprises/domaine', element: <Domaine /> },
    
    

    { path: '/utilisateurs/apprenant', element: <Apprenant /> },
    { path: '/utilisateurs/effectifs', element: <EffectifsM /> },
    { path: '/utilisateurs/admin-entreprise', element: <AdminEntreprise /> },
    { path: '/liste-cours', element: <ListCours /> },
    { path: '/utilisateurs', element: <Users /> },
    { path: '/MinistereProfile', element: <MinistereProfile /> },
    { path: '/cours/:coursId/Quizz', element: <QuizzCour /> },
    { path: '/cours/:coursId/chapitre/:chapitreId/QuizzChapitre', element: <QuizzChapitre /> },
    { path: '/ListCours/:coursId/Quizz/:QuizzId/QuestionList', element: <QuestionList /> },
    { path: '/ListChapitres/:chapitreId/Quizz/:QuizzId/QuestionsChapitre', element: <QuestionsChapitre /> },

    

    { path: '/signup', element: <Signup /> },
    { path: '/GradesE', element: <GradesE /> },
    { path: '/utilisateursE', element: <UsersE /> },
    { path: '/entreprisesE', element: <EntreprisesE /> },
    { path: '/groupesE', element: <GestionGroupesE /> },
    { path: '/CourrielE', element: <CourrielE /> },
    { path: '/entreprisesE/domaineE', element: <DomaineE /> },
    { path: '/utilisateursE/apprenantE', element: <ApprenantE /> },
    { path: '/utilisateursE/effectifsE', element: <EffectifsE /> },
    { path: '/utilisateursE/admin-entrepriseE', element: <AdminEntrepriseE /> },
    { path: '/Tableau', element: <Tableau /> },
   { path: '/course', element: <CoursA /> },
   { path: '/course/:coursId/' , element:<CourseDetail />} ,

   { path: '/course/:coursId/chapitre/:chapterId/quizz' , element:<QuizzChapitreA />} ,
   { path: '/course/:coursId/quizz/:QuizzId/question/' , element:<QuestionQuiz />} ,
   { path: '/course/:coursId/quizz/' , element:<QuizzCourA />} ,

   { path: '/course/:coursId/chapter/:chapterId/quizz/:QuizzId/question' , element:<ChapterQuestion />} ,

   { path: '/course/:coursId/question' , element:<QuestionQuiz />} ,
 
   { path: '/course/:coursId/quiz/result' , element:<CourQuizResult />} ,
   { path: '/course/:coursId/chapter/:chapterId/quiz/result' , element:<ChapterQuizResult />} ,
   { path: '/Quizz/QuizzChapitre' , element:<QuizResponsesList />} ,
   { path: '/Quizz/QuizzCour' , element:<QuizCourResponsesList />} ,
   { path: '/CourConsultés' , element:<ConsultedCourses />} ,
   


   { path: '/chat', element: <ErrorBoundary><Chat  /></ErrorBoundary> }, 
 
   { path: '/Mail', element: <MailingPage /> },

   
  ];

  return (
   

<div className="min-h-screen flex flex-col p-0 m-0">

  
      {location.pathname !== "/signup" && location.pathname !== "/login" && (
        role === "Admin Ministère" ? <NavbarMinistere /> :
        role === "Admin Entreprise" ? <NavbarEntreprise /> :
        role === "Sous Admin" ? <NavbarEntreprise /> :
        role === "Apprenant" ? <NavbarApprenant /> :
       
        null
      )}

{location.pathname !== '/signup' && location.pathname !== '/login' && (
      <Header  />
      
    )}
<div>
     
    </div>
      {/* Contenu principal avec un décalage à droite pour éviter le chevauchement */}
      <div className="flex-1 w-full p-4 pt-16 pr-20 overflow-y-auto  p-0 m-0">
      <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* Route 404 */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-2xl pt-16">
                404 Not Found
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
