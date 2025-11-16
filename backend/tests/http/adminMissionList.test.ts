import request from 'sync-request-curl';
import { port, url } from '../../src/config.json';
import { clearRequest, adminAuthRegisterRequest, adminMissionCreateRequest } from './requestHelpers';
import { validUsers, httpToErrorCategories, errorCategories, errorMessages } from '../../src/testSamples';

const missions1 = [
  { name: 'Mercury Mission', description: 'Exploring Mercury', target: 'Orbit' },
  { name: 'Venus Mission', description: 'Exploring Venus atmosphere', target: 'Clouds' },
  { name: 'Mars Mission', description: 'Exploring Mars surface', target: 'Gale Crater' },
  { name: 'Europa Mission', description: 'Searching for life in Europa ocean', target: 'Ice Shell' },
  { name: 'Titan Mission', description: 'Exploring Titan methane lakes', target: 'Kraken Mare' },
  { name: 'Jupiter Mission', description: 'Studying Jupiter atmosphere', target: 'Great Red Spot' },
  { name: 'Saturn Mission', description: 'Ring system analysis', target: 'Ring Gap' },
  { name: 'Asteroid Mission', description: 'Mining operations on Ceres', target: 'Surface' }
];

const missions2 = [
  { name: 'winterreigen', description: 'Winter dance composition study', target: 'Concert Hall' },
  { name: 'pastorale', description: 'Pastoral symphony analysis', target: 'Orchestra' },
  { name: 'postludium', description: 'Closing musical piece research', target: 'Organ' },
  { name: 'nocturne', description: 'Night music composition', target: 'Piano' },
  { name: 'rhapsody', description: 'Irregular musical form study', target: 'Chamber Music' },
  { name: 'fugue', description: 'Contrapuntal composition analysis', target: 'Bach Archive' },
  { name: 'sonata', description: 'Classical form exploration', target: 'Manuscript' },
  { name: 'symphony', description: 'Large scale orchestral work', target: 'Vienna Hall' }
];

const missions3 = [
  { name: 'HAHA', description: '', target: '' },
  { name: 'eee', description: '', target: '' },
  { name: 'XXX', description: '', target: '' },
  { name: 'hohoho', description: '', target: '' },
  { name: 'ohohoh', description: '', target: '' }
];


const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  clearRequest();
});

describe('HTTP tests for /v1/admin/mission/list', () => {
  test('Invalid session ID returns 401 with correct error category', () => {
    const res = request('GET', `${SERVER_URL}/v1/admin/mission/list`, {
      headers: { controlusersessionid: 'invalidSessionId' },
    });

    const body = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(httpToErrorCategories.INVALID_CREDENTIALS);
    expect(body).toStrictEqual({
      error: errorMessages.INVALID_CREDENTIALS.sessionId,
    });
  });

  test('Valid simple case — single mission', () => {
    const user = adminAuthRegisterRequest(
      validUsers.user5.email,
      validUsers.user5.password,
      validUsers.user5.nameFirst,
      validUsers.user5.nameLast
    );

    const mission = adminMissionCreateRequest(
      user.result.controlUserSessionId,
      missions1[2].name,
      missions1[2].description,
      missions1[2].target
    );

    const res = request('GET', `${SERVER_URL}/v1/admin/mission/list`, {
      headers: { controlusersessionid: user.result.controlUserSessionId },
    });

    const body = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(200);
    expect(body).toStrictEqual({
      missions: [{ missionId: mission.result.missionId, name: missions1[2].name }],
    });
  });

  describe('Multiple users and missions', () => {
    let uid: string[] = [];
    let mid1: number[] = [];
    let mid2: number[] = [];
    let mid3: number[] = [];

    beforeEach(() => {
      clearRequest();

      uid = [];
      mid1 = [];
      mid2 = [];
      mid3 = [];

      // Register multiple users (user3–user6)
      const users = [validUsers.user3, validUsers.user4, validUsers.user5, validUsers.user6];

      for (const u of users) {
        const res = adminAuthRegisterRequest(u.email, u.password, u.nameFirst, u.nameLast);
        uid.push(res.result.controlUserSessionId);
      }

      // Assign missions to user 1 (user4)
      for (const m of missions1.slice(0, 3)) {
        const res = adminMissionCreateRequest(uid[1], m.name, m.description, m.target);
        mid1.push(res.result.missionId);
      }

      // Assign missions to user 2 (user5)
      for (const m of missions3.slice(0, 2)) {
        const res = adminMissionCreateRequest(uid[2], m.name, m.description, m.target);
        mid2.push(res.result.missionId);
      }

      // Assign missions to user 3 (user6)
      for (const m of missions2.slice(0, 3)) {
        const res = adminMissionCreateRequest(uid[3], m.name, m.description, m.target);
        mid3.push(res.result.missionId);
      }
    });

    test('User 0 — empty mission list', () => {
      const res = request('GET', `${SERVER_URL}/v1/admin/mission/list`, {
        headers: { controlusersessionid: uid[0] },
      });
      const body = JSON.parse(res.body as string);

      expect(res.statusCode).toBe(200);
      expect(body).toStrictEqual({ missions: [] });
    });

    test('User 1 — planetary missions', () => {
      const res = request('GET', `${SERVER_URL}/v1/admin/mission/list`, {
        headers: { controlusersessionid: uid[1] },
      });
      const body = JSON.parse(res.body as string);

      expect(res.statusCode).toBe(200);
      expect(body).toStrictEqual({
        missions: [
          { missionId: mid1[0], name: missions1[0].name },
          { missionId: mid1[1], name: missions1[1].name },
          { missionId: mid1[2], name: missions1[2].name },
        ],
      });
    });

    test('User 2 — short random missions', () => {
      const res = request('GET', `${SERVER_URL}/v1/admin/mission/list`, {
        headers: { controlusersessionid: uid[2] },
      });
      const body = JSON.parse(res.body as string);

      expect(res.statusCode).toBe(200);
      expect(body).toStrictEqual({
        missions: [
          { missionId: mid2[0], name: missions3[0].name },
          { missionId: mid2[1], name: missions3[1].name },
        ],
      });
    });

    test('User 3 — music-inspired missions', () => {
      const res = request('GET', `${SERVER_URL}/v1/admin/mission/list`, {
        headers: { controlusersessionid: uid[3] },
      });
      const body = JSON.parse(res.body as string);

      expect(res.statusCode).toBe(200);
      expect(body).toStrictEqual({
        missions: [
          { missionId: mid3[0], name: missions2[0].name },
          { missionId: mid3[1], name: missions2[1].name },
          { missionId: mid3[2], name: missions2[2].name },
        ],
      });
    });
  });
});
