import { el } from "../dom.js";

export function card({ title, value, unit, badge, subHtml }) {
  return el("div", { class: "card" }, [
    el("div", { class: "k" }, [
      el("h3", { html: title }),
      el("span", { class: "badge", html: badge || "" }),
    ]),
    el("p", { class: "v", html: `${value} <span class="unit">${unit || ""}</span>` }),
    el("div", { class: "sub", html: subHtml || "" }),
  ]);
}
