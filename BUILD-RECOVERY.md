# Session deletion build recovery

The build log showed that the Host aggregate checker was reading stale workspace declaration outputs: the source already defines `SessionPersistence.delete`, `SessionController.delete`, `SessionDeleteRequest` / `SessionDeleteValue`, `SessionQueryEngine.forgetSession`, and `SessionProjectionCache.deleteSession`, but the aggregate checker still saw older declarations.

After applying this source tree, force-rebuild Host project references once before the normal build:

```bash
pnpm exec tsc -b tsconfig.host.json --force --pretty false
pnpm run build
```

The `sqlite.spec.ts` test was also corrected to call `ctx.sessionPersistence.delete(...)` on the service while retaining the `Fiber` returned by `ctx.plugin(TestPersistence)` only for disposal.

The previous log reported 9 of 10 build gates passing, including client compilation and web bundling. This environment did not have the repository's Node dependencies installed, so the forced TypeScript rebuild and complete build have not been executed here; rerun them on the development machine and share the new first failing diagnostic if any remain.
