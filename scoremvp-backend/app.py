# app.py
import os
from flask import Flask, request, jsonify, send_from_directory, Blueprint
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps
from database import SessionLocal
from models import User, Jogadora, Jogo, Estatistica, Acao

SECRET_KEY = os.environ.get('SECRET_KEY', 'sua_chave_secreta_aqui')

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

# --- 1) Cria um Blueprint que atende tudo em /api/... ---
api = Blueprint('api', __name__, url_prefix='/api')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token não fornecido!'}), 401
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['username']
        except:
            return jsonify({'message': 'Token inválido!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@api.route('/login', methods=['POST'])
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

@api.route('/jogadoras', methods=['GET'])
@token_required
def get_jogadoras(current_user):
    db = SessionLocal()
    try:
        jogadoras = db.query(Jogadora).all()
        return jsonify([{'id': j.id, 'nome': j.nome} for j in jogadoras])
    finally:
        db.close()

@api.route('/jogos', methods=['POST'])
@token_required
def create_jogo(current_user):
    data = request.get_json()
    db = SessionLocal()
    try:
        novo = Jogo(
            data=datetime.strptime(data['data'], '%Y-%m-%d'),
            local=data['local'],
            horario=data['horario'],
            adversario=data['adversario'],
            categoria=data['categoria']
        )
        db.add(novo); db.commit(); db.refresh(novo)
        return jsonify({'id': novo.id, 'message': 'Jogo criado!'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@api.route('/jogos', methods=['GET'])
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

@api.route('/estatistica', methods=['POST'])
@token_required
def add_estatistica(current_user):
    data = request.get_json()
    db = SessionLocal()
    try:
        est = Estatistica(
            id_jogadora=data['id_jogadora'],
            id_jogo=data['id_jogo'],
            tipo=data['tipo']
        )
        db.add(est); db.commit(); db.refresh(est)
        acao = Acao(id_estatistica=est.id)
        db.add(acao); db.commit()
        return jsonify({'message': 'Estatística registrada!'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@api.route('/desfazer', methods=['POST'])
@token_required
def desfazer(current_user):
    db = SessionLocal()
    try:
        ult = db.query(Acao).order_by(Acao.timestamp.desc()).limit(1).all()
        if not ult:
            return jsonify({'message':'Nada a desfazer'})
        ac = ult[0]
        est = db.query(Estatistica).get(ac.id_estatistica)
        if est:
            db.delete(est); db.delete(ac); db.commit()
            return jsonify({'message':'Desfeito!'})
        return jsonify({'message':'Erro'}), 400
    finally:
        db.close()

@api.route('/dashboard', methods=['GET'])
def get_dashboard():
    jogo_id = request.args.get('jogo_id')
    if not jogo_id:
        return jsonify({'message': 'ID do jogo não fornecido!'}), 400
    db = SessionLocal()
    try:
        estatisticas = db.query(Estatistica).filter_by(id_jogo=jogo_id).all()
        totais, destaques = {}, {}
        for est in estatisticas:
            totais[est.tipo] = totais.get(est.tipo, 0) + 1
            destaques.setdefault(est.tipo, {})
            destaques[est.tipo][est.jogadora.nome] = destaques[est.tipo].get(est.jogadora.nome, 0) + 1
        desta = []
        for tipo, jogs in destaques.items():
            best = max(jogs.items(), key=lambda x: x[1])
            desta.append({'tipo':tipo,'jogadora':best[0],'quantidade':best[1]})
        return jsonify({'totais':totais,'destaques':desta})
    finally:
        db.close()

# registra o blueprint
app.register_blueprint(api)

# --- 2) Serve o React build EM TODAS AS ROTAS NÃO-API ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # se for arquivo estático existente, serve-o
    static_file = os.path.join(app.static_folder, path)
    if path and os.path.exists(static_file):
        return send_from_directory(app.static_folder, path)
    # senão retorna sempre o index.html do build
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
