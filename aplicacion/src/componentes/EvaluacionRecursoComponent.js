import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import RespuestaAlumnoService from "../Services/RespuestaAlumnoService";
import EvaluacionRecursoService from "../Services/EvaluacionRecursoService";
import "../estilos/evaluacionRecurso.css";

export default function EvaluacionRecursoComponent() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { id: recursoId } = useParams();

  const [preguntas, setPreguntas] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
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
    EvaluacionRecursoService.getEvaluacionRecurso(recursoId)
      .then(res => {
        const evaluacion = res.data;
        console.log("Preguntas desde evaluación:", evaluacion.preguntas);

        setPreguntas(evaluacion.preguntas);
        setAnswers(new Array(evaluacion.preguntas.length).fill(""));
      })
      .catch(error => console.error("Error al cargar preguntas:", error));
  }, [recursoId]);



  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < preguntas.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!usuario) return;
    setIsSubmitting(true);

    const respuestasAlumno = preguntas.map((pregunta, index) => ({
      usuario: { usuarioId: usuario.usuarioId },
      pregunta: { preguntaId: pregunta.preguntaId },
      respuesta: { respuestaId: parseInt(answers[index]) },
      fecha: new Date().toISOString(),
    }));

    try {
      const response = await RespuestaAlumnoService.guardarRespuestas(respuestasAlumno);

      if (response.status === 200) {
        setCompleted(true);
      }

      navigate(`/resultadoEvaluacion/recurso/${recursoId}`);

    } catch (error) {
      console.error("Error al guardar respuestas:", error);
      alert("Ocurrió un error al guardar tus respuestas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ⬅️ AHORA REGRESA EXACTAMENTE AL RECURSO
  const handleBack = () => {
    navigate(`/recurso/${recursoId}`);
  };

  if (!preguntas.length) {
    return <p className="diagnostico-loading-text">Cargando preguntas...</p>;
  }

  if (completed) {
    return (
      <div className="diagnostico-container">
        
        <div className="diagnostico-final-card">
          <h2>¡Evaluación completada!</h2>
          <p>Tus respuestas se han guardado correctamente.</p>
          <button className="diagnostico-btn" onClick={handleBack}>
            Volver al recurso
          </button>
        </div>
      </div>
    );
  }

  const progreso = ((currentQuestion + 1) / preguntas.length) * 100;
  const pregunta = preguntas[currentQuestion];
  const allAnswered = answers.every((a) => a !== "");

  return (
    <>
      <button onClick={handleBack} className="diagnostico-btn-back">
        ← Volver al recurso
      </button>

      <div className="diagnostico-container">
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
        <div className="diagnostico-header">
          <h2>Evaluación del Recurso {recursoId.nombre}</h2>
          <p>Evalúa lo aprendido</p>
          <div className="diagnostico-progress-bar">
            <div
              className="diagnostico-progress"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
          <p>Pregunta {currentQuestion + 1} de {preguntas.length}</p>
        </div>

        <div className="diagnostico-card">
          <h3>{pregunta.textoPregunta}</h3>

          <div className="diagnostico-options">
            {/* 🟦 Si la pregunta es abierta */}
            {pregunta.respuestas.length === 0 ? (
              <textarea
                className="diagnostico-textarea"
                placeholder="Escribe tu respuesta aquí..."
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(e.target.value)}
              ></textarea>
            ) : (pregunta.respuestas.map((respuesta) => (
              <label
                key={respuesta.respuestaId}
                className="diagnostico-option"
              >
                <input
                  type="radio"
                  name={`pregunta-${pregunta.preguntaId}`}
                  value={respuesta.respuestaId}
                  checked={answers[currentQuestion] === String(respuesta.respuestaId)}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
                {respuesta.respuesta}
              </label>
            ))
            )}
          </div>
        </div>

        <div className="diagnostico-navigation">
          <button
            className="diagnostico-btn-outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Anterior
          </button>

          {currentQuestion === preguntas.length - 1 ? (
            <button
              className="diagnostico-btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Finalizar Evaluación"}
            </button>
          ) : (
            <button
              className="diagnostico-btn-primary"
              onClick={handleNext}
              disabled={answers[currentQuestion] === ""}
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
