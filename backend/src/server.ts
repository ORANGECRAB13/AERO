// IMPORTS are the start of the file
// import Express server related libraries
import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
// import Swagger display related libraries
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
// import your webserver configuration file
import config from './config.json';
// import your logic calls - add further items as required
import { echo } from './newecho';
import { adminAuthLogin, adminAuthLogout, adminAuthRegister, adminControlUserDetails, adminControlUserPasswordUpdate, adminControlUserDetailsUpdate } from './auth';
import {
  adminMissionCreate, adminMissionList, adminMissionRemove, adminMissionInfo,
  adminMissionNameUpdate, adminMissionTargetUpdate, adminMissionDescriptionUpdate,
  adminMissionAssignAstronaut, adminMissionUnassignAstronaut, adminMissionTransfer
} from './mission';
import { adminAstronautCreate, adminAstronautDetails, adminAstronautDetailsUpdate, adminAstronautHealthDetails, adminAstronautHealthDetailsUpdate, adminAstronautPool, adminAstronautRemove } from './astronaut';
import { clear } from './other';
import { getControlUserIdFromSessionId, getMissionFromMissionId } from './helper';
import {
  adminLaunchVehicleCreate,
  adminLaunchVehicleInfoUpdate,
  adminLaunchVehicleInfo,
  adminLaunchVehicleRetire,
  adminLaunchVehicleList
} from './launchVehicle';
import {
  adminLaunchCreate,
  adminLaunchDetails,
  adminLaunchStatusUpdate,
  adminLaunchAllocateAstronaut,
  adminLaunchList,
  adminLaunchDeallocateAstronaut
} from './launch';
import { llmAstronautChat, llmAstronautChatHistory } from './llm';
import { adminPayloadDeployedList } from './payload';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

// Setting up the configuration for your webserver
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }

  return res.json(result);
});

