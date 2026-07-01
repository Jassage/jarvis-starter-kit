import request from 'supertest';

// Mocker les modules qui ouvrent des connexions avant l'import de app
jest.mock('../config/database', () => ({
  default: { $connect: jest.fn(), $disconnect: jest.fn() },
  prisma: { $connect: jest.fn(), $disconnect: jest.fn() },
}));

jest.mock('../config/redis', () => ({
  default: { connect: jest.fn(), quit: jest.fn(), on: jest.fn() },
  redis: { connect: jest.fn(), quit: jest.fn(), on: jest.fn() },
}));

jest.mock('../queues', () => ({
  notificationQueue: { add: jest.fn(), addBulk: jest.fn() },
  emailQueue: { add: jest.fn() },
}));

jest.mock('../workers/notification.worker', () => ({}));
jest.mock('../workers/email.worker', () => ({}));

jest.mock('@bull-board/express', () => ({
  ExpressAdapter: jest.fn().mockImplementation(() => ({
    setBasePath: jest.fn(),
    getRouter: jest.fn().mockReturnValue((_req: unknown, _res: unknown, next: () => void) => next()),
  })),
}));

jest.mock('@bull-board/api', () => ({
  createBullBoard: jest.fn(),
}));

jest.mock('@bull-board/api/bullMQAdapter', () => ({
  BullMQAdapter: jest.fn(),
}));

import app from '../app';

describe('GET /health', () => {
  it('retourne 200 avec status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('LAKAY API');
  });
});

describe('Routes inconnues', () => {
  it('retourne 404 pour une route inexistante', async () => {
    const res = await request(app).get('/api/route-qui-nexiste-pas');
    expect(res.status).toBe(404);
  });
});
