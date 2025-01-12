import type { FastifyInstance } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { readFile } from 'fs/promises'
import { resolve } from 'path'

import openAPIConfig from '#config/openapi.ts'

/**
 * This context wraps all logic that should only be available during development
 */
export default async function developmentContext(app: FastifyInstance) {
  const swaggerUITitle = 'OpenAPI docs'
  const darkThemeFile = 'swagger-dark.css'

  const [darkTheme, apiVersion] = await Promise.all([
    readFile(resolve('static', darkThemeFile), 'utf-8'),
    readFile(resolve('package.json'), 'utf-8')
      .then(JSON.parse)
      .then((pkg: { version: string }) => pkg.version),
  ])

  app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.1',
      info: {
        title: swaggerUITitle,
        description: 'OpenAPI docs',
        version: apiVersion,
      },
      // IDEA: Maybe document how the session cookie works?
      // However, since it's HttpOnly, it doesn't make sense to test it out via the UI anyway
      // components: {
      //   securitySchemes: {
      //     cookieAuth: {
      //       type: 'apiKey',
      //       in: 'cookie',
      //       name: openAPIConfig.sessionCookieName,
      //     },
      //   },
      // },

      tags: Object.values(openAPIConfig.openAPITags),
    },
    transform: jsonSchemaTransform,
  })

  app.register(fastifySwaggerUI, {
    routePrefix: `/${openAPIConfig.openAPIPrefix}`,
    logLevel: 'silent',
    theme: {
      title: swaggerUITitle,
      css: [{ filename: darkThemeFile, content: darkTheme }],
    },
  })
}
