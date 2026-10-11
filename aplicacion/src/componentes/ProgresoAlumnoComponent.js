import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import RecursosService from "../Services/RecursosService";
import RespuestaAlumnoService from "../Services/RespuestaAlumnoService";
import UsuarioAprendizajeService from "../Services/UsuarioAprendizajeService";
import "../estilos/progresoAlumno.css";
import {
  Menu,
  ArrowLeft, TrendingUp, Award,
  BookOpen, CheckCircle, Target, CircleUser,
} from "lucide-react";

export default function ProgresoAlumno({ onBack }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [perfilAprendizaje, setPerfilAprendizaje] = useState(null);
  const [resources, setResources] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [diagnosticScore, setDiagnosticScore] = useState(0);
  const DIAGNOSTIC_TEST_ID = 1;
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);


  // 1. Cargar estilo del usuario
  useEffect(() => {
    if (!usuario) return;

    UsuarioAprendizajeService.obtenerPorUsuario(usuario.usuarioId)
      .then((res) => {
        const registros = res.data;
        if (registros.length > 0) {
          const ultimo = registros[registros.length - 1];
          setPerfilAprendizaje(ultimo.tipoAprendizaje.nombre.toLowerCase());
        }
      })
      .catch((err) => console.error("Error obteniendo estilo:", err));
  }, [usuario, location.key]);
  // 2. Cargar recursos del estilo
  useEffect(() => {
    if (!perfilAprendizaje) return;

    RecursosService.getRecursosByTipo(perfilAprendizaje)
      .then((res) => setResources(res.data))
      .catch((err) => console.error("Error obteniendo recursos por estilo:", err));
  }, [perfilAprendizaje, location.key]);

  // 3. Obtener score del test diagnóstico
  useEffect(() => {
    if (!usuario) return;

    RespuestaAlumnoService.obtenerPorcentajeDiagnostico(
      usuario.usuarioId,
      DIAGNOSTIC_TEST_ID
    )
      .then((res) => setDiagnosticScore(res.data.porcentaje))
      .catch((err) => console.error("Error porcentaje diagnóstico:", err));
  }, [usuario, location.key]);

  // 4. Obtener actividades completadas
  useEffect(() => {
    if (!usuario || resources.length === 0) return;

    RespuestaAlumnoService.obtenerActividadesCompletadas(usuario.usuarioId)
      .then((res) => {
        const completadas = res.data.filter((r) => {
          if (r.evaluacionId === DIAGNOSTIC_TEST_ID) return false;
          return resources.some((recurso) => recurso.recursoId === r.recursoId);
        });
        setCompletedActivities(completadas);
      })
      .catch((err) => console.error("Error actividades completadas:", err));
  }, [usuario, resources, location.key]);

  // 5. Progreso
  const totalActivities = resources.length;
  const completed = completedActivities.length;
  const completionPercentage =
    totalActivities > 0 ? Math.round((completed / totalActivities) * 100) : 0;

  const averageScore =
    completed > 0
      ? Math.round(
        completedActivities.reduce((sum, a) => sum + a.score, 0) /
        completedActivities.length
      )
      : 0;

  const passedActivities = completedActivities.filter((a) => a.score >= 70).length;

  const getScoreColor = (score) => {
    if (score >= 90) return "score-high";
    if (score >= 70) return "score-medium";
    return "score-low";
  };

  const handleLogout = () => navigate("/principalalumno");

  // 6. Construir lista con ACTIVIDADES + TESTS
  const testResults = [];

  if (diagnosticScore > 0) {
    testResults.push({
      id: "diagnostico",
      type: "diagnostico",
      title: "Test Diagnóstico",
      score: diagnosticScore,
      completedAt: new Date(),
    });
  }

  if (perfilAprendizaje) {
    testResults.push({
      id: "estilo",
      type: "estilo",
      title: "Test de Estilo de Aprendizaje",
      completedAt: new Date(),
    });
  }

  const allRecentActivities = [
    ...testResults,
    ...completedActivities,
  ];

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

          <li onClick={() => { if (!menuAbierto) return;  navigate("/recursos")}}>
            <BookOpen size={30} /> <span>Inicio</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return;  navigate("/recursos")}}>
            <Target size={30} />  <span>Recursos</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return;  navigate("/recursos")}}>
            <TrendingUp size={30} />  <span>Mi Ruta</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return;  navigate("/recursos")}}>
            <Award size={30} /> <span>Mi Progreso</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return;  navigate("/recursos")}}>
            <CheckCircle size={30} />  <span>Calificaciones</span>
          </li>

          <li onClick={() => { if (!menuAbierto) return;  navigate("/recursos")}}>
            <CircleUser size={30} />  <span>Mi Perfil</span>
          </li>
        </ul>
      </aside>


      {/* CONTENIDO PRINCIPAL */}
      <div className={`content ${menuAbierto ? "shift" : ""}`}>

        <div className="container">

          {/* Encabezado */}
          <div className="header">
            <div className="header-text">
              <h1>Mi Progreso</h1>
              <p>Visualiza tu avance y desempeño en la plataforma</p>
            </div>
            <div className="back-button">
              <button onClick={handleLogout}>
                <ArrowLeft className="icon" /> Volver
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="stats-grid">
          {/* ... NO SE MODIFICA NADA AQUÍ ... */}
          <div className="card">
            <div className="card-header">Evaluaciones Completadas</div>
            <div className="card-content">
              <CheckCircle className="icon-large primary" />
              <div>
                <p className="stat-value">
                  {completed}/{totalActivities}
                </p>
                <p className="stat-label">{completionPercentage}% completado</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Promedio General</div>
            <div className="card-content">
              <TrendingUp className="icon-large accent" />
              <div>
                <p className={`stat-value ${getScoreColor(averageScore)}`}>
                  {averageScore}%
                </p>
                <p className="stat-label">Puntuación promedio</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Evaluaciones Aprobadas</div>
            <div className="card-content">
              <Award className="icon-large primary" />
              <div>
                <p className="stat-value">{passedActivities}</p>
                <p className="stat-label">Con 70% o más</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Estilo de Aprendizaje</div>
            <div className="card-content">
              <BookOpen className="icon-large accent" />
              <div>
                <p className="stat-value">{perfilAprendizaje}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progreso general */}
        <div className="card progress-card">
          <div className="card-header">
            <Target className="icon-small" /> Progreso General
          </div>

          <p>
            Tu avance considerando únicamente recursos del tipo{" "}
            <strong>{perfilAprendizaje}</strong>
          </p>

          <p className="stat-value">
            Evaluaciones Completadas: {completed}/{totalActivities}
          </p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          {/* Tests */}
          <div className="tests-grid">
            <div className="test-card">
              <div className="test-header">
                <span>Test Diagnóstico</span>
                {diagnosticScore > 0 ? (
                  <CheckCircle className="icon-small primary" />
                ) : (
                  <span className="badge">Pendiente</span>
                )}
              </div>
              <p className="score">{diagnosticScore}%</p>
            </div>

            <div className="test-card">
              <div className="test-header">
                <span>Test de Estilo</span>
                {perfilAprendizaje ? (
                  <CheckCircle className="icon-small primary" />
                ) : (
                  <span className="badge">Pendiente</span>
                )}
              </div>
              <p className="score">{perfilAprendizaje}</p>
            </div>
          </div>
        </div>

        {/* ACTIVIDADES RECIENTES */}
        <div className="card recent-activities">
          <div className="card-header">
            <h3>Actividades Recientes</h3>
            <p>Tus últimas evaluaciones completadas</p>
          </div>

          <div className="card-content">
            {allRecentActivities.length === 0 ? (
              <div className="empty-state">
                <BookOpen className="icon-large muted" />
                <p>Aún no has completado actividades</p>
                <button className="button-explore" onClick={() => onBack("/recursosAlumno")}>
                  Explorar Recursos
                </button>
              </div>
            ) : (
              <div className="activity-list">
                {allRecentActivities
                  .sort(
                    (a, b) =>
                      new Date(b.completedAt) - new Date(a.completedAt)
                  )
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="activity-item">
                      <div className="activity-info">
                        <h4>{item.title || "Actividad"}</h4>
                      </div>

                      <div className="activity-score">
                        {/* Actividad normal */}
                        {item.type !== "diagnostico" &&
                          item.type !== "estilo" && (
                            <>
                              {item.score >= 70 ? (
                                <span className="badge approved">
                                  Aprobado
                                </span>
                              ) : (
                                <span className="badge not-approved">
                                  No aprobado
                                </span>
                              )}
                            </>
                          )}

                        {/* Botón Ver Resultados */}
                        <button
                          className="result-button"
                          onClick={() => {
                            if (item.type === "diagnostico") {
                              navigate("/resultados-diagnostico/1");
                            } else if (item.type === "estilo") {
                              navigate("/resultados-test-aprendizaje-alumno");
                            } else {
                              navigate(`/resultadoActividad/${item.id}`);
                            }
                          }}
                        >
                          Ver resultados
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// import React, { useEffect, useState } from "react";
// import { ArrowLeft, TrendingUp, Award, BookOpen, CheckCircle } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "../estilos/progresoAlumno.css";

// export default function ProgresoAlumnoFicticio({ onBack }) {

//   const [perfilAprendizaje, setPerfilAprendizaje] = useState("visual");
//   const [resources, setResources] = useState([]);
//   const [completedActivities, setCompletedActivities] = useState([]);
//   const [diagnosticScore, setDiagnosticScore] = useState(0);
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const navigate = useNavigate();
//   const menuItems = [
//     { label: "Inicio", path: "/principalalumno", icon: "🏠" },
//     { label: "Recursos", path: "/recursosAlumno", icon: "📚" },
//     { label: "Mi Ruta", path: "/rutaAlumno", icon: "🛣️" },
//     { label: "Mi Progreso", path: "/progresoAlumno", icon: "📈" },
//     { label: "Calificaciones", path: "/calificacionesAlumno", icon: "📝" },
//     { label: "Mi Perfil", path: "/perfilAlumno", icon: "👤" },
//   ];
//   // CARGA TOTALMENTE FICTICIA
//   useEffect(() => {

//     // Recursos ficticios
//     const fakeResources = [
//       { recursoId: 1, titulo: "Actividad Práctica: Construye tu Primer Algoritmo" },
//       { recursoId: 2, titulo: "Variables y Tipos de Datos" },
//       { recursoId: 3, titulo: "Estructuras Condicionales" },
//       { recursoId: 4, titulo: "Ciclos en JavaScript" },
//       { recursoId: 5, titulo: "Ciclos en JavaScript" },
//       { recursoId: 6, titulo: "Ciclos en JavaScript" },
//       { recursoId: 7, titulo: "Ciclos en JavaScript" },
//       { recursoId: 8, titulo: "Ciclos en JavaScript" },
//       { recursoId: 9, titulo: "Ciclos en JavaScript" },
//     ];

//     // Actividades ficticias
//     const fakeActivities = [
//       {
//         id: 101,
//         recursoId: 1,
//         title: "Evaluación: Construye tu Primer Algoritmo",
//         score: 100,
//         completedAt: "2024-11-20T10:15:00",
//       }
//     ];

//     setResources(fakeResources);
//     setCompletedActivities(fakeActivities);
//     setPerfilAprendizaje("visual");
//     setDiagnosticScore(78);

//   }, []);

//   // Cálculos
//   const totalActivities = resources.length;
//   const completed = completedActivities.length;
//   const completionPercentage = Math.round((completed / totalActivities) * 100);

//   const averageScore = Math.round(
//     completedActivities.reduce((sum, a) => sum + a.score, 0) /
//     completedActivities.length
//   );

//   const passedActivities = completedActivities.filter(a => a.score >= 70).length;

//   const getScoreColor = (score) => {
//     if (score >= 90) return "score-high";
//     if (score >= 70) return "score-medium";
//     return "score-low";
//   };

//   const allRecentActivities = [
//     {
//       id: "diagnostico",
//       title: "Test Diagnóstico",
//       score: diagnosticScore,
//       type: "diagnostico",
//       completedAt: new Date(),
//     },
//     {
//       id: "estilo",
//       title: "Test de Estilo de Aprendizaje",
//       type: "estilo",
//       completedAt: new Date(),
//     },
//     ...completedActivities
//   ];

//   return (
//     <div className={`progress-page ${isCollapsed ? "expanded" : "menu-open"}`}>
//       <div className="container">
//         <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
//           <div className="sidebar-header">
//             <h2 className="sidebar-title">{!isCollapsed ? "Menú" : "📋"}</h2>
//             <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
//               {isCollapsed ? "➡️" : "⬅️"}
//             </button>
//           </div>

//           <ul className="sidebar-menu">
//             {menuItems.map((item, index) => (
//               <li
//                 key={index}
//                 className="sidebar-item"
//                 onClick={() => navigate(item.path)}
//               >
//                 <span className="icon">{item.icon}</span>
//                 {!isCollapsed && <span className="text">{item.label}</span>}
//               </li>
//             ))}

//             <li className="sidebar-item logout" onClick={() => navigate("/")}>
//               <span className="icon">🚪</span>
//               {!isCollapsed && <span className="text">Cerrar Sesión</span>}
//             </li>
//           </ul>
//         </div>
//         {/* Encabezado */}
//         <div className="header">
//           <div className="header-text">
//             <h1>Mi Progreso</h1>
//             <p>Visualiza tu avance y desempeño en la plataforma</p>
//           </div>
//           <div className="back-button">
//             <button onClick={() => onBack("/principalalumno")}>
//               <ArrowLeft className="icon" /> Volver
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Estadísticas principales */}
//       <div className="stats-grid">

//         <div className="card">
//           <div className="card-header">Evaluaciones Completadas</div>
//           <div className="card-content">
//             <CheckCircle className="icon-large primary" />
//             <div>
//               <p className="stat-value">{completed}/{totalActivities}</p>
//               <p className="stat-label">{completionPercentage}% completado</p>
//             </div>
//           </div>
//         </div>

//         <div className="card">
//           <div className="card-header">Promedio General</div>
//           <div className="card-content">
//             <TrendingUp className="icon-large accent" />
//             <div>
//               <p className={`stat-value ${getScoreColor(averageScore)}`}>
//                 {averageScore}%
//               </p>
//               <p className="stat-label">Puntuación promedio</p>
//             </div>
//           </div>
//         </div>

//         <div className="card">
//           <div className="card-header">Evaluaciones Aprobadas</div>
//           <div className="card-content">
//             <Award className="icon-large primary" />
//             <div>
//               <p className="stat-value">{passedActivities}</p>
//               <p className="stat-label">Con 70% o más</p>
//             </div>
//           </div>
//         </div>

//         <div className="card">
//           <div className="card-header">Estilo de Aprendizaje</div>
//           <div className="card-content">
//             <BookOpen className="icon-large accent" />
//             <div>
//               <p className="stat-value">{perfilAprendizaje}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* LOGROS */}
//       <div className="dashboard-columns">
//         {/* LOGROS */}
//         <div className="dashboard-section">
//           <h4>🏅 Logros</h4>
//           <ul>
//             {averageScore >= 90 && <li>🔥 Excelente rendimiento</li>}
//             {passedActivities >= 3 && <li>🏆 Constancia: 3 evaluaciones aprobadas</li>}
//             {completionPercentage >= 50 && <li>🚀 Buen ritmo: mitad completada</li>}
//           </ul>
//         </div>

//         {/* ÁREAS DE MEJORA */}
//         <div className="dashboard-section">
//           <h4>🔍 Áreas de Mejora</h4>
//           <ul>
//             {averageScore < 70 && <li>Repite evaluaciones para reforzar.</li>}
//             {completionPercentage < 50 && <li>Completa más recursos poco a poco.</li>}
//             {passedActivities === 0 && <li>Revisa tus errores e intenta de nuevo.</li>}
//           </ul>
//         </div>
//       </div>

//       {/* Actividades recientes */}
//       <div className="card recent-activities">
//         <div className="card-header">
//           <h3>Actividades Recientes</h3>
//           <p>Tus últimas evaluaciones completadas</p>
//         </div>

//         <div className="card-content">
//           <div className="activity-list">
//             {allRecentActivities
//               .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
//               .slice(0, 5)
//               .map((item) => (
//                 <div key={item.id} className="activity-item">
//                   <div className="activity-info">
//                     <h4>{item.title}</h4>
//                   </div>

//                   <div className="activity-score">
//                     {item.type !== "diagnostico" && item.type !== "estilo" && (
//                       <>
//                         {item.score >= 70 ? (
//                           <span className="badge approved">Aprobado</span>
//                         ) : (
//                           <span className="badge not-approved">No aprobado</span>
//                         )}
//                       </>
//                     )}

//                     <button className="result-button">
//                       Ver resultados
//                     </button>
//                   </div>
//                 </div>
//               ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
