import { paginate, parsePagination } from '../utils/response';

describe('paginate()', () => {
  it('calcule le nombre de pages correctement', () => {
    expect(paginate(1, 10, 25)).toEqual({ page: 1, limit: 10, total: 25, pages: 3 });
  });

  it('retourne 1 page si total <= limit', () => {
    expect(paginate(1, 20, 5)).toEqual({ page: 1, limit: 20, total: 5, pages: 1 });
  });

  it('gère un total de zéro', () => {
    expect(paginate(1, 10, 0)).toEqual({ page: 1, limit: 10, total: 0, pages: 0 });
  });

  it('gère une division exacte', () => {
    expect(paginate(2, 10, 20)).toEqual({ page: 2, limit: 10, total: 20, pages: 2 });
  });
});

describe('parsePagination()', () => {
  it('parse les valeurs par défaut', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('parse page et limit corrects', () => {
    expect(parsePagination({ page: '3', limit: '15' })).toEqual({ page: 3, limit: 15, skip: 30 });
  });

  it('clamp page à 1 minimum', () => {
    expect(parsePagination({ page: '-5' })).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('clamp limit à 100 maximum', () => {
    const result = parsePagination({ limit: '999' });
    expect(result.limit).toBe(100);
  });

  it('clamp limit à 1 minimum', () => {
    const result = parsePagination({ limit: '0' });
    expect(result.limit).toBe(1);
  });
});
