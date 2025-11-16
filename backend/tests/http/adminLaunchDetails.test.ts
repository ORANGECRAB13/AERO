import {
  clearRequest,
  registerUsers,
  createMissions,
  createLaunchVehicles,
  adminLaunchCreateRequest,
  adminLaunchDetailsRequest,
  createAstronauts,
  adminMissionAssignAstronautRequest,
  adminLaunchAllocateAstronautRequest,
} from './requestHelpers';
import { validPayloads, validLaunchParameters, validLaunchVehicles, validMissions } from '../../src/testSamples';
import { missionLaunchState } from '../../src/interfaces';

const ERROR = { error: expect.any(String) };

describe('POST /v1/admin/mission/:missionid/launch/:launchid', () => {
  let sid: string;
  let sid2: string;
  let mid: number;
  let lvid: number;
  let launchId: number;

  beforeEach(() => {
    clearRequest();
    [sid, sid2] = registerUsers('user1', 'user2');
    [mid] = createMissions(sid, 1);
    [lvid] = createLaunchVehicles(sid, 1);
    const launchRes = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], validLaunchParameters[1]);
    launchId = launchRes.result.launchId;
  });

  describe('Error cases', () => {
    test('401: Invalid session ID', () => {
      const res = adminLaunchDetailsRequest('invalid-sid', mid, launchId);
      expect(res.statusCode).toBe(401);
      expect(res.result).toEqual(ERROR);
    });

    test('403: Mission does not exist', () => {
      const res = adminLaunchDetailsRequest(sid, mid + 99, launchId);
      expect(res.statusCode).toBe(403);
      expect(res.result).toEqual(ERROR);
    });

    test('403: User does not own mission', () => {
      const res = adminLaunchDetailsRequest(sid2, mid, launchId);
      expect(res.statusCode).toBe(403);
      expect(res.result).toEqual(ERROR);
    });

    test('400: Invalid launch ID', () => {
      const res = adminLaunchDetailsRequest(sid, mid, launchId + 99);
      expect(res.statusCode).toBe(400);
      expect(res.result).toEqual(ERROR);
    });
  });

  describe('Success cases', () => {
    test('Successfully retrieves launch details with no astronauts', () => {
      const res = adminLaunchDetailsRequest(sid, mid, launchId);
      expect(res.statusCode).toBe(200);
      expect(res.result).toStrictEqual({
        launchId: launchId,
        missionCopy: {
          missionId: mid,
          ...validMissions[1],
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          assignedAstronauts: []
        },
        timeCreated: expect.any(Number),
        state: missionLaunchState.READY_TO_LAUNCH,
        launchVehicle: {
          launchVehicleId: lvid,
          name: validLaunchVehicles[1].name,
          maneuveringFuelRemaining: validLaunchVehicles[1].maneuveringFuel,
        },
        payload: { ...validPayloads[1], payloadId: 1, deployed: false },
        allocatedAstronauts: [],
        launchCalculationParameters: validLaunchParameters[1]
      });
    });

    test('Successfully retrieves launch details with allocated astronauts', () => {
      const [aid1, aid2] = createAstronauts(sid, 1, 2);
      adminMissionAssignAstronautRequest(sid, mid, aid1);
      adminMissionAssignAstronautRequest(sid, mid, aid2);
      
      adminLaunchAllocateAstronautRequest(sid,mid,launchId,aid1)
      adminLaunchAllocateAstronautRequest(sid,mid,launchId,aid2)

      const res = adminLaunchDetailsRequest(sid, mid, launchId);
      expect(res.statusCode).toBe(200);

      expect(res.result.allocatedAstronauts).toHaveLength(2);
      expect(res.result.allocatedAstronauts).toStrictEqual([
        { astronautId: aid1, designation: expect.any(String) },
        { astronautId: aid2, designation: expect.any(String) },
      ]);
    });
  });
});