app.delete('/clear', (req: Request, res: Response) => res.json(clear()));

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const result = adminAuthRegister(email, password, nameFirst, nameLast);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = adminAuthLogin(email, password);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const result = adminAuthLogout(controlUserSessionId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/controluser/details', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const result = adminControlUserDetails(controlUserSessionId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/controluser/details', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const { email, nameFirst, nameLast } = req.body;
    const result = adminControlUserDetailsUpdate(controlUserSessionId, email, nameFirst, nameLast);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/controluser/password', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const { oldPassword, newPassword } = req.body;
    const result = adminControlUserPasswordUpdate(controlUserSessionId, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/mission', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const { name, description, target } = req.body;
    const result = adminMissionCreate(controlUserSessionId, name, description, target);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.delete('/v1/admin/mission/:missionid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const missionId = parseInt(req.params.missionid);
    const result = adminMissionRemove(controlUserSessionId, missionId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/launchvehicle/list', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const result = adminLaunchVehicleList(controlUserSessionId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/mission/list', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const result = adminMissionList(controlUserSessionId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/mission/:missionid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const missionId = parseInt(req.params.missionid);
    const result = adminMissionInfo(controlUserSessionId, missionId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/mission/:missionid/name', (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.missionid);
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const { name } = req.body;
    const result = adminMissionNameUpdate(controlUserSessionId, missionId, name);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/mission/:missionid/description', (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.missionid);
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const { description } = req.body;
    const result = adminMissionDescriptionUpdate(controlUserSessionId, missionId, description);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/mission/:missionid/target', (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.missionid);
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const { target } = req.body;
    const result = adminMissionTargetUpdate(controlUserSessionId, missionId, target);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/mission/:missionid/assign/:astronautid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const missionId = Number(req.params.missionid);
    const astronautId = Number(req.params.astronautid);
    const result = adminMissionAssignAstronaut(controlUserSessionId, astronautId, missionId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.delete('/v1/admin/mission/:missionid/assign/:astronautid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const missionId = Number(req.params.missionid);
    const astronautId = Number(req.params.astronautid);
    const result = adminMissionUnassignAstronaut(controlUserSessionId, astronautId, missionId, false);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.delete('/v2/admin/mission/:missionid/assign/:astronautid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.header('controlUserSessionId');
    const missionId = Number(req.params.missionid);
    const astronautId = Number(req.params.astronautid);
    const result = adminMissionUnassignAstronaut(controlUserSessionId, astronautId, missionId, true);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/mission/:missionid/transfer', (req: Request, res: Response) => {
  try {
    const userEmail = req.body.userEmail;
    const missionId = parseInt(req.params.missionid);
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const result = adminMissionTransfer(controlUserSessionId, missionId, userEmail);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/astronaut', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const { nameFirst, nameLast, rank, age, weight, height } = req.body;
    const result = adminAstronautCreate(controlUserSessionId, nameFirst, nameLast, rank, age, weight, height);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/astronaut/pool', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const result = adminAstronautPool(controlUserSessionId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/astronaut/:astronautid', (req: Request, res: Response) => {
  try {
    const astronautId = parseInt(req.params.astronautid);
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const result = adminAstronautDetails(controlUserSessionId, astronautId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/astronaut/:astronautid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const { nameFirst, nameLast, rank, age, weight, height } = req.body;
    const astronautId = parseInt(req.params.astronautid);
    const result = adminAstronautDetailsUpdate(controlUserSessionId, astronautId, nameFirst, nameLast, rank, age, weight, height);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.delete('/v1/admin/astronaut/:astronautid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const astronautId = parseInt(req.params.astronautid);
    const result = adminAstronautRemove(controlUserSessionId, astronautId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/astronaut/:astronautid/health', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const astronautId = parseInt(req.params.astronautid);
    const { physicalHealth, mentalHealth } = req.body;
    const result = adminAstronautHealthDetailsUpdate(controlUserSessionId, astronautId, physicalHealth, mentalHealth);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/astronaut/:astronautid/health', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const astronautId = parseInt(req.params.astronautid);
    const result = adminAstronautHealthDetails(controlUserSessionId, astronautId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/launchvehicle', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    getControlUserIdFromSessionId(controlUserSessionId);
    const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = req.body;
    const result = adminLaunchVehicleCreate(name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/launchvehicle/:launchvehicleid', (req: Request, res: Response) => {
  try {
    getControlUserIdFromSessionId(req.headers.controlusersessionid as string);
    const launchVehicleId = parseInt(req.params.launchvehicleid);
    const result = adminLaunchVehicleInfo(launchVehicleId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/launchvehicle/:launchvehicleid', (req: Request, res: Response) => {
  try {
    getControlUserIdFromSessionId(req.headers.controlusersessionid as string);
    const launchVehicleId = parseInt(req.params.launchvehicleid);
    const { name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel } = req.body;
    const result = adminLaunchVehicleInfoUpdate(launchVehicleId, name, description, maxCrewWeight, maxPayloadWeight, launchVehicleWeight, thrustCapacity, maneuveringFuel);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.delete('/v1/admin/launchvehicle/:launchvehicleid', (req: Request, res: Response) => {
  try {
    getControlUserIdFromSessionId(req.headers.controlusersessionid as string);
    const launchVehicleId = parseInt(req.params.launchvehicleid);
    const result = adminLaunchVehicleRetire(launchVehicleId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/mission/:missionid/launch', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
    const missionId = parseInt(req.params.missionid);
    const { launchVehicleId, payload, launchParameters } = req.body;
    const result = adminLaunchCreate(controlUserId, missionId, launchVehicleId, payload, launchParameters);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/mission/:missionid/launch/:launchid', (req: Request, res: Response) => {
  try {
    const controlUserId = getControlUserIdFromSessionId(req.headers.controlusersessionid as string);
    const missionId = parseInt(req.params.missionid);
    const launchId = parseInt(req.params.launchid);
    getMissionFromMissionId(missionId, controlUserId);
    const result = adminLaunchDetails(launchId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.put('/v1/admin/mission/:missionid/launch/:launchid/status', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
    const missionId = parseInt(req.params.missionid);
    getMissionFromMissionId(missionId, controlUserId);
    const { action } = req.body;
    const launchId = parseInt(req.params.launchid);
    const result = adminLaunchStatusUpdate(action, launchId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/launch/list', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
    const result = adminLaunchList(controlUserId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/mission/:missionid/launch/:launchid/allocate/:astronautid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const controlUserId = getControlUserIdFromSessionId(controlUserSessionId);
    const missionId = parseInt(req.params.missionid);
    const launchId = parseInt(req.params.launchid);
    const astronautId = parseInt(req.params.astronautid);
    getMissionFromMissionId(missionId, controlUserId);
    adminLaunchAllocateAstronaut(controlUserId, astronautId, missionId, launchId);
    res.json({});
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.delete('/v1/admin/mission/:missionid/launch/:launchid/allocate/:astronautid', (req: Request, res: Response) => {
  try {
    const controlUserSessionId = req.headers.controlusersessionid as string;
    const astronautId = parseInt(req.params.astronautid);
    const missionId = parseInt(req.params.missionid);
    const launchId = parseInt(req.params.launchid);
    adminLaunchDeallocateAstronaut(controlUserSessionId, astronautId, missionId, launchId);
    res.json({});
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.post('/v1/admin/astronaut/:astronautid/llmchat', (req: Request, res: Response) => {
  try {
    const astronautId = parseInt(req.params.astronautid);
    const messageRequest = req.body.messageRequest;
    const result = llmAstronautChat(astronautId, messageRequest);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/astronaut/:astronautid/llmchat', (req: Request, res: Response) => {
  try {
    const astronautId = parseInt(req.params.astronautid);
    const result = llmAstronautChatHistory(astronautId);
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

app.get('/v1/admin/payload/deployedList', (req: Request, res: Response) => {
  try {
    getControlUserIdFromSessionId(req.headers.controlusersessionid as string);
    const result = adminPayloadDeployedList();
    res.json(result);
  } catch (error) {
    res.status(error.status).json({ error: error.message });
  }
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
