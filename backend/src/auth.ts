// This file should contain your functions relating to:
// - adminAuth*

import { getControlUserIdFromSessionId, getControlUserFromEmail } from './helper';
import { getData, setData } from './dataStore';
import { errorMessages } from './testSamples';
import { v4 as uuidv4 } from 'uuid';
import { User, AdminAuthLoginReturn, AdminAuthRegisterReturn, AdminControlUserDetailsReturn } from './interfaces';
import HTTPError from 'http-errors';
import isEmail from 'validator/lib/isEmail';
import sha256 from 'crypto-js/sha256';

const PASSWORD_MIN_LENGTH = 8;
const USER_NAME_MIN_LENGTH = 2;
const USER_NAME_MAX_LENGTH = 20;
const USER_NAME_REGEX = /[^A-Za-z '-]/;

/**
 * Generates a unique ID for a new control user
 * @returns {number} The next available control user ID (1 if no users exist, otherwise max ID + 1)
 */
export function controlUserIdGen(): number {
  const users = getData().users;
  return users.length === 0
    ? 1
    : Math.max(...users.map(user => user.controlUserId)) + 1;
}

/**
 * Checks if an email address is already registered to another user
 * @param {string} email - Email address to check
 * @param {number} [controlUserId] - Optional user ID to exclude from check (for updates)
 * @returns {void} - throws HTTPError if email is already used
 */
export function isEmailUsed(email: string, controlUserId: number | null): void {
  if (getData().users.some(user => user.email === email && user.controlUserId !== controlUserId)) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.emailUsed);
  }
}

/**
  * <Check if the provided password is in a valid format>
  *
  * @param {string} password - this is password which should be set by user
  * @returns {void} - throws HTTPError if invalid
*/
export function isPasswordValid(password: string): void {
  // check if the length is less than 8 characters
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.passwordInvalidLength);
  }
  // check for number & letter existing
  const hasNumber = /[0-9]/.test(password);
  const hasLetter = /[a-z]/i.test(password);

  if (hasNumber === false || hasLetter === false) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.passwordInvalidChars);
  }
}

/**
 * Encrypts a password using SHA-256 hashing
 * @param {string} password - Plain text password to hash
 * @returns {string} Hashed password as a hexadecimal string
 */
export const hashPassword = (password: string): string => sha256(password).toString();

/**
 * Validates user's first and last names meet format requirements
 * @param {string} nameFirst - User's first name
 * @param {string} nameLast - User's last name
 * @returns {void} - throws HTTPError if invalid
 *
 * Requirements for both names:
 * - Must be between 2 and 20 characters long
 * - Can only contain letters, spaces, hyphens, and apostrophes
 */
export function isUserNameValid(nameFirst: string, nameLast: string): void {
  if (nameFirst.length < USER_NAME_MIN_LENGTH || nameFirst.length > USER_NAME_MAX_LENGTH) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.nameFirstInvalidLength);
  }

  const nameFirstInvalidChars = USER_NAME_REGEX.test(nameFirst);
  if (nameFirstInvalidChars) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.nameFirstInvalidChars);
  }

  if (nameLast.length < USER_NAME_MIN_LENGTH || nameLast.length > USER_NAME_MAX_LENGTH) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.nameLastInvalidLength);
  }

  const nameLastInvalidChars = USER_NAME_REGEX.test(nameLast);
  if (nameLastInvalidChars) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.nameLastInvalidChars);
  }
}

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {void} - throws HTTPError if invalid
 */
export function isEmailValid(email: string): void {
  if (!isEmail(email)) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.emailInvalid);
  }
}

