// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.

declare module "react-router" {
    interface AppLoadContext {
        cloudflare: { env: Env; ctx: ExecutionContext };
    }
}
