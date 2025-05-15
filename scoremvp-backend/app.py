# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
from functools import wraps
from database import SessionLocal
from models import User, Jogadora, Jogo, Estatistica, Acao

app = Flask(__name__)
CORS(app)

# -- JWT SECRET_KEY -------------------------------------------------
# Em produção, defina SECRET_KEY via variável de ambiente no Railway
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY não definido no ambiente!") 

# Decorator para checar token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'message': 'Token não fornecido!'}), 401
        token = auth.split()[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# ---------------------- ROTAS / API -------------------------------

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    # Hard-coded para o MVP
    if username == 'admin' and password == 'admin':
        token = jwt.encode({
            'username': username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({'token': token})
    return jsonify({'message': 'Credenciais inválidas!'}), 401

@app.route('/api/jogadoras', methods=['GET'])
@token_required
def get_jogadoras(current_user):
    db = SessionLocal()
    try:
        jogadoras = db.query(Jogadora).all()
        return jsonify([{'id': j.id, 'nome': j.nome} for j in jogadoras])
    finally:
        db.close()

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

@app.route('/api/jogos', methods=['GET'])
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

if __name__ == "__main__":
    # Railway injeta PORT automaticamente, aqui você garante fallback
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
