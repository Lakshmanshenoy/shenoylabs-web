"use client";

import React, { useEffect, useState, useRef } from "react";
import Toast from "../../../components/ui/Toast";

type FileItem = { filename: string; src: string };

export default function MediaAdminPage() {
  const [dir, setDir] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [directories, setDirectories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  type PrLog = { url: string; action: "upload" | "delete"; filename?: string; ts: number };
  const PR_LOG_KEY = "tina_media_pr_log";
  const [prLogs, setPrLogs] = useState<PrLog[]>([]);

  // load server-backed logs with localStorage fallback
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/media/prs", { headers: { "User-Agent": "Mozilla/5.0" } });
        if (res.ok) {
          const json = await res.json();
          if (mounted && Array.isArray(json?.logs)) {
            setPrLogs(json.logs);
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      // fallback to localStorage
      try {
        const raw = localStorage.getItem(PR_LOG_KEY);
        if (raw && mounted) setPrLogs(JSON.parse(raw));
      } catch (e) {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const addPrLog = (url: string, action: "upload" | "delete", filename?: string) => {
    const entry: PrLog = { url, action, filename, ts: Date.now() };
    setPrLogs((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      try {
        localStorage.setItem(PR_LOG_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    // try to persist server-side (best-effort)
    (async () => {
      try {
        await fetch("/api/media/prs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
      } catch (e) {
        // ignore failures — localStorage remains as fallback
      }
    })();
  };

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async (targetDir?: string) => {
    try {
      setLoading(true);
      setError(null);
      const path = targetDir ?? dir;
      const url = path ? `/media/list/${encodeURIComponent(path)}` : `/media/list`;
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || `Failed to fetch ${url}`);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setFiles(json.files || []);
      setDirectories(json.directories || []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (subdir: string) => {
    const newDir = dir ? `${dir}/${subdir}` : subdir;
    setDir(newDir);
    fetchList(newDir);
  };

  const handleDelete = async (filename: string) => {
    const ok = confirm(`Delete ${filename}? This will open a PR.`);
    if (!ok) return;
    try {
      setProcessingFile(filename);
      setError(null);
      setSuccess(null);
      setPrUrl(null);
      const path = dir ? `${dir}/${filename}` : filename;
      const res = await fetch(`/media/${encodeURIComponent(path)}`, { method: "DELETE", headers: { "User-Agent": "Mozilla/5.0" } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || `Delete failed`);
        return;
      }
      if (json?.pr?.url) {
        setSuccess("Delete PR created");
        setPrUrl(json.pr.url);
        addPrLog(json.pr.url, "delete", filename);
      } else {
        setSuccess("Delete committed");
      }
      // refresh
      fetchList();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setProcessingFile(null);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("No file selected");
      return;
    }
    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      setPrUrl(null);

      const form = new FormData();
      form.append("file", file);
      // include directory for server to place under public/<dir>
      if (dir) form.append("directory", dir);

      const path = dir ? `/media/upload/${encodeURIComponent(dir)}` : "/media/upload";
      const res = await fetch(path, { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || "Upload failed");
        return;
      }
      if (json?.pr?.url) {
        setSuccess("Upload PR created");
        setPrUrl(json.pr.url);
        addPrLog(json.pr.url, "upload", file.name);
      } else if (json?.src) {
        setSuccess("Uploaded");
      } else {
        setSuccess("Upload complete");
      }
      fetchList();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ marginBottom: 10 }}>Media Manager</h1>
      <div style={{ marginBottom: 12 }}>
        <input value={dir} onChange={(e) => setDir(e.target.value)} placeholder="directory (e.g. images)" />
        <button onClick={() => fetchList()} style={{ marginLeft: 8 }}>
          Refresh
        </button>
      </div>
      {loading && <div>Loading…</div>}

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        {directories.map((d) => (
          <button key={d} onClick={() => handleNavigate(d)} style={{ padding: "6px 10px" }}>
            {d}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <input ref={fileInputRef} type="file" />
        <button onClick={handleUpload} disabled={uploading} style={{ marginLeft: 8 }}>
          {uploading ? "Uploading…" : "Upload to current directory"}
        </button>
      </div>

      {(success || error) && (
        <Toast
          message={error ?? success ?? ""}
          type={error ? "error" : "success"}
          action={prUrl ? { href: prUrl, label: "View PR" } : undefined}
          onClose={() => {
            setError(null);
            setSuccess(null);
            setPrUrl(null);
          }}
        />
      )}

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8, fontSize: 15 }}>Recent PRs</h3>
        {prLogs.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No PRs yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {prLogs.map((l) => (
              <div key={l.url + String(l.ts)} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 13 }}>
                  <div style={{ color: "#111827", fontWeight: 600 }}>
                    {l.action === "upload" ? "Upload PR" : "Delete PR"}
                  </div>
                  <a href={l.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                    {l.url}
                  </a>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>{new Date(l.ts).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{l.filename ?? "—"}</div>
                </div>
              </div>
            ))}
            <div>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem(PR_LOG_KEY);
                  } catch (e) {}
                  setPrLogs([]);
                }}
                style={{ marginTop: 8 }}
              >
                Clear logs
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
        {files.map((f) => (
          <div key={f.filename} style={{ border: "1px solid #e5e7eb", padding: 8, borderRadius: 8 }}>
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.src} alt={f.filename} style={{ maxWidth: "100%", maxHeight: "100%" }} />
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13 }}>{f.filename}</div>
              <div>
                <button onClick={() => handleDelete(f.filename)} disabled={processingFile === f.filename || uploading} style={{ color: "#b91c1c" }}>
                  {processingFile === f.filename ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
