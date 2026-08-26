const DB = "foliosyne";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface StoredFile {
  id: string;
  name: string;
  kind: "pdf" | "docx";
  bytes: ArrayBuffer;
  savedAt: number;
}

export async function putFile(file: StoredFile) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getFile(id: string): Promise<StoredFile | undefined> {
  const db = await openDb();
  const row = await new Promise<StoredFile | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as StoredFile | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return row;
}

export async function listFiles(): Promise<Omit<StoredFile, "bytes">[]> {
  const db = await openDb();
  const rows = await new Promise<StoredFile[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as StoredFile[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows
    .map(({ id, name, kind, savedAt }) => ({
      id,
      name,
      kind,
      savedAt,
      size: 0,
    }))
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, 8);
}

export async function listRecentMeta(): Promise<
  { id: string; name: string; kind: "pdf" | "docx"; size: number; savedAt: number }[]
> {
  const db = await openDb();
  const rows = await new Promise<StoredFile[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as StoredFile[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      kind: r.kind,
      size: r.bytes.byteLength,
      savedAt: r.savedAt,
    }))
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, 8);
}
