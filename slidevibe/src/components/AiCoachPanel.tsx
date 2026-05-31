/**
 * AiCoachPanel — the left-rail "AI Coach" for the Bosch experience layout.
 *
 * Hybrid by design: the explainer (slide title + blurb + quick-prompt chips) is
 * always visible and costs nothing. The LLM (Azure OpenAI, via ProovBridge.aiChat)
 * is only called when the student clicks a chip or sends a message — so there's no
 * token spend just from opening a slide.
 *
 * Degrades gracefully: with no live session (mock / preview / direct open) it still
 * shows the explainer + chips, and replies with a friendly "activates once you
 * launch from your dashboard" note instead of throwing.
 */
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Loader2, Lightbulb } from 'lucide-react';
import { ProovBridge, type ChatMessage } from '../lib/proovBridge';

type Msg = { role: 'user' | 'assistant'; content: string };

const QUICK_PROMPTS = [
  'Explain this simply',
  'Give a real-world example',
  "Hint — I'm stuck",
];

export function AiCoachPanel({
  title,
  section,
  blurb,
  tips,
  themeColor = '#005691',
  slideIndex,
}: {
  title: string;
  section: string;
  blurb?: string;
  tips?: string[];
  themeColor?: string;
  slideIndex: number;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build the system prompt fresh each call so the coach always knows the
  // student's current slide, even as they navigate.
  const systemPrompt = (): ChatMessage => ({
    role: 'system',
    content:
      'You are the AI Coach inside a hands-on business-analytics training experience. ' +
      'The student works at a fictional firm, Veridian Industries, and is building the skills to deliver a ' +
      'real-world case study on Bosch (using only public data). ' +
      `They are currently on the step "${section} — ${title}". ` +
      'Help them understand the concept and complete the task. Be concise, encouraging, and concrete — short ' +
      'paragraphs or a few bullets. Guide them; do not just hand over the finished answer. If they go off-topic, ' +
      'gently steer back to the step.',
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setBusy(true);

    try {
      if (!ProovBridge.isActive()) {
        setMessages([
          ...next,
          {
            role: 'assistant',
            content:
              "I activate once you launch this project from your ProoV dashboard. For now, use the steps on the right — and I'll be here to help the moment you're in a live session.",
          },
        ]);
        return;
      }
      const reply = await ProovBridge.aiChat([
        systemPrompt(),
        ...next.map(m => ({ role: m.role, content: m.content }) as ChatMessage),
      ]);
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            reply && reply.trim()
              ? reply
              : "I'm in preview mode here, so I can't reach the model — but once this runs in a live session I'll answer in full.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', content: "Sorry — I couldn't reach the coach just now. Try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-[340px] flex-none bg-white border-r border-gray-200 z-20">
      {/* Tab header */}
      <div className="flex-none px-4 pt-4 pb-3 border-b border-gray-100">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-bold text-white shadow-sm"
          style={{ background: themeColor }}
        >
          <Sparkles size={14} /> AI Coach
        </div>
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 flex flex-col gap-4">
        {/* Slide explainer (always on) */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1" style={{ color: themeColor }}>
            {section}
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 leading-snug">{title}</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-gray-600">
            {blurb || `Ask me anything about “${title}”. Use a quick prompt below, or type your own question.`}
          </p>
          {tips && tips.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug text-gray-500">
                  <Lightbulb size={13} className="mt-0.5 shrink-0" style={{ color: themeColor }} /> {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Conversation */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'self-end bg-gray-900 text-white rounded-br-sm'
                : 'self-start bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="self-start flex items-center gap-2 text-[13px] text-gray-400">
            <Loader2 size={14} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="flex-none px-4 pb-2 pt-2 flex flex-wrap gap-2 border-t border-gray-100">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={busy}
            className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={e => {
          e.preventDefault();
          send(input);
        }}
        className="flex-none p-3 border-t border-gray-100 flex items-center gap-2"
        key={slideIndex /* keep input focused per slide */}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask or write anything here…"
          className="flex-1 h-10 px-3.5 rounded-full border border-gray-200 bg-gray-50 text-[13.5px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white"
          style={{ ['--tw-ring-color' as string]: `${themeColor}55` }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
          style={{ background: themeColor }}
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>
    </aside>
  );
}
