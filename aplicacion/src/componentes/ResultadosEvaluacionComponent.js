import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RespuestaAlumnoService from "../Services/RespuestaAlumnoService";
import EvaluacionRecursoService from "../Services/EvaluacionRecursoService";
import "../estilos/resultadosDiagnostico.css";

export default function ResultadosRecurso() {
  const { id: recursoId } = useParams();
  const { usuario } = useAuth();

  const [preguntas, setPreguntas] = useState([]);
  const [respuestasAlumno, setRespuestasAlumno] = useState([]);
  const [stats, setStats] = useState({
    correctas: 0,
    total: 0,
    porcentaje: 0,
  });
  const navigate = useNavigate();
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
      // OBTENER LA EVALUACIÓN ASOCIADA AL RECURSO
      const erResp = await EvaluacionRecursoService.getEvaluacionRecurso(
        recursoId
      );
      const evaluacion = erResp.data;

      // Preguntas
      setPreguntas(evaluacion.preguntas);

      // Respuestas del alumno
      const respuestasResp =
        await RespuestaAlumnoService.obtenerPorUsuarioYRecurso(
          usuario.usuarioId,
          recursoId
        );

      setRespuestasAlumno(respuestasResp.data);

      // Porcentaje
      const statsResp =
        await RespuestaAlumnoService.obtenerPorcentajeRecurso(
          usuario.usuarioId,
          recursoId
        );

      setStats({
        correctas: statsResp.data.correctas,
        total: statsResp.data.total,
        porcentaje: statsResp.data.porcentaje,
      });
    } catch (error) {
      console.error("Error cargando resultados del recurso", error);
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
        <h1>Resultados de la Evaluación del Recurso</h1>
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

      {/* Revisión de preguntas */}
      <div className="rd-card">
        <h2>Revisión de  respuestas</h2>

        {preguntas.map((pregunta, index) => {
          const rAlumno = respuestasAlumno.find(
            (r) => r.preguntaId === pregunta.preguntaId
          );

          const esCorrecta =
            rAlumno &&
            rAlumno.respuesta.respuesta === pregunta.correcta;

          return (
            <div
              key={pregunta.preguntaId}
              className={`rd-answer-item ${esCorrecta ? "rd-correct" : "rd-wrong"}`}
            >
              <h4>{index + 1}. {pregunta.textoPregunta}</h4>

              <p>
                <strong>Tu respuesta:</strong>{" "}
                {rAlumno ? rAlumno.respuesta.respuesta : "No respondida"}
              </p>

              {!esCorrecta && (
                <>
                  <p><strong>Respuesta correcta:</strong> {pregunta.correcta}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="rd-buttons">
        <button className="rd-btn" onClick={() => (window.location.href = `/recursosAlumno`)}>
          Volver a los recursos
        </button>
      </div>
    </div>
  );
}
