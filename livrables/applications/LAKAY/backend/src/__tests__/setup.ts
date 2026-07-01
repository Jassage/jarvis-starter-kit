// Variables d'environnement minimales pour les tests (sans vraie DB ni Redis)
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/lakay_test';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long!!';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-at-least-32-chars!!';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NODE_ENV = 'test';
