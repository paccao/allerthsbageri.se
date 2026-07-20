import { defineEnvVars } from '@sveltejs/kit/env'
import z from 'zod'

const optionalString = z.string().optional()

export const variables = defineEnvVars({
  /* ----------------------- PRIVATE ---------------------- */
  EMAIL: {
    description:
      'Plaintext email that should be encrypted before publishing to the website',
  },
  BACKEND_API_URL: {
    schema: z.string().default('http://localhost:3000'),
    description: 'API url for the core backend',
  },
  BFF_API_KEY: {
    schema: z.string().max(64),
    description: 'Should match with backend/.env',
  },
  KEYSTATIC_GITHUB_CLIENT_ID: {
    schema: optionalString,
    description: 'Keystatic CMS (Used by the GitHub app for OAuth)',
  },
  KEYSTATIC_GITHUB_CLIENT_SECRET: {
    schema: optionalString,
    description: 'Keystatic CMS (Used by the GitHub app for OAuth)',
  },
  KEYSTATIC_SECRET: {
    schema: optionalString,
    description: 'Used for Keystatic Cloud. https://keystatic.com/docs/cloud',
  },

  /* ----------------------- PUBLIC ---------------------- */
  PUBLIC_PASSWORD: {
    public: true,
    static: true,
    description: 'Password used to decrypt the email',
  },
  PUBLIC_PAYLOAD: {
    public: true,
    static: true,
    description: 'Output for the encrypted email',
  },
  PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: {
    public: true,
    schema: optionalString,
    description: 'Keystatic CMS GitHub app slug',
  },
})
