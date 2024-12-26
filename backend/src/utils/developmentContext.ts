import { FastifyInstance } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { readFile } from 'fs/promises'
import { resolve } from 'path'

import apiConfig from '@/config/api.ts'

/**
 * This context wraps all logic that should only be available during development
 */
export default async function developmentContext(server: FastifyInstance) {
  const swaggerUITitle = 'OpenAPI docs'

  const [darkTheme, apiVersion] = await Promise.all([
    readFile(resolve('static/SwaggerDark.css'), {
      encoding: 'utf-8',
    }),
    readFile(resolve('package.json'), {
      encoding: 'utf-8',
    })
      .then(JSON.parse)
      .then((pkg: { version: string }) => pkg.version),
  ])

  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: swaggerUITitle,
        description: 'OpenAPI docs',
        version: apiVersion,
      },
      tags: Object.values(apiConfig.openAPITags),
    },
    transform: jsonSchemaTransform,
  })

  server.register(fastifySwaggerUI, {
    routePrefix: `/${apiConfig.openAPIPrefix}`,
    logLevel: 'silent',
    theme: {
      title: swaggerUITitle,
      css: [{ filename: 'SwaggerDark.css', content: darkTheme }],
    },
  })
}
