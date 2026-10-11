import axios from "axios";

const URL_BASE = "http://localhost:8080/pregunta";

class PreguntasService {
    //Obtener todas las preguntas de una evaluación específica
    getPreguntasByEvaluacion(idEvaluacion) {
        return axios.get(`${URL_BASE}/evaluacion/${idEvaluacion}`);
    }
}

export default new PreguntasService();
