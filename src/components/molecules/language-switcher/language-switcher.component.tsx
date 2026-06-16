
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

import './language-switcher.component.scss';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

const activeIndex = SUPPORTED_LANGUAGES.indexOf(i18n.language as never);

  return (
      <div className='lang-toggle' style={{ '--active-index': Math.max(activeIndex, 0) } as React.CSSProperties}>
        {SUPPORTED_LANGUAGES.map((lng) => (
          <button className={`${i18n.language === lng ? 'selected' : ''}`} key={lng} type="button"  onClick={() => i18n.changeLanguage(lng)}>
            {lng.toUpperCase()}
          </button>
        ))}
        <div className='lang-toggle__background'></div>
      </div>
  );
}
