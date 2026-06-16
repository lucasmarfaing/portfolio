import { Button, DevLabel, Icon, Logo } from "@/atoms";
import { Experience } from "@/molecules";
import { useTranslation } from "react-i18next";

import './hero.section.scss';


export function HeroSection() {
    const { t } = useTranslation();

    return (
        <section id="home">
            <span className='hook'>{t('hero.hook')}</span>
            <Logo></Logo>
            <Button label={"button.contact"} onClick={(): void => { console.log("JE CLIQUE")}}></Button>
            <Experience date={new Date("2018-10-15")} label={"hero.experience.work"}></Experience>
            <Experience date={new Date("1997-04-25")} label={"hero.experience.born"}></Experience>
            <Experience date={new Date("2013-06-01")} label={"hero.experience.mystery"}></Experience>
            <Icon name={"email-bold"} color='var(--color-primary)' size={35}></Icon>
            <DevLabel></DevLabel>
        </section>);
}
