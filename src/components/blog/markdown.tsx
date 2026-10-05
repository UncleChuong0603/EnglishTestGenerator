import React from "react";
import { safeHref } from "../../lib/blog/core";

type Choice = { label: string; text: string };

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|!?\[[^\]]*\]\([^\s)]+\))/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;

    if (token.startsWith("**")) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      out.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else {
      const image = token.startsWith("!");
      const parts = token.match(/^!?\[([^\]]*)\]\(([^)]+)\)$/);
      const href = parts && safeHref(parts[2]);
      if (!parts || !href) {
        out.push(token);
      } else if (image) {
        out.push(
          // Markdown images can be remote and do not provide intrinsic dimensions.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={parts[1]}
            className="my-6 max-h-[32rem] w-full rounded-2xl object-cover"
            key={key}
            loading="lazy"
            src={href}
          />,
        );
      } else {
        out.push(
          <a
            className="font-bold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:decoration-teal-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            href={href}
            key={key}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {parts[1]}
          </a>,
        );
      }
    }
    last = pattern.lastIndex;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

function parseInlineChoices(line: string): { prompt: string; choices: Choice[] } | null {
  const marker = /\s+\(([A-D])\)\s+/g;
  const matches = [...line.matchAll(marker)];
  if (matches.length < 2) return null;

  const labels = matches.map(match => match[1]);
  if (!labels.every((label, index) => label === String.fromCharCode(65 + index))) return null;

  const prompt = line.slice(0, matches[0].index).trim();
  if (!prompt) return null;

  const choices = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : line.length;
    return { label: match[1], text: line.slice(start, end).trim().replace(/\.$/, "") };
  });

  return choices.every(choice => choice.text) ? { prompt, choices } : null;
}

function ChoiceGrid({ choices, keyPrefix }: { choices: Choice[]; keyPrefix: string }) {
  return (
    <ol aria-label="Các lựa chọn" className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
      {choices.map(choice => (
        <li
          className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 leading-7 text-slate-800"
          key={`${keyPrefix}-${choice.label}`}
        >
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-black text-slate-700"
          >
            {choice.label}
          </span>
          <span className="min-w-0 break-words">{inline(choice.text, `${keyPrefix}-${choice.label}`)}</span>
        </li>
      ))}
    </ol>
  );
}

function isAnswerExplanation(line: string) {
  const plain = line.replace(/\*\*/g, "").trim();
  return /^(?:Đáp án|Chọn)\s+[A-D](?:\.|\b)/i.test(plain);
}

export function Markdown({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const nodes: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const flush = () => {
    if (!list.length) return;

    const choices = list
      .map(item => item.match(/^([A-D])[.)]\s+(.+)$/))
      .filter((item): item is RegExpMatchArray => Boolean(item))
      .map(item => ({ label: item[1], text: item[2] }));
    const sequential = choices.every((choice, index) => choice.label === String.fromCharCode(65 + index));

    if (!ordered && choices.length === list.length && choices.length >= 2 && sequential) {
      nodes.push(
        <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5" key={`choices-${nodes.length}`}>
          <ChoiceGrid choices={choices} keyPrefix={`choices-${nodes.length}`} />
        </div>,
      );
    } else {
      const Tag = ordered ? "ol" : "ul";
      nodes.push(
        <Tag
          className={`my-5 space-y-2 pl-6 text-slate-700 ${ordered ? "list-decimal" : "list-disc"}`}
          key={`list-${nodes.length}`}
        >
          {list.map((item, index) => (
            <li className="pl-1 leading-7" key={index}>
              {inline(item, `li-${nodes.length}-${index}`)}
            </li>
          ))}
        </Tag>,
      );
    }
    list = [];
  };

  lines.forEach((line, index) => {
    const item = line.match(/^\s*(?:([-*])|(\d+)\.)\s+(.+)$/);
    if (item) {
      const nextOrdered = Boolean(item[2]);
      if (list.length && ordered !== nextOrdered) flush();
      ordered = nextOrdered;
      list.push(item[3]);
      return;
    }

    flush();
    if (!line.trim() || /^```/.test(line)) return;

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Heading = heading[1].length <= 2 ? "h2" : "h3";
      nodes.push(
        <Heading className="mb-3 mt-10 scroll-mt-24 font-black tracking-tight text-slate-950" key={index}>
          {inline(heading[2], `h-${index}`)}
        </Heading>,
      );
      return;
    }

    if (line.startsWith("> ")) {
      nodes.push(
        <aside className="my-7 rounded-r-2xl border-l-4 border-teal-700 bg-teal-50 px-5 py-5 text-slate-800" key={index}>
          <p className="mb-2 text-sm font-black uppercase tracking-wider text-teal-900">Ghi nhớ</p>
          <blockquote className="leading-7">{inline(line.slice(2), `q-${index}`)}</blockquote>
        </aside>,
      );
      return;
    }

    const question = parseInlineChoices(line);
    if (question) {
      nodes.push(
        <section
          aria-label="Câu hỏi ví dụ"
          className="my-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
          key={index}
        >
          <p className="m-0 leading-8 text-slate-950">{inline(question.prompt, `prompt-${index}`)}</p>
          <ChoiceGrid choices={question.choices} keyPrefix={`question-${index}`} />
        </section>,
      );
      return;
    }

    if (isAnswerExplanation(line)) {
      nodes.push(
        <aside className="my-6 rounded-xl border-l-4 border-teal-700 bg-teal-50 px-5 py-4 leading-7 text-slate-800" key={index}>
          {inline(line, `answer-${index}`)}
        </aside>,
      );
      return;
    }

    nodes.push(
      <p className="my-5 leading-[1.75] text-slate-700" key={index}>
        {inline(line, `p-${index}`)}
      </p>,
    );
  });

  flush();
  return (
    <div className="article-body break-words text-[17px] leading-[1.75] [&_h2]:text-2xl [&_h3]:text-xl">
      {nodes}
    </div>
  );
}
