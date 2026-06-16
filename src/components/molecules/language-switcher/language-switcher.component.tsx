import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

import './language-switcher.component.scss';

// Endonymes pour les lecteurs d'écran.
const LANGUAGE_NAMES: Record<string, string> = {
  fr: 'Français',
  en: 'English',
};

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const activeIndex = SUPPORTED_LANGUAGES.indexOf(i18n.language as never);

  return (
    <div
      className='lang-toggle'
      role="group"
      aria-label={t('a11y.languageSwitcher')}
      style={{ '--active-index': Math.max(activeIndex, 0) } as React.CSSProperties}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          className={i18n.language === lng ? 'selected' : ''}
          key={lng}
          type="button"
          lang={lng}
          title={LANGUAGE_NAMES[lng] ?? lng.toUpperCase()}
          aria-pressed={i18n.language === lng}
          aria-label={LANGUAGE_NAMES[lng] ?? lng.toUpperCase()}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
      <div className='lang-toggle__background' aria-hidden="true"></div>
    </div>
  );
}
