import { vi } from 'vitest';
// Browser-only input listeners are irrelevant to the pure UI/access contracts.
vi.stubGlobal('window', { addEventListener: vi.fn() });
