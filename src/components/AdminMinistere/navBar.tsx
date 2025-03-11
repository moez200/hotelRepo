import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import profile from '../../assets/logoM.png';
import {
  FaHome,
  FaTrophy,
  FaUsers,

  FaUserFriends,
  FaBook,
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

const NavbarMinistere: React.FC<NavbarProps> = ({ className }) => {
  const location = useLocation();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const { logout } = useAuth(); 

  const navigate = useNavigate();

  const user = getAuthStore.getState().user; 

  const pageTitles: { [key: string]: string } = {
    '/acceuil': 'Accueil Admin Ministere',
    '/grades': 'Grades',
    '/utilisateurs': 'Utilisateurs',
    '/utilisateurs/admin-ministere': 'Admin Ministère',
    '/utilisateurs/admin-entreprise': 'Admin Entreprise',
    '/utilisateurs/apprenant': 'Apprenant',
    '/entreprises': 'Entreprises',
    '/entreprises/domaine': 'Domaine',
    '/groupes': 'Groupes',
    '/cours': 'Cours',
    '/MinistereProfile':'MinistereProfile',
    '/liste-cours': 'Liste des Cours',
    '/cours/:coursId/Quizz': 'Quizz',
    '/cours/:coursId/chapitres': 'chapitres',
    '/ListCours/Quizz/:QuizzId/QuestionList':'Liste Questions',
    '/utilisateurs/effectifs': 'effectifs',
    
    
    [`/chat/${user?.id}`]: 'Conversations'
  };
  
  const matchPath = Object.keys(pageTitles).find((path) => {
    const regex = new RegExp(`^${path.replace(/:\w+/g, '\\d+')}$`); // Remplace :coursId par un chiffre (ex: /cours/123/Quizz)
    return regex.test(location.pathname);
  });
  
  const currentPageTitle = matchPath ? pageTitles[matchPath] : 'Accueil';
  
  
  const navItems = [
    { icon: <FaHome />, text: 'Accueil', to: '/acceuil', active: location.pathname === '/acceuil' },
    { icon: <FaTrophy />, text: 'Grades', to: '/grades', active: location.pathname === '/grades' },
    
    {
      icon: <FaUsers />,
      text: 'Utilisateurs',
      to: '/utilisateurs',
      active: location.pathname.startsWith('/utilisateurs'),
      subLinks: [
        { text: 'Admin Ministère', to: '/utilisateurs/admin-ministere' },
        { text: 'Admin Entreprise', to: '/utilisateurs/admin-entreprise' },
        { text: 'Apprenant', to: '/utilisateurs/apprenant' },
        { text: 'effectifs', to: '/utilisateurs/effectifs' },

        
      ],
    },
  
    {
      icon: <FaUsers />,
      text: 'Entreprises',
      to: '/entreprises',
      active: location.pathname.startsWith('/entreprises'),
      subLinks: [{ text: 'Domaine', to: '/entreprises/domaine' }],
    },
  
    { icon: <FaUserFriends />, text: 'Groupes', to: '/groupes', active: location.pathname === '/groupes' },
    { icon: <FaBook />, text: 'Cours', to: '/cours', active: location.pathname === '/cours' },
    { icon: <FaBook />, text: 'Liste des Cours', to: '/liste-cours', active: location.pathname === '/liste-cours' },
    {
      icon: <FaComments />,
      text: "Conversations",
      to: `/chat`, // Navigation dynamique basée sur l'ID de l'utilisateur
      active: location.pathname === `/chat`,
    },
 
  ];

  return (
    <>
      {/* Header au-dessus de la Navbar */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-400 text-white py-3 fixed top-0 left-0 w-full z-10 " >
  <div className="container mx-auto flex justify-between items-center">
     {/* Logo */}
     <div className="flex items-center gap-2">
            <img src={profile} alt="Logo Ministère" className="h-8 w-8 rounded-full" />
            <h1 className="text-lg font-bold text-white">Ministère du Tourisme</h1>
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

      {/* Sous-menu : s'affiche uniquement si dropdownOpen est true */}
      {subLinks && dropdownOpen && (
        <ul className="absolute left-0 mt-1 bg-white text-gray-800 shadow-md rounded-lg w-48 z-50">
          {subLinks.map((sub, index) => (
            <li key={index}>
              <Link 
                to={sub.to} 
                className="block px-4 py-2 hover:bg-gray-100"
              >
                {sub.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default NavbarMinistere;