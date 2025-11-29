import { spec } from 'node:test/reporters'
import { type Stream, Transform } from 'node:stream'

/**
 * Custom test reporter for `node:test`
 *
 * Only output logs for failed tests to get cleaner test results and simplify debugging.
 *
 * Adapted from https://hobochild.com/posts/node-suppress-test-logs/
 */
class FailedTestsReporter extends Transform {
  specReporter: ReturnType<typeof spec>
  logs: unknown[]

  constructor() {
    super({ writableObjectMode: true })
    this.specReporter = new spec()
    this.logs = []
  }

  addToFailedLogs: Stream.TransformCallback = (_, data: unknown) => {
    this.logs.push(data)
  }

  _transform(
    event: { type: string; data: unknown },
    encoding: BufferEncoding,
    callback: Stream.TransformCallback,
  ) {
    switch (event.type) {
      case 'test:stderr':
      case 'test:stdout':
        // Save any output from the spec reporter internally
        this.logs.push(
          this.specReporter._transform(event, encoding, this.addToFailedLogs),
        )
        callback(null)
        break
      case 'test:pass':
        this.specReporter._transform(event, encoding, callback)
        this.logs = []
        break
      case 'test:fail':
        this.specReporter._transform(event, encoding, this.addToFailedLogs)
        // Only return logs if test failed
        callback(null, this.logs.join(''))
        this.logs = []
        break
      default:
        // Fall back to spec reporter for other events
        this.specReporter._transform(event, encoding, callback)
        break
    }
  }

  _flush(callback: Stream.TransformCallback) {
    this.specReporter._flush(callback)
  }
}

export default new FailedTestsReporter()
