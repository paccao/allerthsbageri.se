import { error } from '@sveltejs/kit'

export const load = async () => {
  if (!import.meta.env.DEV) {
    error(404)
  }
}
