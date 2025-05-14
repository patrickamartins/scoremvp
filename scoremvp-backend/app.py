import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps

# Importa o engine e o SessionLocal do SQLAlchemy
from database import engine, SessionLocal  
# Importa a Base (para metadata.create_all) e seus modelos
from models import Base, User, Jogadora, Jogo, Estatistica, Acao  

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

# Cria todas as tabelas que ainda não existirem
print("⚙️  Criando tabelas no banco de dados (se não existirem)…")
Base.metadata.create_all(bind=engine)
print("✅ Tabelas criadas ou já existentes.")

# Chave secreta para JWT (em produção use algo seguro e fora do código)
SECRET_KEY = os.environ.get('SECRET_KEY', 'sua_chave_secreta_aqui')

# Decorator para verificar o token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token não fornecido!'}), 401
        try:
            token = token.split(' ')[1]  # Remove o 'Bearer '
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['username']
        except:
            return jsonify({'message': 'Token inválido!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Serve o build do React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# --- Autenticação ---
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == 'admin' and password == 'admin':
        token = jwt.encode({
            'username': username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY)
        return jsonify({'token': token})
    return jsonify({'message': 'Credenciais inválidas!'}), 401

# --- Endpoints protegidos por token ---
@app.route('/jogadoras', methods=['GET'])
@token_required
def get_jogadoras(current_user):
    db = SessionLocal()
    try:
        jogadoras = db.query(Jogadora).all()
        return jsonify([{'id': j.id, 'nome': j.nome} for j in jogadoras])
    finally:
        db.close()

@app.route('/jogos', methods=['POST'])
@token_required
def create_jogo(current_user):
    data = request.get_json()
    db = SessionLocal()
    try:
        novo_jogo = Jogo(
            data=datetime.strptime(data['data'], '%Y-%m-%d'),
            local=data['local'],
            horario=data['horario'],
            adversario=data['adversario'],
            categoria=data['categoria']
        )
        db.add(novo_jogo)
        db.commit()
        db.refresh(novo_jogo)
        return jsonify({'id': novo_jogo.id, 'message': 'Jogo criado com sucesso!'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/jogos', methods=['GET'])
@token_required
def get_jogos(current_user):
    db = SessionLocal()
    try:
        jogos = db.query(Jogo).all()
        return jsonify([{
            'id': j.id,
            'data': j.data.strftime('%Y-%m-%d'),
            'local': j.local,
            'horario': j.horario,
            'adversario': j.adversario,
            'categoria': j.categoria
        } for j in jogos])
    finally:
        db.close()

@app.route('/estatistica', methods=['POST'])
@token_required
def add_estatistica(current_user):
    data = request.get_json()
    db = SessionLocal()
    try:
        nova_estatistica = Estatistica(
            id_jogadora=data['id_jogadora'],
            id_jogo=data['id_jogo'],
            tipo=data['tipo']
        )
        db.add(nova_estatistica)
        db.commit()
        db.refresh(nova_estatistica)

        nova_acao = Acao(id_estatistica=nova_estatistica.id)
        db.add(nova_acao)
        db.commit()
        return jsonify({'message': 'Estatística registrada com sucesso!'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/desfazer', methods=['POST'])
@token_required
def desfazer_acao(current_user):
    db = SessionLocal()
    try:
        ultimas_acoes = db.query(Acao).order_by(Acao.timestamp.desc()).limit(5).all()
        if not ultimas_acoes:
            return jsonify({'message': 'Não há ações para desfazer!'})
        acao_para_remover = ultimas_acoes[0]
        estat = db.query(Estatistica).filter_by(id=acao_para_remover.id_estatistica).first()
        if estat:
            db.delete(estat)
            db.delete(acao_para_remover)
            db.commit()
            return jsonify({'message': 'Ação desfeita com sucesso!'})
        return jsonify({'message': 'Erro ao desfazer ação!'}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

# --- Dashboard público (sem token) ---
@app.route('/dashboard', methods=['GET'])
def get_dashboard():
    jogo_id = request.args.get('jogo_id')
    if not jogo_id:
        return jsonify({'message': 'ID do jogo não fornecido!'}), 400
    db = SessionLocal()
    try:
        estatisticas = db.query(Estatistica).filter_by(id_jogo=jogo_id).all()
        totais = {}
        destaques = {}
        for est in estatisticas:
            totais[est.tipo] = totais.get(est.tipo, 0) + 1
            destaques.setdefault(est.tipo, {}).setdefault(est.jogadora.nome, 0)
            destaques[est.tipo][est.jogadora.nome] += 1
        destaques_fmt = [{
            'tipo': tipo,
            'jogadora': max(jogs.items(), key=lambda x: x[1])[0],
            'quantidade': max(jogs.items(), key=lambda x: x[1])[1]
        } for tipo, jogs in destaques.items() if jogs]
        return jsonify({'totais': totais, 'destaques': destaques_fmt})
    finally:
        db.close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
