import { getData } from './dataStore';
import { getTime } from './helper';
import { Payload } from './interfaces';

const EARTH_RADIUS_METERS = 6378000;

export const getOrbitalDistance = (targetDistance: number) => targetDistance + EARTH_RADIUS_METERS;

export const getOrbitalVelocity = (acceleration: number, targetDistance: number) => Math.sqrt(2 * acceleration * targetDistance);

function angleOfDeviation(speed: number, orbitalDistance: number, deployedTime: number): number {
  const timeTravled = getTime() - deployedTime;
  const distanceTraveled = speed * timeTravled;
  return distanceTraveled / orbitalDistance;
}

type PayloadInfo = {
  payloadId: number;
  description: string;
  weight: number;
  speed: number;
  timeOfDeployment: number;
  relativePosition: {
    orbitDistance: number;
    angleOfDeviation: number;
  }
}

function getPayloadInfo(payload: Payload): PayloadInfo {
  return {
    payloadId: payload.payloadId,
    description: payload.description,
    weight: payload.weight,
    speed: payload.orbitalVelocity,
    timeOfDeployment: payload.timeDeployed,
    relativePosition: {
      orbitDistance: payload.orbitalDistance,
      angleOfDeviation: angleOfDeviation(payload.orbitalVelocity, payload.orbitalDistance, payload.timeDeployed)
    }
  };
}

export function adminPayloadDeployedList(): { deployedPayloads: PayloadInfo[] } {
  const deployedPayloads = getData().launches.reduce((acc, launch) => {
    if (launch.payload.timeDeployed !== null) {
      acc.push(getPayloadInfo(launch.payload));
    }
    return acc;
  }, []);
  return { deployedPayloads };
}
