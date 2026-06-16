import { useTranslation } from 'react-i18next';
import { SECTIONS } from '@/constants/sections';
import './navbar.component.scss';
import { LanguageSwitcher } from '@/molecules';

export function Navbar() {
  const { t } = useTranslation();

  return (
    <header className="navbar">
      <nav aria-label={t('a11y.primaryNav')}>
        {SECTIONS.map(({ id, navKey }) => (
          <a key={id} href={`#${id}`}>
            {t(navKey)}
          </a>
        ))}
      </nav>

      <LanguageSwitcher ></LanguageSwitcher>
    </header>
  );
}
