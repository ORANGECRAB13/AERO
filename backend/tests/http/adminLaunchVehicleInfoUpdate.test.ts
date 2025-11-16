import {
  clearRequest,
  registerUsers,
  createLaunchVehicles,
  adminLaunchVehicleInfoUpdateRequest,
  adminLaunchVehicleInfoRequest,
} from './requestHelpers';
import { validLaunchVehicles, errorLaunchVehicles } from '../../src/testSamples';

const ERROR = { error: expect.any(String) };

describe('PUT /v1/admin/launchvehicle/:launchvehicleid', () => {
  let sid: string;
  let lvid: number;
  const lv1 = validLaunchVehicles[1];
  const lv2 = validLaunchVehicles[2];

  beforeEach(() => {
    clearRequest();
    [sid] = registerUsers('user1');
    [lvid] = createLaunchVehicles(sid, 1);
  });

  describe('Success cases', () => {
    test('Successfully edits a launch vehicle', () => {
      const res = adminLaunchVehicleInfoUpdateRequest(
        sid,
        lvid,
        lv2.name,
        lv2.description,
        lv2.maxCrewWeight,
        lv2.maxPayloadWeight,
        lv2.launchVehicleWeight,
        lv2.thrustCapacity,
        lv2.maneuveringFuel
      );

      expect(res.statusCode).toBe(200);
      expect(res.result).toEqual({});

      const infoRes = adminLaunchVehicleInfoRequest(sid, lvid);
      expect(infoRes.statusCode).toBe(200);
      expect(infoRes.result).toMatchObject({
        name: lv2.name,
        maxCrewWeight: lv2.maxCrewWeight,
        maxPayloadWeight: lv2.maxPayloadWeight,
        launchVehicleWeight: lv2.launchVehicleWeight,
        thrustCapacity: lv2.thrustCapacity,
        startingManeuveringFuel: lv2.maneuveringFuel,
      });
    });
  });

  describe('Error cases', () => {
    test('401: Invalid session ID', () => {
      const res = adminLaunchVehicleInfoUpdateRequest(
        'invalid-sid',
        lvid,
        lv2.name,
        lv2.description,
        lv2.maxCrewWeight,
        lv2.maxPayloadWeight,
        lv2.launchVehicleWeight,
        lv2.thrustCapacity,
        lv2.maneuveringFuel
      );
      expect(res.statusCode).toBe(401);
      expect(res.result).toEqual(ERROR);
    });

    test('400: Invalid launch vehicle ID', () => {
      const res = adminLaunchVehicleInfoUpdateRequest(
        sid,
        lvid + 99,
        lv2.name,
        lv2.description,
        lv2.maxCrewWeight,
        lv2.maxPayloadWeight,
        lv2.launchVehicleWeight,
        lv2.thrustCapacity,
        lv2.maneuveringFuel
      );
      expect(res.statusCode).toBe(400);
      expect(res.result).toEqual(ERROR);
    });

    describe('Error cases - Invalid name', () => {
      test('Returns 400 for name with invalid characters', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, errorLaunchVehicles.nameInvalidChars, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for name that is too short', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, errorLaunchVehicles.nameTooShort, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for name that is too long', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, errorLaunchVehicles.nameTooLong, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });
    });

    describe('Error cases - Invalid description', () => {
      test('Returns 400 for description with invalid characters', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, errorLaunchVehicles.descriptionInvalidChars, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for description that is too short', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, errorLaunchVehicles.descriptionTooShort, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for description that is too long', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, errorLaunchVehicles.descriptionTooLong, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });
    });

    describe('Error cases - Invalid maxCrewWeight', () => {
      test('Returns 400 for maxCrewWeight that is too low', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, errorLaunchVehicles.maxCrewWeightTooLow, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for maxCrewWeight that is too high', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, errorLaunchVehicles.maxCrewWeightTooHigh, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });
    });

    describe('Error cases - Invalid maxPayloadWeight', () => {
      test('Returns 400 for maxPayloadWeight that is too low', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, lv1.maxCrewWeight, errorLaunchVehicles.maxPayloadWeightTooLow, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for maxPayloadWeight that is too high', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, lv1.maxCrewWeight, errorLaunchVehicles.maxPayloadWeightTooHigh, lv1.launchVehicleWeight, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });
    });

    describe('Error cases - Invalid launchVehicleWeight', () => {
      test('Returns 400 for launchVehicleWeight that is too low', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, errorLaunchVehicles.launchVehicleWeightTooLow, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for launchVehicleWeight that is too high', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, errorLaunchVehicles.launchVehicleWeightTooHigh, lv1.thrustCapacity, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });
    });

    describe('Error cases - Invalid thrustCapacity', () => {
      test('Returns 400 for thrustCapacity that is too low', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, errorLaunchVehicles.thrustCapacityTooLow, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for thrustCapacity that is too high', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, errorLaunchVehicles.thrustCapacityTooHigh, lv1.maneuveringFuel);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });
    });

    describe('Error cases - Invalid maneuveringFuel', () => {
      test('Returns 400 for maneuveringFuel that is too low', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, errorLaunchVehicles.maneuveringFuelTooLow);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });

      test('Returns 400 for maneuveringFuel that is too high', () => {
        const res = adminLaunchVehicleInfoUpdateRequest(sid, lvid, lv1.name, lv1.description, lv1.maxCrewWeight, lv1.maxPayloadWeight, lv1.launchVehicleWeight, lv1.thrustCapacity, errorLaunchVehicles.maneuveringFuelTooHigh);
        expect(res.statusCode).toBe(400);
        expect(res.result).toEqual(ERROR);
      });
    });
  });
});
