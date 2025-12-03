# Allerths bageri backend

Backend system for the order system.

This document contains several useful sections:

1. Development instructions for setting up and working with the project locally.
2. Documentation, architecture, and motivations for why the backend is built the way it is.

---

## 1. Development instructions

### Setup your development env

Install [Node.js 22](https://nodejs.org/) and [pnpm 10](https://pnpm.io/).

```sh
git clone https://github.com/paccao/allerthsbageri.se.git && \
cd allerthsbageri.se/backend && \
pnpm i
```

#### Setup Env file

1. Make a copy of `.env.example` and name it `.env`.
2. Nothing else needed for the dev environment, modify as needed for other environments.

#### Run the backend

```sh
pnpm dev
```

You can now find the OpenAPI documentation at <http://localhost:3000/api/docs>, which is guaranteed to match the actual implementation thanks to our schema-based request and response validation.

Great job, you're now ready to start developing!

---

### Updating the DB schema during development

After modifying the DB schema, you need to apply the changes to the database. For simple DB schema updates, this is automatically handled automatically if you run `pnpm dev`.

For some changes, you need to apply the DB changes manually. Usually this happens when there's a risk for data loss.

During early development, we can push the DB schema changes and interactively resolve most issues.

> [!TIP]
> If you want to avoid data loss, you could find ways to copy the data over to the new schema. Though it's generally easier to just remove old inaccurate data and add new entries manually. Alternatively, you could consider extending the seeding data with more useful data for local development.

To start the interactive schema migration:

```sh
pnpm run db push
```

> [!NOTE]
> In the future, this workflow will be replaced by proper DB migrations, stored in Git together with the code and automatically run before app startup.

### How our tests work

We use the Node.js test runner (`node:test`) to run test suites in parallel. See the `test*` scripts in `package.json` for details. We also use a custom test reporter which only prints logs for failed tests, which makes the output much cleaner and easier to understand.

By default, each test suite will use its own in-memory SQLite database, keeping test suites independent from each other. This approach also improves performance by not writing to the filesystem, while avoiding SQLite deadlocks that would happen when using a file-based test database.

The tests can also override this default behaviour and create a real database on the filesystem at the start of a test.

### Run only specific tests

This is useful when implementing and testing a specific feature.

Starting simple, if you want to run a specific test suite with all test cases, you can use a glob pattern to match it:

```sh
pnpm test **/order.routes*.test.ts
```

However, if you only want to run a few specific test cases, you can do like this:

1. Add `suite.only()` and `test.only()` in the relevant test file(s) to register code for focused testing. This is required by the `node:test` runner.

2. Then you can run the selected tests:

```sh
pnpm test:only
```

You can also combine this with the watch mode:

```sh
pnpm test:only --watch
```

### Debugging the backend

1. Create a VS Code debug terminal.
2. Add code breakpoints.
3. In the debug terminal, start the backend with a command like `pnpm dev` or `pnpm test`

### Test GitHub workflow locally

1. Install [Docker rootless](https://docs.docker.com/engine/security/rootless/)
2. Install [nektos/act](https://github.com/nektos/act)
3. Run `act` to test GitHub workflows locally:

```sh
act --workflows ".github/workflows/test-backend.yaml" \
    --container-architecture linux/amd64 \
    -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:runner-24.04
```

### Upgrading dependencies

```sh
pnpm outdated
```

For each changed package, review the git diffs carefully for suspicious code that could introduce security vulnerabilities, and check the changelogs to see if we need to make changes. If everything looks alright, go ahead and update.

There are two approaches:

Ideally, update one specific package at a time

```sh
pnpm update <package>
```

Or, update all packages with new versions all at once. This should be used with caution, since it's easier to introduce breaking changes, bugs, or security vulnerabilities.

```sh
pnpm up
```

Before committing, test the changes locally and ensure everything works well. It's OK to update multiple dependencies in the same commit, but it's a good practice to review and install them one by one.

---

## 2. Documentation

This section describes how the backend is structured, and some of the reasoning behind its current design and implementation.

### Core technologies

- **TypeScript**
- **Node.js**
- **Fastify** - Minimal, simple, and performant web framework.
- **Zod** - Schema validation used in several parts of the system to increase data correctness.
- **Drizzle ORM** - SQL query builder with ORM features, migrations, and good TypeScript support.
- **SQLite** - Main database. Excellent choice for our primary use case: Small to medium scale commerce where simple tech and low hosting costs are more important than advanced features. However, we could pretty easily switch to Postgres in the future if we need to.

### Dependency injection (DI)

In order to decouple various parts of the backend, we use a minimal DI implementation to manage dependencies with enough flexibility for our needs. If we need more advanced features in the future, we could use the built-in features of Fastify, or switch to a DI framework. But for now, it's good to minimise the number of dependencies and avoid unnecessary complexity.

In our current implementation, we create one instance of all our dependencies in the dependency container which are shared for the entire app instance by default. They can be overridden for specific modules as needed.

For example, the app instance by default uses the same connection to the database, making the DB connection act like a singleton.

#### Best practices

When creating a function or class that expects the `DependencyContainer` as an argument, it's recommended to narrow the type with something like `Pick<DependencyContainer, 'db'>` to clearly document which dependencies are needed:

```ts
export function createSomeService({ db }: Pick<DependencyContainer, 'db'>) {
  // ...
}

// or

export class SomeService {
  constructor({ db }: Pick<DependencyContainer, 'db'>) {
    // ...
  }
}
```

By narrowing the type, and destructuring the expected dependencies, the code clearly communicates what it depends on. This also makes it possible to call the function or instantiate the class with partial dependencies, with TypeScript checking that we provide the expected dependencies.

---

### Codebase structure

#### Modules

We separate related backend logic into `modules`. Essentially this means one major feature or problem domain per module. Some modules only have a service, while others include more parts.

Modules are implemented in `src/modules/*` and contain the following types of files:

- **Schemas** - Defining the request- and response schemas, together with their related types. These schemas have two primary use cases:
  1. Parsing and validation of incoming API requests and outgoing responses, ensuring the data matches the expected format.
  2. Automatically generating OpenAPI documentation which is always in sync with the actual implementation. Having a shared source of truth like this greatly simplifies the collaboration between backend and frontend development, especially when the frontend uses an API client that infers TypeScript types from the OpenAPI schema. This ensures the frontend uses the correct shapes of requests, responses, and even API errors.

- **Routes** - Where API routes are defined. These need to be registered to be used by the application. Routes added to the `public` context become available for anyone, and routes added to the `authenticated` context require valid authentication. Fine-grained permissions and other forms of authorization should be implemented by separate plugins, or more commonly, in the controllers.

- **Controllers** - The business logic for responding to API requests. Try to keep them as small and simple as possible and move the database operations to the relevant services. However, for simple use cases, and when the business logic is not needed in other parts of the application, it's OK to keep the DB interactions in the controller and skip creating a dedicated service.

- **Services** - Reusable business logic that usually interacts with external services like databases. Only needs to be created when the business logic gets too complex to stay in the controller, or when the logic is needed in multiple places in the backend. By only creating services when needed, we can avoid unnecessary abstractions, letting simple one-off controllers keep their business logic in one place instead of just being a thin (and unnecessary) wrapper for a service.

- **Tests** - Right now, the most valuable kinds of backend tests are integration tests for modules that verify the API routes work as expected, including all other modules they use internally. We use the built-in Fastify HTTP injection to rapidly test with realistic conditions, but without the overhead of starting actual HTTP servers. Additional unit tests could be useful, but since integration tests gives the largest code coverage with minimal effort, they are more valuable to guarantee the API works as expected.

- **Plugins** - Fastify plugins, also known as middleware, are used to add additional functionality to specific routes. It's useful to group together all code related to the same problem domain in the same module, to make it easier to reason about and find what you are looking for.

#### Logger

The project uses a shared logger instance, accessible via the dependency container.

All logging related to the API and backend services should use the shared logger, to make it easy to adapt logs based on the environment, config and capture logs.

#### Configuration

In the `src/config/*` directory, we load all configuration centrally and use schemas for validation and type safety. This ensures the backend has a correct environment before starting, helping us catch potential errors. It's also a good place to document how to configure the backend.

---

## Design decisions

Motivations for why some features were implemented in a particular way.

### Customer orders

Customer fills in the pickup occasion, pick the products and go to the next page. They fill in their contact details and click order.
`POST /api/order` gets sent and creates the customer, order, and order item. No email verification or login required.
If a customer does not follow through with their order, the seller has to flag them manually, its not built into the system initially.
