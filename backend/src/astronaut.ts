import {
  AdminAstronautPoolReturn,
  AdminAstronautCreateReturn,
  AdminAstronautDetailsReturn,
  Astronaut,
  PhysicalHealthIndicators,
  MentalHealthIndicators,
  adminAstronautHealthDetailsReturn
} from './interfaces';
import { errorMessages } from './testSamples';
import { isUserNameValid } from './auth';
import { getControlUserIdFromSessionId, getAstronautFromAstronautId, getTime } from './helper';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

const RANK_MIN_LENGTH = 5;
const RANK_MAX_LENGTH = 50;
const AGE_MIN = 20;
const AGE_MAX = 60;
const WEIGHT_MAX = 100;
const HEIGHT_MIN = 150;
const HEIGHT_MAX = 200;

/**
 * Generates a unique astronaut Id
 * @returns {number}
 */
export function astronautIdGen(): number {
  const astronauts = getData().astronauts;
  return astronauts.length === 0
    ? 1
    : Math.max(...astronauts.map(astronaut => astronaut.astronautId)) + 1;
}

/**
 * Validates the astronaut's first name and last name
 * @param nameFirst - The astronaut's first name
 * @param nameLast - The astronaut's last name
 * @returns {void} - throws HTTPError if invalid
 */
export function isAstronautNameValid(astronautId: number | null, nameFirst: string, nameLast: string): void {
  isUserNameValid(nameFirst, nameLast);

  if (getData().astronauts.some(astronaut =>
    astronaut.nameFirst === nameFirst && astronaut.nameLast === nameLast && astronaut.astronautId !== astronautId
  )) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.astronautNameUsed);
  }
}

/**
 * Validate the astronaut's rank
 * @param rank - The astronaut's rank
 * @returns {void} - throws HTTPError if invalid
 */
export function isAstronautRankValid(rank: string): void {
  if (rank.length < RANK_MIN_LENGTH || rank.length > RANK_MAX_LENGTH) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.rankInvalidLength);
  }

  const rankInvalidChars = /[^a-zA-Z -']/.test(rank);
  if (rankInvalidChars) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.rankInvalidChars);
  }
}

/**
 * Checks if the astronaut's age, weight, height met specific requirements
 * @param age - The astronaut's age
 * @param weight - The astronaut's weight
 * @param height - The astronaut's height
 * @returns {void} - throws HTTPError if requirements not met
 */
export function isAstronautRequirementsMet(age: number, weight: number, height: number): void {
  if (age < AGE_MIN || age > AGE_MAX) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.age);
  }
  if (weight > WEIGHT_MAX) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.weight);
  }
  if (height < HEIGHT_MIN || height > HEIGHT_MAX) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.height);
  }
}

/**
 * Validates that a astronautid corresponds to a mission's assignedastronauts
 * @param {number} astronautId - astronaut id to validate
 * @returns {void} - throws HTTPError if astronaut is assigned
 */
export function isAstronautAssigned(astronautId: number): void {
  if (getData().missions.some(mission => mission.assignedAstronauts.some(ass => ass.astronautId === astronautId))) {
    throw HTTPError(400, errorMessages.BAD_INPUT.ASTRONAUT.astronautAssignedToMission);
  }
}

export function isAstronautHealthStatusValid(
  physicalHealth: PhysicalHealthIndicators, mentalHealth: MentalHealthIndicators
): void {
  const validHealthStatus = new Set(['GREEN', 'YELLOW', 'RED']);
  const allHealth = { ...physicalHealth, ...mentalHealth };
  for (const [indicator, status] of Object.entries(allHealth)) {
    if (!validHealthStatus.has(status)) {
      throw HTTPError(400, `Invalid status ${status} for ${indicator}`);
    }
  }
}

export function adminAstronautPool(controlUserSessionId: string): AdminAstronautPoolReturn {
  getControlUserIdFromSessionId(controlUserSessionId);

  const data = getData();
  const astronauts = data.astronauts.map(astronaut => ({
    astronautId: astronaut.astronautId,
    designation: astronaut.designation,
    assigned: Object.keys(astronaut.assignedMission).length > 0
  }));

  return { astronauts };
}
/**
 * Create a new astronaut by the given details
 * @param controlUserSessionId
 * @param nameFirst
 * @param nameLast
 * @param rank
 * @param age
 * @param weight
 * @param height
 * @returns {ErrorReturn} Error Object if input invalid
 * @returns {{astronautId: number}} astronautId Object if input valid
 */
