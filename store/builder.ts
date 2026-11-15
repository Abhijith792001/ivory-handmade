"use client";
import { create } from "zustand";
import type { BuilderBox, BuilderItem } from "@/types";

export const BOX_COLORS = [
  { name: "Ivory", hex: "#F6EEE2" },
  { name: "Blush", hex: "#E8C4B8" },
  { name: "Sage", hex: "#8E9C75" },
  { name: "Kraft", hex: "#C49A6C" },
] as const;

export const RIBBON_COLORS = [
  { name: "Sage", hex: "#6E7F52" },
  { name: "Brown", hex: "#6B3A1E" },
  { name: "Blush", hex: "#D9A79A" },
  { name: "Gold", hex: "#C9A45C" },
  { name: "Ivory", hex: "#FBF3EA" },
] as const;

export const FILLER_COLORS = [
  { name: "Kraft", hex: "#C8A27A" },
  { name: "Cream", hex: "#F1E4CF" },
  { name: "Blush", hex: "#EBC6BA" },
  { name: "Sage", hex: "#A9B48F" },
] as const;

export type BuilderStep = 0 | 1 | 2 | 3;

export interface PlacedItem {
  uid: string;
  item: BuilderItem;
}

interface BuilderState {
  step: BuilderStep;
  box: BuilderBox | null;
  placed: PlacedItem[];
  boxColor: string;
  ribbonColor: string;
  fillerColor: string;
  note: string;
  setStep: (s: BuilderStep) => void;
  chooseBox: (b: BuilderBox) => void;
  addItem: (i: BuilderItem) => boolean;
  removeItem: (uid: string) => void;
  setBoxColor: (c: string) => void;
  setRibbonColor: (c: string) => void;
  setFillerColor: (c: string) => void;
  setNote: (n: string) => void;
  reset: () => void;
}

export const slotsUsed = (placed: PlacedItem[]) => placed.reduce((s, p) => s + p.item.slots_used, 0);

const initial = {
  step: 0 as BuilderStep,
  box: null,
  placed: [] as PlacedItem[],
  boxColor: "Ivory",
  ribbonColor: "Sage",
  fillerColor: "Kraft",
  note: "",
};

let counter = 0;

export const useBuilder = create<BuilderState>()((set, get) => ({
  ...initial,
  setStep: (step) => set({ step }),
  chooseBox: (box) =>
    set((s) => {
      // Keep items that still fit when switching to a smaller box.
      const kept: PlacedItem[] = [];
      let used = 0;
      for (const p of s.placed) {
        if (used + p.item.slots_used <= box.capacity) {
          kept.push(p);
          used += p.item.slots_used;
        }
      }
      return { box, placed: kept };
    }),
  addItem: (item) => {
    const { box, placed } = get();
    if (!box || slotsUsed(placed) + item.slots_used > box.capacity) return false;
    const already = placed.filter((p) => p.item.id === item.id).length;
    if (already >= item.stock) return false;
    set({ placed: [...placed, { uid: `p${++counter}`, item }] });
    return true;
  },
  removeItem: (uid) => set((s) => ({ placed: s.placed.filter((p) => p.uid !== uid) })),
  setBoxColor: (boxColor) => set({ boxColor }),
  setRibbonColor: (ribbonColor) => set({ ribbonColor }),
  setFillerColor: (fillerColor) => set({ fillerColor }),
  setNote: (note) => set({ note: note.slice(0, 140) }),
  reset: () => set({ ...initial }),
}));

export const hexOf = (list: readonly { name: string; hex: string }[], name: string) =>
  list.find((c) => c.name === name)?.hex ?? list[0].hex;
