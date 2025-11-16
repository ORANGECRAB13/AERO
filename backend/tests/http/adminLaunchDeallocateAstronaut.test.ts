import { missionLaunchAction } from "../../src/interfaces";
import { validLaunchParameters, validPayloads } from "../../src/testSamples";
import { adminLaunchAllocateAstronautRequest, adminLaunchCreateRequest, adminLaunchStatusUpdateRequest, adminMissionAssignAstronautRequest, adminRemoveAstronautfromLaunchRequest, clearRequest, createAstronauts, createLaunchVehicles, createMissions, registerUsers } from "./requestHelpers";

const ERROR = { error: expect.any(String) };

describe('DELETE /v1/admin/mission/:missionid/launch/:launchid/allocate/:astronautid', () => {
    let sid: string
    let aid: number
    let mid: number
    let lid: number
    let lvid: number
    beforeEach(() => {
        clearRequest();
        [sid] = registerUsers('user1');
        [aid] = createAstronauts(sid, 1);
        [mid] = createMissions(sid, 1);
        [lvid] = createLaunchVehicles(sid, 1);
        adminMissionAssignAstronautRequest(sid, mid, aid);
        const payload = validPayloads[1];
        const launchParams = validLaunchParameters[1];
        lid = adminLaunchCreateRequest(sid, mid, lvid, payload, launchParams).result.launchId
    })
    describe('401 response', () => {
        test('controlUsersessionid is invalid', () => {
            const res = adminRemoveAstronautfromLaunchRequest(sid + 's', aid, mid, lid);
            expect(res.result).toStrictEqual(ERROR);
            expect(res.statusCode).toBe(401)
        })
    })
    describe('403 response', () => {
        test('the specified missionid does not exist', () => {
            adminLaunchAllocateAstronautRequest(sid, mid, lid, aid);
            const res = adminRemoveAstronautfromLaunchRequest(sid, aid, mid + 1, lid);
            expect(res.result).toStrictEqual(ERROR);
            expect(res.statusCode).toBe(403)
        })
        test('control user is not the owner of the mission', () => {
            let [sid2] = registerUsers('user2');
            const res = adminRemoveAstronautfromLaunchRequest(sid2, aid, mid, lid);
            expect(res.result).toStrictEqual(ERROR);
            expect(res.statusCode).toBe(403)
        })
    })
    describe('400 response', () => {
        test('astronaut is invalid', () => {
            const res = adminRemoveAstronautfromLaunchRequest(sid, aid + 1, mid, lid);
            expect(res.result).toStrictEqual(ERROR);
            expect(res.statusCode).toBe(400)
        })
        test('The astronaut not allocated to this launch', () => {
            const res = adminRemoveAstronautfromLaunchRequest(sid, aid, mid, lid);
            expect(res.result).toStrictEqual(ERROR);
            expect(res.statusCode).toBe(400)
        })
        test('launchid is invalid', () => {
            const res = adminRemoveAstronautfromLaunchRequest(sid, aid, mid, lid + 1);
            expect(res.result).toStrictEqual(ERROR);
            expect(res.statusCode).toBe(400)
        })
        test('The launch has started and is still in progress(launch state is not READY_TO_LAUNCH or ON_EARTH)', () => {
            adminLaunchAllocateAstronautRequest(sid, mid, lid, aid)
            adminLaunchStatusUpdateRequest(sid, mid, lid, missionLaunchAction.LIFTOFF)
            const res = adminRemoveAstronautfromLaunchRequest(sid, aid, mid, lid);
            expect(res.result).toStrictEqual(ERROR);
            expect(res.statusCode).toBe(400)
        })
    })
    describe('success cases', () => {
        beforeEach(() => adminLaunchAllocateAstronautRequest(sid, mid, lid, aid))
        test('the launch is READY_TO_LAUNCH', () => {
            const res = adminRemoveAstronautfromLaunchRequest(sid, aid, mid, lid);
            expect(res.result).toStrictEqual({});
        })
        // test('the launch is ON_EARTH', () => {
        //     adminLaunchStatusUpdateRequest(sid, mid, lid, missionLaunchAction.LIFTOFF);
        //     adminLaunchStatusUpdateRequest(sid, mid, lid, missionLaunchAction.FAULT);
        //     adminLaunchStatusUpdateRequest(sid, mid, lid, missionLaunchAction.RETURN);
        //     const res = adminRemoveAstronautfromLaunchRequest(sid, aid, mid, lid);
        //     expect(res.result).toStrictEqual({});
        // })
    })
})