"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/layout/whatsapp-float";
import { waLink } from "@/lib/whatsapp";

export function ContactForm() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("A custom gift");
  const [message, setMessage] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(waLink(`Hi Ivory! I'm ${name}.\nTopic: ${topic}\n\n${message}`), "_blank", "noopener");
  };
  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <div>
        <Label htmlFor="c-name">Your name</Label>
        <Input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="c-topic">About</Label>
        <Select id="c-topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {["A custom gift", "A photo frame", "Bulk / corporate order", "An existing order", "Something else"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="c-msg">Message</Label>
        <Textarea id="c-msg" required value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[140px]" />
      </div>
      <Button type="submit" size="lg">
        <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp
      </Button>
    </form>
  );
}
