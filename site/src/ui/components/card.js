export function card({ title, value, unit, badge, subHtml, className = "", style = "" }) {
  const el = document.createElement("div");
  el.className = `card ${className}`.trim();
  if (style) el.setAttribute("style", style);

  el.innerHTML = `
    <div class="card-content">
      <div class="k">
        <h3>${title}</h3>
        <span class="badge">${badge || ""}</span>
      </div>

      <p class="v">${value ?? ""} <span class="unit">${unit || ""}</span></p>
      <div class="sub">${subHtml || ""}</div>
    </div>
  `;

  return el;
}
