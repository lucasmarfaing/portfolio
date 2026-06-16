import { useTranslation } from "react-i18next";

import './button.component.scss';

interface ButtonProps {
    label: string;
    onClick: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    /** Nom accessible alternatif (ex: bouton icône) si le label visible ne suffit pas. */
    ariaLabel?: string;
}

export function Button({ label, onClick, disabled = false, ariaLabel }: ButtonProps) {
    const { t } = useTranslation();

    return (
        <button
            className='button'
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {t(label)}
        </button>
    );
}
