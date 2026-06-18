import { Button, DevLabel } from "@/atoms";
import { Experience } from "@/molecules";
import { useTranslation, Trans } from "react-i18next";

import mePicture from '@/assets/images/me_picture.png';

import './hero.section.scss';


export function HeroSection() {
    const { t } = useTranslation();

    return (
        <section id="home">
            <div className="home-content">
                <h1 className="home-content__name">Lucas Marfaing</h1>
                <span className='home-content__hook'>{t('hero.hook')}</span>

                <div className="actions">
                    <Button label={"button.contact"} onClick={(): void => { console.log("JE CLIQUE") }}></Button>
                    <span className="actions__cv"> <Trans i18nKey="button.download" components={{ 1: <span className="accent" /> }} /></span>
                </div>


                <div className="bottom">
                    <div className="bottom__experience">
                        <Experience date={new Date("2018-10-15")} label={"hero.experience.work"}></Experience>
                        <Experience date={new Date("1997-04-25")} label={"hero.experience.born"}></Experience>
                        <Experience date={new Date("2013-06-01")} label={"hero.experience.mystery"}></Experience>
                    </div>

                    <DevLabel></DevLabel>
                </div>
            </div>

            <div className="back">
                <span className="back__text">{t('hero.back.developer')}</span>
                <span className="back__text">{t('hero.back.designer')}</span>
                <span className="back__text">{t('hero.back.dreamer')}</span>
            </div>
        </section>);
}
