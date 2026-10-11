import axios from "axios";

const URL_BASE = "http://localhost:8080/rutaAprendizaje";

class RutaService {
    getCrearRuta(usuarioId) {
        return axios.post(`${URL_BASE}/crearRuta/${usuarioId}`)
    }

    getRutaUsuario(usuarioId) {
        return axios.get(`${URL_BASE}/usuario/${usuarioId}`)
    }

    getCompletarRecurso(usuarioId, recursoId) {
        return axios.get(`${URL_BASE}/completar/${usuarioId}/${recursoId}`)
    }

    getEstadoRecurso(usuarioId, recursoId) {
        return axios.get(`${URL_BASE}/estadoRecurso/${usuarioId}/${recursoId}`);
    }

    cargarRuta(usuarioId, recursoId){
        return axios.post(`${URL_BASE}/completar/${usuarioId}/${recursoId}`)
    }


}

export default new RutaService();