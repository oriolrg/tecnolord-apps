// site/src/ui/components/card.js
import { el } from "../dom.js";

export function card({ title, value, unit, badge, subHtml = "", className = "" }) {
  const wrap = el("div", { className: `card ${className}`.trim() });

  const header = el("div", { className: "k" });
  header.append(
    el("h3", {}, title || ""),
    badge ? el("span", { className: "badge" }, badge) : el("span", { className: "badge", style: "visibility:hidden" }, "—"),
  );

  wrap.append(header);

  // Si no hi ha value real, NO pintem el bloc principal (evita espais en blanc)
  const hasValue = value != null && String(value).trim() !== "";

  if (hasValue) {
    const v = el("p", { className: "v" });
    v.append(
      el("span", {}, String(value)),
      unit ? el("span", { className: "unit" }, unit) : el("span", { className: "unit", style: "display:none" }, ""),
    );
    wrap.append(v);
  }

  if (subHtml && String(subHtml).trim() !== "") {
    const sub = el("div", { className: "sub" });
    sub.innerHTML = subHtml;
    wrap.append(sub);
  }

  return wrap;
}
