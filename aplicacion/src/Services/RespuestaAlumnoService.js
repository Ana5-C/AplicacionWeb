import axios from "axios";

const URL_BASE = "http://localhost:8080/respuestaAlumno";

class RespuestaAlumnoService {
  obtenerPorUsuario(usuarioId) {
    return axios.get(`${URL_BASE}/usuario/${usuarioId}`);
  }

  obtenerPorUsuarioYEvaluacion(usuarioId, evaluacionId) {
    return axios.get(`${URL_BASE}/usuario/${usuarioId}/evaluacion/${evaluacionId}`);
  }

  guardarRespuestas(respuestas) {
    return axios.post(`${URL_BASE}/respuestas`, respuestas, {
      headers: { "Content-Type": "application/json" },
    });
  }

  obtenerPorcentajeDiagnostico(usuarioId, evaluacionId) {
    return axios.get(`${URL_BASE}/usuario/${usuarioId}/evaluacion/${evaluacionId}/porcentaje`);
  }

  obtenerActividadesCompletadas(usuarioId) {
    return axios.get(`${URL_BASE}/usuario/${usuarioId}`);
  }

  // 🔹 Nuevo: respuestas por recurso
  obtenerPorUsuarioYRecurso(usuarioId, recursoId) {
    return axios.get(`${URL_BASE}/usuario/${usuarioId}/recurso/${recursoId}`);
  }

  // 🔹 Nuevo: porcentaje por recurso
  obtenerPorcentajeRecurso(usuarioId, recursoId) {
    return axios.get(`${URL_BASE}/porcentaje/${usuarioId}/recurso/${recursoId}`);
  }

}

export default new RespuestaAlumnoService();
