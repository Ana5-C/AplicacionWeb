import axios from "axios";

const URL_BASE = "http://localhost:8080/usuarioAprendizaje";

class UsuarioAprendizajeService {
  crear(usuarioAprendizaje) {
    return axios.post(URL_BASE, usuarioAprendizaje, {
      headers: { "Content-Type": "application/json" },
    });
  }

  obtenerPorUsuario(usuarioId) {
    return axios.get(`${URL_BASE}/usuario/${usuarioId}`);
  }

  actualizar(usuarioAprendizajeId, data) {
    return axios.put(`${URL_BASE}/${usuarioAprendizajeId}`, data);
  }
}

export default new UsuarioAprendizajeService();
