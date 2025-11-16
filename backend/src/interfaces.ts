export interface User {
  controlUserId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  oldPasswords: string[];
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface AstronautSummary {
  astronautId: number;
  designation: string;
}

export interface Mission {
  missionId: number;
  controlUserId: number;
  active: boolean;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  target: string;
  assignedAstronauts: AstronautSummary[];
}

export interface AssignedMission {
  missionId: number;
  objective: string;
}

export enum HealthStatus {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

export interface PhysicalHealthIndicators {
  restingHeartRate: HealthStatus;
  bloodPressure: HealthStatus;
  boneDensity: HealthStatus;
  muscleMass: HealthStatus;
  reactionTime: HealthStatus;
  radiationLevel: HealthStatus;
  whiteBloodCellLevel: HealthStatus;
  sleepQuality: HealthStatus;
}

export interface MentalHealthIndicators {
  depressionLevel: HealthStatus;
  anxietyLevel: HealthStatus;
  stressLevel: HealthStatus;
  cognitivePerformance: HealthStatus;
  personalityTraits: HealthStatus;
  motivationLevel: HealthStatus;
}

export interface LLMMessageLog {
  astronautId: number,
  messageId: number,
  messageContent: string,
  chatBotResponse: boolean,
  timeSent: number
}

export interface Astronaut {
  astronautId: number;
  nameFirst: string;
  nameLast: string;
  designation: string;
  timeAdded: number;
  timeLastEdited: number;
  rank: string;
  age: number;
  weight: number;
  height: number;
  assignedMission: AssignedMission | Record<string, never>;
  healthRecords: {
    physicalHealth: PhysicalHealthIndicators,
    mentalHealth: MentalHealthIndicators,
    timeLastEdited: number
  } []
  llmChatHistory: {
    launchId: number;
    messageLog: LLMMessageLog[]
  }[]
}

export interface Session {
  controlUserId: number;
  controlUserSessionId: string;
}

export enum missionLaunchState {
  READY_TO_LAUNCH = 'READY_TO_LAUNCH',
  LAUNCHING = 'LAUNCHING',
  MANEUVERING = 'MANEUVERING',
  COASTING = 'COASTING',
  MISSION_COMPLETE = 'MISSION_COMPLETE',
  REENTRY = 'RE_ENTRY',
  ON_EARTH = 'ON_EARTH'
}

export enum missionLaunchAction {
  LIFTOFF = 'LIFTOFF',
  CORRECTION = 'CORRECTION',
  FIRE_THRUSTERS = 'FIRE_THRUSTERS',
  DEPLOY_PAYLOAD = 'DEPLOY_PAYLOAD',
  GO_HOME = 'GO_HOME',
  FAULT = 'FAULT',
  RETURN = 'RETURN',
  SKIP_WAITING = 'SKIP_WAITING'
}

export interface LaunchVehicle {
  launchVehicleId: number; // an id for this entity
  name: string; // a name for this launch vehicle
  description: string; // a description for this launch vehicle
  maxCrewWeight: number; // maximum weight (kg) of astronauts this launch vehicle can carry
  maxPayloadWeight: number; // maximum weight (kg) of payload this launch vehicle can carry
  launchVehicleWeight: number;
  thrustCapacity: number; // amount of force this launch vehicle generates when it burns thrustFuel
  maneuveringFuel: number; // amount of maneuvering fuel (units) this launch vehicle has to start each launch
  timeAdded: number; // created time in seconds
  timeLastEdited: number; // last time a value was edited in seconds
  retired: boolean; // is this launch vehicle active or not
  // launches?: LaunchSummary // this is computed value so it does not need to be stored
}

export interface Payload {
  payloadId : number; // an id for this entity
  description : string; // a description for this payload
  weight : number; // a weight (kg) for this payload
  timeDeployed: number | null; // time in seconds that this payload was deployed
  orbitalDistance: number | null;
  orbitalVelocity: number | null;
}

export interface LaunchCalcParameters {
  targetDistance: number; // distance (m) to the target destination for this launch
  thrustFuel: number; // amount of fuel that is allocated to the launch vehicle for this launch
  fuelBurnRate: number; // rate at which the launch vehicle burns its `thrustFuel`
  activeGravityForce: number; // downward force of gravity acting against the thrust capacity of the launch vehicle
  maneuveringDelay: number; // how long does the launch wait before automatically going from `MANEUVERING` state to `COASTING` state
}

export interface Launch {
  launchId: number; // an id for this entity
  missionCopy: Mission; // copy of the mission that this launch is based on. Note - it must be deep copy so that if the original mission is changed, this copy remains unchanged
  launchCreationTime: number; // time in seconds that this launch was created
  state : missionLaunchState; // what is the current state of this launch, always begins at 'READY_TO_LAUNCH'
  assignedLaunchVehicleId: number; // launch vehicle assigned to this launch
  remainingLaunchVehicleManeuveringFuel: number // how much maneuvering fuel is left in the launch vehicle currently assigned to this launch
  payload: Payload; // payload assigned to this launch
  allocatedAstronauts: number[] // array of astronautId's that are allocated to this launch
  launchCalculationParameters: LaunchCalcParameters
}

export interface Data {
  users: User[];
  missions: Mission[];
  astronauts: Astronaut[];
  sessions: Session[];
  launches: Launch[];
  launchVehicles: LaunchVehicle[];
}

/// /////////////////////////////////////////////////////////////////////

// export interface ErrorReturn { error: string, errorCategory: string }

export interface AdminAuthRegisterReturn { controlUserSessionId: string }

export interface AdminAuthLoginReturn { controlUserSessionId: string }

export interface AdminControlUserDetailsReturn {
  user: {
    controlUserId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  }
}

export interface AdminMissionListReturn {
  missions: { missionId: number; name: string }[]
}

export interface AdminMissionCreateReturn { missionId: number }

export interface AdminMissionInfoReturn {
  missionId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  target: string;
  assignedAstronauts: AstronautSummary[];
}

export interface AdminAstronautPoolReturn {
  astronauts: {
    astronautId: number;
    designation: string;
    assigned: boolean;
  } []
}

export interface AdminAstronautCreateReturn { astronautId: number }

export interface AdminAstronautDetailsReturn {
  astronautId: number;
  designation: string;
  timeAdded: number;
  timeLastEdited: number;
  age: number;
  weight: number;
  height: number;
  assignedMission: AssignedMission | Record<string, never>;
}

export interface adminAstronautHealthDetailsReturn {
  physicalHealth: PhysicalHealthIndicators;
  mentalHealth: MentalHealthIndicators;
  timeLastEdited: number;
}

export interface LaunchSummary {
  launch: string;
  state: missionLaunchState;
}

export interface adminLaunchVehicleInfoReturn {
  launchVehicleId: number;
  name: string;
  timeAdded: number;
  timeLastEdited: number;
  maxCrewWeight: number;
  maxPayloadWeight: number;
  launchVehicleWeight: number;
  thrustCapacity: number;
  startingManeuveringFuel: number;
  retired: boolean;
  launches: LaunchSummary[];
}

export interface LaunchVehicleSummary {
  launchVehicleId: number;
  name: string;
  maneuveringFuelRemaining: number;
}

export interface AdminLaunchVehicleListReturn {
  launchVehicles: {
    launchVehicleId: number;
    name: string;
    assigned: boolean;
  }[];
}

export interface adminLaunchDetailsReturn {
  launchId: number;
  missionCopy: AdminMissionInfoReturn;
  timeCreated: number;
  state: missionLaunchState;
  launchVehicle: LaunchVehicleSummary;
  payload: {
    payloadId: number;
    description: string;
    weight: number;
    deployed: boolean;
  };
  allocatedAstronauts: AstronautSummary[];
  launchCalculationParameters: LaunchCalcParameters;
}
