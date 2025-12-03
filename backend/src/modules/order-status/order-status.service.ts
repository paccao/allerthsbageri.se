import { eq } from 'drizzle-orm'

import { orderStatusTable } from '#db/schema.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export class OrderStatusService {
  #db: DependencyContainer['db']
  log: DependencyContainer['log']

  constructor({ db, log }: Pick<DependencyContainer, 'db' | 'log'>) {
    this.#db = db
    this.log = log
  }

  async getOrderStatus(id: number) {
    const results = await this.#db
      .select()
      .from(orderStatusTable)
      .where(eq(orderStatusTable.id, id))

    return results[0]
  }

  async listOrderStatuses() {
    return await this.#db
      .select()
      .from(orderStatusTable)
      .where(eq(orderStatusTable.isDefault, true))
  }

  async getDefaultOrderStatus() {
    const defaultStatus = await this.#db
      .select()
      .from(orderStatusTable)
      .where(eq(orderStatusTable.isDefault, true))

    if (defaultStatus.length > 1) {
      // IDEA: use custom error to allow setting HTTP 500 status code
      throw new Error('More than one default order status found', {
        cause: { defaultStatus },
      })
    }

    if (defaultStatus[0]) {
      return defaultStatus[0]
    }

    throw new Error('No default order status found', {
      cause: { defaultStatus },
    })
  }

  /**
   * Get an order status and fallback to default if it does not exist or the id was missing
   */
  async getOrderStatusOrDefault(id?: number) {
    if (!id) return this.getDefaultOrderStatus()

    let orderStatus = await this.getOrderStatus(id)
    // IDEA: Give services access to the app logger even outside of controllers
    // This would make the API easier to debug since logs would be connected with specific requests
    this.log.warn(`orderStatus not found: ${id}. Falling back to default`)
    if (orderStatus) return orderStatus

    return this.getDefaultOrderStatus()
  }
}
