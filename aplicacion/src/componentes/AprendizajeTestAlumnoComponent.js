import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import UsuarioService from "../Services/UsuarioService";
import PreguntasService from "../Services/PreguntasService";
import RespuestaAlumnoService from "../Services/RespuestaAlumnoService";
import "../estilos/aprendizajeTestAlumno.css";

export default function AprendizajeTestAlumno() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [preguntas, setPreguntas] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const idEvaluacionTipoAprendizaje = 2;
    PreguntasService.getPreguntasByEvaluacion(idEvaluacionTipoAprendizaje)
      .then((response) => {
        setPreguntas(response.data);
        setAnswers(new Array(response.data.length).fill(""));
      })
      .catch((error) => console.error("Error al cargar preguntas:", error));
  }, []);

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
    setIsSubmitting(true);

    const estiloContador = { visual: 0, auditivo: 0, kinestesico: 0 };

    preguntas.forEach((pregunta, index) => {
      const respuestaId = parseInt(answers[index]);
      const respuestaSeleccionada = pregunta.respuestas.find(
        (r) => r.respuestaId === respuestaId
      );

      if (respuestaSeleccionada?.tipoAprendizaje?.nombre) {
        const tipo = respuestaSeleccionada.tipoAprendizaje.nombre.toLowerCase();
        if (estiloContador[tipo] !== undefined) {
          estiloContador[tipo]++;
        }
      }
    });

    let estiloDominante = "visual";
    let max = 0;
    Object.entries(estiloContador).forEach(([estilo, cantidad]) => {
      if (cantidad > max) {
        estiloDominante = estilo;
        max = cantidad;
      }
    });

    const respuestasAlumno = preguntas.map((pregunta, index) => ({
      usuario: { usuarioId: usuario.usuarioId },
      pregunta: { preguntaId: pregunta.preguntaId },
      respuesta: { respuestaId: parseInt(answers[index]) },
      fecha: new Date().toISOString(),
    }));

    try {
      const response = await RespuestaAlumnoService.guardarRespuestas(respuestasAlumno);

      if (response.status === 200) {
        alert(response.data.mensaje);

        // Guardar resultado en localStorage
        localStorage.setItem("resultadoAprendizaje", JSON.stringify({
          respuestas: answers,
          estiloContador,
          estiloDominante,
          completadoEn: new Date().toISOString(),
        }));

        // Actualizar el estilo de aprendizaje en backend
        try {
          await UsuarioService.actualizarEstiloAprendizaje(usuario.usuarioId, estiloDominante);
          console.log("✅ Estilo actualizado:", estiloDominante);
        } catch (error) {
          console.error("⚠️ No se pudo actualizar el estilo:", error.response?.data || error);
        }

        // Redirigir al resultado
        navigate("/resultados-test-aprendizaje-alumno");
      }
    } catch (error) {
      console.error("Error al guardar respuestas:", error);
      alert("Ocurrió un error al guardar tus respuestas.");
    }


  };

  if (!preguntas.length) {
    return <p className="loading-text">Cargando preguntas...</p>;
  }

  const progreso = ((currentQuestion + 1) / preguntas.length) * 100;
  const pregunta = preguntas[currentQuestion];
  const allAnswered = answers.every((a) => a !== "");

  const handleLogout = () => {
    navigate("/principalalumno");
  };

  

  return (
    <>
      <button onClick={handleLogout} className="btn-back">← Volver</button>
      <div className="test-container">
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
        <div className="test-header">
          <h2>Test de Estilo de Aprendizaje</h2>
          <p>Descubre cómo aprendes mejor</p>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progreso}%` }}></div>
          </div>
          <p>Pregunta {currentQuestion + 1} de {preguntas.length}</p>
        </div>

        <div className="question-card">
          <h3>{pregunta.textoPregunta}</h3>
          <div className="options-list">
            {pregunta.respuestas.map((respuesta) => (
              <label key={respuesta.respuestaId} className="option">
                <input
                  type="radio"
                  name={`pregunta-${pregunta.preguntaId}`}
                  value={respuesta.respuestaId}
                  checked={answers[currentQuestion] === String(respuesta.respuestaId)}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                />
                {respuesta.respuesta}
              </label>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button
            className="btn-outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Anterior
          </button>

          {currentQuestion === preguntas.length - 1 ? (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Finalizar Test"}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={answers[currentQuestion] === ""}
            >
              Siguiente →
            </button>
          )}
        </div>
        <p className="note">
          No hay respuestas correctas o incorrectas. Selecciona la opción que mejor describa tu forma de aprender.
        </p>
      </div>
    </>
  );
}
