import { createContext } from 'svelte'
import type { BookingState } from './booking.svelte'

export const [getBookingContext, setBookingContext] =
  createContext<BookingState>()
