import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PreguntasService from "../Services/PreguntasService";
import RespuestaAlumnoService from "../Services/RespuestaAlumnoService";
import "../estilos/resultadosDiagnostico.css";

export default function ResultadosDiagnostico() {
  const { evaluacionId } = useParams();
  const { usuario } = useAuth();
const navigate = useNavigate();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestasAlumno, setRespuestasAlumno] = useState([]);
  const [stats, setStats] = useState({
    correctas: 0,
    total: 0,
    porcentaje: 0
  });
  const [loading, setLoading] = useState(true);

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
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      // Preguntas
      const preguntasResp = await PreguntasService.getPreguntasByEvaluacion(
        evaluacionId
      );

      // Respuestas del alumno
      const respuestasResp =
        await RespuestaAlumnoService.obtenerPorUsuarioYEvaluacion(
          usuario.usuarioId,
          evaluacionId
        );

      // Estadísticas calculadas en el backend
      const statsResp =
        await RespuestaAlumnoService.obtenerPorcentajeDiagnostico(
          usuario.usuarioId,
          evaluacionId
        );

      setPreguntas(preguntasResp.data);
      setRespuestasAlumno(respuestasResp.data);

      setStats({
        correctas: statsResp.data.correctas,
        total: statsResp.data.total,
        porcentaje: statsResp.data.porcentaje
      });

    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="rd-loading">Cargando resultados...</div>;
  }

  const { correctas, total, porcentaje } = stats;

  const getScoreMessage = () => {
    if (porcentaje >= 90) return "Excelente conocimiento";
    if (porcentaje >= 70) return "Buen nivel de conocimientos previos";
    if (porcentaje >= 50) return "Conocimientos básicos adecuados";
    return "Se recomienda reforzar conceptos fundamentales";
  };

  return (
    <div className="rd-container">
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
      <div className="rd-card rd-main-card">
        <h1>Resultados del Test Diagnóstico</h1>
        <h3 className="rd-score-message">{getScoreMessage()}</h3>

        <div className="rd-score-box">
          <p className="rd-score">{porcentaje}%</p>
        </div>

        <div className="rd-progress-box">
          <p>{correctas} de {total} correctas</p>
          <progress value={porcentaje} max="100"></progress>
        </div>

        <div className="rd-stats-grid">
          <div className="rd-small-card">
            <p className="rd-stat-number">{correctas}</p>
            <p>Correctas</p>
          </div>

          <div className="rd-small-card">
            <p className="rd-stat-number">{total - correctas}</p>
            <p>Incorrectas</p>
          </div>

          <div className="rd-small-card">
            <p className="rd-stat-number">{porcentaje}%</p>
            <p>Puntuación</p>
          </div>
        </div>
      </div>

      {/* Revisión de respuestas */}
      <div className="rd-card">
        <h2>Revisión de Respuestas</h2>

        {preguntas.map((pregunta, index) => {
          const respuestaUser = respuestasAlumno.find(
            (r) => r.preguntaId === pregunta.preguntaId
          );

          const esCorrecta =
            respuestaUser &&
            respuestaUser.respuesta.respuesta === pregunta.correcta;

          return (
            <div
              key={pregunta.preguntaId}
              className={`rd-answer-item ${
                esCorrecta ? "rd-correct" : "rd-wrong"
              }`}
            >
              <h4>
                {index + 1}. {pregunta.textoPregunta}
              </h4>

              <p>
                <strong>Tu respuesta:</strong>{" "}
                {respuestaUser
                  ? respuestaUser.respuesta.respuesta
                  : "No respondida"}
              </p>

              {!esCorrecta && (
                <p>
                  <strong>Respuesta correcta:</strong> {pregunta.correcta}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="rd-buttons">
        <button
          className="rd-btn"
          onClick={() => (window.location.href = "/principalalumno")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
