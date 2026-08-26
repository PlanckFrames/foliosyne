import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/translate-5c4IzWvP.js
var LANG_NAMES = {
	en: "English",
	es: "Spanish",
	fr: "French",
	de: "German",
	pt: "Portuguese",
	it: "Italian",
	ja: "Japanese",
	zh: "Simplified Chinese",
	ko: "Korean",
	ar: "Arabic",
	hi: "Hindi",
	nl: "Dutch",
	ru: "Russian"
};
var translateDocumentText_createServerFn_handler = createServerRpc({
	id: "11be0401cd8211b14c08ac491e05df6a570c09aec92533fc1c553c503b7bcd45",
	name: "translateDocumentText",
	filename: "src/lib/server/translate.ts"
}, (opts) => translateDocumentText.__executeServer(opts));
var translateDocumentText = createServerFn({ method: "POST" }).validator((input) => input).handler(translateDocumentText_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const text = data.text.slice(0, 12e3);
	const target = LANG_NAMES[data.targetLang] ?? data.targetLang;
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 3500,
			temperature: .2,
			messages: [{
				role: "system",
				content: "You translate documents. Return only the translation, preserving paragraph breaks. No preface."
			}, {
				role: "user",
				content: `Translate the following into ${target}:\n\n${text}`
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI API error ${res.status}`
	};
	return {
		ok: true,
		text: (await res.json()).choices?.[0]?.message?.content ?? ""
	};
});
//#endregion
export { translateDocumentText_createServerFn_handler };
