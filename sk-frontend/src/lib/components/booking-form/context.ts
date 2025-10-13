import { Context } from 'runed'
import type { BookingState } from './booking.svelte'

export const bookingContext = new Context<BookingState>('booking')
