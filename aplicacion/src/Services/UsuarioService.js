import axios from "axios";

const URL_BASE = "http://localhost:8080/usuario";
class UsuarioService {
    login(matricula, contrasenia) {
        return axios.post(`${URL_BASE}/login`, { matricula, contrasenia });
    }

    register(usuario) {
        return axios.post(URL_BASE, usuario)
    }

    findByID(usuarioId) {
        return axios.get(URL_BASE + '/' + usuarioId);
    }

    update(usuarioId, usuario) {
        return axios.put(`${URL_BASE}/${usuarioId}`, usuario);
    }

    delete(usuarioId) {
        return axios.delete(`${URL_BASE}/${usuarioId}`);
    }


    actualizarEstiloAprendizaje(usuarioId, estiloAprendizaje) {
        return axios.put(
            `${URL_BASE}/${usuarioId}/estiloAprendizaje`,
            `"${estiloAprendizaje}"`, //Enviar como texto plano (entre comillas)
            {
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    // ✅ Estas tres funciones deben estar AQUÍ
    getLearningResources() {
        return axios.get("http://localhost:8080/recursos");
    }

    getResourceActivities() {
        return axios.get("http://localhost:8080/actividades");
    }

    getActivityResults(usuarioId) {
        return axios.get(`http://localhost:8080/resultados/usuario/${usuarioId}`);
    }
    /*actualizarEstiloAprendizaje(usuarioId, estiloAprendizaje) {
        return axios.put(`${URL_BASE}/${usuarioId}/estilo-aprendizaje`, { estiloAprendizaje });
    }*/


    /* findAll(){
        return axios.get(URL_BASE);
    }

    create(usuario){
        return axios.post(URL_BASE, usuario)
    }

    findByID(usuarioId){
        return axios.get(URL_BASE+'/'+usuarioId);
    }

    update(usuarioId, usuario){
        return axios.put(URL_BASE+'/'+usuarioId, usuario);
        
    }
    login(matricula, contrasenia) {
        return axios.post(`${URL_BASE}/login`, { matricula, contrasenia });
      } */
}

export default new UsuarioService();