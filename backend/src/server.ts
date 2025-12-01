import startApp from './app.ts'
import apiConfig from './config/api.ts'
import openAPIConfig from '#config/openapi.ts'
import { createDependencyContainer } from './di-container.ts'

const app = await startApp(createDependencyContainer())

async function main() {
  try {
    await app.ready()
    await app.listen({
      host: apiConfig.host,
      port: apiConfig.port,
    })

    if (apiConfig.env.DEV) {
      app.log.info(
        `OpenAPI docs served at http://${apiConfig.host}:${apiConfig.port}/${openAPIConfig.prefix}`,
      )
    }
  } catch (e) {
    app.log.error(e)
    process.exit(1)
  }
}

await main()
