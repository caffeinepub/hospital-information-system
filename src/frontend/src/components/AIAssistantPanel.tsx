import { useState } from "react";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

const FAQ_CHIPS = [
  { label: "How to add a patient?", key: "add patient" },
  { label: "How to view QR code?", key: "view qr" },
  { label: "How to track visitors?", key: "track visitors" },
  { label: "How to backup data?", key: "backup" },
  { label: "How to add a doctor?", key: "add doctor" },
];

const FAQ: { pattern: RegExp; answer: string }[] = [
  {
    pattern: /add.*(patient|patients)/i,
    answer:
      "Go to the Patients page and click the 'Add Patient' button in the top right. Fill in the name, admission date, time, ward — the day of week is auto-filled. Submit to save.",
  },
  {
    pattern: /view.*qr|qr.*code|qr.*link|share.*qr/i,
    answer:
      "Open the Patients page and click any patient row. In the detail modal, you'll see a QR code. Use 'Copy Link' to get the shareable URL, or 'Download QR' to save the image.",
  },
  {
    pattern: /track.*visitor|visitor.*log|who.*access|qr.*scan/i,
    answer:
      "Visit the Visitor Log page from the Dashboard. Every time a department staff or guest scans a QR code, it gets recorded here with the patient name and timestamp. It auto-refreshes every 30 seconds.",
  },
  {
    pattern: /backup/i,
    answer:
      "Go to Dashboard and click 'Backup Now' at the bottom. The system also auto-triggers a backup daily — the last backup time is shown on the Dashboard.",
  },
  {
    pattern: /add.*(doctor|doctors|physician)/i,
    answer:
      "Go to the Doctors page and click 'Add Doctor'. Enter the doctor's name, specialty, department, and contact info.",
  },
  {
    pattern: /treatment/i,
    answer:
      "On the Treatments page, click 'Add Treatment'. Select a patient from the dropdown, enter the treatment type, notes, and date.",
  },
  {
    pattern: /medicine|medication|drug|inventory/i,
    answer:
      "Visit the Medicine page to manage inventory. Use 'Add Medicine' to enter the name, quantity, unit, and usage instructions. Low stock (< 10) is highlighted in red.",
  },
  {
    pattern: /facilit|room|equipment/i,
    answer:
      "On the Facilities page, you can view rooms and equipment status. Add facilities with their name, location, and current status (Available/Occupied/Maintenance).",
  },
  {
    pattern: /login|logout|sign in|sign out/i,
    answer:
      "Use the Login button on the home page to authenticate via Internet Identity. To log out, click the Logout button in the top navigation bar.",
  },
  {
    pattern: /discharge/i,
    answer:
      "Patient discharge status is set at admission. Contact your system administrator to update patient status from Admitted to Discharged.",
  },
];

function getAnswer(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  for (const { pattern, answer } of FAQ) {
    if (pattern.test(trimmed)) return answer;
  }
  return "I'm not sure about that specific question. Please contact your system administrator or IT support for assistance.";
}

let nextId = 1;

export function AIAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId++,
      role: "assistant",
      text: "Hello! I'm your MediCare HIS assistant. Ask me anything about using the system — adding patients, viewing QR codes, tracking visitors, backups, and more.",
    },
  ]);
  const [input, setInput] = useState("");

  function handleSend(query?: string) {
    const text = (query ?? input).trim();
    if (!text) return;
    const userMsg: Message = { id: nextId++, role: "user", text };
    const answer = getAnswer(text);
    const botMsg: Message = { id: nextId++, role: "assistant", text: answer };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  const showChips = messages.length <= 1;

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open AI Assistant"
        title="AI Assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Sparkles className="h-5 w-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="ai-panel-enter fixed bottom-24 right-6 z-50 flex h-[520px] w-80 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm font-semibold text-primary-foreground">
                AI Assistant
              </p>
              <p className="text-xs text-primary-foreground/70">MediCare HIS Helper</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI panel"
              className="rounded p-1 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick chip suggestions */}
          {showChips && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
              {FAQ_CHIPS.map((chip) => (
                <button
                  type="button"
                  key={chip.key}
                  onClick={() => handleSend(chip.label)}
                  className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 text-sm"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="h-9 w-9 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
