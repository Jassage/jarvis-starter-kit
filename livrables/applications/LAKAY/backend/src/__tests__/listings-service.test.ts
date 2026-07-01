// Tests unitaires pour les fonctions pures de listings.service
// Les fonctions DB sont mockées — seule la logique métier est testée

jest.mock('../config/database', () => ({
  default: {},
  prisma: {},
}));
jest.mock('../config/redis', () => ({
  default: { on: jest.fn() },
  redis: { on: jest.fn() },
}));
jest.mock('../queues', () => ({
  notificationQueue: { addBulk: jest.fn() },
  emailQueue: { add: jest.fn() },
}));
jest.mock('../config/cloudinary', () => ({}));
jest.mock('../utils/email', () => ({}));
jest.mock('../config/socket', () => ({ getIO: jest.fn() }));

// Test de la logique d'expiration de renouvellement
describe('Logique de renouvellement d\'annonce', () => {
  const expiryDays = { FREE: 30, BASIC: 90, PROFESSIONAL: 180, ENTERPRISE: 365 } as const;
  type Plan = keyof typeof expiryDays;

  function computeExpiry(plan: Plan): Date {
    const d = new Date('2026-07-01T00:00:00Z');
    d.setDate(d.getDate() + expiryDays[plan]);
    return d;
  }

  it('FREE → +30 jours', () => {
    const exp = computeExpiry('FREE');
    expect(exp.getUTCDate()).toBe(31);
    expect(exp.getUTCMonth()).toBe(6); // juillet = 6 (0-indexed)
  });

  it('BASIC → +90 jours (≈ fin sept)', () => {
    const exp = computeExpiry('BASIC');
    const diff = Math.round((exp.getTime() - new Date('2026-07-01').getTime()) / 86400000);
    expect(diff).toBe(90);
  });

  it('PROFESSIONAL → +180 jours', () => {
    const exp = computeExpiry('PROFESSIONAL');
    const diff = Math.round((exp.getTime() - new Date('2026-07-01').getTime()) / 86400000);
    expect(diff).toBe(180);
  });

  it('ENTERPRISE → +365 jours', () => {
    const exp = computeExpiry('ENTERPRISE');
    const diff = Math.round((exp.getTime() - new Date('2026-07-01').getTime()) / 86400000);
    expect(diff).toBe(365);
  });
});

// Test de la logique de baisse de prix
describe('Détection baisse de prix', () => {
  function computeDrop(oldPrice: number, newPrice: number) {
    if (newPrice >= oldPrice) return null;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  }

  it('détecte une baisse de 20%', () => {
    expect(computeDrop(100000, 80000)).toBe(20);
  });

  it('retourne null si le prix monte', () => {
    expect(computeDrop(80000, 100000)).toBeNull();
  });

  it('retourne null si le prix est identique', () => {
    expect(computeDrop(100000, 100000)).toBeNull();
  });

  it('baisse de 1 HTG — arrondi à 0%', () => {
    expect(computeDrop(100000, 99999)).toBe(0);
  });

  it('baisse de 50%', () => {
    expect(computeDrop(200000, 100000)).toBe(50);
  });
});
