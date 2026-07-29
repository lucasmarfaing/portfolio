import { Button, DevLabel } from "@/atoms";
import { Experience } from "@/molecules";
import { useTranslation, Trans } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";

import mePicture from '@/assets/images/me_picture.png';

import './hero.section.scss';

// Pop « jelly » : ressort avec rebond — même langage que le dot-drop du header.
const POP = { type: "spring", bounce: 0.55, duration: 0.7 } as const;



export function HeroSection() {
    const { t } = useTranslation();
    const reduce = useReducedMotion();

    // --- Entrée jelly, lettre par lettre ---
    const renderWord = (word: string, start: number) =>
        [...word].map((ch, i) => (
            <motion.span
                key={i}
                className="char"
                initial={reduce ? false : { y: 90, opacity: 0, scale: 0.4 }}
                animate={reduce ? {} : { y: 0, opacity: 1, scale: 1 }}
                transition={{ ...POP, delay: start + i * 0.045 }}
            >
                {ch}
            </motion.span>
        ));

    // Entrée ressort discrète pour le reste (accroche, CTA, stats).
    const rise = (delay: number) =>
        reduce ? {} : {
            initial: { y: 50, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { type: "spring", bounce: 0.3, duration: 0.8, delay },
        };

    return (
        <section id="home">
            <div className="home-content">
                <div className="home-content__info">
                    <div className="home-content__left">
                        <h1 className="home-content__name">
                            <span className="home-content__name-line">{renderWord("Lucas", 0.15)}</span>
                            <span className="home-content__name-line">{renderWord("Marfaing", 0.4)}</span>
                        </h1>

                        <motion.span className='home-content__hook' {...rise(0.8)}>
                            {t('hero.hook')}
                        </motion.span>

                        <motion.div className="actions" {...rise(0.95)}>
                            <Button label={"button.contact"} onClick={(): void => { console.log("JE CLIQUE") }}></Button>
                            <span className="actions__cv"> <Trans i18nKey="button.download" components={{ 1: <span className="accent" /> }} /></span>
                        </motion.div>
                    </div>

                    <div className="me-mask">
                        {/* Le cercle rose ET la photo sont dans le même groupe
                            masqué → ils sont révélés ensemble par le pinceau,
                            comme un seul tableau. Le masque est interne au SVG. */}
                        <svg className="me-mask__svg" viewBox="0 0 550 650" aria-hidden="true">
                            <defs>
                                <mask id="brush-mask">
                                    {/* Serpentin en diagonale : passes perpendiculaires
                                        à l'axe haut-gauche → bas-droite. La 1re passe
                                        couvre le coin haut-gauche, la dernière le coin
                                        bas-droite → le pinceau balaie en travers TL→BR.
                                        Pas de filtre de texture : le bord reste franc,
                                        seuls les bouts ronds adoucissent le trait. */}
                                    <path
                                        className="me-mask__brush-path"
                                        d="M248,-249 Q45,53 -286,203 L-190,318 Q141,168 344,-134 L441,-20 Q238,282 -93,432 L4,547 Q335,397 538,95 L635,209 Q432,511 101,661 L197,776 Q528,626 731,324 L828,439 Q625,741 294,891"
                                        fill="none"
                                        stroke="#fff"
                                        // 200 et pas 180 : en dessous, les passes ne se
                                        // recouvrent plus assez et un éclat de photo
                                        // reste non peint dans le coin haut-droite.
                                        strokeWidth="200"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        pathLength={1}
                                        // État caché appliqué dès le 1er rendu (évite
                                        // le flash de l'image avant le chargement CSS).
                                        style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                                    />
                                </mask>
                            </defs>

                            <g mask="url(#brush-mask)">
                                <circle className="me-mask__circle" cx="275" cy="375" r="275" />
                                <image
                                    href={mePicture}
                                    x="-25"
                                    y="-50"
                                    width="600"
                                    height="700"
                                    preserveAspectRatio="xMidYMin slice"
                                />
                            </g>
                        </svg>
                    </div>
                </div>


                <motion.div className="bottom" {...rise(1.05)}>
                    <div className="bottom__experience">
                        <Experience date={new Date("2018-10-15")} label={"hero.experience.work"}></Experience>
                        <Experience date={new Date("1997-04-25")} label={"hero.experience.born"}></Experience>
                        <Experience date={new Date("2013-06-01")} label={"hero.experience.mystery"}></Experience>
                    </div>

                    <DevLabel></DevLabel>
                </motion.div>
            </div>

            <motion.div
                className="back"
                initial={reduce ? false : { opacity: 0 }}
                animate={reduce ? {} : { opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
            >
                <span className="back__text">{t('hero.back.developer')}</span>
                <span className="back__text">{t('hero.back.designer')}</span>
                <span className="back__text">{t('hero.back.dreamer')}</span>
            </motion.div>
        </section>);
}
