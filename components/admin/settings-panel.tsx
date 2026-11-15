"use client";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { adminFetch } from "./api";

interface Values {
  mat_price: number;
  engraving_price: number;
  note_card_price: number;
}

export function SettingsPanel() {
  const [v, setV] = useState<Values | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminFetch<{ rows: { key: string; value: Record<string, number> }[] }>("/api/admin/settings").then(({ rows }) => {
      const get = (k: string) => rows.find((r) => r.key === k)?.value ?? {};
      setV({
        mat_price: get("frame_extras").mat_price ?? 40,
        engraving_price: get("frame_extras").engraving_price ?? 50,
        note_card_price: get("builder_extras").note_card_price ?? 0,
      });
    });
  }, []);

  const save = async () => {
    if (!v) return;
    setBusy(true);
    await adminFetch("/api/admin/settings", { method: "POST", body: JSON.stringify({ key: "frame_extras", value: { mat_price: v.mat_price, engraving_price: v.engraving_price } }) });
    await adminFetch("/api/admin/settings", { method: "POST", body: JSON.stringify({ key: "builder_extras", value: { note_card_price: v.note_card_price } }) });
    setBusy(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!v) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-sage-dark" />;
  const field = (k: keyof Values, label: string) => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type="number" min={0} value={v[k]} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} className="max-w-[200px]" />
    </div>
  );
  return (
    <div className="max-w-xl">
      <h2 className="font-serif text-3xl">Extras</h2>
      <p className="mt-1 text-[16px] text-muted">Add-on prices used by the frame and gift builders.</p>
      <div className="card-soft mt-6 grid gap-5 p-6">
        {field("mat_price", "White mat (₹)")}
        {field("engraving_price", "Engraving line (₹)")}
        {field("note_card_price", "Gift note card (₹, 0 = free)")}
        <Button onClick={save} disabled={busy} className="w-fit">
          {busy ? <Loader2 className="animate-spin" /> : saved ? <Check /> : null} {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}
