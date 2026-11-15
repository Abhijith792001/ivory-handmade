"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  side = "right",
  className,
  children,
  title,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Content> & { side?: "right" | "left"; title: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-brown/25 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          "paper fixed inset-y-0 z-50 flex w-full max-w-md flex-col shadow-lift duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "right"
            ? "right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
            : "left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-brown/10 px-6 py-5">
          <Dialog.Title className="font-serif text-2xl">{title}</Dialog.Title>
          <Dialog.Close className="rounded-full p-2 text-muted transition hover:bg-ivory hover:text-brown" aria-label="Close">
            <X className="h-5 w-5" />
          </Dialog.Close>
        </div>
        <Dialog.Description className="sr-only">{title}</Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
