import React, { useState } from "react";
import { Link } from "react-router-dom";

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

const SidebarLink: React.FC<NavItemProps> = ({ icon, text, to, active, subLinks }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link 
        to={to} 
        className={`flex items-center gap-3 p-3 rounded-lg transition-all transform hover:translate-x-2 group ${
          active ? "bg-gray-700 text-white" : "hover:bg-gray-700"
        }`}
      >
        {icon}
        <span>{text}</span>
      </Link>

      {isHovered && subLinks && (
        <ul className="absolute left-full top-0 ml-2 w-48 bg-gray-800 text-white shadow-lg rounded-lg">
          {subLinks.map((sub, index) => (
            <li key={index}>
              <Link to={sub.to} className="block px-4 py-2 hover:bg-gray-700">
                {sub.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarLink;
