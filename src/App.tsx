import {
  HeroSection,
  AboutSection,
  ProjectsSection,
  ContactSection,
} from '@/sections';
import { Navbar } from '@/organisms';

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
