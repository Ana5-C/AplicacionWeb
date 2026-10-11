import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import RecursoService from "../Services/RecursosService";
import UsuarioAprendizajeService from "../Services/UsuarioAprendizajeService";
import "../estilos/recursosAlumno.css";

const ResourcesPage = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [recursos, setRecursos] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [loading, setLoading] = useState(true);
  const [tipoAprendizaje, setTipoAprendizaje] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { label: "Inicio", path: "/principalalumno", icon: "🏠" },
    { label: "Recursos", path: "/recursosAlumno", icon: "📚" },
    { label: "Mi Ruta", path: "/rutaAlumno", icon: "🛣️" },
    { label: "Mi Progreso", path: "/progresoAlumno", icon: "📈" },
    { label: "Calificaciones", path: "/calificacionesAlumno", icon: "📝" },
    { label: "Mi Perfil", path: "/perfilAlumno", icon: "👤" },
  ];
  /*  1. Obtener estilo de aprendizaje del usuario
  --------------------------------------------------------- */
  useEffect(() => {
    const fetchTipoAprendizaje = async () => {
      if (!usuario?.usuarioId) return;

      try {
        const resp = await UsuarioAprendizajeService.obtenerPorUsuario(
          usuario.usuarioId
        );
        if (resp.data.length > 0) {
          const ultimo = resp.data[resp.data.length - 1];
          setTipoAprendizaje(ultimo.tipoAprendizaje.nombre);
        } else {
          setTipoAprendizaje(null);
        }
      } catch (error) {
        console.error("Error al obtener tipo de aprendizaje:", error);
      }
    };

    fetchTipoAprendizaje();
  }, [usuario]);

  /* 3. Obtener recursos según estilo*/
  useEffect(() => {
    const fetchRecursos = async () => {
      if (!tipoAprendizaje) return;
      setLoading(true);

      try {
        const resp = await RecursoService.getRecursosByTipo(tipoAprendizaje);
        setRecursos(resp.data);
      } catch (error) {
        console.error("Error al obtener recursos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecursos();
  }, [tipoAprendizaje]);

  /* 4. Filtrado por dificultad */
  const normalize = (t) =>
    t?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let recursosFiltrados = recursos;

  if (selectedDifficulty !== "all") {
    recursosFiltrados = recursosFiltrados.filter(
      (r) => normalize(r.dificultad) === normalize(selectedDifficulty)
    );
  }
  /*7. UI e íconos*/
  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case "video":
        return "🎥";
      case "ejercicio":
        return "📘";
      case "lectura":
        return "📄";
      case "simulacion":
        return "🧠";
      default:
        return "📚";
    }
  };

  const getColorDificultad = (d) => `tag ${normalize(d)}`;
  /* Mostrar pantalla si no tiene tipo de aprendizaje */
  if (tipoAprendizaje === null) {
    return (
      <div className="resources-container">

        <div className="card centered-card">
          <h2>Completa tu Perfil</h2>
          <p>Debes realizar el test de estilo de aprendizaje para ver recursos personalizados.</p>
          <button className="btn" onClick={() => navigate("/aprendizajetestalumno")}>
            Realizar Test de Estilo
          </button>
          <button className="btn-outline" onClick={() => navigate("/principalalumno")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  /* Mostrar loading */
  if (loading) {
    return (
      <div className="resources-container">
        <p>Cargando recursos de tipo {tipoAprendizaje}...</p>
      </div>
    );
  }

  /* RENDER PAGE */
  return (
    <div className="resources-layout">
      <div className="resources-container">
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
        
        <button className="btn-outline back-btn" onClick={() => navigate("/principalalumno")}>
          ← Volver al inicio
        </button>

        <div className="header-section">
          <div>
            <h1>Recursos para tu estilo de aprendizaje</h1>
            <p>
              Estás viendo recursos para el estilo:{" "}
              <strong>{tipoAprendizaje}</strong>.
            </p>
          </div>
        </div>

        {/* ===== FILTROS POR DIFICULTAD ===== */}
        <div className="tabs">
          <button
            className={selectedDifficulty === "all" ? "tab active" : "tab"}
            onClick={() => setSelectedDifficulty("all")}
          >
            Todos
          </button>
          <button
            className={selectedDifficulty === "basico" ? "tab active" : "tab"}
            onClick={() => setSelectedDifficulty("basico")}
          >
            Básico
          </button>
          <button
            className={selectedDifficulty === "intermedio" ? "tab active" : "tab"}
            onClick={() => setSelectedDifficulty("intermedio")}
          >
            Intermedio
          </button>
          <button
            className={selectedDifficulty === "avanzado" ? "tab active" : "tab"}
            onClick={() => setSelectedDifficulty("avanzado")}
          >
            Avanzado
          </button>
        </div>

        {/* ===== RESULTADOS ===== */}
        {recursosFiltrados.length === 0 ? (
          <div className="card centered-card">
            <p>
              No hay recursos disponibles.
            </p>
          </div>
        ) : (
          <div className="grid-container">
            {recursosFiltrados.map((recurso) => (
              <div
                key={recurso.recursoId}
                className="card resource-card"
                onClick={() => navigate(`/recurso/${recurso.recursoId}`)}
              >
                {recurso.urlImagen && (
                  <div className="image-container">
                    <img src={recurso.urlImagen} alt={recurso.titulo} />
                  </div>
                )}
                <div className="card-body">
                  <div className="card-tags">
                    <span className={getColorDificultad(recurso.dificultad)}>
                      {recurso.dificultad}
                    </span>
                    <span className="tag tipo">
                      {getIconoTipo(recurso.tipo)} {recurso.tipo}
                    </span>
                  </div>
                  <h3>{recurso.titulo}</h3>
                  <p>{recurso.descripcion}</p>
                  <button className="btn full-width">Acceder al Recurso</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
