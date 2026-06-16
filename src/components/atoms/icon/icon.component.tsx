// src/components/atoms/icon/icon.component.tsx
import Email from '@/icons/email.svg?react';
import EmailBold from '@/icons/email-bold.svg?react';
import Github from '@/icons/github.svg?react';
import GithubBold from '@/icons/github-bold.svg?react';
import Headset1 from '@/icons/headset-1.svg?react';
import Headset2 from '@/icons/headset-2.svg?react';
import Heart from '@/icons/heart.svg?react';
import Heart2 from '@/icons/heart-2.svg?react';
import Lamp from '@/icons/lamp.svg?react';
import Linkedin from '@/icons/linkedin.svg?react';
import LinkedinBold from '@/icons/linkedin-bold.svg?react';
import Location from '@/icons/location.svg?react';
import People from '@/icons/people.svg?react';
import Refresh from '@/icons/refresh.svg?react';
import Rocket from '@/icons/rocket.svg?react';
import Share from '@/icons/share.svg?react';

const ICONS = {
  email: Email,
  'email-bold': EmailBold,
  github: Github,
  'github-bold': GithubBold,
  'headset-1': Headset1,
  'headset-2': Headset2,
  heart: Heart,
  'heart-2': Heart2,
  lamp: Lamp,
  linkedin: Linkedin,
  'linkedin-bold': LinkedinBold,
  location: Location,
  people: People,
  refresh: Refresh,
  rocket: Rocket,
  share: Share,
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  /**
   * Texte alternatif. Si fourni, l'icône est exposée aux lecteurs d'écran
   * (role="img"). Sinon elle est considérée décorative (aria-hidden).
   */
  label?: string;
};

export function Icon({ name, size = 24, color = 'currentColor', label }: IconProps) {
  const Svg = ICONS[name];
  // Icône porteuse de sens → role="img" + label ; sinon décorative → masquée.
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true };
  // SVGO/SVGR ont converti les fill du SVG en `currentColor` → on pilote via `color`.
  return <Svg style={{ fontSize: size, color }} {...a11y} />;
}
