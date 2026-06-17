import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLenis } from 'lenis/react';
import { SECTIONS } from '@/constants/sections';
import { LanguageSwitcher } from '@/molecules';
import { Logo } from '@/atoms';
import './navbar.component.scss';

const SITE_NAME = 'Lucas Marfaing';
const NAV_LINKS = SECTIONS.filter((s) => s.showNav);
const HOME_SECTION = SECTIONS[0];
const SCROLL_OFFSET = -90;

export function Navbar() {
    const { t } = useTranslation();
    const lenis = useLenis();
    const [activeId, setActiveId] = useState<string>(HOME_SECTION.id);
    const [scrolled, setScrolled] = useState(false);
    const firstRun = useRef(true);

    useLenis(({ scroll }) => {
        setScrolled(scroll > 80);

        const mid = window.innerHeight / 2;
        const current = SECTIONS.find(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return false;
            const { top, bottom } = el.getBoundingClientRect();
            return top <= mid && bottom > mid;
        });
        if (current) setActiveId(current.id);
    });

    useEffect(() => {
        const section = SECTIONS.find((s) => s.id === activeId);
        document.title = section ? `${SITE_NAME} — ${t(section.title)}` : SITE_NAME;
    }, [activeId, t]);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            return;
        }
        const url = activeId === HOME_SECTION.id ? location.pathname : `#${activeId}`;
        history.replaceState(null, '', url);
    }, [activeId]);

    const navigateTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        lenis?.scrollTo(`#${id}`, { offset: SCROLL_OFFSET, immediate: reduce });

        const target = document.getElementById(id);
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        }
    };

    return (
        <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <Logo active={activeId === HOME_SECTION.id} onClick={(e) => navigateTo(e, HOME_SECTION.id)} />

            <div className='navbar__left'>
                <nav className='navbar__nav' aria-label={t('a11y.primaryNav')}>
                    {NAV_LINKS.map(({ id, navKey }) => (
                        <a
                            key={id}
                            className='navbar__link'
                            href={`#${id}`}
                            onClick={(e) => navigateTo(e, id)}
                            aria-current={activeId === id ? 'true' : undefined}
                        >
                            {t(navKey)}
                            {activeId === id && <span className='navbar__dot' aria-hidden='true' />}
                        </a>
                    ))}
                </nav>

                <LanguageSwitcher />
            </div>
        </header>
    );
}
