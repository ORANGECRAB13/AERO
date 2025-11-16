import {
  clearRequest,
  registerUsers,
  createLaunchVehicles,
  createMissions,
  adminLaunchCreateRequest,
  adminLaunchStatusUpdateRequest,
  adminLaunchVehicleRetireRequest,
  adminLaunchVehicleInfoRequest,
} from './requestHelpers';
import { validPayloads, validLaunchParameters } from '../../src/testSamples';
import { missionLaunchAction } from '../../src/interfaces';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearRequest();
});

describe('DELETE /v1/admin/launchvehicle/:launchvehicleid', () => {
  let sid: string;
  let lvid: number;

  beforeEach(() => {
    [sid] = registerUsers('user1');
    [lvid] = createLaunchVehicles(sid, 1);
  });

  test('successfully retires a launch vehicle', () => {
    const res = adminLaunchVehicleRetireRequest(sid, lvid);
    expect(res.statusCode).toBe(200);
    expect(res.result).toEqual({});

    // Verify it's retired
    const infoRes = adminLaunchVehicleInfoRequest(sid, lvid);
    expect(infoRes.result.retired).toBe(true);
  });

  test('returns 401 for invalid session ID', () => {
    const res = adminLaunchVehicleRetireRequest('invalid-session-id', lvid);
    expect(res.statusCode).toBe(401);
    expect(res.result).toEqual(ERROR);
  });

  test('returns 400 for invalid launch vehicle ID', () => {
    const invalidId = lvid + 99;
    const res = adminLaunchVehicleRetireRequest(sid, invalidId);
    expect(res.statusCode).toBe(400);
    expect(res.result).toEqual(ERROR);
  });

  test('returns 400 when launch vehicle is assigned to an active launch', () => {
    const [mid] = createMissions(sid, 1)
    const launchId = adminLaunchCreateRequest(
      sid,
      mid,
      lvid,
      validPayloads[2],
      validLaunchParameters[2]
    ).result.launchId;

    const res = adminLaunchVehicleRetireRequest(sid, lvid);
    expect(res.statusCode).toBe(400);
    expect(res.result).toEqual(ERROR);
    expect(res.result.error).toContain('is already assigned to an active launch');
  });

  test('successfully retires a launch vehicle assigned to an inactive (ON_EARTH) launch', () => {
    const [mid] = createMissions(sid, 1)
    const launchId = adminLaunchCreateRequest(
      sid,
      mid,
      lvid,
      validPayloads[2],
      validLaunchParameters[2]
    ).result.launchId;

    // To get the launch to ON_EARTH state, we can trigger a fault from READY_TO_LAUNCH
    adminLaunchStatusUpdateRequest(sid, mid, launchId, missionLaunchAction.FAULT);

    const res = adminLaunchVehicleRetireRequest(sid, lvid);
    expect(res.result).toEqual({});
    expect(res.statusCode).toBe(200);
  });

  test('successfully "retires" a launch vehicle that is already retired', () => {
    // First retirement
    adminLaunchVehicleRetireRequest(sid, lvid);

    // Second retirement attempt
    const res = adminLaunchVehicleRetireRequest(sid, lvid);

    expect(res.statusCode).toBe(200);
    expect(res.result).toEqual({});
  });
});

