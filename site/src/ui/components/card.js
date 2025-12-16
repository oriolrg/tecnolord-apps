import { el } from "../dom.js";

export function card({ title, value, unit, badge, subHtml }) {
  return el("section", { class: "card", role: "region", "aria-label": title }, [
    el("div", { class: "k" }, [
      el("h3", { html: title }),
      el("span", { class: "badge", html: badge || "", "aria-label": badge ? `Tipus de lectura: ${badge}` : "Tipus de lectura" }),
    ]),
    el("p", { class: "v", html: `${value} <span class="unit">${unit || ""}</span>` }),
    el("div", { class: "sub", html: subHtml || "" }),
  ]);
}
