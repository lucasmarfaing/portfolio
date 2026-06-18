import { Button, DevLabel, Icon } from "@/atoms";
import { Experience } from "@/molecules";
import { useTranslation } from "react-i18next";

import './hero.section.scss';


export function HeroSection() {
    const { t } = useTranslation();

    return (
        <section id="home">
            <div className="home_content">
                <span className='home_content__hook'>{t('hero.hook')}</span>
                <Button label={"button.contact"} onClick={(): void => { console.log("JE CLIQUE") }}></Button>


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
