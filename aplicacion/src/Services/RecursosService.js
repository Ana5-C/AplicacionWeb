import axios from "axios";

const URL_BASE = "http://localhost:8080/recurso";

class RecursoService {
  getAllRecursos() {
    return axios.get(URL_BASE);
  }

  getRecursoById(id) {
    return axios.get(`${URL_BASE}/${id}`);
  }
  getRecursosPorDificultad(nivel) {
    return axios.get(`${URL_BASE}/dificultad/${nivel}`);
  }
  getRecursosByTipo(tipoAprendizaje) {
    return axios.get(`${URL_BASE}/tipo/${tipoAprendizaje}`);
  }
}

export default new RecursoService();
