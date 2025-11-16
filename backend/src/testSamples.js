import { HealthStatus } from './interfaces';

export const errorCategories = {
  BAD_INPUT: 'BAD_INPUT',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INACCESSIBLE_VALUE: 'INACCESSIBLE_VALUE',
  UNKNOWN: 'UNKNOWN'
};

export const errorMessages = {
  BAD_INPUT: {
    AUTH: {
      emailUsed: 'Email address is used by another user',
      emailInvalid: 'Provided Email is not an valid email address',
      emailDNE: 'Email address does not exist',
      nameFirstInvalidChars: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
      nameFirstInvalidLength: 'NameFirst is less than 2 characters or more than 20 characters',
      nameLastInvalidChars: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes',
      nameLastInvalidLength: 'NameLast is less than 2 characters or more than 20 characters',
      passwordInvalidLength: 'Password is less than 8 characters',
      passwordInvalidChars: 'Password does not contain at least one number and at least one letter',
      passwordEmailMismatch: 'Password is not correct for the given email',
      oldPasswordIncorrect: 'Old Password is not the correct old password',
      newPasswordIsOld: 'Old Password and New Password match exactly',
      newPasswordUsedBefore: 'New Password has already been used before by this user',
    },
    MISSION: {
      nameInvalidChars: 'Name contains invalid characters. Valid characters are alphanumeric and spaces',
      nameInvalidLength: 'Name is either less than 3 characters long or more than 30 characters long',
      nameUsed: 'Name is already used by the current logged in user for another space mission',
      description: 'Description is more than 400 characters in length',
      target: 'Target is more than 100 characters in length',
      missionHasAstronautAssigned: 'Astronauts have been assigned to this mission'
    },
    ASTRONAUT: {
      astronautNameUsed: 'Another Astronaut already exists with the same nameFirst and nameLast',
      rankInvalidLength: 'Rank is less than 5 characters or more than 50 characters',
      rankInvalidChars: 'Rank contains characters other than lowercase letters, uppercase letters, spaces, hyphens, round brackets or apostrophes',
      age: 'Age < 20 or > 60',
      weight: 'Weight (measured in kgs at Earth gravity) > 100',
      height: 'Height (measured in cms) < 150 or > 200',
      astronautIdInvalid: 'astronautid is invalid',
      astronautAssignedToMission: 'The astronaut is already assigned to a mission',
      astronautAssignedToAnotherMission: 'The astronaut is already assigned to another mission',
      astronautNotAssignedToCurrentMission: 'The astronaut is not assigned to this space mission',
      astronautAssignedToAnotherLaunch: 'The astronaut is already allocated to another launch that has not ended'
    }
  },

  INVALID_CREDENTIALS: {
    sessionId: 'ControlUserSessionId is invalid.'
  },

  INACCESSIBLE_VALUE: {
    missionId: 'Mission ID does not refer to a valid space mission, or a space mission that this mission control user owns.'
  }
};

export const httpToErrorCategories = {
  BAD_INPUT: 400,
  INVALID_CREDENTIALS: 401,
  INACCESSIBLE_VALUE: 403,
};

export const validUsers = {
  user1: {
    email: 'myBrotherErwin@ad.unsw.edu.au',
    password: 'eHI63}E;58eJ',
    nameFirst: 'Erwin',
    nameLast: 'Lobo'
  },
  user2: {
    email: 'flattenTriangular@outlook.com',
    password: '.6#j}|23s2£4>102}Aq0_5sY;Q~Ls5;iJT@^oFngcH{@{(B>#>',
    nameFirst: 'Carl Friedrich',
    nameLast: 'Gauss'
  },
  user3: {
    email: 'A.Friedheim@gmail.com',
    password: '321password',
    nameFirst: 'Authur',
    nameLast: 'Friedheim'
  },
  user4: {
    email: 'fatherOf20Children@gmail.com',
    password: 'password123',
    nameFirst: "Johann'S",
    nameLast: 'Bach'
  },
  user5: {
    email: 'imBachPlayer@bar.com',
    password: '11111111111s',
    nameFirst: 'Alexander',
    nameLast: 'Borovsky'
  },
  user6: {
    email: 'imBachPlayer@outlook.com',
    password: 'j1234321',
    nameFirst: 'Frieda',
    nameLast: 'Kwast-Hodapp'
  }
};

