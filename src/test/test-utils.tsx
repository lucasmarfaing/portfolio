import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

/**
 * Wraps the component under test with the app-wide providers (i18n for now).
 * Add new providers (router, theme, …) here so every test gets them.
 */
function AllProviders({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from RTL, then override `render` with the wrapped one.
export * from '@testing-library/react';
export { renderWithProviders as render };
