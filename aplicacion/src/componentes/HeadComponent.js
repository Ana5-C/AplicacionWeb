import { Link } from "react-router-dom";
import { Brain } from "lucide-react";

function HeadComponent() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/">
            <Brain className="logo-icon" />
          </Link>
          <h1 className="logo-text">EduAdapt</h1>
          </div>
        <div className="auth-buttons">
          <Link to="/iniciosesion">
            <button className="btn-outline">Iniciar Sesión</button>
          </Link>
          <Link to="/registro">
            <button className="btn-primary">Registrarse</button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default HeadComponent;
