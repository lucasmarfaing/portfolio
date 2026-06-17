import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';

import {
    HeroSection,
    AboutSection,
    ProjectsSection,
    ContactSection,
} from '@/sections';
import { Navbar } from '@/organisms';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
    return (
        <ReactLenis root options={{ duration: 1.2, smoothWheel: !prefersReducedMotion }}>
            <Navbar />
            <main>
                <HeroSection />
                <AboutSection />
                <ProjectsSection />
                <ContactSection />
            </main>
        </ReactLenis>
    );
}
