import {
  HeroSection,
  AboutSection,
  ProjectsSection,
  ContactSection,
} from '@/sections';
import { Navbar } from '@/components';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </main>
    </>
  );
}
