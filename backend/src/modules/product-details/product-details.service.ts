import { eq } from 'drizzle-orm'

import { productDetailsTable } from '#db/schema.ts'
import type { CreateProductDetailsBody } from './product-details.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'

// IDEA: Rename service methods to use common names like `get()`, `list()` and similar.
// Since we always call the methods for the service, we can make the code shorter without losing information.

export class ProductDetailsService {
  #db: DependencyContainer['db']

  constructor({ db }: Pick<DependencyContainer, 'db'>) {
    this.#db = db
  }

  async getProductDetails(id: number) {
    const results = await this.#db
      .select()
      .from(productDetailsTable)
      .where(eq(productDetailsTable.id, id))

    return results[0]
  }

  async listProductDetails() {
    return this.#db.select().from(productDetailsTable)
  }

  async createProductDetails({ ...data }: CreateProductDetailsBody) {
    const results = await this.#db
      .insert(productDetailsTable)
      .values({ ...data })
      .returning()

    return results[0]!
  }

  async updateProductDetails(
    id: number,
    data: Partial<typeof productDetailsTable.$inferInsert>,
  ) {
    const results = await this.#db
      .update(productDetailsTable)
      .set(data)
      .where(eq(productDetailsTable.id, id))
      .returning()

    return results[0]
  }
}
