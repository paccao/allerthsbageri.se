import { eq } from 'drizzle-orm'

import { customerTable } from '#db/schema.ts'
import type { DependencyContainer } from '#src/di-container.ts'

// IDEA: Maybe rename methods to follow a common pattern like the following?
// customerService.create(data)
// customerService.list()
// customerService.get(id)
// customerService.update(id, data)
// customerService.delete(id)
// customerService.getOrCreate(data)

// We could use a similar pattern in other services too
// Maybe also for controllers, simplifying the handlers

export class CustomerService {
  #db: DependencyContainer['db']

  constructor({ db }: Pick<DependencyContainer, 'db'>) {
    this.#db = db
  }

  async createCustomer(data: typeof customerTable.$inferInsert) {
    const [customer] = await this.#db
      .insert(customerTable)
      .values(data)
      .returning()

    return customer!
  }

  listCustomers() {
    return this.#db.select().from(customerTable)
  }

  async getCustomer(id: number) {
    const results = await this.#db
      .select()
      .from(customerTable)
      .where(eq(customerTable.id, id))

    return results[0]
  }

  async updateCustomer(
    id: number,
    data: Partial<typeof customerTable.$inferInsert>,
  ) {
    const results = await this.#db
      .update(customerTable)
      .set(data)
      .where(eq(customerTable.id, id))
      .returning()

    return results[0]
  }

  async deleteCustomer(id: number) {
    await this.#db.delete(customerTable).where(eq(customerTable.id, id))
  }

  async getOrCreateCustomer(
    data: Omit<typeof customerTable.$inferInsert, 'id'>,
  ) {
    let [customer] = await this.#db
      .select()
      .from(customerTable)
      .where(eq(customerTable.phone, data.phone))

    if (customer) {
      return customer
    }

    return this.createCustomer(data)
  }
}
