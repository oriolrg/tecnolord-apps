export function card({ title, value, unit, badge, subHtml = "", className = "" }) {
  const wrap = document.createElement("div");
  wrap.className = `card ${className}`.trim();

  wrap.innerHTML = `
    <div class="k">
      <h3>${title}</h3>
      ${badge ? `<span class="badge">${badge}</span>` : ""}
    </div>

    ${value !== "" ? `
      <p class="v">
        <span>${value}</span>
        ${unit ? `<span class="unit">${unit}</span>` : ""}
      </p>
    ` : ""}

    ${subHtml ? `<div class="sub">${subHtml}</div>` : ""}
  `;

  return wrap;
}
