import { DevLabel, Experience } from "@/components";
import './hero.section.scss';

export function HeroSection() {
  return (
  <section id="home">    
    <Experience date={new Date("2018-10-15")} label={"hero.experience.work"}></Experience>
    <Experience date={new Date("1997-04-25")} label={"hero.experience.born"}></Experience>
    <Experience date={new Date("2013-06-01")} label={"hero.experience.mystery"}></Experience>
    <DevLabel></DevLabel>
  </section>);
}
