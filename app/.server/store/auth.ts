import { Authenticator } from "remix-auth";
import { GitHubStrategy } from "remix-auth-github";
import { OAuth2Strategy } from "remix-auth-oauth2";

import {
    DISCORD_CLIENT_ID,
    GITHUB_CLIENT_ID,
    TWITTER_CLIENT_ID,
} from "./consts";

const urlBase = (mode: string) =>
    mode === "production"
        ? "https://edit.members.approvers.dev"
        : "http://localhost:3000";

export type Member = {
    discordToken: string;
    discordId: string;
};
export const getAuthenticator = (discordClientSecret: string, mode: string) => {
    const authenticator = new Authenticator<Member>();
    authenticator.use(
        new OAuth2Strategy(
            {
                clientId: DISCORD_CLIENT_ID,
                clientSecret: discordClientSecret,
                authorizationEndpoint: "https://discord.com/oauth2/authorize",
                tokenEndpoint: "https://discord.com/api/v10/oauth2/token",
                redirectURI: new URL("/redirect", urlBase(mode)),
                tokenRevocationEndpoint:
                    "https://discord.com/api/v10/oauth2/token/revoke",
                scopes: ["identify", "guilds.members.read"],
            },
            async ({ tokens }) => {
                const discordMeRes = await fetch(
                    "https://discord.com/api/v10/users/@me",
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken()}`,
                        },
                    },
                );
                const { id: discordId } = (await discordMeRes.json()) as {
                    id: string;
                };
                return {
                    discordToken: tokens.accessToken(),
                    discordId,
                };
            },
        ),
        "discord-oauth",
    );
    return authenticator;
};

export type GitHubAssociation = {
    id: string;
    name: string;
};
const fetchGitHubUser = async (
    accessToken: string,
): Promise<GitHubAssociation> => {
    const res = await fetch("https://api.github.com/user", {
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });
    const { id, login, name } = (await res.json()) as {
        id: number;
        login: string;
        name: string | null;
    };
    return {
        id: id.toString(),
        name: name ?? login,
    };
};
export const getGithubAssocAuthenticator = (
    githubClientSecret: string,
    mode: string,
) => {
    const assocAuthenticator = new Authenticator<GitHubAssociation>();

    assocAuthenticator.use(
        new GitHubStrategy(
            {
                clientId: GITHUB_CLIENT_ID,
                clientSecret: githubClientSecret,
                redirectURI: new URL(
                    "/dashboard/redirect-github",
                    urlBase(mode),
                ),
            },
            ({ tokens }) => fetchGitHubUser(tokens.accessToken()),
        ),
        "github-oauth",
    );
    return assocAuthenticator;
};

export type TwitterAssociation = {
    id: string;
    name: string;
};
export const getTwitterAssocAuthenticator = (
    twitterClientSecret: string,
    mode: string,
) => {
    const assocAuthenticator = new Authenticator<TwitterAssociation>();
    assocAuthenticator.use(
        new OAuth2Strategy(
            {
                clientId: TWITTER_CLIENT_ID,
                clientSecret: twitterClientSecret,
                authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
                tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
                redirectURI: new URL(
                    "/dashboard/redirect-twitter",
                    urlBase(mode),
                ),
                scopes: ["tweet.read", "users.read"],
            },
            async ({ tokens }) => {
                const params = new URLSearchParams({
                    "user.fields": "id,username",
                });
                const meRes = await fetch(
                    `https://api.twitter.com/2/users/me?${params}`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken()}`,
                        },
                    },
                );
                if (!meRes.ok) {
                    console.log(await meRes.text());
                    throw new Error("failed getting twitter account");
                }
                const json = (await meRes.json()) as {
                    data: { id: string; username: string };
                };
                const {
                    data: { id, username: name },
                } = json;
                return { id, name };
            },
        ),
        "twitter-oauth",
    );
    return assocAuthenticator;
};
