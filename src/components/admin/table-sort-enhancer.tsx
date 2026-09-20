"use client";

import { useEffect } from "react";

const NON_SORTABLE =
  /^(|actions?|details?|preview|validation|thao tác|chi tiết|chọn)$/i;

function cellValue(row: HTMLTableRowElement, index: number) {
  return row.cells[index]?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

export function TableSortEnhancer({ locale }: { locale: string }) {
  useEffect(() => {
    const enhanceTables = () =>
      document
        .querySelectorAll<HTMLTableElement>("main table")
        .forEach((table) => {
          if (table.dataset.sortEnhanced === "true") return;
          const body = table.tBodies[0];
          const headers = table.tHead?.rows[0]?.cells;
          if (!body || !headers) return;

          table.dataset.sortEnhanced = "true";
          Array.from(headers).forEach((header, index) => {
            const label = header.textContent?.replace(/\s+/g, " ").trim() ?? "";
            if (NON_SORTABLE.test(label) || header.querySelector("input"))
              return;

            const button = document.createElement("button");
            button.type = "button";
            button.className =
              "inline-flex items-center gap-1 text-left hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700";
            button.setAttribute("aria-label", `Sort by ${label}`);
            const text = document.createElement("span");
            text.textContent = label;
            const icon = document.createElement("span");
            icon.className = "text-xs text-slate-400";
            icon.ariaHidden = "true";
            icon.textContent = "↕";
            button.append(text, icon);
            header.textContent = "";
            header.append(button);
            header.setAttribute("aria-sort", "none");

            button.addEventListener("click", () => {
              const ascending =
                header.getAttribute("aria-sort") !== "ascending";
              Array.from(headers).forEach((cell) => {
                cell.setAttribute("aria-sort", "none");
                const otherIcon = cell.querySelector("button span:last-child");
                if (otherIcon) otherIcon.textContent = "↕";
              });
              header.setAttribute(
                "aria-sort",
                ascending ? "ascending" : "descending",
              );
              icon.textContent = ascending ? "↑" : "↓";
              const rows = Array.from(body.rows).sort(
                (a, b) =>
                  (ascending ? 1 : -1) *
                  cellValue(a, index).localeCompare(
                    cellValue(b, index),
                    locale,
                    { numeric: true, sensitivity: "base" },
                  ),
              );
              rows.forEach((row) => body.append(row));
            });
          });
        });
    enhanceTables();
    const observer = new MutationObserver(enhanceTables);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
