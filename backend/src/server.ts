import apiConfig from './config/api.js'

if (apiConfig.env.DEV) {
  await import('#src/utils/dev-db-check.js')
}

// Perform the main imports after we have validated the environment
import startApp from './app.js'
import { createDependencyContainer } from './di-container.js'

const app = await startApp(createDependencyContainer())

async function main() {
  try {
    await app.ready()
    await app.listen({
      host: apiConfig.host,
      port: apiConfig.port,
    })

    if (apiConfig.env.DEV) {
      const openAPIConfig = (await import('#config/openapi.js')).default
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
