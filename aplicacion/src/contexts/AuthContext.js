import React, { createContext, useState, useContext, useEffect } from "react";
import UsuarioService from "../Services/UsuarioService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  // 🔹 Cargar usuario desde localStorage si existe
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  // 🔹 Iniciar sesión
  const login = async (matricula, contrasenia) => {
    try {
      const response = await UsuarioService.login(matricula, contrasenia);
      const userData = response.data;
      setUsuario(userData);
      localStorage.setItem("usuario", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error en login:", error.response?.data || error.message);
      throw error;
    }
  };

  // 🔹 Registrar usuario
  const register = async (usuarioData) => {
    try {
      const response = await UsuarioService.register(usuarioData);
      return response.data;
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  // 🔹 Actualizar usuario
  const updateUsuario = async (usuarioId, nuevosDatos) => {
    try {
      await UsuarioService.update(usuarioId, nuevosDatos);
      const response = await UsuarioService.findByID(usuarioId);
      const updatedUser = response.data;
      setUsuario(updatedUser);
      localStorage.setItem("usuario", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      throw error;
    }
  };

  // 🔹 Eliminar usuario (nueva función)
  const deleteUsuario = async (usuarioId) => {
    try {
      await UsuarioService.delete(usuarioId);
      setUsuario(null);
      localStorage.removeItem("usuario");
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      throw error;
    }
  };

  // 🔹 Cerrar sesión
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        register,
        updateUsuario,
        deleteUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
