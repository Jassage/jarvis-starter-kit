import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Les tests de règles partagent une même base d'émulateur et la vident entre chaque
    // cas : les faire tourner en parallèle les ferait se marcher dessus.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
