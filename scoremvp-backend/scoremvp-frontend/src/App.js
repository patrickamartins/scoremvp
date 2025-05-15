import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

// Lista fixa de jogadoras
const JOGADORAS = [
  { id: 1, nome: "Manu" },
  { id: 2, nome: "Bellinha" },
  { id: 3, nome: "Sofia Alves" },
  { id: 4, nome: "Letícia Laura" },
  { id: 5, nome: "Laura Xavier" },
  { id: 6, nome: "Noemi" },
  { id: 7, nome: "Maria Luiza" },
  { id: 8, nome: "Valentina Altfuldisk" },
  { id: 9, nome: "Aysha" },
  { id: 10, nome: "Duda" },
  { id: 11, nome: "Helô" },
  { id: 12, nome: "Aline Gomes" },
  { id: 13, nome: "Mari Garcia" },
  { id: 14, nome: "Valentina Soares" },
];

const TIPOS = [
  { label: "+2", value: "+2" },
  { label: "+3", value: "+3" },
  { label: "+1 (lance livre)", value: "+1" },
  { label: "Assistência", value: "Assistência" },
  { label: "Rebote", value: "Rebote" },
  { label: "Roubo", value: "Roubo" },
  { label: "Toco", value: "Toco" },
  { label: "TurnOver", value: "TurnOver" },
  { label: "Falta", value: "Falta" },
];

