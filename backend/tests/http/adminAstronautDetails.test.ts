import { errorResult, clearRequest, adminAuthRegisterRequest, adminAstronautCreateRequest } from "./requestHelpers";
import request from 'sync-request-curl';
import { port, url } from '../../src/config.json';

const SERVER_URL = `${url}:${port}`;
const successResult = {
  astronautId: expect.any(Number),
  designation: expect.any(String),
  timeAdded: expect.any(Number),
  timeLastEdited: expect.any(Number),
  age: expect.any(Number),
  weight: expect.any(Number),
  height: expect.any(Number),
  assignedMission: expect.anything()
};

beforeEach(() => clearRequest());

describe('GET /v1/admin/astronaut/{astronautid}', () => {
  let user1: any;
  let astronaut1: any;

  beforeEach(() => {
    // call adminAuthRegisterRequest() to create a user
    user1 = adminAuthRegisterRequest('user1@example.com', 'Password123', 'User', 'One');
    // call adminAstronautCreateRequest() to create an astronaut
    astronaut1 = adminAstronautCreateRequest(user1.result.controlUserSessionId, 'Neil', 'Armstrong', 'Commander', 38, 75, 180);
  });

  describe('Success Cases', () => {
    test('Successfully retrieves astronaut details', () => {
      // call GET request to get astronaut details
      const res = request('GET', `${SERVER_URL}/v1/admin/astronaut/${astronaut1.result.astronautId}`, {
        headers: { controlusersessionid: user1.result.controlUserSessionId }
      });
      const data = JSON.parse(res.body.toString());
      expect(res.statusCode).toBe(200);
      expect(data).toMatchObject(successResult);
    });
  });

  describe('Error Cases', () => {
    test('Invalid session ID - 401', () => {
      // call GET request with invalid session
      const res = request('GET', `${SERVER_URL}/v1/admin/astronaut/${astronaut1.result.astronautId}`, {
        headers: { controlusersessionid: 'invalid-session' }
      });
      const data = JSON.parse(res.body.toString());
      expect(res.statusCode).toBe(401);
      expect(data).toStrictEqual(errorResult);
    });

    test('Astronaut does not exist - 400', () => {
      // call GET request with non-existent astronaut ID
      const res = request('GET', `${SERVER_URL}/v1/admin/astronaut/999999`, {
        headers: { controlusersessionid: user1.result.controlUserSessionId }
      });
      const data = JSON.parse(res.body.toString());
      expect(res.statusCode).toBe(400);
      expect(data).toStrictEqual(errorResult);
    });
  });
});
