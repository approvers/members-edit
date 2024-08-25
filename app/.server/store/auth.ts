import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";
import {
    DISCORD_CLIENT_ID,
    GITHUB_CLIENT_ID,
    TWITTER_CLIENT_ID,
} from "./consts";

const cookieSecret = process.env.COOKIE_SECRET;
if (!cookieSecret) {
    throw new Error("COOKIE_SECRET was not set");
}
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
if (!discordClientSecret) {
    throw new Error("DISCORD_CLIENT_SECRET was not set");
}
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
if (!githubClientSecret) {
    throw new Error("GITHUB_CLIENT_SECRET was not set");
}
const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;
if (!twitterClientSecret) {
    throw new Error("TWITTER_CLIENT_SECRET was not set");
}

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "edit.members.approvers.dev",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: [cookieSecret],
        secure: process.env.NODE_ENV === "production",
    },
});

const urlBase =
    process.env.NODE_ENV === "production"
        ? "https://edit.members.approvers.dev"
        : "http://localhost:3000";

export type Member = {
    discordToken: string;
    discordId: string;
};
export const authenticator = new Authenticator<Member>(sessionStorage);

authenticator.use(
    new OAuth2Strategy(
        {
            clientId: DISCORD_CLIENT_ID,
            clientSecret: discordClientSecret,
            authorizationEndpoint: "https://discord.com/oauth2/authorize",
            tokenEndpoint: "https://discord.com/api/v10/oauth2/token",
            redirectURI: new URL("/redirect", urlBase),
            tokenRevocationEndpoint:
                "https://discord.com/api/v10/oauth2/token/revoke",
            codeChallengeMethod: "S256",
            scopes: ["identify", "guilds.members.read"],
            authenticateWith: "request_body",
        },
        async ({ tokens }) => {
            const discordMeRes = await fetch(
                "https://discord.com/api/v10/users/@me",
                {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                    },
                },
            );
            const { id: discordId } = await discordMeRes.json<{ id: string }>();
            return {
                discordToken: tokens.access_token,
                discordId,
            };
        },
    ),
    "discord-oauth",
);

export type GitHubAssociation = {
    id: string;
    name: string;
};
export const githubAssocAuthenticator = new Authenticator<GitHubAssociation>(
    sessionStorage,
);

githubAssocAuthenticator.use(
    new OAuth2Strategy(
        {
            clientId: GITHUB_CLIENT_ID,
            clientSecret: githubClientSecret,
            authorizationEndpoint: "https://github.com/login/oauth/authorize",
            tokenEndpoint: "https://github.com/login/oauth/access_token",
            redirectURI: new URL("/dashboard/redirect-github", urlBase),
            codeChallengeMethod: "S256",
            authenticateWith: "request_body",
        },
        async ({ tokens }) => {
            const res = await fetch("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            });
            const { id, login } = await res.json<{
                id: number;
                login: string;
            }>();
            return { type: "github", id: id.toString(), name: login };
        },
    ),
    "github-oauth",
);

export type TwitterAssociation = {
    id: string;
    name: string;
};
export const twitterAssocAuthenticator = new Authenticator<TwitterAssociation>(
    sessionStorage,
);
twitterAssocAuthenticator.use(
    new OAuth2Strategy(
        {
            clientId: TWITTER_CLIENT_ID,
            clientSecret: twitterClientSecret,
            authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
            tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
            redirectURI: new URL("/dashboard/redirect-twitter", urlBase),
            scopes: ["tweet.read", "users.read"],
            codeChallengeMethod: "S256",
            authenticateWith: "http_basic_auth",
        },
        async ({ tokens }) => {
            const params = new URLSearchParams({
                "user.fields": "id,username",
            });
            const meRes = await fetch(
                "https://api.twitter.com/2/users/me?" + params,
                {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                    },
                },
            );
            const { id, username: name } = await meRes.json<{
                id: string;
                username: string;
            }>();
            return { type: "twitter", id, name };
        },
    ),
    "twitter-oauth",
);
