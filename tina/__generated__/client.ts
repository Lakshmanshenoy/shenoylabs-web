import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
import tinaConfig from "../config";
import matter from "gray-matter";

const client = createClient({ url: "http://localhost:4001/graphql", token: "", queries });

// Ensure media store uses this app's origin for media endpoints when running in the browser
if (typeof window !== "undefined") {
	try {
		// contentApiUrl is only used by the media store to determine an origin. Keep the existing api url for GraphQL.
		(client as any).contentApiUrl = window.location.origin + "/api/tina";
	} catch (e) {
		// ignore
	}
}

const pending: Array<{ path: string; content: string }> = [];

const getCollection = (name: string) => {
	try {
		return tinaConfig?.schema?.collections?.find((c: any) => c.name === name);
	} catch (e) {
		return undefined;
	}
};

const ensureExt = (fmt: string | undefined) => {
	if (!fmt) return ".md";
	return fmt.startsWith(".") ? fmt : `.${fmt}`;
};

const joinPath = (...parts: string[]) =>
	parts
		.filter(Boolean)
		.map((p) => p.replace(/^\/+|\/+$/g, ""))
		.join("/");

const wrapRequest = (obj: any) => {
	if (!obj || typeof obj.request !== "function") return;
	const original = obj.request.bind(obj);
	obj.request = async (query: any, options?: any) => {
		try {
			const qStr = typeof query === "string" ? query : (query && query.loc && query.loc.source && query.loc.source.body) || "";
			if (typeof qStr === "string" && (qStr.includes("createDocument(") || qStr.includes("updateDocument("))) {
				const vars = (options && options.variables) || {};
				const collectionName = vars.collection;
				const relativePath = vars.relativePath;
				const params = vars.params;
				if (collectionName && relativePath && params) {
					const collection = getCollection(collectionName);
					const format = ensureExt(collection?.format);
					const filePath = joinPath(collection?.path || "", relativePath);
					try {
						let content = "";
						if (format === ".json") {
							content = JSON.stringify(params, null, 2);
						} else {
							const { $_body, body, _template, _relativePath, _keepTemplateKey, _id, _collection, ...rest } = params || {};
							const meta = { ...rest };
							if (_template) meta._template = _template;
							const bodyStr = $_body ?? body ?? "";
							// gray-matter stringify
							// @ts-ignore
							content = matter.stringify(bodyStr, meta);
						}
						pending.push({ path: filePath, content });
					} catch (e) {
						console.error("cms: stringifyFile failed", e);
					}
				}
			}
		} catch (e) {
			console.error("cms: request wrapper error", e);
		}
		return original(query, options);
	};
};

wrapRequest(client);
if ((client as any).api) wrapRequest((client as any).api);

const postTreePR = async (opts: { baseBranch?: string; branch?: string; title?: string } = {}) => {
	const commitMessage = opts.title || "TinaCMS changes";
	const prTitle = opts.title || "TinaCMS changes";
	const body = {
		changes: pending.map((p) => ({ path: p.path, content: p.content })),
		commitMessage,
		prTitle,
		baseBranch: opts.baseBranch,
		branchName: opts.branch,
	};
	const res = await fetch("/api/tina/github/tree", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Tina cms createPullRequest failed: ${res.status} ${text}`);
	}
	const json = await res.json();
	pending.length = 0;
	return json;
};

// Override createPullRequest where it might appear
try {
	if (typeof (client as any).createPullRequest === "function") {
		(client as any).createPullRequest = async (args: any) => postTreePR({ baseBranch: args?.baseBranch, branch: args?.branch, title: args?.title });
	}
	if ((client as any).api && typeof (client as any).api.createPullRequest === "function") {
		(client as any).api.createPullRequest = async (args: any) => postTreePR({ baseBranch: args?.baseBranch, branch: args?.branch, title: args?.title });
	}
	if ((client as any).api?.tina && typeof (client as any).api.tina.createPullRequest === "function") {
		(client as any).api.tina.createPullRequest = async (args: any) => postTreePR({ baseBranch: args?.baseBranch, branch: args?.branch, title: args?.title });
	}
} catch (e) {
	console.error("cms: createPullRequest override failed", e);
}

export { client };
export default client;
  