export function adminAstronautCreate(
  controlUserSessionId: string, nameFirst: string, nameLast: string, rank: string, age: number, weight: number, height: number
): AdminAstronautCreateReturn {
  getControlUserIdFromSessionId(controlUserSessionId);
  isAstronautNameValid(null, nameFirst, nameLast);
  isAstronautRankValid(rank);
  isAstronautRequirementsMet(age, weight, height);

  const data = getData();
  const astronautId = astronautIdGen();
  const currentTime = getTime();
  const astronaut: Astronaut = {
    astronautId,
    nameFirst,
    nameLast,
    designation: `${rank} ${nameFirst} ${nameLast}`,
    rank,
    age,
    weight,
    height,
    assignedMission: {},
    timeAdded: currentTime,
    timeLastEdited: currentTime,
    healthRecords: [],
    llmChatHistory: []
  };
  data.astronauts.push(astronaut);
  setData(data);

  return { astronautId };
}

export function adminAstronautRemove(controlUserSessionId: string, astronautId: number): Record<string, never> {
  getControlUserIdFromSessionId(controlUserSessionId);
  getAstronautFromAstronautId(astronautId);
  isAstronautAssigned(astronautId);

  const data = getData();
  data.astronauts = data.astronauts.filter(a => a.astronautId !== astronautId);
  setData(data);

  return {};
}

export function adminAstronautDetails(controlUserSessionId: string, astronautId: number): AdminAstronautDetailsReturn {
  getControlUserIdFromSessionId(controlUserSessionId);
  const astronaut = getAstronautFromAstronautId(astronautId);

  return {
    astronautId: astronaut.astronautId,
    designation: astronaut.designation,
    timeAdded: astronaut.timeAdded,
    timeLastEdited: astronaut.timeLastEdited,
    age: astronaut.age,
    weight: astronaut.weight,
    height: astronaut.height,
    assignedMission: astronaut.assignedMission
  };
}

export function adminAstronautDetailsUpdate(
  controlUserSessionId: string, astronautId: number,
  nameFirst: string, nameLast: string, rank: string, age: number, weight: number, height: number
): Record<string, never> {
  getControlUserIdFromSessionId(controlUserSessionId);
  const astronaut = getAstronautFromAstronautId(astronautId);
  isAstronautNameValid(astronautId, nameFirst, nameLast);
  isAstronautRankValid(rank);
  isAstronautRequirementsMet(age, weight, height);

  astronaut.nameFirst = nameFirst;
  astronaut.nameLast = nameLast;
  astronaut.rank = rank;
  astronaut.designation = `${rank} ${nameFirst} ${nameLast}`;
  astronaut.age = age;
  astronaut.weight = weight;
  astronaut.height = height;
  astronaut.timeLastEdited = getTime();
  const data = getData();
  setData(data);

  return {};
}

/**
 * Retrieves the astronaut's health details and last edited time
 * @param controlUserSessionId
 * @param astronautId
 * @returns {{physicalHealth: PhysicalHealthIndicators, mentalHealth: MentalHealthIndicators, timeLastEdited: number}}
 */
export function adminAstronautHealthDetails(
  controlUserSessionId: string, astronautId: number
): adminAstronautHealthDetailsReturn | string {
  getControlUserIdFromSessionId(controlUserSessionId);
  const astronaut = getAstronautFromAstronautId(astronautId);
  if (astronaut.healthRecords.length === 0) {
    return `No health records present for ${astronaut.designation}, astronautId: ${astronautId}`;
  }
  return astronaut.healthRecords[astronaut.healthRecords.length - 1];
}

/**
 * Updates the astronaut's health details
 * @param controlUserSessionId
 * @param astronautId
 * @param physicalHealth
 * @param mentalHealth
 * @returns
 */
export function adminAstronautHealthDetailsUpdate(
  controlUserSessionId: string, astronautId: number,
  physicalHealth: PhysicalHealthIndicators, mentalHealth: MentalHealthIndicators
): Record<string, never> {
  getControlUserIdFromSessionId(controlUserSessionId);
  const astronaut = getAstronautFromAstronautId(astronautId);
  isAstronautHealthStatusValid(physicalHealth, mentalHealth);

  const timeLastEdited = getTime();
  astronaut.healthRecords.push({ physicalHealth, mentalHealth, timeLastEdited });
  setData(getData());
  return {};
}
