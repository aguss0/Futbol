import { useState } from 'react';
import Inicio from './components/Inicio.jsx';
import Jugadores from './components/Jugadores.jsx';
import NuevoPartido from './components/NuevoPartido.jsx';
import EditarPartido from './components/EditarPartido.jsx';

const TABS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'nuevo', label: 'Nuevo partido' },
  { id: 'jugadores', label: 'Jugadores' },
];

export default function App() {
  const [tab, setTab] = useState('inicio');
  const [refrescarKey, setRefrescarKey] = useState(0);
  const [editandoId, setEditandoId] = useState(null);

  function volverAInicio() {
    setEditandoId(null);
    setRefrescarKey((k) => k + 1);
    setTab('inicio');
  }

  return (
    <div className="app">
      <header className="encabezado">
        <div>
          <h1>
            Picad<span>i</span>to
          </h1>
          <p>Histórico de partidos del grupo</p>
        </div>
      </header>

      {!editandoId && (
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'activo' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}

      {editandoId ? (
        <>
          <div className="seccion" style={{ marginTop: 0 }}>
            <h2>Editar partido</h2>
          </div>
          <EditarPartido
            partidoId={editandoId}
            onGuardado={volverAInicio}
            onCancelar={() => setEditandoId(null)}
          />
        </>
      ) : (
        <>
          {tab === 'inicio' && (
            <Inicio
              refrescarKey={refrescarKey}
              onEditar={(id) => setEditandoId(id)}
            />
          )}
          {tab === 'nuevo' && (
            <NuevoPartido
              onCreado={() => {
                setRefrescarKey((k) => k + 1);
                setTab('inicio');
              }}
            />
          )}
          {tab === 'jugadores' && <Jugadores />}
        </>
      )}
    </div>
  );
}
