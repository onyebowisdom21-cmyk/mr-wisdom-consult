import Link from "next/link";
import { Fragment, ReactNode } from "react";

function renderLinks(text: string): ReactNode[] {
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  const output: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    output.push(text.slice(cursor, match.index));
    const label = match[1];
    const href = match[2];
    if (!label || !href) {
      output.push(match[0]);
      cursor = match.index + match[0].length;
      continue;
    }
    if (href.startsWith("/") && !href.startsWith("//")) {
      output.push(<Link href={href} key={match.index}>{label}</Link>);
    } else {
      let safeUrl = false;
      try {
        const parsed = new URL(href);
        safeUrl = parsed.protocol === "https:" || parsed.protocol === "http:" || parsed.protocol === "mailto:";
      } catch {
        safeUrl = false;
      }
      output.push(safeUrl
        ? <a href={href} key={match.index} rel="noopener noreferrer" target="_blank">{label} ↗</a>
        : label);
    }
    cursor = match.index + match[0].length;
  }
  output.push(text.slice(cursor));
  return output.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}

export function RichTextRenderer({ content }: { content: string }) {
  return (
    <div>
      {content.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
        <p key={index}>{renderLinks(paragraph)}</p>
      ))}
    </div>
  );
}
