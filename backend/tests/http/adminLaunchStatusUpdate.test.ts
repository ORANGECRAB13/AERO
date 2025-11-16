import {
  clearRequest,
  registerUsers,
  createMissions,
  createLaunchVehicles,
  adminLaunchCreateRequest,
  adminLaunchStatusUpdateRequest,
  adminLaunchVehicleCreateRequest,
  createOneAstronaut,
  createAstronauts,
  adminLaunchDetailsRequest,
  adminMissionAssignAstronautRequest,
  adminLaunchAllocateAstronautRequest,
} from './requestHelpers';
import { validPayloads, validLaunchParameters, edgeCaseLaunchVehicle, edgeCaseLaunch } from '../../src/testSamples';
import { missionLaunchAction, missionLaunchState } from '../../src/interfaces';

const ERROR = { error: expect.any(String) };

describe('PUT /v1/admin/mission/:missionid/launch/:launchid', () => {
  let sid: string;
  let mid: number;
  let lvid: number;
  let launchId: number;

  beforeEach(() => {
    clearRequest();
    [sid] = registerUsers('user1');
    [mid] = createMissions(sid, 1);
    [lvid] = createLaunchVehicles(sid, 1);
    const launchRes = adminLaunchCreateRequest(sid, mid, lvid, validPayloads[1], validLaunchParameters[1]);
    launchId = launchRes.result.launchId;
  });

  describe('Error cases', () => {
    test('401: Invalid session ID', () => {
      const res = adminLaunchStatusUpdateRequest('invalid-sid', mid, launchId, missionLaunchAction.LIFTOFF);
      expect(res.statusCode).toBe(401);
      expect(res.result).toEqual(ERROR);
    });

    test('403: Mission does not exist', () => {
      const res = adminLaunchStatusUpdateRequest(sid, mid + 99, launchId, missionLaunchAction.LIFTOFF);
      expect(res.statusCode).toBe(403);
      expect(res.result).toEqual(ERROR);
    });

    test('403: User does not own mission', () => {
      const [sid2] = registerUsers('user2');
      const res = adminLaunchStatusUpdateRequest(sid2, mid, launchId, missionLaunchAction.LIFTOFF);
      expect(res.statusCode).toBe(403);
      expect(res.result).toEqual(ERROR);
    });

    test('400: Invalid launch ID', () => {
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId + 99, missionLaunchAction.LIFTOFF);
      expect(res.statusCode).toBe(400);
      expect(res.result).toEqual(ERROR);
    });

    test('400: Unknown action', () => {
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, 'INVALID_ACTION');
      expect(res.statusCode).toBe(400);
      expect(res.result).toEqual(ERROR);
    });

    test('400: Invalid action for current state (LIFTOFF from LAUNCHING)', () => {
      // First, liftoff to change state to LAUNCHING
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);

      // Then, try to liftoff again
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);
      expect(res.statusCode).toBe(400);
      expect(res.result).toEqual(ERROR);
    });
  });

  describe('Success cases - State Transitions', () => {

    test('READY_TO_LAUNCH -> LAUNCHING (LIFTOFF)', () => {
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);
      expect(res.result).toEqual({});
      const launchDetail = adminLaunchDetailsRequest(sid, mid, launchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.LAUNCHING)
    });

    test('LAUNCHING -> MANEUVERING (SKIP_WAITING)', () => {
      // READY_TO_LAUNCH -> LAUNCHING
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);

      // LAUNCHING -> MANEUVERING
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.SKIP_WAITING);
      expect(res.result).toEqual({});
      const launchDetail = adminLaunchDetailsRequest(sid, mid, launchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.MANEUVERING)
    });

    test('MANEUVERING -> LAUNCHING (CORRECTION)', () => {
      // READY_TO_LAUNCH -> LAUNCHING
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);
      // LAUNCHING -> MANEUVERING
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.SKIP_WAITING);

      // MANEUVERING -> LAUNCHING
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.CORRECTION);
      expect(res.result).toEqual({});
      const launchDetail = adminLaunchDetailsRequest(sid, mid, launchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.LAUNCHING)
    });

    test('MANEUVERING -> COASTING (FIRE_THRUSTERS)', () => {
      // READY_TO_LAUNCH -> LAUNCHING
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);
      // LAUNCHING -> MANEUVERING
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.SKIP_WAITING);

      // MANEUVERING -> COASTING
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.FIRE_THRUSTERS);
      expect(res.result).toEqual({});
      const launchDetail = adminLaunchDetailsRequest(sid, mid, launchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.COASTING)
    });

    test('COASTING -> MISSION_COMPLETE (DEPLOY_PAYLOAD)', () => {
      // Perform state transitions to get to COASTING
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.SKIP_WAITING);
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.FIRE_THRUSTERS);

      // COASTING -> MISSION_COMPLETE
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.DEPLOY_PAYLOAD);
      expect(res.result).toEqual({});
      const launchDetail = adminLaunchDetailsRequest(sid, mid, launchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.MISSION_COMPLETE)
    });

    test('MISSION_COMPLETE -> REENTRY (GO_HOME)', () => {
      // Perform state transitions to get to MISSION_COMPLETE
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.SKIP_WAITING);
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.FIRE_THRUSTERS);
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.DEPLOY_PAYLOAD);

      // MISSION_COMPLETE -> REENTRY
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.GO_HOME);
      expect(res.result).toEqual({});
      const launchDetail = adminLaunchDetailsRequest(sid, mid, launchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.REENTRY)
    });

    test('REENTRY -> ON_EARTH (RETURN)', () => {
      // Perform state transitions to get to REENTRY
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.FAULT); // FAULT goes to REENTRY

      // REENTRY -> ON_EARTH
      const res = adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.RETURN);
      expect(res.result).toEqual({});
      const launchDetail = adminLaunchDetailsRequest(sid, mid, launchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.ON_EARTH)
    });

    test('Auto state transitions', async () => {
      const delay = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));
      adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.LIFTOFF);
      // auto transit delay 3 seconds + launch manuvering delay 2 seconds
      // to keep it safe, delay for 10 seconds.
      await delay(10)
      const launchDetail = adminLaunchDetailsRequest(sid, mid, launchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.COASTING)
    }, 15 * 1000)
  });

  describe('Special cases', () => {
    test('Cannot reach destination at LIFTOFF: => FAULT => ON_EARTH => 400 Error', () => {
      const lv = edgeCaseLaunchVehicle;
      lvid = adminLaunchVehicleCreateRequest(sid, lv.name, lv.description, lv.maxCrewWeight, 
        lv.maxPayloadWeight, lv.launchVehicleWeight, lv.thrustCapacity, lv.maneuveringFuel
      ).result.launchVehicleId;
      const resLaunch = adminLaunchCreateRequest(sid, mid, lvid, edgeCaseLaunch.payload, edgeCaseLaunch.launchParameters);
      expect(resLaunch.result).toStrictEqual({ launchId: expect.any(Number) });

      const newlaunchId = resLaunch.result.launchId;
      const aid = createOneAstronaut(sid, 1)
      adminMissionAssignAstronautRequest(sid, mid, aid)
      adminLaunchAllocateAstronautRequest(sid, mid, newlaunchId, aid)

      const res = adminLaunchStatusUpdateRequest(sid, mid, newlaunchId, missionLaunchAction.LIFTOFF);
      const launchDetail = adminLaunchDetailsRequest(sid, mid, newlaunchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.ON_EARTH)

      expect(res.statusCode).toBe(400);
      expect(res.result).toEqual(ERROR);
    })
    
    test('Insufficent fuel at CORRECTION: FAULT => REENTRY => 400 Error', () => {
      // use launch vehicle 3 which has maneuvering fuel 10
      const [lvid3] = createLaunchVehicles(sid, 3)
      // use launch param 3 which has maneuvering delay 1000 (so no auto transitioning can happen in the test)
      const newLaunchId = adminLaunchCreateRequest(sid, mid, lvid3, validPayloads[1], validLaunchParameters[3]).result.launchId
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.LIFTOFF);

      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.SKIP_WAITING);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.CORRECTION);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.SKIP_WAITING);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.CORRECTION);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.SKIP_WAITING);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.CORRECTION);

      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.SKIP_WAITING);
      const res = adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.CORRECTION);

      expect(res.result).toStrictEqual(ERROR);
      expect(res.statusCode).toBe(400);

      const launchDetail = adminLaunchDetailsRequest(sid, mid, newLaunchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.REENTRY)
    })

    test('Insufficent fuel at FIRE_TRUSTERS: FAULT => REENTRY => 400 Error', () => {
      // use launch vehicle 3 which has maneuvering fuel 10
      const [lvid3] = createLaunchVehicles(sid, 3)
      // use launch param 3 which has maneuvering delay 1000 (so no auto transitioning can happen in the test)
      const newLaunchId = adminLaunchCreateRequest(sid, mid, lvid3, validPayloads[1], validLaunchParameters[3]).result.launchId

      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.LIFTOFF);

      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.SKIP_WAITING);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.CORRECTION);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.SKIP_WAITING);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.CORRECTION);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.SKIP_WAITING);
      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.CORRECTION);

      adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.SKIP_WAITING);
      const res = adminLaunchStatusUpdateRequest(sid, mid, newLaunchId, missionLaunchAction.FIRE_THRUSTERS);

      expect(res.result).toStrictEqual(ERROR);
      expect(res.statusCode).toBe(400);

      const launchDetail = adminLaunchDetailsRequest(sid, mid, newLaunchId)
      expect(launchDetail.result.state).toBe(missionLaunchState.REENTRY)
    })
  })
});