import './App.css';
import HeadComponent from './componentes/HeadComponent';
import FootComponent from './componentes/FootComponent';
import PrincipalComponent from './componentes/PrincipalComponent';
import RegistroComponent from './componentes/RegistroComponent';
import InicioSesionComponent from './componentes/InicioSesionComponent';
import PrincipalAlumnoComponent from './componentes/AlumnoPrincipalComponent';
import ProgresoAlumno from './componentes/ProgresoAlumnoComponent';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext";
import PerfilAlumnoComponent from './componentes/PerfilAlumnoComponent';
import CalificacionesAlumno from './componentes/CalificacionesAlumnoComponent';
import RutaAlumnoComponent from './componentes/RutaAlumnoComponent';
import DiagnosticoTestAlumno from './componentes/DiagnosticoTestAlumnoComponent';
import AprendizajeTestAlumno from './componentes/AprendizajeTestAlumnoComponent';
import ResultadosAprendizajeTestAlumno from './componentes/ResultadosTestAlumnoComponent';
import RecursosAlumno from './componentes/RecursosAlumno';
import RecursoIdAlumno from './componentes/RecursoDetalleAlumno';
import ResultadosDiagnostico from './componentes/ResultadosDiagnosticoComponent';
import EvaluacionRecurso from './componentes/EvaluacionRecursoComponent';
import ResultadosRecurso from './componentes/ResultadosEvaluacionComponent';

// Este componente se encarga de decidir qué mostrar según la ruta
function AppContent() {
  const location = useLocation();

  // Rutas donde sí se mostrará el Header y el Footer
  const mostrarHeaderFooter = ["/", "/iniciosesion", "/registro"].includes(location.pathname);

  return (
    <>
      {mostrarHeaderFooter && <HeadComponent />}

      <div className="container">
        <Routes>
          <Route path="/" element={<PrincipalComponent />} />
          <Route path="/iniciosesion" element={<InicioSesionComponent />} />
          <Route path="/registro" element={<RegistroComponent />} />
          <Route path="/principalalumno" element={<PrincipalAlumnoComponent />} />
          <Route path='/perfilalumno' element={<PerfilAlumnoComponent />} />
          <Route path='/progresoalumno' element={<ProgresoAlumno />} />
          <Route path='/calificacionesalumno' element={<CalificacionesAlumno />} />
          <Route path='/rutaalumno' element={<RutaAlumnoComponent />} />
          <Route path='/diagnosticotestalumno' element={<DiagnosticoTestAlumno />} />
          <Route path='/resultados-diagnostico/:evaluacionId' element={<ResultadosDiagnostico />} />
          <Route path='/aprendizajetestalumno' element={<AprendizajeTestAlumno />} />
          <Route path='/resultados-test-aprendizaje-alumno' element={<ResultadosAprendizajeTestAlumno />} />
          <Route path='/recursosalumno' element={<RecursosAlumno />} />
          <Route path='/recurso/:id' element={<RecursoIdAlumno />} />
          <Route path='/evaluacionRecurso/:id' element={<EvaluacionRecurso />} />
          <Route path='/resultadoEvaluacion/recurso/:id' element={<ResultadosRecurso />} />
        </Routes>
      </div>
      <FootComponent />
    </>
  );
}

function App() {
  return (
    <div className='App'>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
