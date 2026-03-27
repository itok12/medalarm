import { extractErrorMessage } from './errorUtils';

describe('extractErrorMessage', () => {
  it('returns err.message when error has no response', () => {
    expect(extractErrorMessage(new Error('network'), 'Fallback')).toBe('network');
  });

  it('returns the fallback when err is null', () => {
    expect(extractErrorMessage(null, 'Fallback')).toBe('Fallback');
  });

  it('returns a plain string response body as-is', () => {
    const err = { response: { data: 'Username already taken' } };
    expect(extractErrorMessage(err, 'Fallback')).toBe('Username already taken');
  });

  it('extracts data.error from object response body', () => {
    const err = { response: { data: { error: 'Email is already in use' } } };
    expect(extractErrorMessage(err, 'Fallback')).toBe('Email is already in use');
  });

  it('extracts data.message from object response body', () => {
    const err = { response: { data: { message: 'Bad request' } } };
    expect(extractErrorMessage(err, 'Fallback')).toBe('Bad request');
  });

  it('returns fallback for unknown object shapes instead of rendering a raw object', () => {
    const err = { response: { data: { code: 400, details: 'nope' } } };
    const result = extractErrorMessage(err, 'Fallback');
    expect(typeof result).toBe('string');
    expect(result).toBe('Fallback');
  });

  it('falls back to fallback string when nothing else is available', () => {
    expect(extractErrorMessage({}, 'Fallback')).toBe('Fallback');
  });
});
