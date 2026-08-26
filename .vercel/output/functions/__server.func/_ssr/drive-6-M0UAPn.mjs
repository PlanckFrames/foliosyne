import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/drive-6-M0UAPn.js
function pack(result) {
	let json = null;
	try {
		json = result.data == null ? null : JSON.stringify(result.data);
	} catch {
		json = null;
	}
	return {
		ok: result.ok,
		json,
		errorMessage: result.errorMessage,
		loginRequired: result.loginRequired,
		loginUrl: result.loginUrl
	};
}
var searchDriveFiles_createServerFn_handler = createServerRpc({
	id: "f1aca2be139248f5ec7cee55bc3924e7833c0f67726a4561980fcf7dbdcf4b04",
	name: "searchDriveFiles",
	filename: "src/lib/server/drive.ts"
}, (opts) => searchDriveFiles.__executeServer(opts));
var searchDriveFiles = createServerFn({ method: "POST" }).validator((input) => input).handler(searchDriveFiles_createServerFn_handler, async ({ data }) => {
	const { callTool } = await import("./client.server-B1C62ED2.mjs");
	const { ConnectorType, GoogleDriveTools } = await import("./app-data-E4J9fKCn.mjs");
	return pack(await callTool(GoogleDriveTools.search, { query: data.query || "pdf OR docx OR document" }, { connectorType: ConnectorType.GoogleDrive }));
});
var readDriveFile_createServerFn_handler = createServerRpc({
	id: "5c1453c38c9410f20b2343c4347b4a9f22bfc9979c4388bb9f2225ba388b7772",
	name: "readDriveFile",
	filename: "src/lib/server/drive.ts"
}, (opts) => readDriveFile.__executeServer(opts));
var readDriveFile = createServerFn({ method: "POST" }).validator((input) => input).handler(readDriveFile_createServerFn_handler, async ({ data }) => {
	const { callTool } = await import("./client.server-B1C62ED2.mjs");
	const { ConnectorType, GoogleDriveTools } = await import("./app-data-E4J9fKCn.mjs");
	return pack(await callTool(GoogleDriveTools.readFile, {
		id: data.fileId,
		fileId: data.fileId
	}, { connectorType: ConnectorType.GoogleDrive }));
});
//#endregion
export { readDriveFile_createServerFn_handler, searchDriveFiles_createServerFn_handler };
