// js/app.js
const API_URL = "https://68b8836db71540504328723b.mockapi.io/test_iot/dipositivos_iot";

// DOM
const form = document.getElementById("statusForm");
const deviceNameInput = document.getElementById("deviceName");
const statusInput = document.getElementById("status");
const tablaRegistros = document.getElementById("tablaRegistros");
const statusValor = document.getElementById("statusValor");

async function getPublicIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    const j = await res.json();
    return j.ip || "0.0.0.0";
  } catch {
    return "0.0.0.0";
  }
}

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

async function cargarRegistros(limit = 5) {
  try {
    const url = `${API_URL}?sortBy=id&order=desc&limit=${limit}`;
    const res = await fetch(url, { cache: "no-store" });
    let data = await res.json();

    if (!Array.isArray(data)) data = [data];
    data = sortByIdDesc(data).slice(0, limit);

    if (data.length > 0) {
      statusValor.textContent = data[0].status;
    } else {
      statusValor.textContent = "Sin registros";
    }

    tablaRegistros.innerHTML = "";
    for (const item of data) {
      const fecha = item.date || item.createdAt || "";
      const fila = `
        <tr>
          <td>${item.id}</td>
          <td>${item.name || "Dispositivo"}</td>
          <td>${item.status}</td>
          <td>${item.ip || "-"}</td>
          <td>${fecha}</td>
        </tr>`;
      tablaRegistros.innerHTML += fila;
    }

  } catch (err) {
    console.error("Error cargarRegistros:", err);
    statusValor.textContent = "Error al cargar";
    tablaRegistros.innerHTML = "";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = deviceNameInput.value.trim();
  const status = statusInput.value;
  if (!name || !status) return;

  const ip = await getPublicIP();
  const fecha = new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" });

  const nuevoRegistro = { name, status, ip, date: fecha };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoRegistro),
      cache: "no-store"
    });

    if (!res.ok) throw new Error("POST failed: " + res.status);

    await cargarRegistros(5);
    form.reset();
  } catch (err) {
    console.error("Error agregando registro:", err);
  }
});

cargarRegistros(5);
