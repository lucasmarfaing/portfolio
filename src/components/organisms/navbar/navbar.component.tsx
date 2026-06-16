import { useTranslation } from 'react-i18next';
import { SECTIONS } from '@/constants/sections';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import './navbar.component.scss';

export function Navbar() {
  const { t, i18n } = useTranslation();

  return (
    <header className="navbar">
      <nav>
        {SECTIONS.map(({ id, navKey }) => (
          <a key={id} href={`#${id}`}>
            {t(navKey)}
          </a>
        ))}
      </nav>

      <div>
        {SUPPORTED_LANGUAGES.map((lng) => (
          <button key={lng} type="button" onClick={() => i18n.changeLanguage(lng)}>
            {lng.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}