export const invalidUserInputs = {
  emailInvalid: 'im no email',
  nameInvalidChar: '%%&^*(qwer',
  nameShort: '',
  nameLong: 'qpweoiwqopeipqwoeipqwoeipqwoeipqwoiepqwoieqwpiepqwoeiqwpoiepqwie',
  passwordShort: 'short',
  passwordNoNumber: 'qwertyqweoiuqoiu',
  passwordNoChar: '098769087'
};

export const validMissions = {
  1: { name: 'Mercury Mission', description: 'Exploring Mercury', target: 'Orbit' },
  2: { name: 'Venus Mission', description: 'Exploring Venus atmosphere', target: 'Clouds' },
  3: { name: 'Mars Mission', description: 'Exploring Mars surface', target: 'Gale Crater' },
  4: { name: 'Europa Mission', description: 'Searching for life in Europa ocean', target: 'Ice Shell' },
  5: { name: 'Titan Mission', description: 'Exploring Titan methane lakes', target: 'Kraken Mare' },
  6: { name: 'Jupiter Mission', description: 'Studying Jupiter atmosphere', target: 'Great Red Spot' },
  7: { name: 'Saturn Mission', description: 'Ring system analysis', target: 'Ring Gap' },
  8: { name: 'Asteroid Mission', description: 'Mining operations on Ceres', target: 'Surface' },
  9: { name: 'winterreigen', description: 'Winter dance composition study', target: 'Concert Hall' },
  10: { name: 'pastorale', description: 'Pastoral symphony analysis', target: 'Orchestra' },
  11: { name: 'postludium', description: 'Closing musical piece research', target: 'Organ' },
  12: { name: 'nocturne', description: 'Night music composition', target: 'Piano' },
  13: { name: 'rhapsody', description: 'Irregular musical form study', target: 'Chamber Music' },
  14: { name: 'fugue', description: 'Contrapuntal composition analysis', target: 'Bach Archive' },
  15: { name: 'sonata', description: 'Classical form exploration', target: 'Manuscript' },
  16: { name: 'symphony', description: 'Large scale orchestral work', target: 'Vienna Hall' }
};

export const errorMissions = {
  nameInvalidChars: 'Mars Mission@2024!',
  nameShort: 'n'.repeat(2),
  nameLong: 'n'.repeat(31),
  description: 'x'.repeat(401),
  target: 'x'.repeat(101)
};

export const validAstronauts = {
  1: {
    nameFirst: 'Ernst von',
    nameLast: 'Dohnanyi',
    rank: 'Admiral',
    age: 55,
    weight: 80,
    height: 175
  },
  2: {
    nameFirst: 'Annie',
    nameLast: 'Fischer',
    rank: 'Colonel',
    age: 33,
    weight: 55,
    height: 166
  },
  3: {
    nameFirst: 'Edward',
    nameLast: 'Kilenyi',
    rank: 'Lieutenant',
    age: 28,
    weight: 55,
    height: 166
  },
  4: {
    nameFirst: 'Gyorgy',
    nameLast: 'Cziffra',
    rank: 'Sergant',
    age: 28,
    weight: 80,
    height: 166
  }
};

export const errorAstronaut = {
  nameShort: 'o',
  nameLong: 'o'.repeat(21),
  nameInvalidChar: '$ir Barbiroli',
  rankShort: 'o',
  rankLong: 'o'.repeat(51),
  rankInvalidChar: '$erg@ant',
  ageYoung: 19,
  ageOld: 61,
  weight: 101,
  heightShort: 149,
  heightTall: 201
};

export const validPhysicalHealth = {
  restingHeartRate: HealthStatus.GREEN,
  bloodPressure: HealthStatus.GREEN,
  boneDensity: HealthStatus.GREEN,
  muscleMass: HealthStatus.GREEN,
  reactionTime: HealthStatus.RED,
  radiationLevel: HealthStatus.YELLOW,
  whiteBloodCellLevel: HealthStatus.GREEN,
  sleepQuality: HealthStatus.GREEN
};

