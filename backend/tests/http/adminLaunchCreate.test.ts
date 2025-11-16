import {
  clearRequest,
  registerUsers,
  createMissions,
  createLaunchVehicles,
  adminLaunchCreateRequest,
  createAstronauts,
  adminMissionAssignAstronautRequest,
  adminLaunchVehicleRetireRequest,
} from './requestHelpers';
import { validLaunchVehicles, validMissions, validPayloads, validLaunchParameters, errorLaunchParameters } from '../../src/testSamples';

const ERROR = { error: expect.any(String) };

describe('POST /v1/admin/mission/:missionid/launch', () => {
  let sid: string;
  let mid: number;
  let lvid: number;

  beforeEach(() => {
    clearRequest();
    [sid] = registerUsers('user1');
    [mid] = createMissions(sid, 1);
    [lvid] = createLaunchVehicles(sid, 1);
  });

  describe('Success cases', () => {
    test('Successfully creates a launch', () => {
      const payload = validPayloads[1];
      const launchParams = validLaunchParameters[1];

      const res = adminLaunchCreateRequest(sid, mid, lvid, payload, launchParams);
      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({ launchId: expect.any(Number) });
    });

    test('Successfully creates two launches', () => {
      const payload1 = validPayloads[1];
      const launchParams1 = validLaunchParameters[1];

      const res1 = adminLaunchCreateRequest(sid, mid, lvid, payload1, launchParams1);
      expect(res1.statusCode).toBe(200);
      expect(res1.result).toEqual({ launchId: expect.any(Number) });

      const payload = validPayloads[2];
      const launchParams = validLaunchParameters[2];
      const lvid2 = createLaunchVehicles(sid, 2)[0];

      const res2 = adminLaunchCreateRequest(sid, mid, lvid2, payload, launchParams);

      expect(res2.result).toEqual({ launchId: expect.any(Number) });

      expect(res1.result.launchId).not.toBe(res2.result.launchId)
    });

    test('Successfully creates two launches', () => {
      const payload = validPayloads[1];
      const launchParams = validLaunchParameters[1];
      createAstronauts(sid, 1, 2)
      adminMissionAssignAstronautRequest(sid, mid, 1)
      adminMissionAssignAstronautRequest(sid, mid, 2)

      const res = adminLaunchCreateRequest(sid, mid, lvid, payload, launchParams);
      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({ launchId: expect.any(Number) });

    });
  });

  describe('Error cases', () => {
    describe('401: Invalid Credentials', () => {
      test('Invalid session ID', () => {
        const res = adminLaunchCreateRequest('', mid, lvid, validPayloads[1], validLaunchParameters[1]);
        expect(res.statusCode).toBe(401);
        expect(res.result).toEqual(ERROR);
      });
    });

    describe('403: Inaccessible Value', () => {
      test('Mission ID does not exist', () => {
        const res = adminLaunchCreateRequest(sid, mid + 99, lvid, validPayloads[1], validLaunchParameters[1]);
        expect(res.statusCode).toBe(403);
        expect(res.result).toEqual(ERROR);
      });

      test('User does not own the mission', () => {
        const [sid2] = registerUsers('user2');
        const res = adminLaunchCreateRequest(sid2, mid, lvid, validPayloads[1], validLaunchParameters[1]);
        expect(res.statusCode).toBe(403);
        expect(res.result).toEqual(ERROR);
      });
    });

    describe('400: Bad Input', () => {
      test('Launch vehicle ID is invalid', () => {
        const res = adminLaunchCreateRequest(sid, mid, lvid + 99, validPayloads[1], validLaunchParameters[1]);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Launch vehicle is retired', () => {
        adminLaunchVehicleRetireRequest(sid, lvid)
        const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], validLaunchParameters[1]);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Launch vehicle is in another active launch', () => {
        adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], validLaunchParameters[1]);
        const [mid2] = createMissions(sid, 2);
        const res = adminLaunchCreateRequest(sid, mid2, lvid, validPayloads[1], validLaunchParameters[1]);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      describe('Payload validation', () => {
        test('Payload description is empty', () => {
          const payload = { ...validPayloads[1], description: '' };
          const res = adminLaunchCreateRequest(sid, mid, lvid, payload, validLaunchParameters[1]);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });

        test('Payload description is too long', () => {
          const payload = { ...validPayloads[1], description: 'a'.repeat(401) };
          const res = adminLaunchCreateRequest(sid, mid, lvid, payload, validLaunchParameters[1]);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });

        test('Payload weight exceeds launch vehicle capacity', () => {
          const lv = validLaunchVehicles[1]; // maxPayloadWeight: 1000
          const payload = { ...validPayloads[1], weight: lv.maxPayloadWeight + 1 };
          const res = adminLaunchCreateRequest(sid, mid, lvid, payload, validLaunchParameters[1]);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });
      });

      describe('Launch parameters validation', () => {
        test('Target distance is negative', () => {
          const params = { ...validLaunchParameters[1], targetDistance: -1 };
          const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });

        test('Thrust fuel is negative', () => {
          const params = { ...validLaunchParameters[1], thrustFuel: -1 };
          const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });

        test('Fuel burn rate is negative', () => {
          const params = { ...validLaunchParameters[1], fuelBurnRate: -1 };
          const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });

        test('Active gravity force is negative', () => {
          const params = { ...validLaunchParameters[1], activeGravityForce: -1 };
          const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });

        test('Maneuvering delay is less than 1', () => {
          const params = { ...validLaunchParameters[1], maneuveringDelay: 0 };
          const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });

        test('Fuel burn rate exceeds thrust fuel', () => {
          const params = { ...validLaunchParameters[1], fuelBurnRate: validLaunchParameters[1].thrustFuel + 1 };
          const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });
      });

      describe('Initial calculation validation', () => {
        test('Insufficient thrust for liftoff', () => {
          // To test this, we need a scenario where net force is <= 0.
          // netForce = thrustCapacity - (activeGravityForce * massTotal)
          // We can use a very heavy payload or a high gravity force.
          const lv = validLaunchVehicles[1]; // thrustCapacity: 1000000
          const payload = validPayloads[1]; // very heavy
          const params = { ...validLaunchParameters[1], activeGravityForce: 100000 }; // high gravity
          const res = adminLaunchCreateRequest(sid, mid, lvid, payload, params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
          // The error message might be 'Insufficient fuel to reach target distance'
          // because a negative acceleration would result in a negative distanceTraveled.
        });

        test('Insufficient fuel to reach target distance', () => {
          // To test this, we can reduce the thrustFuel or increase the targetDistance.
          const params = { ...validLaunchParameters[1], thrustFuel: 1 }; // very low fuel
          const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });

        test('Insufficient fuel to reach target distance (high target)', () => {
          const params = { ...validLaunchParameters[1], targetDistance: 999999999 }; // very high target
          const res = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], params);
          expect(res.statusCode).toBe(400);
          expect(res.result).toEqual(ERROR);
        });
      });
    });
  });
});