import {
  clearRequest,
  registerUsers,
  createMissions,
  createLaunchVehicles,
  adminLaunchCreateRequest,
  adminLaunchVehicleInfoRequest,
  adminLaunchStatusUpdateRequest,
} from './requestHelpers';
import { validPayloads, validLaunchParameters, validLaunchVehicles } from '../../src/testSamples';
import { missionLaunchState } from '../../src/interfaces';

const ERROR = { error: expect.any(String) };

describe('GET /v1/admin/launchvehicle/:launchvehicleid', () => {
  let sid: string;
  let lvid: number;

  beforeEach(() => {
    clearRequest();
    [sid] = registerUsers('user1');
    [lvid] = createLaunchVehicles(sid, 1);
  });

  describe('Error cases', () => {
    test('401: Invalid session ID', () => {
      const res = adminLaunchVehicleInfoRequest('invalid-sid', lvid);
      expect(res.statusCode).toBe(401);
      expect(res.result).toEqual(ERROR);
    });

    test('400: Invalid launch vehicle ID', () => {
      const res = adminLaunchVehicleInfoRequest(sid, lvid + 99);
      expect(res.statusCode).toBe(400);
      expect(res.result).toEqual(ERROR);
    });
  });

  describe('Success cases', () => {
    test('Successfully retrieves launch vehicle details with no launches', () => {
      const res = adminLaunchVehicleInfoRequest(sid, lvid);
      const lv = validLaunchVehicles[1];

      expect(res.statusCode).toBe(200);
      expect(res.result).toStrictEqual({
        launchVehicleId: lvid,
        name: lv.name,
        timeAdded: expect.any(Number),
        timeLastEdited: expect.any(Number),
        maxCrewWeight: lv.maxCrewWeight,
        maxPayloadWeight: lv.maxPayloadWeight,
        launchVehicleWeight: lv.launchVehicleWeight,
        thrustCapacity: lv.thrustCapacity,
        startingManeuveringFuel: lv.maneuveringFuel,
        retired: false,
        launches: [],
      });
    });

    test('Successfully retrieves launch vehicle details in the corresponding launch', () => {
      const [mid1, mid2] = createMissions(sid, 1, 2);
      const [lvid2] = createLaunchVehicles(sid, 2);
      adminLaunchCreateRequest(sid, mid1, lvid, validPayloads[1], validLaunchParameters[1]);
      adminLaunchCreateRequest(sid, mid2, lvid2, validPayloads[2], validLaunchParameters[2]);

      let res = adminLaunchVehicleInfoRequest(sid, lvid);
      expect(res.statusCode).toBe(200);
      expect(res.result).toHaveProperty('launchVehicleId', lvid);
      expect(res.result).toHaveProperty('name', validLaunchVehicles[1].name);
      expect(res.result).toHaveProperty('timeAdded', expect.any(Number));
      expect(res.result).toHaveProperty('timeLastEdited', expect.any(Number));
      expect(res.result).toHaveProperty('retired', false);
      expect(res.result).toHaveProperty('launches');
      expect(res.result.launches).toHaveLength(1);
      expect(res.result.launches[0]).toHaveProperty('launch', expect.any(String));
      expect(res.result.launches[0]).toHaveProperty('state', missionLaunchState.READY_TO_LAUNCH);

      res = adminLaunchVehicleInfoRequest(sid, lvid2);
      expect(res.statusCode).toBe(200);
      expect(res.result).toHaveProperty('launchVehicleId', lvid2);
      expect(res.result).toHaveProperty('name', validLaunchVehicles[2].name);
      expect(res.result).toHaveProperty('timeAdded', expect.any(Number));
      expect(res.result).toHaveProperty('timeLastEdited', expect.any(Number));
      expect(res.result).toHaveProperty('retired', false);
      expect(res.result).toHaveProperty('launches');
      expect(res.result.launches).toHaveLength(1);
      expect(res.result.launches[0]).toHaveProperty('launch', expect.any(String));
      expect(res.result.launches[0]).toHaveProperty('state', missionLaunchState.READY_TO_LAUNCH);
    })

    test('Successfully retrieves launch vehicle details added to two launches', () => {
      const [mid] = createMissions(sid, 1);
      adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], validLaunchParameters[1]);

      let res = adminLaunchVehicleInfoRequest(sid, lvid);

      expect(res.statusCode).toBe(200);
      expect(res.result).toHaveProperty('launchVehicleId', lvid);
      expect(res.result).toHaveProperty('name', validLaunchVehicles[1].name);
      expect(res.result).toHaveProperty('timeAdded', expect.any(Number));
      expect(res.result).toHaveProperty('timeLastEdited', expect.any(Number));
      expect(res.result).toHaveProperty('retired', false);
      expect(res.result).toHaveProperty('launches');
      expect(res.result.launches).toHaveLength(1);
      expect(res.result.launches[0]).toHaveProperty('launch', expect.any(String));
      expect(res.result.launches[0]).toHaveProperty('state', missionLaunchState.READY_TO_LAUNCH);

      adminLaunchStatusUpdateRequest(sid, mid, 1, 'FAULT');
      res = adminLaunchVehicleInfoRequest(sid, lvid);
      expect(res.result.launches[0]).toHaveProperty('state', missionLaunchState.ON_EARTH);

      adminLaunchCreateRequest(sid, mid, lvid, validPayloads[2], validLaunchParameters[2]);
      res = adminLaunchVehicleInfoRequest(sid, lvid);
      expect(res.statusCode).toBe(200);
      expect(res.result).toHaveProperty('launchVehicleId', lvid);
      expect(res.result).toHaveProperty('name', validLaunchVehicles[1].name);
      expect(res.result).toHaveProperty('timeAdded', expect.any(Number));
      expect(res.result).toHaveProperty('timeLastEdited', expect.any(Number));
      expect(res.result).toHaveProperty('retired', false);
      expect(res.result).toHaveProperty('launches');
      expect(res.result.launches).toHaveLength(2);
      expect(res.result.launches[1]).toHaveProperty('launch', expect.any(String));
      expect(res.result.launches[1]).toHaveProperty('state', missionLaunchState.READY_TO_LAUNCH);
      
    });
  });
});