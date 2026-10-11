import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/calificacionesAlumno.css";

const CalificacionesAlumno = () => {
  const navigate = useNavigate();

  const [activityResults, setActivityResults] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [averageScore, setAverageScore] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // ============================================
  // 🔥 DATOS FICTICIOS
  // ============================================
  useEffect(() => {
    // 8 evaluaciones inventadas
    const fakeData = [
      {
        id: 1,
        activityTitle: "Evaluación: Construye tu Primer Algoritmo",
        score: 80,
        completedAt: "2025-02-10T14:30",
        feedback: "Buen trabajo, sigue practicando los algoritmos."
      }
    ];

    setActivityResults(fakeData);

    // estadísticas
    const total = fakeData.length;
    const passed = fakeData.filter((r) => r.score >= 70).length;
    const failed = total - passed;
    const avg =
      Math.round(fakeData.reduce((sum, r) => sum + r.score, 0) / total);

    setPassedCount(passed);
    setFailedCount(failed);
    setAverageScore(avg);
  }, []);

  // ============================================
  // FILTROS
  // ============================================
  const filteredResults = activityResults.filter((result) => {
    if (selectedTab === "passed") return result.score >= 70;
    if (selectedTab === "failed") return result.score < 70;
    return true;
  });

  const sortedResults = [...filteredResults].sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
  );

  const getScoreClass = (score) => {
    if (score >= 90) return "score-high";
    if (score >= 70) return "score-medium";
    return "score-low";
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { label: "Inicio", path: "/principalalumno", icon: "🏠" },
    { label: "Recursos", path: "/recursosAlumno", icon: "📚" },
    { label: "Mi Ruta", path: "/rutaAlumno", icon: "🛣️" },
    { label: "Mi Progreso", path: "/progresoAlumno", icon: "📈" },
    { label: "Calificaciones", path: "/calificacionesAlumno", icon: "📝" },
    { label: "Mi Perfil", path: "/perfilAlumno", icon: "👤" },
  ];


  // ============================================
  // RENDER
  // ============================================
  return (

    <div className="progreso-container">
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

      <button className="back-btn" onClick={() => navigate("/principalalumno")}>
        ← Volver al Dashboard
      </button>

      <h1 className="titulo">Mis Calificaciones</h1>
      <p className="subtitulo">Consulta tus calificaciones y retroalimentación</p>

      {/* RESUMEN */}
      <div className="resumen">
        <div className="card">
          <h3>Promedio General</h3>
          <p className={`score ${getScoreClass(averageScore)}`}>{averageScore}%</p>
          <span>{activityResults.length} evaluaciones</span>
        </div>

        <div className="card">
          <h3>Aprobadas</h3>
          <p className="score score-medium">{passedCount}</p>
          <span>70% o más</span>
        </div>

        <div className="card">
          <h3>No Aprobadas</h3>
          <p className="score score-low">{failedCount}</p>
          <span>Menos de 70%</span>
        </div>
      </div>

      {/* HISTORIAL */}
      <div className="card historial">
        <h3>Historial de Evaluaciones</h3>

        {/* PESTAÑAS */}
        <div className="tabs">
          <button
            className={selectedTab === "all" ? "active" : ""}
            onClick={() => setSelectedTab("all")}
          >
            Todas ({activityResults.length})
          </button>

          <button
            className={selectedTab === "passed" ? "active" : ""}
            onClick={() => setSelectedTab("passed")}
          >
            Aprobadas ({passedCount})
          </button>

          <button
            className={selectedTab === "failed" ? "active" : ""}
            onClick={() => setSelectedTab("failed")}
          >
            No Aprobadas ({failedCount})
          </button>
        </div>

        {/* LISTADO */}
        {sortedResults.length === 0 ? (
          <div className="vacio">
            <p>No hay registros.</p>
          </div>
        ) : (
          <div className="resultados">
            {sortedResults.map((result) => (
              <div
                key={result.id}
                className={`resultado ${result.score >= 70 ? "aprobado" : "no-aprobado"
                  }`}
              >
                <div className="resultado-header">
                  <h4>{result.activityTitle}</h4>
                  <p className={`score ${getScoreClass(result.score)}`}>
                    {result.score}%
                  </p>
                </div>

                <p className="fecha">
                  Completado el{" "}
                  {new Date(result.completedAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <p className="retro">
                  <strong>Retroalimentación del Docente:</strong>{" "}
                  {result.feedback || "Sin comentarios"}
                </p>

                <button
                  className="btn-outline"
                  onClick={() => navigate(`/evaluacion/${result.id}`)}
                >
                  Ver Resultados
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalificacionesAlumno;
