import initServer from './server.ts'
import { db } from '@/db/index.ts'
import apiConfig from './config/api.ts'

const app = await initServer()

async function main() {
  try {
    await app.ready()
    await app.listen({
      host: apiConfig.host,
      port: apiConfig.port,
    })

    if (apiConfig.env.DEV) {
      app.log.info(
        `OpenAPI docs served at http://${apiConfig.host}:${apiConfig.port}/${apiConfig.openAPIPrefix}`,
      )
    }
  } catch (e) {
    app.log.error(e)
    process.exit(1)
  }
}

main()
  .catch(app.log.error)
  .finally(() => {
    db.$client.close()
  })
