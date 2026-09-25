import Link from "next/link";
import { breadcrumbStructuredData, serializeStructuredData, type BreadcrumbItem } from "@/lib/seo/structured-data";

export function BreadcrumbTrail({ items }: { items: readonly BreadcrumbItem[] }) {
  return <>
    <nav aria-label="Đường dẫn" className="text-sm text-slate-600">
      {items.map((item, index) => <span key={item.path}>
        {index > 0 && <span aria-hidden="true"> / </span>}
        {index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link className="underline" href={item.path}>{item.name}</Link>}
      </span>)}
    </nav>
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(breadcrumbStructuredData(items)) }} type="application/ld+json" />
  </>;
}
