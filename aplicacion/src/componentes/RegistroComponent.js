import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import "../estilos/registro.css";

const RegistroComponent = () => {
  const { register } = useContext(AuthContext);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPat] = useState("");
  const [apellidoMaterno, setApellidoMat] = useState("");
  const [tipoUsuarioId, setTipoUsuarioId] = useState("");
  const [matricula, setMatricula] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar tipos de usuario
  useEffect(() => {
    axios
      .get("http://localhost:8080/tipoUsuario")
      .then((response) => setTiposUsuario(response.data))
      .catch((error) =>
        console.error("Error al cargar tipos de usuario:", error)
      );
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !nombre ||
      !apellidoPaterno ||
      !apellidoMaterno ||
      !tipoUsuarioId ||
      !matricula ||
      !correo ||
      !contrasenia
    ) {
      setError("Por favor complete todos los campos obligatorios");
      return;
    }

    const usuario = {
      nombre,
      appat: apellidoPaterno,
      apmat: apellidoMaterno,
      matricula,
      correo,
      contrasenia,
      tipoUsuario: { tipoUsuarioId },
    };

    try {
      await register(usuario);
      alert("Usuario registrado con éxito");
      navigate("/iniciosesion");
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setError("Error al registrar el usuario");
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <h2 className="registro-title">Crear cuenta</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form className="registro-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="text"
            placeholder="Apellido Paterno"
            value={apellidoPaterno}
            onChange={(e) => setApellidoPat(e.target.value)}
          />
          <input
            type="text"
            placeholder="Apellido Materno"
            value={apellidoMaterno}
            onChange={(e) => setApellidoMat(e.target.value)}
          />

          <select
            value={tipoUsuarioId}
            onChange={(e) => setTipoUsuarioId(e.target.value)}
          >
            <option value="">Seleccione tipo de usuario</option>
            {tiposUsuario.map((tipo) => (
              <option key={tipo.tipoUsuarioId} value={tipo.tipoUsuarioId}>
                {tipo.nombreRol}
              </option>
            ))}
          </select>

          <input
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
          />

          <button type="submit" className="registro-button">
            Registrarse
          </button>

          <div className="login-extra">
            <a href="/iniciosesion" className="login-link">
              ¿Ya tiene una cuenta? Inicia Sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroComponent;


/* import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UsuarioService from "../Services/UsuarioService";
import '../estilos/registro.css'
import axios from "axios";

const RegistroComponent = () => {
    const [tiposUsuario, setTiposUsuario] = useState([]);
    const [nombre, setNombre] = useState("");
    const [apellidoPaterno, setApellidoPat] = useState("");
    const [apellidoMaterno, setApellidoMat] = useState("");
    const [tipoUsuarioId, setTipoUsuarioId] = useState("");
    const [matricula, setMatricula] = useState("");
    const [correo, setCorreo] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Obtener tipos de usuario desde el backend
    useEffect(() => {
        axios.get("http://localhost:8080/tipoUsuario")
            .then(response => setTiposUsuario(response.data))
            .catch(error => console.error("Error al cargar tipos de usuario:", error));
    }, []);

    const createUsuario = (e) => {
        e.preventDefault();

        if (!nombre || !apellidoPaterno || !apellidoMaterno || !tipoUsuarioId || !matricula || !correo || !contrasenia) {
            setError("Por favor complete todos los campos obligatorios");
            return;
        }

        // Estructura correcta para el backend
        const usuario = {
            nombre,
            appat: apellidoPaterno,
            apmat: apellidoMaterno,
            matricula,
            correo,
            contrasenia,
            tipoUsuario: { tipoUsuarioId }
        };

        UsuarioService.create(usuario)
            .then(() => {
                alert("Usuario registrado con éxito");
                navigate("/iniciosesion");
            })
            .catch((error) => {
                console.error("Error al registrar usuario:", error);
                setError("Error al registrar el usuario");
            });
    };

    return (
        <div className="registro-container">
            <div className="registro-card">
                <h2 className="registro-title">Crear cuenta</h2>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <form className="registro-form" onSubmit={createUsuario}>
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        name="apellidoPaterno"
                        placeholder="Apellido Paterno"
                        value={apellidoPaterno}
                        onChange={(e) => setApellidoPat(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        name="apellidoMaterno"
                        placeholder="Apellido Materno"
                        value={apellidoMaterno}
                        onChange={(e) => setApellidoMat(e.target.value)}
                        required
                    />

                    <select
                        name="tipoUsuarioId"
                        value={tipoUsuarioId}
                        onChange={(e) => setTipoUsuarioId(e.target.value)}
                        required
                    >
                        <option value="">Seleccione tipo de usuario</option>
                        {tiposUsuario.map((tipo) => (
                            <option key={tipo.tipoUsuarioId} value={tipo.tipoUsuarioId}>
                                {tipo.nombreRol}
                            </option>
                        ))}
                    </select>

                    <input
                        name="matricula"
                        placeholder="Matrícula"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        required
                    />
                    <input
                        name="correo"
                        placeholder="Correo"
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                    />
                    <input
                        name="contrasenia"
                        placeholder="Contraseña"
                        type="password"
                        value={contrasenia}
                        onChange={(e) => setContrasenia(e.target.value)}
                        required
                    />

                    <button className="registro-button" type="submit">
                        Registrarse
                    </button>

                    <div className="login-extra">
                        <a href="/iniciosesion" className="login-link">¿Ya tiene una cuenta? Inicia Sesión</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistroComponent;
 */