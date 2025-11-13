// ================== CONFIGURACIÓN GENERAL ==================
// Como el backend sirve también el frontend, usamos rutas relativas:
const API_BASE = ""; // => mismo dominio (http://localhost:3000)

// Scroll suave para el botón "Probar demo"
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ================== MODO OSCURO / CLARO ==================
const toggleDark = document.getElementById("toggle-dark");

if (toggleDark) {
  toggleDark.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");

    toggleDark.innerText = document.body.classList.contains("dark-mode")
      ? "Modo claro"
      : "Modo oscuro";
  });
}

// ================== OBTENER ELEMENTOS DEL DOM ==================

const btnRegistrar = document.getElementById("btn-registrar");
const inputNombre = document.getElementById("nombre");
const selIdiomaRegistro = document.getElementById("idioma-registro");
const selPerfilRegistro = document.getElementById("perfil-registro");
const registroMsg = document.getElementById("registro-msg");

const btnGenerar = document.getElementById("btn-generar");
const btnAlerta = document.getElementById("btn-alerta");
const alertaChofer = document.getElementById("alerta-chofer");

const turistaResumen = document.getElementById("turista-resumen");
const turistaChips = document.getElementById("turista-chips");
const choferResumen = document.getElementById("chofer-resumen");
const choferChips = document.getElementById("chofer-chips");

// ================== 1. REGISTRO DE TURISTA ==================
if (btnRegistrar) {
  btnRegistrar.addEventListener("click", async () => {
    const nombre = (inputNombre?.value || "").trim();
    const idioma = selIdiomaRegistro?.value || "Inglés";
    const perfil = selPerfilRegistro?.value || "Sin discapacidad";

    if (!nombre) {
      if (registroMsg)
        registroMsg.innerHTML = `<span class="text-danger">Escribe un nombre.</span>`;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/turistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, idioma, perfil }),
      });

      const data = await res.json();

      if (!data.ok) {
        if (registroMsg)
          registroMsg.innerHTML = `<span class="text-danger">${
            data.mensaje || "Error al registrar."
          }</span>`;
        return;
      }

      if (registroMsg)
        registroMsg.innerHTML = `<span class="text-success">✅ Turista registrado: ${data.turista.nombre}</span>`;
    } catch (err) {
      console.error(err);
      if (registroMsg)
        registroMsg.innerHTML = `<span class="text-danger">Error de conexión con el servidor.</span>`;
    }
  });
}

// ================== 2. GENERAR RUTA PARA EL VIAJE ==================
if (btnGenerar) {
  btnGenerar.addEventListener("click", async () => {
    const origen = document.getElementById("origen")?.value || "Hotel Cancún";
    const destino = document.getElementById("destino")?.value || "Playa Delfines";
    const idioma = document.getElementById("idioma")?.value || "Inglés";
    const perfil = document.getElementById("perfil")?.value || "Sin discapacidad";

    const nombre = (inputNombre?.value || "").trim() || "Turista sin nombre";

    try {
      const res = await fetch(`${API_BASE}/api/ruta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origen, destino, idioma, perfil, nombre }),
      });

      const data = await res.json();

      if (!data.ok) {
        if (turistaResumen)
          turistaResumen.innerHTML = `<span class="text-danger">${
            data.mensaje || "Error al generar ruta."
          }</span>`;
        return;
      }

      const r = data.ruta;
      const p = data.pasajero;

      // -------- VISTA DEL TURISTA --------
      if (turistaResumen) {
        turistaResumen.innerHTML = `
          <p><strong>Ruta generada:</strong></p>
          <p>Desde <b>${r.origen}</b> hasta <b>${r.destino}</b>.</p>
          <p>Ruta sugerida: <b>${r.numero_camion}</b> – Llega en <b>${r.tiempo_llegada}</b>.</p>
          <p>Idioma del viaje: <b>${r.idioma}</b></p>
          <p>Perfil: <b>${r.perfil}</b></p>
        `;
      }

      const chips = [];

      if (p.esCiego) {
        chips.push("📳 Vibración previa");
        chips.push("🎧 Sonido 3D");
        chips.push("🆘 SOS por voz");
      }
      if (p.esSordo) {
        chips.push("🔔 Alertas visuales");
        chips.push("🤟 LSM/ASL");
      }
      if (p.esMudo) {
        chips.push("💬 Mensajes automáticos");
      }
      if (p.esAdultoMayor) {
        chips.push("🔎 Letra grande");
      }
      if (p.necesitaRampa) {
        chips.push("♿ Acceso y rampa");
      }
      if (chips.length === 0) {
        chips.push("✔ Modo estándar");
      }

      if (turistaChips) {
        turistaChips.innerHTML = chips
          .map((c) => `<span class="mini-chip">${c}</span>`)
          .join("");
      }

      // -------- ACTUALIZAR PANEL DEL CHOFER --------
      await cargarPasajerosChofer();
      if (alertaChofer) alertaChofer.style.display = "none";
    } catch (err) {
      console.error(err);
      if (turistaResumen)
        turistaResumen.innerHTML = `<span class="text-danger">Error de conexión con el servidor.</span>`;
    }
  });
}

// ================== 3. PANEL DEL CHOFER ==================
async function cargarPasajerosChofer() {
  try {
    const res = await fetch(`${API_BASE}/api/chofer/pasajeros`);
    const data = await res.json();

    if (!data.ok) {
      if (choferResumen)
        choferResumen.innerHTML = `<span class="text-danger">No se pudo cargar la lista de pasajeros.</span>`;
      return;
    }

    const pasajeros = data.pasajeros || [];

    if (pasajeros.length === 0) {
      if (choferResumen) choferResumen.innerHTML = "Sin pasajeros pendientes.";
      if (choferChips) choferChips.innerHTML = "";
      return;
    }

    let htmlLista = "<ul>";
    let chipsGlobales = [];

    pasajeros.forEach((p) => {
      htmlLista += `<li><b>${p.nombre}</b> → ${p.destino} (Ruta ${p.numero_camion})</li>`;

      if (p.necesitaRampa) chipsGlobales.push("♿ Rampa");
      if (p.esCiego) chipsGlobales.push("👁‍🗨 Ciego");
      if (p.esSordo) chipsGlobales.push("👂 Sordo");
      if (p.esMudo) chipsGlobales.push("🧏 Mudo");
      if (p.esAdultoMayor) chipsGlobales.push("👴 Adulto mayor");
    });

    htmlLista += "</ul>";

    if (choferResumen) choferResumen.innerHTML = htmlLista;

    if (choferChips) {
      choferChips.innerHTML = [...new Set(chipsGlobales)]
        .map((c) => `<span class="mini-chip">${c}</span>`)
        .join("");
    }
  } catch (err) {
    console.error(err);
    if (choferResumen)
      choferResumen.innerHTML = `<span class="text-danger">Error de conexión con el servidor.</span>`;
  }
}

// Llamar cada 5 segundos para simular actualización en tiempo real
setInterval(cargarPasajerosChofer, 5000);

// ================== 4. ALERTA: PRÓXIMA PARADA ==================
if (btnAlerta) {
  btnAlerta.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chofer/proxima-parada`);
      const data = await res.json();

      if (alertaChofer) {
        alertaChofer.style.display = "block";
        alertaChofer.innerText = data.mensaje || "Alerta recibida.";
      }

      await cargarPasajerosChofer();
    } catch (err) {
      console.error(err);
      if (alertaChofer) {
        alertaChofer.style.display = "block";
        alertaChofer.innerText = "Error al obtener la alerta.";
      }
    }
  });
}

// ================== 5. CARGA INICIAL ==================
cargarPasajerosChofer();
