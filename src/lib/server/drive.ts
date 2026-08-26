import { createServerFn } from "@tanstack/react-start";

type DriveResult = {
  ok: boolean;
  json: string | null;
  errorMessage?: string;
  loginRequired?: boolean;
  loginUrl?: string;
};

function pack(result: {
  ok: boolean;
  data: unknown;
  errorMessage?: string;
  loginRequired?: boolean;
  loginUrl?: string;
}): DriveResult {
  let json: string | null = null;
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
    loginUrl: result.loginUrl,
  };
}

export const searchDriveFiles = createServerFn({ method: "POST" })
  .validator((input: { query: string }) => input)
  .handler(async ({ data }): Promise<DriveResult> => {
    const { callTool } = await import("@/lib/app-data/client.server");
    const { ConnectorType, GoogleDriveTools } = await import("@/lib/app-data");
    const result = await callTool(
      GoogleDriveTools.search,
      { query: data.query || "pdf OR docx OR document" },
      { connectorType: ConnectorType.GoogleDrive },
    );
    return pack(result);
  });

export const readDriveFile = createServerFn({ method: "POST" })
  .validator((input: { fileId: string }) => input)
  .handler(async ({ data }): Promise<DriveResult> => {
    const { callTool } = await import("@/lib/app-data/client.server");
    const { ConnectorType, GoogleDriveTools } = await import("@/lib/app-data");
    const result = await callTool(
      GoogleDriveTools.readFile,
      { id: data.fileId, fileId: data.fileId },
      { connectorType: ConnectorType.GoogleDrive },
    );
    return pack(result);
  });
