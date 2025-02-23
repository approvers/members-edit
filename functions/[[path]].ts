import { createPagesFunctionHandler } from "@react-router/cloudflare";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - the server build file is generated by `remix vite:build`
import * as build from "../build/server";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - the server build file is generated by `remix vite:build`
export const onRequest = createPagesFunctionHandler({ build });
