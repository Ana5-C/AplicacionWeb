import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, BarChart3, Brain } from "lucide-react";
import "../estilos/principal.css";

function PrincipalComponent() {
  return (
    <div className="principal-container">
      <section className="hero">
        <h2 className="hero-title">Plataforma Educativa Adaptativa</h2>
        <p className="hero-text">
          Aprende Fundamentos de Programación con contenido personalizado que se adapta a tu estilo de aprendizaje
        </p>
        <div className="hero-buttons">
          <Link to="/iniciosesion">
            <button className="btn-primary">Soy Estudiante</button>
          </Link>
          <Link to="/iniciosesion">
            <button className="btn-outline">Soy Profesor</button>
          </Link>
        </div>
      </section> 
      <section className="features">
        <div className="feature-grid">
          <div className="feature-card">
            <BookOpen className="feature-icon blue" />
            <h3 className="feature-title">Contenido Adaptativo</h3>
            <p className="feature-description">
              Materiales que se ajustan automáticamente a tu nivel y estilo de aprendizaje
            </p>
          </div>

          <div className="feature-card">
            <Users className="feature-icon green" />
            <h3 className="feature-title">Gestión de Cursos</h3>
            <p className="feature-description">
              Herramientas completas para profesores para crear y gestionar contenido educativo
            </p>
          </div>

          <div className="feature-card">
            <BarChart3 className="feature-icon purple" />
            <h3 className="feature-title">Seguimiento de Progreso</h3>
            <p className="feature-description">
              Monitoreo detallado del avance con métricas y alertas tempranas
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PrincipalComponent;
