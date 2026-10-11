import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "../estilos/iniciosesion.css";

const InicioSesionComponent = () => {
  const [matricula, setMatricula] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const success = await login(matricula, contrasenia); 
      if (success) {
        navigate("/principalalumno"); 
      } else {
        alert("Usuario no encontrado, por favor regístrate");
      }
    } catch (error) {
      alert("Credenciales incorrectas o usuario inexistente");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Inicio de Sesión</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            required
          />
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-extra">
          <a href="/registro" className="login-link">
            ¿No tienes cuenta? Regístrate aquí
          </a>
        </div>
      </div>
    </div>
  );
};

export default InicioSesionComponent;


/* import React, { useState } from "react";
import UsuarioService from "../Services/UsuarioService";
import '../estilos/iniciosesion.css'


const InicioSesionComponent = () => {
  const [matricula, setMatricula] = useState("");
  const [contrasenia, setContrasenia] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    UsuarioService.login(matricula, contrasenia)
      .then((response) => {
        if (response.data) {
          alert("Inicio de sesión exitoso");
          window.location.href = "/principalalumno"; 
        } else {
          alert("Usuario no encontrado, por favor regístrese");
        }
      })
      .catch(() => alert("Credenciales incorrectas o usuario inexistente"));
  };

  return (
    
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Inicio de Sesión</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            required
          />
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-extra">
          <a href="/registro" className="login-link">¿No tienes cuenta? Regístrate aquí</a>
        </div>
      </div>
    </div>
  );
};

export default InicioSesionComponent;
 */