# app.py
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps

from database import engine, SessionLocal
from models import Base, User, Jogadora, Jogo, Estatistica, Acao

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

# Criar tabelas na inicialização
@app.before_first_request
def initialize_database():
    print("⚙️ Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso!")

# Chave JWT
SECRET_KEY = os.environ.get('SECRET_KEY', 'sua_chave_secreta_aqui')

# Decorator JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token ausente!'}), 401
        try:
            token = token.split()[1]  # Remove 'Bearer ' do token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            db = SessionLocal()
            current_user = db.query(User).filter_by(id=data['user_id']).first()
            db.close()
        except:
            return jsonify({'message': 'Token inválido!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Rotas da API
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    db = SessionLocal()
    user = db.query(User).filter_by(username=data['username']).first()
    db.close()
    
    if user and data['password'] == user.password:  # Em produção use hash!
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY)
        return jsonify({'token': token})
    return jsonify({'message': 'Credenciais inválidas!'}), 401

@app.route('/api/jogadoras', methods=['GET'])
@token_required
def get_jogadoras(current_user):
    db = SessionLocal()
    jogadoras = db.query(Jogadora).all()
    db.close()
    return jsonify([{'id': j.id, 'nome': j.nome} for j in jogadoras])

@app.route('/api/jogos', methods=['GET'])
@token_required
def get_jogos(current_user):
    db = SessionLocal()
    jogos = db.query(Jogo).all()
    db.close()
    return jsonify([{
        'id': j.id,
        'adversario': j.adversario,
        'data': j.data.strftime('%Y-%m-%d')
    } for j in jogos])

@app.route('/api/jogos', methods=['POST'])
@token_required
def create_jogo(current_user):
    data = request.get_json() or {}
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
        return jsonify({'id': novo_jogo.id, 'message': 'Jogo criado!'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/api/estatistica', methods=['POST'])
@token_required
def add_estatistica(current_user):
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        est = Estatistica(
            id_jogadora=data['id_jogadora'],
            id_jogo=data['id_jogo'],
            tipo=data['tipo']
        )
        db.add(est)
        db.commit()
        # registra ação
        ac = Acao(id_estatistica=est.id)
        db.add(ac)
        db.commit()
        return jsonify({'message': 'Estatística registrada!'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/api/desfazer', methods=['POST'])
@token_required
def desfazer_acao(current_user):
    db = SessionLocal()
    try:
        ult = db.query(Acao).order_by(Acao.timestamp.desc()).limit(1).all()
        if not ult:
            return jsonify({'message': 'Nada para desfazer!'})
        acao = ult[0]
        est = db.query(Estatistica).get(acao.id_estatistica)
        if est:
            db.delete(est)
            db.delete(acao)
            db.commit()
            return jsonify({'message': 'Ação desfeita!'})
        return jsonify({'message': 'Erro ao desfazer!'}), 400
    finally:
        db.close()

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    jogo_id = request.args.get('jogo_id')
    if not jogo_id:
        return jsonify({'message': 'jogo_id é obrigatório'}), 400
    db = SessionLocal()
    try:
        stats = db.query(Estatistica).filter_by(id_jogo=jogo_id).all()
        totais = {}
        destaques = {}
        for e in stats:
            totais[e.tipo] = totais.get(e.tipo, 0) + 1
            destaques.setdefault(e.tipo, {})
            destaques[e.tipo][e.jogadora.nome] = destaques[e.tipo].get(e.jogadora.nome, 0) + 1
        destaques_fmt = [
            {'tipo': t, 'jogadora': max(j.items(), key=lambda x: x[1])[0], 'quantidade': max(j.items(), key=lambda x: x[1])[1]}
            for t, j in destaques.items() if j
        ]
        return jsonify({'totais': totais, 'destaques': destaques_fmt})
    finally:
        db.close()

@app.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}, 200

# Rota para servir o frontend React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
