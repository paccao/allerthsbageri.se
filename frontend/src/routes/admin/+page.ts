import { error } from '@sveltejs/kit'

// TODO: Replace this check and make the admin routes into properly auth-protected routes
export const load = async () => {
  if (!import.meta.env.DEV) {
    error(404)
  }
}
