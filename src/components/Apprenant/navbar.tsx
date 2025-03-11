import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import profile from '../../assets/logoM.png';
import {
  FaHome,
  FaTrophy,
  FaUsers,
  FaBook,
  FaComments,
  FaBars,
  FaTimes,
  FaClock,
} from 'react-icons/fa';
import { getAuthStore } from '../../store/auth';
import { useAuth } from '../hook/useAuth';
import { MdQuiz } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

interface SubLink {
  text: string;
  to: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active: boolean;
  subLinks?: SubLink[];
}

interface NavbarProps {
  className?: string;
}

const NavbarApprenant: React.FC<NavbarProps> = ({ className }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
 

  const { t } = useTranslation(); // Hook pour l'internationalisation

  const user = getAuthStore.getState().user;

  const pageTitles: { [key: string]: string } = {
    '/Tableau': t('dashboard'), // Utilisation de la traduction
    '/course': t('coursesList'),
    '/CoursConsultés': t('viewedCourses'),
    '/Quizz': t('quizzes'),
    '/utilisateursE/apprenantE': t('apprenant'),
    '/Quizz/QuizzCour': t('quizCourse'),
    '/Quizz/QuizzChapitre': t('quizChapter'),
    [`/chat/Apprenant/${user?.id}`]: t('conversations'), // Dynamique en fonction de l'utilisateur
  };

  const matchPath = Object.keys(pageTitles).find((path) => {
    const regex = new RegExp(`^${path.replace(/:\w+/g, '\\d+')}$`); // Remplace :coursId par un chiffre (ex: /cours/123/Quizz)
    return regex.test(location.pathname);
  });

  const currentPageTitle = matchPath ? pageTitles[matchPath] : t('home'); // Utilisation de la traduction

  const navItems = [
    { icon: <FaHome />, text: t('dashboard'), to: '/Tableau', active: location.pathname === '/Tableau' },
    { icon: <FaBook />, text: t('coursesList'), to: '/course', active: location.pathname === '/course' },
    { icon: <FaClock />, text: t('viewedCourses'), to: '/CourConsultés', active: location.pathname === '/CourConsultés' },
    {
      icon: <MdQuiz />,
      text: t('quizzes'),
      to: '/Quizz',
      active: location.pathname.startsWith('/Quizz'),
      subLinks: [
        { text: t('quizCourse'), to: '/Quizz/QuizzCour' },
        { text: t('quizChapter'), to: '/Quizz/QuizzChapitre' },
      ],
    },
     {
         icon: <FaComments />,
         text: "Conversations",
         to: `/chat`, // Navigation dynamique basée sur l'ID de l'utilisateur
         active: location.pathname === `/chat`,
       },
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-blue-800 to-blue-400 text-white py-3 fixed top-0 left-0 w-full z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={profile} alt="Logo Ministère" className="h-8 w-8 rounded-full" />
            <h1 className="text-lg font-bold text-white">{t('MinistèreduTourisme')}</h1>
          </div>
          <h2 className="text-xl font-bold ml-4 left-1/2 transform -translate-x-1/2">{currentPageTitle}</h2>
        </div>
      </header>

      <nav className="bg-gradient-to-r from-blue-800 to-blue-400 shadow-md fixed w-full top-12 z-50">
        <div className="container mx-auto flex justify-between items-center p-0">
          <nav className="hidden lg:flex gap-4 justify-center w-full">
            {navItems.map((item, index) => (
              <NavItem key={index} {...item} />
            ))}
          </nav>
          <button className="lg:hidden text-white" onClick={toggleMenu}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="lg:hidden bg-gray-900 text-white flex flex-col items-center py-2">
            {navItems.map((item, index) => (
              <NavItem key={index} {...item} />
            ))}
          </nav>
        )}
      </nav>
    </>
  );
};

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, active, subLinks }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div
      className="relative group"
      onMouseEnter={() => subLinks && setDropdownOpen(true)}
      onMouseLeave={() => subLinks && setDropdownOpen(false)}
    >
      <Link 
        to={to} 
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-blue-600' : 'hover:bg-blue-600'}`}
      >
        <span className="text-white">{icon}</span>
        <span className="text-sm text-white">{text}</span>
      </Link>
      {subLinks && dropdownOpen && (
        <ul className="absolute left-0 mt-1 bg-white text-gray-800 shadow-md rounded-lg w-48 z-50">
          {subLinks.map((sub, index) => (
            <li key={index}>
              <Link to={sub.to} className="block px-4 py-2 hover:bg-gray-100">
                {sub.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NavbarApprenant;
