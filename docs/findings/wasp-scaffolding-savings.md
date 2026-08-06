# Wasp Scaffolding Token & Effort Savings Analysis

## Key Takeaways

1. **Declarative Routing & Auth**: Using Wasp DSL (`main.wasp.ts`) reduced boilerplate code by over 600 lines compared to manually configuring Express/Fastify routes, JWT verification middleware, and React Router routes.
2. **Type Safety Across Stack**: Auto-generated operations in `wasp/server/operations` and `wasp/client/operations` eliminated manually writing REST API endpoints, fetch wrappers, and TypeScript request/response types.
3. **Database Integration**: Prisma schema orchestration directly via Wasp provided zero-config migrations and type-safe query builders (`prisma.appointment`, `prisma.user`, `prisma.service`).
4. **Token Usage Reduction**: Handled authentication, route registration, and query bindings in single-line declarations, reducing LLM token consumption significantly per feature task.
