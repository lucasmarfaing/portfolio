import { useTranslation } from "react-i18next";

import './button.component.scss';

interface ButtonProps {
    label: string;
    onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
    const { t } = useTranslation();

    return <button className='button' type="button" onClick={onClick}>{t(label)}</button>;
}
