
import { differenceInYears } from 'date-fns';
import './experience.component.scss';
import { useTranslation } from 'react-i18next';

interface ExperienceProps {
    date: Date;
    label: string;
}


export function Experience({date, label}: ExperienceProps) {
    const { t } = useTranslation();

    const timeDiff = differenceInYears(new Date(), date);

  return (
    <div className='experience'>
        <span className="experience__year">{timeDiff}<span className="experience__plus">+</span></span>
        <span className="experience__label">{t(label)}</span>
    </div>
  );
}
