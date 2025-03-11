// Exemple de composant

import { useTranslation } from 'react-i18next';

const WelcomeMessage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string | undefined) => {
    i18n.changeLanguage(lng); // Changer la langue
  };

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('description')}</p>
      <button>{t('button')}</button>

      {/* Boutons pour changer la langue */}
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>
      <button onClick={() => changeLanguage('ar')}>العربية</button>
    </div>
  );
};

export default WelcomeMessage;