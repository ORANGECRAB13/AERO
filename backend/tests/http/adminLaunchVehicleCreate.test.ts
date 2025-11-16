import {
  clearRequest,
  adminLaunchVehicleCreateRequest,
  registerUsers,
  createLaunchVehicles
} from './requestHelpers';
import { validLaunchVehicles, errorLaunchVehicles } from '../../src/testSamples';

const ERROR = { error: expect.any(String) };

describe('POST /v1/admin/launchvehicle', () => {
  let sessionId: string;

  beforeEach(() => {
    clearRequest();
    [sessionId] = registerUsers('user1');
  });

  describe('Success cases', () => {
    test('Successfully creates a launch vehicle with valid data - Falcon 9', () => {
      const lv = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        lv.name,
        lv.description,
        lv.maxCrewWeight,
        lv.maxPayloadWeight,
        lv.launchVehicleWeight,
        lv.thrustCapacity,
        lv.maneuveringFuel
      );

      expect(response.result).toEqual({ launchVehicleId: expect.any(Number) });
    });

    test('Successfully creates a launch vehicle with valid data - Delta IV Heavy', () => {
      const lv = validLaunchVehicles[2];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        lv.name,
        lv.description,
        lv.maxCrewWeight,
        lv.maxPayloadWeight,
        lv.launchVehicleWeight,
        lv.thrustCapacity,
        lv.maneuveringFuel
      );

      expect(response.result).toEqual({ launchVehicleId: expect.any(Number) });
    });

    test('Successfully creates a launch vehicle with boundary values', () => {
      const lv = validLaunchVehicles[3];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        lv.name,
        lv.description,
        lv.maxCrewWeight,
        lv.maxPayloadWeight,
        lv.launchVehicleWeight,
        lv.thrustCapacity,
        lv.maneuveringFuel
      );

      expect(response.result).toEqual({ launchVehicleId: expect.any(Number) });
    });

    test('Creates multiple launch vehicles with unique IDs', () => {
      const lv1 = validLaunchVehicles[1];
      const lv2 = validLaunchVehicles[2];

      const response1 = adminLaunchVehicleCreateRequest(
        sessionId,
        lv1.name,
        lv1.description,
        lv1.maxCrewWeight,
        lv1.maxPayloadWeight,
        lv1.launchVehicleWeight,
        lv1.thrustCapacity,
        lv1.maneuveringFuel
      );

      const response2 = adminLaunchVehicleCreateRequest(
        sessionId,
        lv2.name,
        lv2.description,
        lv2.maxCrewWeight,
        lv2.maxPayloadWeight,
        lv2.launchVehicleWeight,
        lv2.thrustCapacity,
        lv2.maneuveringFuel
      );

      expect(response1.result.launchVehicleId).not.toBe(response2.result.launchVehicleId);
    });
  });

  describe('Error cases - Invalid name', () => {
    test('Returns 400 for name with invalid characters', () => {
      const lv = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        errorLaunchVehicles.nameInvalidChars,
        lv.description,
        lv.maxCrewWeight,
        lv.maxPayloadWeight,
        lv.launchVehicleWeight,
        lv.thrustCapacity,
        lv.maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for name that is too short', () => {
      const { description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        errorLaunchVehicles.nameTooShort,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for name that is too long', () => {
      const { description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        errorLaunchVehicles.nameTooLong,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });
  });

  describe('Error cases - Invalid description', () => {
    test('Returns 400 for description with invalid characters', () => {
      const { name, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        errorLaunchVehicles.descriptionInvalidChars,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for description that is too short', () => {
      const { name, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        errorLaunchVehicles.descriptionTooShort,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for description that is too long', () => {
      const { name, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        errorLaunchVehicles.descriptionTooLong,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });
  });

  describe('Error cases - Invalid maxCrewWeight', () => {
    test('Returns 400 for maxCrewWeight that is too low', () => {
      const { name, description, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        errorLaunchVehicles.maxCrewWeightTooLow,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for maxCrewWeight that is too high', () => {
      const { name, description, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        errorLaunchVehicles.maxCrewWeightTooHigh,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });
  });

  describe('Error cases - Invalid maxPayloadWeight', () => {
    test('Returns 400 for maxPayloadWeight that is too low', () => {
      const { name, description, maxCrewWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        maxCrewWeight,
        errorLaunchVehicles.maxPayloadWeightTooLow,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for maxPayloadWeight that is too high', () => {
      const { name, description, maxCrewWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        maxCrewWeight,
        errorLaunchVehicles.maxPayloadWeightTooHigh,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });
  });

  describe('Error cases - Invalid launchVehicleWeight', () => {
    test('Returns 400 for launchVehicleWeight that is too low', () => {
      const { name, description, maxCrewWeight, maxPayloadWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        errorLaunchVehicles.launchVehicleWeightTooLow,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for launchVehicleWeight that is too high', () => {
      const { name, description, maxCrewWeight, maxPayloadWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        errorLaunchVehicles.launchVehicleWeightTooHigh,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });
  });

  describe('Error cases - Invalid thrustCapacity', () => {
    test('Returns 400 for thrustCapacity that is too low', () => {
      const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        errorLaunchVehicles.thrustCapacityTooLow,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for thrustCapacity that is too high', () => {
      const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        errorLaunchVehicles.thrustCapacityTooHigh,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });
  });

  describe('Error cases - Invalid maneuveringFuel', () => {
    test('Returns 400 for maneuveringFuel that is too low', () => {
      const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        errorLaunchVehicles.maneuveringFuelTooLow
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 400 for maneuveringFuel that is too high', () => {
      const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        sessionId,
        name,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        errorLaunchVehicles.maneuveringFuelTooHigh
      );

      expect(response.statusCode).toBe(400);
      expect(response.result).toEqual(ERROR);
    });
  });

  describe('Error cases - Invalid session', () => {
    test('Returns 401 for invalid session ID', () => {
      const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        'invalidSessionId',
        name,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel
      );

      expect(response.statusCode).toBe(401);
      expect(response.result).toEqual(ERROR);
    });

    test('Returns 401 for empty session ID', () => {
      const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = validLaunchVehicles[1];
      const response = adminLaunchVehicleCreateRequest(
        '',
        name,
        description,
        maxCrewWeight,
        maxPayloadWeight,
        launchVehicleWeight,
        thrustCapacity,
        maneuveringFuel);
      expect(response.statusCode).toBe(401);
      expect(response.result).toEqual(ERROR);
    });
  });
});