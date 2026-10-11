import axios from "axios";

const URL_BASE = "http://localhost:8080/evaluacionRecurso";

class EvaluacionRecursoService {
    getEvaluacionRecurso(recursoId) {
        return axios.get(`${URL_BASE}/recurso/${recursoId}`);
    }
}

export default new EvaluacionRecursoService();