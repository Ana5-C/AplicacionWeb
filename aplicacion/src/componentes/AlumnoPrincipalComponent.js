import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UsuarioAprendizajeService from "../Services/UsuarioAprendizajeService";
import RespuestaAlumnoService from "../Services/RespuestaAlumnoService";
import "../estilos/principalAlumno.css";
import { BookOpen, Brain, ClipboardCheck, User, TrendingUp, Award, Map, } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const AlumnoPrincipalComponent = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [perfilAprendizaje, setPerfilAprendizaje] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [testEstiloCompletado, setTestEstiloCompletado] = useState(false);
  const [diagnosticoCompletado, setDiagnosticoCompletado] = useState(false);


  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!usuario) return;

    // 🔹 Consultar si el alumno ya tiene un perfil de aprendizaje registrado
    UsuarioAprendizajeService.obtenerPorUsuario(usuario.usuarioId)
      .then((response) => {
        const registros = response.data;
        if (registros && registros.length > 0) {
          const ultimo = registros[registros.length - 1];
          setPerfilAprendizaje(ultimo.tipoAprendizaje.nombre);
          setTestEstiloCompletado(true);
        } else {
          setPerfilAprendizaje(null);
          setTestEstiloCompletado(false);
        }
      })
      .catch((error) => {
        console.error("Error al obtener el perfil de aprendizaje:", error);
        setTestEstiloCompletado(false);
      })
      .finally(() => setCargando(false));

    RespuestaAlumnoService.obtenerPorUsuarioYEvaluacion(usuario.usuarioId, 1)
      .then((resp) => {
        if (resp.data && resp.data.length > 0) {
          setDiagnosticoCompletado(true);
        } else {
          setDiagnosticoCompletado(false);
        }
      })
      .catch((e) => {
        console.error("Error revisando diagnóstico:", e);
        setDiagnosticoCompletado(false);
      });

  }, [usuario]);

  if (cargando) return <p>Cargando tu información...</p>;

  return (
    <div className="principal-alumno-container">
      {/* 🔹 Encabezado principal */}
      <div className="principal-dashboard-header">
        <div>
          <h1 className="principal-dashboard-title">
            Bienvenido, {usuario?.nombre} {usuario?.appat} {usuario?.apmat}
          </h1>
          <p className="principal-dashboard-subtitle">
            Matrícula: {usuario?.matricula}
          </p>
        </div>
        <div className="principal-dashboard-actions">
          <Link to="/perfilalumno" className="principal-btn-outline">
            <User className="principal-icon" /> Mi Perfil
          </Link>
          <button className="principal-btn-outline" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* 🔹 Evaluaciones Pendientes */}
      {(!diagnosticoCompletado || !testEstiloCompletado === true) && (
        <div className="principal-card principal-pending">
          <h2 className="principal-card-title">
            <ClipboardCheck className="principal-icon" /> Evaluaciones Pendientes
          </h2>
          <p>Completa estas evaluaciones para recibir contenido personalizado.</p>

          <div className="principal-tests-container">
            {/* Test Diagnóstico */}
            {!diagnosticoCompletado && (
              <div className="principal-test-item">
                <div>
                  <h3>Test Diagnóstico</h3>
                  <p>Evalúa tus conocimientos previos en programación.</p>
                </div>
                <Link to="/diagnosticotestalumno" className="principal-btn-primary">
                  Realizar Test
                </Link>
              </div>
            )}

            {/* Test de Estilo de Aprendizaje */}
            {!testEstiloCompletado && (
              <div className="principal-test-item">
                <div>
                  <h3>Test de Estilo de Aprendizaje</h3>
                  <p>Identifica si eres visual, auditivo o kinestésico.</p>
                </div>
                <Link to="/aprendizajetestalumno" className="principal-btn-primary">
                  Realizar Test
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔹 Secciones principales */}
      <div className="principal-grid-container">
        <div className="principal-card">
          <h3 className="principal-card-title">
            <BookOpen className="principal-icon principal-blue" /> Recursos
          </h3>
          <p>Accede a materiales personalizados según tu estilo de aprendizaje.</p>
          <Link to="/recursosalumno" className="principal-btn-primary">
            Ver Recursos
          </Link>
        </div>

        <div className="principal-card">
          <h3 className="principal-card-title">
            <Map className="principal-icon principal-green" /> Ruta de Aprendizaje
          </h3>
          <p>Visualiza tu ruta personalizada y progreso por temas.</p>
          <Link to="/rutaalumno" className="principal-btn-outline">
            Ver Ruta
          </Link>
        </div>

        <div className="principal-card">
          <h3 className="principal-card-title">
            <TrendingUp className="principal-icon principal-purple" /> Mi Progreso
          </h3>
          <p>Monitorea tu avance y estadísticas de aprendizaje.</p>
          <Link to="/progresoalumno" className="principal-btn-outline">
            Ver Progreso
          </Link>
        </div>

        <div className="principal-card">
          <h3 className="principal-card-title">
            <Award className="principal-icon principal-orange" /> Calificaciones
          </h3>
          <p>Consulta tus calificaciones y retroalimentación.</p>
          <Link to="/calificacionesalumno" className="principal-btn-outline">
            Ver Calificaciones
          </Link>
        </div>
      </div>

      {/* 🔹 Perfil de aprendizaje */}
      {perfilAprendizaje && (
        <div className="principal-card principal-learning-profile">
          <h3 className="principal-card-title">
            <Brain className="principal-icon" /> Tu Perfil de Aprendizaje
          </h3>

          <div className="principal-learning-data">
            <div>
              <h4>Estilo de Aprendizaje:</h4>
              <p className="principal-highlight">
                {perfilAprendizaje.charAt(0).toUpperCase() + perfilAprendizaje.slice(1)}
              </p>
            </div>

            {usuario?.diagnosticScore !== undefined && (
              <div>
                <h4>Puntuación Diagnóstica:</h4>
                <div className="principal-progress-container">
                  <div
                    className="principal-progress-bar"
                    style={{ width: `${usuario.diagnosticScore}%` }}
                  ></div>
                  <span>{usuario.diagnosticScore}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumnoPrincipalComponent;
