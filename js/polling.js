// js/polling.js
const API_URL = "https://68b8836db71540504328723b.mockapi.io/test_iot/dipositivos_iot";

const tablaRegistrosPoll = document.getElementById("tablaRegistrosPoll");
const statusValorPoll = document.getElementById("statusValorPoll");

let pollIntervalId = null;
const POLL_MS = 2000;
const LIMIT = 10;

function sortByIdDesc(arr) {
  return arr.slice().sort((a, b) => {
    const ia = Number(a.id ?? NaN);
    const ib = Number(b.id ?? NaN);
    if (!isNaN(ia) && !isNaN(ib)) return ib - ia;
    const ta = new Date(a.createdAt || a.date || 0).getTime();
    const tb = new Date(b.createdAt || b.date || 0).getTime();
    return tb - ta;
  });
}

async function fetchLastN(limit = LIMIT) {
  try {
    const url = `${API_URL}?sortBy=id&order=desc&limit=${limit}`;
    const res = await fetch(url, { cache: "no-store" });
    let data = await res.json();
    if (!Array.isArray(data)) data = [data];

    data = sortByIdDesc(data).slice(0, limit);

    if (data.length > 0) {
      statusValorPoll.textContent = data[0].status;
    } else {
      statusValorPoll.textContent = "Sin registros";
    }

    tablaRegistrosPoll.innerHTML = "";
    for (const item of data) {
      const fecha = item.date || item.createdAt || "";
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name || "Dispositivo"}</td>
        <td>${item.status}</td>
        <td>${item.ip || "-"}</td>
        <td>${fecha}</td>
      `;
      tablaRegistrosPoll.appendChild(fila);
    }

  } catch (err) {
    console.error("fetchLastN error:", err);
    statusValorPoll.textContent = "Error al obtener datos";
    tablaRegistrosPoll.innerHTML = "";
  }
}

function startPolling() {
  fetchLastN(LIMIT);
  pollIntervalId = setInterval(() => fetchLastN(LIMIT), POLL_MS);
}

function stopPolling() {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
}

window.addEventListener("beforeunload", stopPolling);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopPolling();
  else if (!pollIntervalId) startPolling();
});

startPolling();
