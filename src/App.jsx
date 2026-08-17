import { useState } from 'react';
import Inicio from './components/Inicio.jsx';
import Jugadores from './components/Jugadores.jsx';
import NuevoPartido from './components/NuevoPartido.jsx';

const TABS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'nuevo', label: 'Nuevo partido' },
  { id: 'jugadores', label: 'Jugadores' },
];

export default function App() {
  const [tab, setTab] = useState('inicio');
  const [refrescarKey, setRefrescarKey] = useState(0);

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

      {tab === 'inicio' && <Inicio key={refrescarKey} />}
      {tab === 'nuevo' && (
        <NuevoPartido
          onCreado={() => {
            setRefrescarKey((k) => k + 1);
            setTab('inicio');
          }}
        />
      )}
      {tab === 'jugadores' && <Jugadores />}
    </div>
  );
}