export const validMentalHealth = {
  depressionLevel: HealthStatus.YELLOW,
  anxietyLevel: HealthStatus.GREEN,
  stressLevel: HealthStatus.GREEN,
  cognitivePerformance: HealthStatus.GREEN,
  personalityTraits: HealthStatus.GREEN,
  motivationLevel: HealthStatus.RED
};

export const validLaunchVehicles = {
  1: {
    name: 'Falcon IX',
    description: 'Reusable two-stage rocket',
    maxCrewWeight: 500,
    maxPayloadWeight: 800,
    launchVehicleWeight: 54905,
    thrustCapacity: 7607000,
    maneuveringFuel: 50
  },
  2: {
    name: 'Delta IV Heavy',
    description: 'Heavy-lift expendable vehicle',
    maxCrewWeight: 150,
    maxPayloadWeight: 950,
    launchVehicleWeight: 73300,
    thrustCapacity: 9000000,
    maneuveringFuel: 95
  },
  3: {
    name: 'Starship Beta X',
    description: 'The immense booster for the Starship system',
    maxCrewWeight: 1000,
    maxPayloadWeight: 1000,
    launchVehicleWeight: 99999,
    thrustCapacity: 4000000,
    maneuveringFuel: 10
  }
};

export const errorLaunchVehicles = {
  nameInvalidChars: 'Bad@Name',
  nameTooShort: 'X', // < 2 characters
  nameTooLong: 'ThisNameIsWayTooLongForThisField', // > 20 characters
  descriptionInvalidChars: 'A description with a # tag.',
  descriptionTooShort: 'a', // < 2 characters
  descriptionTooLong: 'a'.repeat(51),
  maxCrewWeightTooLow: 99, // < 100
  maxCrewWeightTooHigh: 1001, // > 1000
  maxPayloadWeightTooLow: 99, // < 100
  maxPayloadWeightTooHigh: 1001, // > 1000
  launchVehicleWeightTooLow: 999, // < 1000
  launchVehicleWeightTooHigh: 100001, // > 100000
  thrustCapacityTooLow: 99999, // < 100000
  thrustCapacityTooHigh: 10000001, // > 10000000
  maneuveringFuelTooLow: 9, // < 10
  maneuveringFuelTooHigh: 101 // > 100
};

export const validPayloads = {
  1: {
    description: 'UNSW Cubesat',
    weight: 400
  },
  2: {
    description: 'Communication Satellite',
    weight: 600
  },
  3: {
    description: 'Scientific Equipment Package',
    weight: 300
  },
};

export const validLaunchParameters = {
  1: {
    targetDistance: 10000,
    fuelBurnRate: 20,
    thrustFuel: 1000,
    activeGravityForce: 9.8,
    maneuveringDelay: 2
  },
  2: {
    targetDistance: 50000,
    fuelBurnRate: 15,
    thrustFuel: 2000,
    activeGravityForce: 9.8,
    maneuveringDelay: 3
  },
  3: {
    targetDistance: 8000,
    fuelBurnRate: 25,
    thrustFuel: 800,
    activeGravityForce: 9.8,
    maneuveringDelay: 1000
  }
};

export const errorLaunchParameters = {
  payloadDescriptionEmpty: '',
  payloadDescriptionTooLong: 'x'.repeat(401),
  payloadOverweight: 1001,
};

export const edgeCaseLaunchVehicle = {
  name: 'Edge',
  description: 'edge case testing',
  maxCrewWeight: 500,
  maxPayloadWeight: 800,
  launchVehicleWeight: 1500,
  thrustCapacity: 200000,
  maneuveringFuel: 50
};

export const edgeCaseLaunch = {
  payload: {
    description: 'Critical mass test',
    weight: 200
  },
  launchParameters: {
    targetDistance: 98230, // 50 km
    thrustFuel: 2000,
    fuelBurnRate: 20, // burnTime = 100 seconds
    activeGravityForce: 98,
    maneuveringDelay: 5
  }
};
