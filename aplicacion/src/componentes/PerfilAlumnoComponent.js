import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RespuestaAlumnoService from "../Services/RespuestaAlumnoService";
import UsuarioAprendizajeService from "../Services/UsuarioAprendizajeService";
import "../estilos/perfilAlumno.css";

const PerfilAlumnoComponent = () => {
    const { usuario, updateUsuario, logout, deleteUsuario } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tipo_usuario_id: "",
        nombre: "",
        appat: "",
        apmat: "",
        correo: "",
        contrasenia: "",
        matricula: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [setMessage] = useState("");
    const [tipoAprendizaje, setTipoAprendizaje] = useState(null);
    const [diagnosticoCompletado, setDiagnosticoCompletado] = useState(false);
    const [diagnosticScore, setDiagnosticScore] = useState(null);


    //Al cargar el componente, copia los datos del usuario al formulario
    useEffect(() => {
        if (usuario) {
            setFormData({
                tipoUsuarioId: usuario.tipoUsuario?.tipoUsuarioId || "",
                tipoUsuario: usuario.tipoUsuario?.nombreRol || "Desconocido",
                nombre: usuario.nombre || "",
                appat: usuario.appat || "",
                apmat: usuario.apmat || "",
                correo: usuario.correo || "",
                contrasenia: usuario.contrasenia || "",
                matricula: usuario.matricula || "",
            });

            // Consultar el perfil de aprendizaje
            UsuarioAprendizajeService.obtenerPorUsuario(usuario.usuarioId)
                .then((response) => {
                    const registros = response.data;
                    if (registros.length > 0) {
                        const ultimo = registros[registros.length - 1];
                        setTipoAprendizaje(ultimo.tipoAprendizaje.nombre);
                    } else {
                        setTipoAprendizaje(null);
                    }
                })
                .catch((err) =>
                    console.error("Error al obtener tipo de aprendizaje:", err)
                );

            // Evaluación 1 = Test Diagnóstico
            RespuestaAlumnoService.obtenerPorUsuarioYEvaluacion(usuario.usuarioId, 1)
                .then((resp) => {
                    if (resp.data && resp.data.length > 0) {
                        setDiagnosticoCompletado(true);

                        // Si tu backend envía "score" como parte de la respuesta:
                        if (resp.data[0].score !== undefined) {
                            setDiagnosticScore(resp.data[0].score);
                        }
                    } else {
                        setDiagnosticoCompletado(false);
                    }
                })
                .catch((err) => {
                    console.error("Error cargando estado diagnóstico:", err);
                    setDiagnosticoCompletado(false);
                });
        }
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    //Guardar cambios
    const handleSave = async () => {
        try {
            if (!usuario?.usuarioId) {
                setMessage("No se pudo obtener el ID del usuario.");
                return;
            }

            const updatedData = {
                nombre: formData.nombre,
                appat: formData.appat,
                apmat: formData.apmat,
                correo: formData.correo,
                contrasenia: formData.contrasenia,
                matricula: formData.matricula,
                tipoUsuario: {
                    tipoUsuarioId: formData.tipoUsuarioId,
                },
            };

            const updatedUser = await updateUsuario(usuario.usuarioId, updatedData);

            setFormData({
                tipoUsuarioId: updatedUser.tipoUsuario?.tipoUsuarioId || "",
                tipoUsuario: updatedUser.tipoUsuario?.nombreRol || "Desconocido",
                nombre: updatedUser.nombre || "",
                appat: updatedUser.appat || "",
                apmat: updatedUser.apmat || "",
                correo: updatedUser.correo || "",
                contrasenia: updatedUser.contrasenia || "",
                matricula: updatedUser.matricula || "",
            });

            setIsEditing(false);
            setMessage("Perfil actualizado correctamente.");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error al actualizar:", error);
            setMessage("Ocurrió un error al actualizar el perfil.");
        }
    };


    //Cancelar edición
    const handleCancel = () => {
        if (usuario) {
            setFormData({
                tipoUsuarioId: usuario.tipoUsuario?.tipoUsuarioId || "",
                tipoUsuario: usuario.tipoUsuario?.nombreRol || "Desconocido",
                nombre: usuario.nombre || "",
                appat: usuario.appat || "",
                apmat: usuario.apmat || "",
                correo: usuario.correo || "",
                contrasenia: usuario.contrasenia || "",
                matricula: usuario.matricula || "",
            });
        }
        setIsEditing(false);
        setMessage("");
    };
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleDelete = async () => {
        if (!usuario?.usuarioId) {
            setMessage("No se pudo obtener el ID del usuario.");
            return;
        }

        if (!window.confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            await deleteUsuario(usuario.usuarioId); // 👈 Usa el contexto
            navigate("/"); // Redirige al inicio
        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
            setMessage("Ocurrió un error al eliminar la cuenta.");
        }
    };


    return (
        <div className="perfil-container">
            <div className="perfil-titulo">
                <h2>Mi Perfil</h2>
                <div className="perfil-header-buttons">
                    <button className="btn-volver-perfil" onClick={() => navigate("/principalalumno")}>
                        Regresar
                    </button>
                    <button className="btn-sesion" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
            <div className="perfil-contenido">
                {/* Panel Izquierdo */}
                <div className="perfil-info">
                    <h3>Información Personal</h3>
                    <p className="perfil-subtitulo">Visualiza tu información personal</p>
                    <form className="perfil-form">
                        <div className="perfil-grid">
                            <div className="campo">
                                <label>Tipo de Usuario</label>
                                <input
                                    type="text"
                                    name="tipoUsuario"
                                    value={formData.tipoUsuario}
                                    readOnly
                                />
                            </div>
                            <div className="campo">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="campo">
                                <label>Apellido Paterno</label>
                                <input
                                    type="text"
                                    name="appat"
                                    value={formData.appat}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="campo">
                                <label>Apellido Materno</label>
                                <input
                                    type="text"
                                    name="apmat"
                                    value={formData.apmat}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="campo">
                                <label>Correo</label>
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="campo">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    name="contrasenia"
                                    value={formData.contrasenia}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="campo">
                                <label>Matrícula</label>
                                <input
                                    type="text"
                                    name="matricula"
                                    value={formData.matricula}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="perfil-botones">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    className="btn-editar"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Editar Perfil
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="btn-guardar"
                                        onClick={handleSave}
                                    >
                                        Guardar Cambios
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={handleCancel}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>

                {/* Panel Derecho */}
                <div className="perfil-lateral">
                    <div className="perfil-estado">
                        <h4>Estado del Perfil</h4>

                        {/* Test Diagnóstico */}
                        <div className="estado-item">
                            <span>Test Diagnóstico</span>
                            {diagnosticoCompletado ? (
                                <CheckCircle className="icono-check" />
                            ) : (
                                <span className="estado-pendiente">Pendiente</span>
                            )}
                        </div>

                        {/* Test de Estilo */}
                        <div className="estado-item">
                            <span>Test de Estilo de Aprendizaje </span>
                            {tipoAprendizaje ? (
                                <CheckCircle className="icono-check" />
                            ) : (
                                <span className="estado-pendiente">Pendiente</span>
                            )}
                        </div>
                        <hr className="separador" />
                        {/* Estilo de Aprendizaje */}
                        <div className="estado-item-col">
                            <span className="titulo-secundario">Estilo de Aprendizaje</span>
                            <span className="resultado-estilo">
                                {tipoAprendizaje ? tipoAprendizaje : "Por descubrir"}
                            </span>
                        </div>
                    </div>

                    <div className="zona-peligro">
                        <h4>Zona de Peligro</h4>
                        <p>Acciones irreversibles</p>
                        <button className="btn-eliminar" onClick={handleDelete}>🗑 Eliminar Cuenta</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilAlumnoComponent;
