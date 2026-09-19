import { vi } from 'vitest';
// The existing turbo-key listener is browser-only; cat contract tests do not use it.
vi.stubGlobal('window', { addEventListener: vi.fn() });
