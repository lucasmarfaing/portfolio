import type { MouseEvent } from 'react';
import './logo.component.scss';

interface LogoProps {
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function Logo({ onClick }: LogoProps) {
  return (
    <a className='logo' href='#home' aria-label="Retour à l'accueil" onClick={onClick}>
      <span className='logo__square'></span>LUCAS
    </a>
  );
}
