import { type PlatformProxy } from "wrangler";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.

type Env = {
    NODE_ENV: string;
    COOKIE_SECRET: string;
    DISCORD_CLIENT_SECRET: string;
    TWITTER_CLIENT_SECRET: string;
    GITHUB_CLIENT_SECRET: string;
};

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
    interface AppLoadContext {
        cloudflare: Cloudflare;
    }
}
