import type { MouseEvent } from 'react';
import './logo.component.scss';

interface LogoProps {
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  active?: boolean;
}

export function Logo({ onClick, active = false }: LogoProps) {
  return (
    <a className='logo' href='#home' aria-label="Retour à l'accueil" onClick={onClick}>
      <span className={`logo__square ${active ? 'logo__square--spin' : ''}`} />
      LUCAS
    </a>
  );
}
