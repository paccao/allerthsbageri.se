import { eq } from 'drizzle-orm'

import { pickupOccasionTable } from '#db/schema.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export class PickupOccasionService {
  #db: DependencyContainer['db']

  constructor({ db }: Pick<DependencyContainer, 'db'>) {
    this.#db = db
  }

  async getPickupOccasion(id: number) {
    const results = await this.#db
      .select()
      .from(pickupOccasionTable)
      .where(eq(pickupOccasionTable.id, id))

    return results[0]
  }

  async listPickupOccasions() {
    return this.#db.select().from(pickupOccasionTable)
  }

  async createPickupOccasion({
    orderStart,
    orderEnd,
    pickupStart,
    pickupEnd,
    ...data
  }: Pick<typeof pickupOccasionTable.$inferInsert, 'name' | 'location'> & {
    orderStart: Date
    orderEnd: Date
    pickupStart: Date
    pickupEnd: Date
  }) {
    const results = await this.#db
      .insert(pickupOccasionTable)
      .values({
        ...data,
        orderStart: orderStart.toISOString(),
        orderEnd: orderEnd.toISOString(),
        pickupStart: pickupStart.toISOString(),
        pickupEnd: pickupEnd.toISOString(),
      })
      .returning()

    return results[0]!
  }

  async updatePickupOccasion(
    id: number,
    data: Partial<typeof pickupOccasionTable.$inferInsert>,
  ) {
    const results = await this.#db
      .update(pickupOccasionTable)
      .set(data)
      .where(eq(pickupOccasionTable.id, id))
      .returning()

    return results[0]
  }
}
