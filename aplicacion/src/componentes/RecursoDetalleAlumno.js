import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecursosService from "../Services/RecursosService";
import RutaService from "../Services/RutaService";
import { useAuth } from "../contexts/AuthContext";
import "../estilos/recursoDetalleAlumno.css";

const RecursoDetalleComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { usuario } = useAuth();
  const usuarioId = usuario?.usuarioId;

  const [recurso, setRecurso] = useState(null);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [estadoRecurso, setEstadoRecurso] = useState(null);
const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { label: "Inicio", path: "/principalalumno", icon: "🏠" },
    { label: "Recursos", path: "/recursosAlumno", icon: "📚" },
    { label: "Mi Ruta", path: "/rutaAlumno", icon: "🛣️" },
    { label: "Mi Progreso", path: "/progresoAlumno", icon: "📈" },
    { label: "Calificaciones", path: "/calificacionesAlumno", icon: "📝" },
    { label: "Mi Perfil", path: "/perfilAlumno", icon: "👤" },
  ];

  useEffect(() => {
    if (!id || !usuario?.usuarioId) return;

    RutaService.getEstadoRecurso(usuario.usuarioId, id)
      .then((response) => setEstadoRecurso(response.data.estado))
      .catch((error) => console.error("Error estado recurso:", error));
  }, [id, usuario]);

  // 1️⃣ Obtener recurso
  useEffect(() => {
    RecursosService.getRecursoById(id)
      .then((response) => setRecurso(response.data))
      .catch((error) => console.error("Error al obtener recurso:", error));
  }, [id]);

  // 2️⃣ Validar si el recurso está desbloqueado en la ruta
  useEffect(() => {
    if (!usuarioId) return;

    const cargarRuta = async () => {
      try {
        const resp = await RutaService.getRutaUsuario(usuarioId);
        const ruta = resp.data;

        const registro = ruta.find((r) => r.recursoId === Number(id));

        if (registro) {
          setDesbloqueado(registro.desbloqueado);
        } else {
          setDesbloqueado(false);
        }
      } catch (error) {
        console.error("Error al obtener ruta:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarRuta();
  }, [usuarioId, id]);

  // 3️⃣ Render del recurso visual (igual que antes)
  const renderRecursoVisual = () => {
    if (!recurso?.url) return null;

    const url = recurso.url;

    const youtubeRegex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(youtubeRegex);

    if (match) {
      return (
        <iframe
          className="recurso-media video"
          title="YouTube video"
          src={`https://www.youtube.com/embed/${match[1]}`}
          allowFullScreen
        ></iframe>
      );
    }

    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <img src={url} alt={recurso.titulo} className="recurso-media" />;
    }

    if (url.toLowerCase().endsWith(".pdf")) {
      return <iframe src={url} className="recurso-media pdf"></iframe>;
    }

    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video className="recurso-media video" controls>
          <source src={url} />
        </video>
      );
    }

    if (url.match(/\.(mp3|wav|ogg)$/i)) {
      return (
        <audio className="recurso-audio" controls>
          <source src={url} />
        </audio>
      );
    }

    return (
      <a className="btn-external" href={url} target="_blank" rel="noreferrer">
        Abrir recurso externo
      </a>
    );
  };

  if (loading || !recurso) return <h2>Cargando recurso...</h2>;

  return (
    <>
      <button className="btn-volver" onClick={() => navigate("/recursosalumno")}>
        Regresar
      </button>

      <div className="recurso-container">
        <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{!isCollapsed ? "Menú" : "📋"}</h2>
          <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="sidebar-item"
              onClick={() => navigate(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {!isCollapsed && <span className="text">{item.label}</span>}
            </li>
          ))}

          <li className="sidebar-item logout" onClick={() => navigate("/")}>
            <span className="icon">🚪</span>
            {!isCollapsed && <span className="text">Cerrar Sesión</span>}
          </li>
        </ul>
      </div>
      
        <div className="recurso-card">
          <div className="recurso-content">
            <h1 className="recurso-titulo">{recurso.titulo}</h1>

            <p className="recurso-descripcion">{recurso.descripcion}</p>

            <div className="recurso-badges">
              <span className={`badge dificultad ${recurso.dificultad}`}>
                {recurso.dificultad}
              </span>

              <span className="badge tipo">
                {typeof recurso.tipoAprendizaje === "string"
                  ? recurso.tipoAprendizaje
                  : recurso.tipoAprendizaje?.nombre}
              </span>
            </div>

            <div className="recurso-media-container">
              {renderRecursoVisual()}
            </div>

            {/* 4️⃣ Botón de evaluación con bloqueo */}
            {estadoRecurso === "bloqueado" ? (
              <button className="btn-evaluacion bloqueado" disabled>
                🔒 Recurso bloqueado — completa el anterior
              </button>
            ) : (
              <button
                className="btn-evaluacion"
                onClick={() => navigate(`/evaluacionRecurso/${recurso.recursoId}`)}
              >
                Iniciar Evaluación
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecursoDetalleComponent;
