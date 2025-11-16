import request from 'sync-request-curl';
import { port, url } from '../../src/config.json';
import { clearRequest, adminAuthRegisterRequest } from './requestHelpers';
import { errorCategories } from '../../src/testSamples';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  clearRequest();
});

describe('POST /v1/admin/mission', () => {
  let validSessionId: string;

  beforeEach(() => {
    const res = adminAuthRegisterRequest(
      'missionUser@example.com',
      'Password123',
      'Mission',
      'Tester'
    );
    validSessionId = res.result.controlUserSessionId;
  });

  describe('Success Cases', () => {
    test.each([
      ['Mercury Mission', 'Exploring Mercury', 'Orbit'],
      ['Venus Mission', 'Exploring Venus atmosphere', 'Clouds'],
      ['Mars Mission', 'Exploring Mars surface', 'Gale Crater'],
    ])('Create mission %s', (name, description, target) => {
      const res = request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: validSessionId },
        json: { name, description, target },
      });

      const body = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(200);
      expect(body).toStrictEqual({ missionId: expect.any(Number) });
    });
  });

  describe('Error Cases', () => {
    test('Invalid sessionId (401)', () => {
      const res = request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: 'invalidSession' },
        json: { name: 'Apollo', description: 'Test', target: 'CuteMoon' },
      });

      const body = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(401);
      expect(body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Name too short (400)', () => {
      const res = request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: validSessionId },
        json: { name: 'Ab', description: 'blablabla', target: 'Mars' },
      });

      const body = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
      expect(body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Name too long (400)', () => {
      const res = request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: validSessionId },
        json: { name: 'A'.repeat(31), description: 'Desc', target: 'Mars' },
      });

      const body = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
      expect(body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Name invalid characters (400)', () => {
      const res = request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: validSessionId },
        json: { name: 'Apollo@123', description: 'wrongLol', target: 'Mars' },
      });

      const body = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
      expect(body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Duplicate mission name for same user (400)', () => {
      request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: validSessionId },
        json: { name: 'Apollo', description: 'First', target: 'Moon' },
      });
      const res = request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: validSessionId },
        json: { name: 'Apollo', description: 'Duplicate', target: 'Mars' },
      });

      const body = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
      expect(body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Description too long (400)', () => {
      const longDesc = 'a'.repeat(401);
      const res = request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: validSessionId },
        json: { name: 'Neptune', description: longDesc, target: 'Orbit' },
      });

      const body = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
      expect(body).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Target too long (400)', () => {
      const longTarget = 'a'.repeat(101);
      const res = request('POST', `${SERVER_URL}/v1/admin/mission`, {
        headers: { controlusersessionid: validSessionId },
        json: { name: 'Jupiter', description: 'Desc', target: longTarget },
      });

      const body = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(400);
      expect(body).toStrictEqual({
        error: expect.any(String),
      });
    });
  });
});
