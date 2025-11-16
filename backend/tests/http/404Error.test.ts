import request from "sync-request-curl"
import { port, url } from "../../src/config.json"

describe('404 Error Test', () => {
  test('404', () => {
    const res = request(
      'TRACE',
      `${url}:${port}`,
      {
        timeout: 5000
      }
    )
    expect(res.statusCode).toBe(404)
  })
})