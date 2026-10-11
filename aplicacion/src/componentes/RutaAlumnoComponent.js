import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RutaService from "../Services/RutaService";
import UsuarioAprendizajeService from "../Services/UsuarioAprendizajeService";
import RecursoService from "../Services/RecursosService";
import { useAuth } from "../contexts/AuthContext";
import "../estilos/rutaalumno.css";

const dificultadIcono = {
  Básico: "🟢",
  Intermedio: "🟡",
  Avanzado: "🔴",
};

export default function LearningPathPage() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.usuarioId;

  const [ruta, setRuta] = useState([]);
  const [tipoAprendizaje, setTipoAprendizaje] = useState(null);
  const [recursosFiltrados, setRecursosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { label: "Inicio", path: "/principalalumno", icon: "🏠" },
    { label: "Recursos", path: "/recursosAlumno", icon: "📚" },
    { label: "Mi Ruta", path: "/rutaAlumno", icon: "🛣️" },
    { label: "Mi Progreso", path: "/progresoAlumno", icon: "📈" },
    { label: "Calificaciones", path: "/calificacionesAlumno", icon: "📝" },
    { label: "Mi Perfil", path: "/perfilAlumno", icon: "👤" },
  ];

  // 1️⃣ Obtener aprendizaje
  useEffect(() => {
    if (!usuarioId) return;

    const fetchAprendizaje = async () => {
      try {
        const resp = await UsuarioAprendizajeService.obtenerPorUsuario(usuarioId);
        if (resp.data.length > 0) {
          const ultimo = resp.data[resp.data.length - 1];
          setTipoAprendizaje(ultimo.tipoAprendizaje.nombre);
        }
      } catch (e) {
        console.error("Error al obtener estilo:", e);
      }
    };
    fetchAprendizaje();
  }, [usuarioId]);


  // 2️⃣ Obtener recursos filtrados
  useEffect(() => {
    if (!tipoAprendizaje) return;

    const fetchRecursos = async () => {
      try {
        const resp = await RecursoService.getRecursosByTipo(tipoAprendizaje);
        setRecursosFiltrados(resp.data);
      } catch (err) {
        console.error("Error al obtener recursos:", err);
      }
    };

    fetchRecursos();
  }, [tipoAprendizaje]);

  // 3️⃣ Obtener ruta + desbloquear el primero
  const cargarRuta = async () => {
    if (!usuarioId || recursosFiltrados.length === 0) return;

    setLoading(true);

    try {
      const resp = await RutaService.getRutaUsuario(usuarioId);
      const rutaBackend = resp.data;

      // Mezcla recursos con progreso
      let rutaCombinada = recursosFiltrados.map((recurso) => {
        const encontrado = rutaBackend.find(
          (r) => r.recurso.recursoId === recurso.recursoId
        );

        return {
          ...recurso,
          estado: encontrado?.estado || "BLOQUEADO",
          completado: encontrado?.estado === "COMPLETADO",
          desbloqueado:
            encontrado?.estado === "DESBLOQUEADO" ||
            encontrado?.estado === "COMPLETADO",
        };
      });

      // 🟢 El primero siempre desbloqueado
      if (rutaCombinada.length > 0) {
        rutaCombinada[0].desbloqueado = true;
      }

      // 🔓 Desbloquear siguiente si el anterior está completado
      for (let i = 1; i < rutaCombinada.length; i++) {
        if (rutaCombinada[i - 1].completado) {
          rutaCombinada[i].desbloqueado = true;
        }
      }

      setRuta(rutaCombinada);
    } catch (error) {
      console.error("❌ Error al cargar ruta:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar carga cuando existan datos
  useEffect(() => {
    cargarRuta();
  }, [usuarioId, recursosFiltrados]);

  // 4️⃣ Completar recurso → guarda en BD
  const completarRecurso = async (recursoId) => {
    try {
      await RutaService.completarRecurso(usuarioId, recursoId);
      await cargarRuta(); // recarga progreso
    } catch (err) {
      console.error("❌ Error al completar recurso:", err);
    }
  };


  //if (loading) return <p>Cargando tu ruta personalizada...</p>;

  if (tipoAprendizaje === null) {
    return (
      <div className="resources-container">
        
        <div className="card centered-card">
          <h2>Completa tu Perfil</h2>
          <p>Debes realizar el test de estilo de aprendizaje para visualizar tu Ruta de Aprendizaje.</p>
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
  return (
    <div className="lp-container-modern">
      <div className="lp-header-container">
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
        <button className="lp-back-btn" onClick={() => navigate(-1)}>
          ⬅ Regresar
        </button>
        <div className="lp-header">
          <h1>Mi Ruta de Aprendizaje</h1>
          <p>Tu progreso basado en tu estilo de aprendizaje</p>
          <p><strong>Tipo de aprendizaje:</strong> {tipoAprendizaje}</p>
        </div>
      </div>


      <div className="lp-timeline">
        {ruta.map((item, index) => (
          <div key={item.recursoId} className="lp-step">
            {index !== ruta.length - 1 && <div className="lp-line"></div>}

            <div
              className={`lp-card-modern 
                ${!item.desbloqueado ? "lp-locked" : ""} 
                ${item.completado ? "lp-completed" : ""}`}
            >
              <div className="lp-card-header-modern">
                <div className="lp-icon">
                  {!item.desbloqueado ? "🔒" : item.completado ? "✅" : "📘"}
                </div>

                <div>
                  <h2>{item.titulo}</h2>
                  <span className="lp-difficulty-modern">
                    {dificultadIcono[item.dificultad]} {item.dificultad}
                  </span>
                </div>
              </div>

              <p className="lp-description-modern">{item.descripcion}</p>

              {item.desbloqueado && !item.completado && (
                <button
                  className="lp-btn-modern"
                  onClick={() => navigate(`/evaluacionRecurso/${item.recursoId}`)}
                >
                  Realizar Evaluación
                </button>
              )}

              {!item.desbloqueado && (
                <button className="lp-btn-locked" disabled>
                  Completa el recurso anterior
                </button>
              )}

              {item.completado && (
                <button className="lp-btn-modern" disabled>
                  Completado
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
