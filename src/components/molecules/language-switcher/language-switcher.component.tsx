import { useRef, useState } from 'react';
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

  const activeIndex = Math.max(SUPPORTED_LANGUAGES.indexOf(i18n.language as never), 0);
  const nextLang = SUPPORTED_LANGUAGES[(activeIndex + 1) % SUPPORTED_LANGUAGES.length];

  // Piste laissée par la pastille pendant sa transition, fusionnée à elle
  // via le filtre gooey pour un effet de goutte liquide qui se rétracte.
  const prevIndexRef = useRef(activeIndex);
  const animIdRef = useRef(0);
  const [trailIndex, setTrailIndex] = useState<number | null>(null);
  const [pillAnim, setPillAnim] = useState<{ id: number; from: number; to: number } | null>(null);

  // Ajusté pendant le rendu (et non dans un effet) pour que l'animation démarre
  // dès le commit qui déplace la pastille : sinon un rendu intermédiaire affiche
  // brièvement la pastille déjà à sa position finale, sans transition.
  if (prevIndexRef.current !== activeIndex) {
    const from = prevIndexRef.current;
    prevIndexRef.current = activeIndex;
    animIdRef.current += 1;
    setTrailIndex(from);
    setPillAnim({ id: animIdRef.current, from, to: activeIndex });
  }

  return (
    <button
      type="button"
      className='lang-toggle'
      role="switch"
      aria-checked={activeIndex === 1}
      aria-label={t('a11y.languageSwitcher')}
      title={LANGUAGE_NAMES[nextLang] ?? nextLang.toUpperCase()}
      onClick={() => i18n.changeLanguage(nextLang)}
      style={{ '--active-index': activeIndex } as React.CSSProperties}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="lang-toggle-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -14"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>

      {SUPPORTED_LANGUAGES.map((lng) => (
        <span
          className={`lang-toggle__label${i18n.language === lng ? ' selected' : ''}`}
          key={lng}
          lang={lng}
          title={LANGUAGE_NAMES[lng] ?? lng.toUpperCase()}
          aria-hidden="true"
        >
          {lng.toUpperCase()}
        </span>
      ))}
      <span className='lang-toggle__slider' aria-hidden="true">
        {trailIndex !== null && (
          <span
            key={`trail-${trailIndex}`}
            className='lang-toggle__pill lang-toggle__pill--trail'
            style={{ '--trail-index': trailIndex } as React.CSSProperties}
            onAnimationEnd={() => setTrailIndex(null)}
          />
        )}
        <span
          key={pillAnim ? `pill-${pillAnim.id}` : 'pill-static'}
          className={`lang-toggle__pill${pillAnim ? ' lang-toggle__pill--moving' : ''}`}
          style={{
            '--active-index': activeIndex,
            ...(pillAnim ? { '--from-index': pillAnim.from, '--to-index': pillAnim.to } : {}),
          } as React.CSSProperties}
          onAnimationEnd={() => setPillAnim(null)}
        />
      </span>
    </button>
  );
}
