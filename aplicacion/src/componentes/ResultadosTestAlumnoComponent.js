import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import RespuestaAlumnoService from "../Services/RespuestaAlumnoService";
import UsuarioAprendizajeService from "../Services/UsuarioAprendizajeService";
import "../estilos/resultadosAprendizajeAlumno.css";
import {
  Menu, TrendingUp, Award,
  BookOpen, CheckCircle, Target, CircleUser,
} from "lucide-react";

export default function ResultadosAprendizajeTestContent() {
  const { usuario } = useAuth();
  const [resultados, setResultados] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  useEffect(() => {
    if (!usuario) return;

    // Obtener todas las respuestas del alumno
    RespuestaAlumnoService.obtenerPorUsuario(usuario.usuarioId)
      .then((response) => {
        const respuestas = response.data;
        calcularYGuardarResultados(respuestas);
      })
      .catch((error) => {
        console.error("Error al obtener respuestas del alumno:", error);
        setResultados({ conteo: { visual: 0, auditivo: 0, kinestesico: 0 }, dominante: "", nivelConfianza: 0 });
      })
      .finally(() => setCargando(false));
  }, [usuario]);

  // Función combinada: calcula resultados y guarda directamente
  const calcularYGuardarResultados = async (respuestas) => {
    if (!respuestas || respuestas.length === 0) {
      console.warn("⚠️ No hay respuestas registradas para este usuario");
      setResultados({ conteo: { visual: 0, auditivo: 0, kinestesico: 0 }, dominante: "", nivelConfianza: 0 });
      return;
    }

    const conteo = { visual: 0, auditivo: 0, kinestesico: 0 };

    respuestas.forEach((ra, i) => {
      let tipo = ra?.respuesta?.tipoAprendizaje?.nombre || "";
      if (!tipo) {
        console.warn(`❗ Respuesta #${i + 1} sin tipoAprendizaje válido`, ra);
        return;
      }

      tipo = tipo.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (tipo.includes("visual")) conteo.visual++;
      else if (tipo.includes("auditivo")) conteo.auditivo++;
      else if (tipo.includes("kinest")) conteo.kinestesico++;
      else console.warn("❓ Tipo desconocido detectado:", tipo);
    });

    const total = Object.values(conteo).reduce((a, b) => a + b, 0);
    if (total === 0) {
      setResultados({ conteo, dominante: "", nivelConfianza: 0 });
      return;
    }

    const dominante = Object.keys(conteo).reduce((a, b) =>
      conteo[a] > conteo[b] ? a : b
    );

    const nivelConfianza = conteo[dominante] / total;

    const resultadoFinal = { conteo, dominante, nivelConfianza };
    setResultados(resultadoFinal);

    // Guardar resultado en backend
    await guardarResultadoAprendizaje(resultadoFinal.dominante, resultadoFinal.nivelConfianza);
  };

  const guardarResultadoAprendizaje = async (tipoDominante, nivelConfianza) => {
    if (!usuario || !tipoDominante) return;

    const tipoAprendizajeId =
      tipoDominante.toLowerCase() === "visual" ? 1 :
        tipoDominante.toLowerCase() === "auditivo" ? 2 :
          tipoDominante.toLowerCase() === "kinestesico" ? 3 : null;

    if (!tipoAprendizajeId) return;

    const confianzaNumerica = Number((nivelConfianza || 0).toFixed(2));

    const usuarioAprendizaje = {
      usuario: { usuarioId: usuario.usuarioId },
      tipoAprendizaje: { tipoAprendizajeId },
      nivelConfianza: confianzaNumerica,
      fecha: new Date().toISOString(),
    };

    try {
      const existentes = await UsuarioAprendizajeService.obtenerPorUsuario(usuario.usuarioId);
      const registroExistente = existentes.data.find(
        (r) => r.tipoAprendizaje.tipoAprendizajeId === tipoAprendizajeId
      );

      if (registroExistente) {
        // Actualiza el registro existente
        await UsuarioAprendizajeService.actualizar(usuario.usuarioId, usuarioAprendizaje);
        console.log("🔄 Resultado actualizado correctamente");
      } else {
        // Crea un nuevo registro
        await UsuarioAprendizajeService.crear(usuarioAprendizaje);
        console.log("🆕 Resultado guardado correctamente");
      }
    } catch (error) {
      console.error("❌ Error al guardar resultado:", error);
    }
  };

  if (cargando) {
    return (
      <div className="no-results-container">
        <div className="card">
          <h2>Cargando resultados...</h2>
        </div>
      </div>
    );
  }

  if (!resultados) {
    return (
      <div className="no-results-container">

        <div className="card">
          <h2>No hay resultados</h2>
          <p>No se encontraron respuestas registradas.</p>
          <button className="btn-primary" onClick={() => (window.location.href = "/principalalumno")}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const total = Object.values(resultados.conteo).reduce((a, b) => a + b, 0);

  const getIcon = (tipo) => {
    switch (tipo) {
      case "visual": return "👁️";
      case "auditivo": return "👂";
      case "kinestesico": return "✋";
      default: return "🧠";
    }
  };

  const getDescripcion = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "visual": return "Prefieres aprender observando, con imágenes o diagramas.";
      case "auditivo": return "Aprendes mejor escuchando y hablando sobre los temas.";
      case "kinestesico": return "Aprendes haciendo, tocando o mediante experiencias prácticas.";
      default: return "";
    }
  };

  return (

    <div className="layout">

      {/* MENÚ LATERAL */}
      <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>

        {/* BOTÓN DESPLAZABLE */}
        <button
          className="sidebar-toggle"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? "⟨" : "⟩"}
        </button>
        <ul>
          <h2 > <Menu size={30} /> <span>Menú</span></h2>

          <li onClick={() => { if (!menuAbierto) return; navigate("/recursos") }}>
            <BookOpen size={30} /> <span>Inicio</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return; navigate("/recursos") }}>
            <Target size={30} />  <span>Recursos</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return; navigate("/recursos") }}>
            <TrendingUp size={30} />  <span>Mi Ruta</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return; navigate("/recursos") }}>
            <Award size={30} /> <span>Mi Progreso</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return; navigate("/recursos") }}>
            <CheckCircle size={30} />  <span>Calificaciones</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return; navigate("/recursos") }}>
            <CircleUser size={30} />  <span>Mi Perfil</span>
          </li>
        </ul>
      </aside>

      <div className="results-container">
        <div className="results-card">
          <div className="results-header">
            <div className="icon-circle">{getIcon(resultados.dominante)}</div>
            <h2>
              Tu estilo de aprendizaje es: <span className="highlight">{resultados.dominante.toUpperCase()}</span>
            </h2>
            <p className="description">{getDescripcion(resultados.dominante)}</p>
            <p className="confidence">
              Nivel de confianza: <strong>{(resultados.nivelConfianza * 100).toFixed(0)}%</strong>
            </p>
          </div>

          <div className="styles-grid">
            {["visual", "auditivo", "kinestesico"].map((tipo) => (
              <div key={tipo} className={`style-card ${resultados.dominante === tipo ? "selected" : ""}`}>
                <h3>{getIcon(tipo)} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(resultados.conteo[tipo] / total) * 100}%` }}></div>
                </div>
                <p>{resultados.conteo[tipo]} de {total}</p>
              </div>
            ))}
          </div>

          <div className="next-steps card">
            <h3>¿Qué sigue?</h3>
            <p>
              Con base en tus respuestas, identificamos que tu estilo dominante es <strong>{resultados.dominante}</strong>.
              Pronto verás recursos educativos recomendados según tu forma de aprender.
            </p>
          </div>

          <div className="buttons">
            <button className="btn-primary" onClick={() => (window.location.href = "/principalalumno")}>Volver</button>
            <button className="btn-secondary" onClick={() => (window.location.href = "/recursosalumno")}>Ver Recursos Personalizados</button>
          </div>
        </div>
      </div>
    </div>
  );
}
