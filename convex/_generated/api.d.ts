/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiContext from "../aiContext.js";
import type * as aiNode from "../aiNode.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as knowledge from "../knowledge.js";
import type * as lib_auth from "../lib/auth.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiContext: typeof aiContext;
  aiNode: typeof aiNode;
  auth: typeof auth;
  chat: typeof chat;
  documents: typeof documents;
  http: typeof http;
  knowledge: typeof knowledge;
  "lib/auth": typeof lib_auth;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