// --- Login ---
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        setMessage("Login realizado com sucesso!");
        setTimeout(() => {
          navigate("/estatisticas");
        }, 1000);
      } else {
        setMessage(data.message || "Erro ao fazer login.");
      }
    } catch (err) {
      setMessage("Erro de conexão com o servidor.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f3f3" }}>
      <form onSubmit={handleLogin} style={{ background: "#fff", padding: 32, borderRadius: 8, boxShadow: "0 2px 8px #0001", minWidth: 320 }}>
        <h2 style={{ marginBottom: 24, textAlign: "center" }}>Login</h2>
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 4,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {message && (
          <div style={{ marginTop: 16, color: message.includes("sucesso") ? "green" : "red", textAlign: "center" }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

// --- Estatísticas e Dashboard ---
function Estatisticas() {
  // Formulário do jogo
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [horario, setHorario] = useState("");
  const [adversario, setAdversario] = useState("");
  const [categoria, setCategoria] = useState("");
  const [jogoId, setJogoId] = useState(null);
  const [message, setMessage] = useState("");
  const [dashboard, setDashboard] = useState(null);

  // Salvar novo jogo
  const handleSalvarJogo = async (e) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    const res = await fetch("/jogos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data, local, horario, adversario, categoria }),
    });
    const dataRes = await res.json();
    if (res.ok) {
      setJogoId(dataRes.id);
      setMessage("Jogo salvo! Agora registre as estatísticas.");
    } else {
      setMessage(dataRes.message || "Erro ao salvar jogo.");
    }
  };

  // Registrar estatística
  const handleEstatistica = async (jogadoraId, tipo) => {
    if (!jogoId) {
      setMessage("Salve o jogo antes de registrar estatísticas!");
      return;
    }
    setMessage("");
    const token = localStorage.getItem("token");
    const res = await fetch("/estatistica", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id_jogadora: jogadoraId, id_jogo: jogoId, tipo }),
    });
    const dataRes = await res.json();
    if (res.ok) {
      setMessage("Estatística registrada!");
      atualizarDashboard();
    } else {
      setMessage(dataRes.message || "Erro ao registrar estatística.");
    }
  };

  // Desfazer ação
  const desfazerAcao = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/desfazer", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const dataRes = await res.json();
    if (res.ok) {
      setMessage("Ação desfeita!");
      atualizarDashboard();
    } else {
      setMessage(dataRes.message || "Erro ao desfazer ação.");
    }
  };

  // Atualizar dashboard
  const atualizarDashboard = () => {
    const token = localStorage.getItem("token");
    if (jogoId) {
      fetch(`/dashboard?jogo_id=${jogoId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then(setDashboard);
    }
  };

  useEffect(() => {
    atualizarDashboard();
    // eslint-disable-next-line
  }, [jogoId]);

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
      <h2>Registrar Novo Jogo</h2>
      <form onSubmit={handleSalvarJogo} style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <input type="date" value={data} onChange={e => setData(e.target.value)} required placeholder="Data" style={{ padding: 8 }} />
        <input type="text" value={local} onChange={e => setLocal(e.target.value)} required placeholder="Local" style={{ padding: 8 }} />
        <input type="time" value={horario} onChange={e => setHorario(e.target.value)} required placeholder="Horário" style={{ padding: 8 }} />
        <input type="text" value={adversario} onChange={e => setAdversario(e.target.value)} required placeholder="Adversário" style={{ padding: 8 }} />
        <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)} required placeholder="Categoria" style={{ padding: 8 }} />
        <button type="submit" style={{ padding: 8, background: "#1976d2", color: "#fff", border: "none", borderRadius: 4 }}>Salvar Jogo</button>
        <button type="button" onClick={desfazerAcao} style={{ padding: 8, background: "#e53935", color: "#fff", border: "none", borderRadius: 4 }}>Desfazer</button>
      </form>
      {message && <div style={{ marginBottom: 16, color: message.includes("sucesso") || message.includes("salvo") || message.includes("registrada") ? "green" : "red" }}>{message}</div>}

      <h2>Registro de Estatísticas</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Nome</th>
            {TIPOS.map(tipo => (
              <th key={tipo.value} style={{ border: "1px solid #ccc", padding: 8 }}>{tipo.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {JOGADORAS.map(jogadora => (
            <tr key={jogadora.id}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{jogadora.nome}</td>
              {TIPOS.map(tipo => (
                <td key={tipo.value} style={{ border: "1px solid #ccc", padding: 4 }}>
                  <button
                    onClick={() => handleEstatistica(jogadora.id, tipo.value)}
                    style={{ width: "100%", padding: 6, borderRadius: 4, border: "1px solid #1976d2", background: "#e3f2fd", cursor: "pointer" }}
                  >
                    {tipo.label}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Dashboard do Jogo</h2>
      {dashboard ? (
        <div>
          <h4>Totais:</h4>
          <ul>
            {Object.entries(dashboard.totais).map(([tipo, qtd]) => (
              <li key={tipo}>{tipo}: {qtd}</li>
            ))}
          </ul>
          <h4>Destaques:</h4>
          <ul>
            {dashboard.destaques.map((d, idx) => (
              <li key={idx}>{d.tipo}: {d.jogadora} ({d.quantidade})</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Salve um jogo e registre estatísticas para ver o dashboard.</p>
      )}
    </div>
  );
}

function Dashboard() {
  const [jogos, setJogos] = useState([]);
  const [jogoId, setJogoId] = useState("");
  const [dashboard, setDashboard] = useState(null);

  // Buscar jogos ao carregar
  useEffect(() => {
    fetch("/jogos", { headers: { Authorization: "" } }) // sem token
      .then(res => res.json())
      .then(data => {
        setJogos(data);
        if (data.length > 0) {
          // Seleciona o último jogo por padrão
          setJogoId(data[data.length - 1].id);
        }
      });
  }, []);

  // Buscar dashboard ao selecionar jogo
  useEffect(() => {
    if (jogoId) {
      fetch(`/dashboard?jogo_id=${jogoId}`, { headers: { Authorization: "" } })
        .then(res => res.json())
        .then(setDashboard);
    }
  }, [jogoId]);

  // Frases personalizadas para destaques
  const frases = {
    "+2": "líder em bola de 2 com",
    "+3": "líder em bola de 3 com",
    "+1": "destaque em lances livres com",
    "Assistência": "lidera em assistências com",
    "Rebote": "destaque em rebotes com",
    "Roubo": "destaque em roubos com",
    "Toco": "destaque em tocos com",
    "TurnOver": "lidera em turnovers com",
    "Falta": "lidera em faltas com"
  };

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <h2>Dashboard - Estatísticas do Jogo</h2>
      <div style={{ marginBottom: 24 }}>
        <label>Selecione o jogo: </label>
        <select value={jogoId} onChange={e => setJogoId(e.target.value)} style={{ padding: 8 }}>
          <option value="">Selecione...</option>
          {jogos.map(j => (
            <option key={j.id} value={j.id}>
              {`${j.data} - ${j.adversario} (${j.categoria})`}
            </option>
          ))}
        </select>
      </div>
      {!jogoId && <p>Selecione um jogo para ver o dashboard.</p>}
      {dashboard && jogoId && (
        <div>
          <h3>Totais por tipo de estatística:</h3>
          <ul>
            {Object.entries(dashboard.totais).map(([tipo, qtd]) => (
              <li key={tipo}>{tipo}: {qtd}</li>
            ))}
          </ul>
          <h3>Destaques individuais:</h3>
          <ul>
            {dashboard.destaques.map((d, idx) => (
              <li key={idx}>
                {d.jogadora} {frases[d.tipo] || "destaque em"} {d.tipo.toLowerCase()} com {d.quantidade}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/estatisticas" element={<Estatisticas />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
