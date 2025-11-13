const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const puerto = 3000;

app.use(cors());
app.use(express.json());

// ========= SERVIR FRONTEND =========
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ========= ENDPOINT: RUTAS =========
app.get("/api/rutas", (req, res) => {
  const dataPath = path.join(__dirname, "data", "rutas.json");
  const json = fs.readFileSync(dataPath, "utf8");
  res.json(JSON.parse(json));
});

// ========= ENDPOINT: ALERTA =========
app.get("/api/alerta", (req, res) => {
  res.json({
    alerta: "Pasajero debe bajar en la próxima parada"
  });
});

// ========= INICIAR SERVIDOR =========
app.listen(puerto, () => {
  console.log("Servidor corriendo en http://localhost:" + puerto);
});