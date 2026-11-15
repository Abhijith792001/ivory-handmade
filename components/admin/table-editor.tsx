"use client";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { adminFetch, adminUpload } from "./api";
import { cn, formatINR } from "@/lib/utils";

export type FieldType = "text" | "number" | "textarea" | "bool" | "select" | "tags" | "images" | "image" | "glb" | "json" | "color";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  help?: string;
  /** Show this column in the list view */
  list?: boolean;
  money?: boolean;
}

type Row = Record<string, unknown> & { id?: string };

function FileButton({ accept, onFile, label }: { accept: string; onFile: (f: File) => Promise<void>; label: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brown/20 px-3 py-1.5 text-[13px] hover:bg-ivory">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {label}
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            await onFile(f);
          } catch (err) {
            alert(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
    </label>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${field.key}`;
  switch (field.type) {
    case "textarea":
      return <Textarea id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <Input id={id} type="number" step="any" value={value == null ? "" : String(value)} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />;
    case "bool":
      return <input id={id} type="checkbox" className="h-5 w-5 accent-[#6E7F52]" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
    case "select":
      return (
        <Select id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      );
    case "tags":
      return (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => {
            const arr = (value as string[]) ?? [];
            const on = arr.includes(o.value);
            return (
              <button
                type="button"
                key={o.value}
                onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                className={cn("rounded-full border px-3 py-1 text-[13px]", on ? "border-sage bg-sage-dark text-ivory" : "border-brown/20")}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      );
    case "color":
      return (
        <div className="flex items-center gap-3">
          <input type="color" value={(value as string) || "#ffffff"} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 rounded" aria-label={field.label} />
          <Input id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className="max-w-[140px]" />
        </div>
      );
    case "images": {
      const arr = (value as string[]) ?? [];
      return (
        <div>
          <div className="flex flex-wrap gap-2">
            {arr.map((src, i) => (
              <div key={src + i} className="relative h-20 w-20 overflow-hidden rounded-xl bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => onChange(arr.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-ivory/90 p-0.5" aria-label="Remove image">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <FileButton accept="image/*" label="Add image" onFile={async (f) => onChange([...arr, await adminUpload(f)])} />
          </div>
        </div>
      );
    }
    case "image":
    case "glb":
      return (
        <div className="flex flex-wrap items-center gap-3">
          {field.type === "image" && value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value as string} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : null}
          <Input id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder="URL" className="max-w-xs" />
          <FileButton accept={field.type === "glb" ? ".glb" : "image/*"} label="Upload" onFile={async (f) => onChange(await adminUpload(f))} />
        </div>
      );
    case "json":
      return <JsonInput value={value} onChange={onChange} />;
    default:
      return <Input id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

function JsonInput({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? [], null, 2));
  const [err, setErr] = useState(false);
  return (
    <div>
      <Textarea
        className={cn("min-h-[140px] font-mono text-[13px]", err && "border-destructive")}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setErr(false);
          } catch {
            setErr(true);
          }
        }}
      />
      {err && <p className="mt-1 text-[13px] text-destructive">Invalid JSON</p>}
    </div>
  );
}

export function TableEditor({ table, title, fields, defaults = {}, idPrefix }: { table: string; title: string; fields: Field[]; defaults?: Row; idPrefix?: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { rows } = await adminFetch<{ rows: Row[] }>(`/api/admin/${table}`);
      setRows(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [table]);
  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editing) return;
    for (const f of fields) if (f.required && (editing[f.key] == null || editing[f.key] === "")) return setError(`${f.label} is required`);
    setSaving(true);
    setError(null);
    try {
      const row = { ...editing };
      if (!row.id && idPrefix) row.id = `${idPrefix}-${Math.random().toString(36).slice(2, 8)}`;
      await adminFetch(`/api/admin/${table}`, { method: "POST", body: JSON.stringify(row) });
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete "${row.name ?? row.label ?? row.id}"? This can't be undone.`)) return;
    try {
      await adminFetch(`/api/admin/${table}?id=${encodeURIComponent(String(row.id))}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const listFields = fields.filter((f) => f.list);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl">{title}</h2>
        <Button size="sm" onClick={() => setEditing({ ...defaults })}>
          <Plus /> Add
        </Button>
      </div>
      {error && !editing && <p className="mb-4 text-[17px] text-destructive">{error}</p>}
      {loading ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-sage-dark" />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-ivory/70 ring-1 ring-brown/10">
          <table className="w-full text-left text-[13px]">
            <thead className="label border-b border-brown/10 text-[13px]">
              <tr>
                {listFields.map((f) => (
                  <th key={f.key} className="px-4 py-3 font-normal">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={String(r.id)} className="border-b border-brown/5 last:border-0 hover:bg-cream/50">
                  {listFields.map((f) => (
                    <td key={f.key} className="px-4 py-3">
                      {f.type === "bool" ? (r[f.key] ? "Yes" : "No") : f.type === "color" ? <span className="inline-block h-5 w-5 rounded-full ring-1 ring-brown/20" style={{ background: String(r[f.key]) }} /> : f.money ? formatINR(Number(r[f.key])) : f.type === "images" ? `${(r[f.key] as string[])?.length ?? 0} photos` : f.type === "select" ? f.options?.find((o) => o.value === r[f.key])?.label ?? String(r[f.key] ?? "") : String(r[f.key] ?? "")}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button onClick={() => setEditing({ ...r })} className="rounded-full p-2 hover:bg-cream" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(r)} className="rounded-full p-2 text-destructive/80 hover:bg-cream" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={listFields.length + 1} className="px-4 py-10 text-center text-muted">
                    Nothing here yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brown/30 p-4 py-10 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Edit ${title}`}>
          <div className="paper w-full max-w-2xl rounded-3xl p-6 shadow-lift sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-2xl">{editing.id ? "Edit" : "New"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-full p-2 hover:bg-ivory" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-5">
              {fields.map((f) => (
                <div key={f.key} className={f.type === "bool" ? "flex items-center justify-between" : ""}>
                  <Label htmlFor={`f-${f.key}`} className={f.type === "bool" ? "mb-0" : ""}>
                    {f.label}
                    {f.required && " *"}
                  </Label>
                  <FieldInput field={f} value={editing[f.key]} onChange={(v) => setEditing((e) => ({ ...e!, [f.key]: v }))} />
                  {f.help && <p className="mt-1 text-[13px] text-muted">{f.help}</p>}
                </div>
              ))}
            </div>
            {error && <p className="mt-4 text-[17px] text-destructive">{error}</p>}
            <div className="mt-8 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="animate-spin" />} Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
