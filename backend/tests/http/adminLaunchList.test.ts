import request from 'sync-request-curl';
import { port, url } from '../../src/config.json';
import { adminLaunchCreateRequest, adminLaunchStatusUpdateRequest, createLaunchVehicles } from './requestHelpers';
import { validLaunchParameters, validPayloads } from '../../src/testSamples';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear`);
});

describe('GET /v1/admin/launch/list', () => {
  describe('Error cases', () => {
    test('401: Invalid session ID', () => {
      const res = request('GET', `${url}:${port}/v1/admin/launch/list`, {
        headers: { controlusersessionid: 'invalid' }
      });
      const body = JSON.parse(res.body.toString());
      expect(res.statusCode).toBe(401);
      expect(body).toEqual(ERROR);
    });
  });

  describe('Success cases', () => {
    test('Returns empty list when no launches exist', () => {
      const userRes = request('POST', `${url}:${port}/v1/admin/auth/register`, {
        json: {
          email: 'user1@test.com',
          password: 'password123',
          nameFirst: 'User',
          nameLast: 'One'
        }
      });
      const user = JSON.parse(userRes.body.toString());

      const res = request('GET', `${url}:${port}/v1/admin/launch/list`, {
        headers: { controlusersessionid: user.controlUserSessionId }
      });
      const body = JSON.parse(res.body.toString());
      expect(res.statusCode).toBe(200);
      expect(body).toEqual({ activeLaunches: [], completedLaunches: [] });
    });

    test('Returns list of launches for user', () => {
      const userRes = request('POST', `${url}:${port}/v1/admin/auth/register`, {
        json: {
          email: 'user1@test.com',
          password: 'password123',
          nameFirst: 'User',
          nameLast: 'One'
        }
      });
      const user = JSON.parse(userRes.body.toString());

      const missionRes = request('POST', `${url}:${port}/v1/admin/mission`, {
        headers: { controlusersessionid: user.controlUserSessionId },
        json: {
          name: 'Apollo Mission',
          description: 'Test mission',
          target: 'Moon'
        }
      });
      const mission = JSON.parse(missionRes.body.toString());

      const vehicleRes = request('POST', `${url}:${port}/v1/admin/launchvehicle`, {
        headers: { controlusersessionid: user.controlUserSessionId },
        json: {
          name: 'Saturn V',
          description: 'Heavy lift vehicle',
          maxCrewWeight: 500,
          maxPayloadWeight: 500,
          launchVehicleWeight: 5000,
          thrustCapacity: 1000000,
          maneuveringFuel: 50
        }
      });
      const vehicle = JSON.parse(vehicleRes.body.toString());

      const launchRes = request('POST', `${url}:${port}/v1/admin/mission/${mission.missionId}/launch`, {
        headers: { controlusersessionid: user.controlUserSessionId },
        json: {
          launchVehicleId: vehicle.launchVehicleId,
          payload: {
            description: 'Test payload',
            weight: 400
          },
          launchParameters: {
            targetDistance: 10000,
            thrustFuel: 5000,
            fuelBurnRate: 10,
            activeGravityForce: 9.81,
            maneuveringDelay: 3
          }
        }
      });
      const launch = JSON.parse(launchRes.body.toString());

      const [lvid] = createLaunchVehicles(user.controlUserSessionId, 2)
      const launch2 = adminLaunchCreateRequest(user.controlUserSessionId, mission.missionId, lvid, validPayloads[2], validLaunchParameters[2]).result.launchId
      adminLaunchStatusUpdateRequest(user.controlUserSessionId, mission.missionId, launch2, 'FAULT')

      const res = request('GET', `${url}:${port}/v1/admin/launch/list`, {
        headers: { controlusersessionid: user.controlUserSessionId }
      });
      const body = JSON.parse(res.body.toString());
      expect(res.statusCode).toBe(200);
      expect(body.activeLaunches).toHaveLength(1);
      expect(body.completedLaunches).toHaveLength(1);
      expect(body.activeLaunches[0]).toBe(launch.launchId);
      expect(body.completedLaunches[0]).toBe(launch2);
    });
  });
});