/**
  * Register a user by the given details
  *
  * @param {String} email - user's email
  * @param {String} password - user's password
  * @param {String} nameFirst - user's first name
  * @param {String} nameLast - user's last name
  *
  * @returns {{ error: String, errorCategory: String }} - for invalid inputs
  * @returns {{ controlUserSessionId: String }} - for valid inputs
*/
export function adminAuthRegister(
  email: string, password: string, nameFirst: string, nameLast: string
): AdminAuthRegisterReturn {
  isEmailValid(email);
  isEmailUsed(email, null);
  isPasswordValid(password);
  isUserNameValid(nameFirst, nameLast);

  // store data
  const controlUserId = controlUserIdGen();
  const newUser: User = {
    controlUserId,
    email: email,
    password: hashPassword(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    oldPasswords: [],
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0
  };
  const data = getData();
  data.users.push(newUser);

  const controlUserSessionId = uuidv4();
  const newSession = {
    controlUserSessionId,
    controlUserId
  };
  data.sessions.push(newSession);
  setData(data);

  return { controlUserSessionId };
}

/**
 * Authenticate user login with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {{controlUserSessionId: string}} Success input
 * @returns {{error: string, errorCategory: string}} Invalid input
 */
export function adminAuthLogin(email: string, password: string): AdminAuthLoginReturn {
  isPasswordValid(password);
  const user = getControlUserFromEmail(email);

  const data = getData();
  // Check password match
  if (user.password !== hashPassword(password)) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.passwordEmailMismatch);
  }

  // Successful login - update counters
  user.numSuccessfulLogins++;
  user.numFailedPasswordsSinceLastLogin = 0;

  const controlUserSessionId = uuidv4();
  const controlUserId = user.controlUserId;
  const newSession = {
    controlUserSessionId,
    controlUserId
  };
  data.sessions.push(newSession);
  setData(data);

  return { controlUserSessionId };
}

/**
 * Get details about a mission control user
 * @param {string} controlUserSessionId - The user ID to get details for
 * @returns {{user: object}} - User details if valid
 * @returns {{error: string, errorCategory: string}} - Error if invalid
 */
export function adminControlUserDetails(controlUserSessionId: string): AdminControlUserDetailsReturn {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  const data = getData();
  const user = data.users.find(u => u.controlUserId === controlUserId);
  // output the correct response
  return {
    user: {
      controlUserId: user.controlUserId,
      name: user.nameFirst + ' ' + user.nameLast,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
    }
  };
}

/**  update the properties of the logged in admin user
 * @param {string}controlUserSessionId - User's controlUserSessionId
 * @param {string}email - User's email
 * @param {string}nameFirst - User's first name
 * @param {string}nameLast - User's last name
 * @return {{error: string, errorCategory: string}} - Invalid input
 * @return {} - no error
*/
export function adminControlUserDetailsUpdate(
  controlUserSessionId: string, email: string, nameFirst: string, nameLast: string
): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  isEmailValid(email);
  isEmailUsed(email, controlUserId);
  isUserNameValid(nameFirst, nameLast);

  const data = getData();
  const user = data.users.find((user) => user.controlUserId === controlUserId);
  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);

  return {};
}

/**
 * Update the user's password and check for bad inputs
 * @param {string} controlUserSessionId - User's ID
 * @param {string} oldPassword - User's old password
 * @param {string} newPassword - User's new password
 * @returns { error: 'specific error message', errorCategory: errorCategories} - invalid input
 * @returns { } - valid input
 */
export function adminControlUserPasswordUpdate(
  controlUserSessionId: string, oldPassword: string, newPassword: string
): Record<string, never> {
  const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
  isPasswordValid(newPassword);

  const source = getData();
  const user = source.users.find(u => u.controlUserId === controlUserId);

  oldPassword = hashPassword(oldPassword);
  newPassword = hashPassword(newPassword);

  if (user.password !== oldPassword) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.oldPasswordIncorrect);
  }

  // check if old and new password match
  if (oldPassword === newPassword) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.newPasswordIsOld);
  }

  // check if new password has been included in user history
  if (user.oldPasswords.includes(newPassword)) {
    throw HTTPError(400, errorMessages.BAD_INPUT.AUTH.newPasswordUsedBefore);
  }

  // update password
  user.oldPasswords.push(oldPassword);
  user.password = newPassword;

  // save changes
  setData(source);

  return {};
}

/**
 * Logout a session
 * @param {string} controlUserSessionId - unique identifier for a session
 * @returns {{ error: string, errorCategory: errorCategories.INVALID_CREDENTIALS }} - ErrorReturn if controlUserSessionId is invalid
 * @returns { } - Empty object if input is valid
 */
export function adminAuthLogout(controlUserSessionId: string): Record<string, never> {
  getControlUserIdFromSessionId(controlUserSessionId);
  const data = getData();
  data.sessions = data.sessions.filter(session => session.controlUserSessionId !== controlUserSessionId);
  setData(data);
  return {};
}
