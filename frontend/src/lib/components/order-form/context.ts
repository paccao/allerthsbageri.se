import { createContext } from 'svelte'
import type { OrderState } from './order-state.svelte'

export const [getOrderContext, setOrderContext] = createContext<OrderState>()
