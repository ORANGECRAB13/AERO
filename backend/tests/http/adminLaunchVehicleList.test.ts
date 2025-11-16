import {
  clearRequest,
  registerUsers,
  createLaunchVehicles,
  createMissions,
  adminLaunchVehicleListRequest,
  adminLaunchCreateRequest,
  adminLaunchStatusUpdateRequest,
} from './requestHelpers';
import {
  httpToErrorCategories,
  errorMessages,
  validLaunchVehicles,
  validPayloads,
  validLaunchParameters,
} from '../../src/testSamples';

describe('GET /v1/admin/launchvehicle/list', () => {
  beforeEach(() => {
    clearRequest();
  });

  test('Returns 401 when session ID is invalid', () => {
    const res = adminLaunchVehicleListRequest('invalid-session');
    expect(res.statusCode).toBe(httpToErrorCategories.INVALID_CREDENTIALS);
    expect(res.result).toStrictEqual({ error: errorMessages.INVALID_CREDENTIALS.sessionId });
  });

  test('Returns empty list when no launch vehicles exist', () => {
    const [sid] = registerUsers('user1');

    const res = adminLaunchVehicleListRequest(sid);
    expect(res.statusCode).toBe(200);
    expect(res.result).toStrictEqual({ launchVehicles: [] });
  });

  test('Lists all non-retired launch vehicles with assigned false by default', () => {
    const [sid] = registerUsers('user1');
    const keys = [1, 2, 3] as const;
    const launchVehicleIds = createLaunchVehicles(sid, ...keys);

    const res = adminLaunchVehicleListRequest(sid);

    expect(res.statusCode).toBe(200);
    expect(res.result).toStrictEqual({
      launchVehicles: keys.map((key, index) => ({
        launchVehicleId: launchVehicleIds[index],
        name: validLaunchVehicles[key].name,
        assigned: false,
      })),
    });
  });

  test('Assigned status reflects active launches', () => {
    const [sid] = registerUsers('user1');
    const [missionId] = createMissions(sid, 1);
    const [launchVehicleId] = createLaunchVehicles(sid, 1);

    const payload = validPayloads[1];
    const launchParameters = validLaunchParameters[1];

    let res = adminLaunchCreateRequest(sid, missionId, launchVehicleId, payload, launchParameters);
    expect(res.statusCode).toBe(200);
    const launchId = res.result.launchId;

    res = adminLaunchVehicleListRequest(sid);
    expect(res.statusCode).toBe(200);
    expect(res.result.launchVehicles).toStrictEqual([
      {
        launchVehicleId,
        name: validLaunchVehicles[1].name,
        assigned: true,
      },
    ]);

    const statusUpdate = adminLaunchStatusUpdateRequest(sid, missionId, launchId, 'FAULT');
    expect(statusUpdate.statusCode).toBe(200);

    res = adminLaunchVehicleListRequest(sid);
    expect(res.statusCode).toBe(200);
    expect(res.result.launchVehicles).toStrictEqual([
      {
        launchVehicleId,
        name: validLaunchVehicles[1].name,
        assigned: false,
      },
    ]);
  });
});
