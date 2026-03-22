import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for integration tests.
 * Runs against a real test database — requires DATABASE_URL to be set.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    // Run integration tests serially to avoid DB contention
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Integration tests may take longer
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
