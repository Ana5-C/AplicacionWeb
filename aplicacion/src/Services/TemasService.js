import axios from "axios";

const URL_BASE = "http://localhost:8080/temas";

class TemarioService {
    getTemarioId(id) {
        return axios.get(`${URL_BASE}/${id}`);
    }
    getAllTemas() {
    return axios.get(URL_BASE);
  }
}

export default new TemarioService();
