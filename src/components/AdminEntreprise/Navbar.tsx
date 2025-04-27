import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import de useTranslation
import profile from '../../assets/logoM.png';
import {
  FaHome,
  FaTrophy,
  FaUsers,
  FaUserFriends,
  FaComments,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { getAuthStore } from '../../store/auth';
import { useAuth } from '.././hook/useAuth';

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

const NavbarEntreprise: React.FC<NavbarProps> = ({ className }) => {
  const { t } = useTranslation(); // Hook pour accéder aux traductions
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const user = getAuthStore.getState().user;

  // Traduction des titres de page avec les clés définies dans i18n
  const pageTitles: { [key: string]: string } = {
    '/acceuilE': t('homeEntreprise'),
    '/gradesE': t('grades'),
    '/utilisateurs': t('users'),
    '/utilisateursE/admin-entrepriseE': t('adminCompany'),
    '/utilisateursE/apprenantE': t('learner'),
    '/entreprisesE': t('companies'),
    '/entreprisesE/domaineE': t('domain'),
    '/groupesE': t('groups'),
    '/utilisateursE/effectifsE': t('staff'),
    [`/chat/Entreprise/${user?.id}`]: t('conversations'),
  };

  const matchPath = Object.keys(pageTitles).find((path) => {
    const regex = new RegExp(`^${path.replace(/:\w+/g, '\\d+')}$`);
    return regex.test(location.pathname);
  });

  const currentPageTitle = matchPath ? pageTitles[matchPath] : t('homeEntreprise');

  // Liste des éléments de navigation avec traductions
  const navItems = [
    { icon: <FaHome />, text: t('homeEntreprise'), to: '/acceuil', active: location.pathname === '/acceuil' },
    { icon: <FaTrophy />, text: t('grades'), to: '/gradesE', active: location.pathname === '/gradesE' },
    {
      icon: <FaUsers />,
      text: t('users'),
      to: '/utilisateursE',
      active: location.pathname.startsWith('/utilisateursE'),
      subLinks: [
        { text: t('subAdmin'), to: '/utilisateurs/SousAdmin' },
        { text: t('adminCompany'), to: '/utilisateursE/admin-entrepriseE' },
        { text: t('learner'), to: '/utilisateursE/apprenantE' },
        { text: t('staff'), to: '/utilisateursE/effectifsE' },
      ],
    },
    {
      icon: <FaUsers />,
      text: t('companies'),
      to: '/entreprisesE',
      active: location.pathname.startsWith('/entreprisesE'),
      subLinks: [{ text: t('domain'), to: '/entreprisesE/domaineE' }],
    },
    { icon: <FaUserFriends />, text: t('groups'), to: '/groupesE', active: location.pathname === '/groupesE' },
    {
      icon: <FaComments />,
      text: t('conversations'),
      to: `/chat`,
      active: location.pathname === `/chat`,
    },
  ];

  return (
    <>
      {/* Header au-dessus de la Navbar */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-400 text-white py-3 fixed top-0 left-0 w-full z-10">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={profile} alt="Logo Ministère" className="h-8 w-8 rounded-full" />
            <h1 className="text-lg font-bold text-white">{t('MinistèreduTourisme')}</h1>
          </div>

          {/* Affichage du nom de l'interface au milieu */}
          <h2 className="text-xl font-bold ml-4 left-1/2 transform -translate-x-1/2">
            {currentPageTitle}
          </h2>
        </div>
      </header>

      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-800 to-blue-400 shadow-md fixed w-full top-12 z-50">
        <div className="container mx-auto flex justify-between items-center p-0">
          {/* Menu Desktop */}
          <nav className="hidden lg:flex gap-4 justify-center w-full">
            {navItems.map((item, index) => (
              <NavItem key={index} {...item} />
            ))}
          </nav>

          {/* Bouton Menu Mobile */}
          <button className="lg:hidden text-white" onClick={toggleMenu}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Menu Mobile */}
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
      {/* Menu principal */}
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          active ? 'bg-blue-600' : 'hover:bg-blue-600'
        }`}
      >
        <span className="text-white">{icon}</span>
        <span className="text-sm text-white">{text}</span>
      </Link>

      {/* Sous-menu */}
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

export default NavbarEntreprise;