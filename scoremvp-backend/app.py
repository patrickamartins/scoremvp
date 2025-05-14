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

# Cria as tabelas na inicialização
@app.before_first_request
def initialize_database():
    app.logger.info("⚙️  Criando tabelas (se não existirem)…")
    Base.metadata.create_all(bind=engine)
    app.logger.info("✅ Tabelas criadas ou já existentes.")

# JWT secret
SECRET_KEY = os.environ.get('SECRET_KEY', 'sua_chave_secreta_aqui')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        parts = auth.split(' ')
        if len(parts) != 2 or parts[0] != 'Bearer':
            return jsonify({'message': 'Token não fornecido ou inválido!'}), 401
        try:
            data = jwt.decode(parts[1], SECRET_KEY, algorithms=["HS256"])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado!'}), 401
        except Exception:
            return jsonify({'message': 'Token inválido!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

#
#  ─── API PREFIX: /api ────────────────────────────────────────────────────────────
#

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    if data.get('username') == 'admin' and data.get('password') == 'admin':
        token = jwt.encode({
            'username': 'admin',
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY)
        return jsonify({'token': token})
    return jsonify({'message': 'Credenciais inválidas!'}), 401

@app.route('/api/jogadoras', methods=['GET'])
@token_required
def api_jogadoras(current_user):
    db = SessionLocal()
    try:
        return jsonify([{'id': j.id, 'nome': j.nome} for j in db.query(Jogadora).all()])
    finally:
        db.close()

@app.route('/api/jogos', methods=['POST'])
@token_required
def api_create_jogo(current_user):
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        j = Jogo(
            data=datetime.strptime(data['data'], '%Y-%m-%d'),
            local=data['local'],
            horario=data['horario'],
            adversario=data['adversario'],
            categoria=data['categoria']
        )
        db.add(j); db.commit(); db.refresh(j)
        return jsonify({'id': j.id, 'message': 'Jogo criado!'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/api/jogos', methods=['GET'])
@token_required
def api_get_jogos(current_user):
    db = SessionLocal()
    try:
        return jsonify([{
            'id': j.id,
            'data': j.data.strftime('%Y-%m-%d'),
            'local': j.local,
            'horario': j.horario,
            'adversario': j.adversario,
            'categoria': j.categoria
        } for j in db.query(Jogo).all()])
    finally:
        db.close()

@app.route('/api/estatistica', methods=['POST'])
@token_required
def api_add_estatistica(current_user):
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        est = Estatistica(
            id_jogadora=data['id_jogadora'],
            id_jogo=data['id_jogo'],
            tipo=data['tipo']
        )
        db.add(est); db.commit(); db.refresh(est)
        ac = Acao(id_estatistica=est.id)
        db.add(ac); db.commit()
        return jsonify({'message': 'Estatística registrada!'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/api/desfazer', methods=['POST'])
@token_required
def api_desfazer(current_user):
    db = SessionLocal()
    try:
        ult = db.query(Acao).order_by(Acao.timestamp.desc()).limit(5).all()
        if not ult:
            return jsonify({'message': 'Nada para desfazer!'})
        ac = ult[0]
        est = db.query(Estatistica).filter_by(id=ac.id_estatistica).first()
        if est:
            db.delete(est); db.delete(ac); db.commit()
            return jsonify({'message': 'Ação desfeita!'})
        return jsonify({'message': 'Erro ao desfazer!'}), 400
    finally:
        db.close()

@app.route('/api/dashboard', methods=['GET'])
def api_dashboard():
    jogo_id = request.args.get('jogo_id')
    if not jogo_id:
        return jsonify({'message': 'ID do jogo não fornecido!'}), 400
    db = SessionLocal()
    try:
        stats = db.query(Estatistica).filter_by(id_jogo=jogo_id).all()
        totais, destaques = {}, {}
        for est in stats:
            totais[est.tipo] = totais.get(est.tipo, 0) + 1
            destaques.setdefault(est.tipo, {}).setdefault(est.jogadora.nome, 0)
            destaques[est.tipo][est.jogadora.nome] += 1
        destaques_fmt = [{
            'tipo': t,
            'jogadora': max(j.items(), key=lambda x: x[1])[0],
            'quantidade': max(j.items(), key=lambda x: x[1])[1]
        } for t, j in destaques.items() if j]
        return jsonify({'totais': totais, 'destaques': destaques_fmt})
    finally:
        db.close()

#
#  ─── STATIC REACT ROUTES ────────────────────────────────────────────────────────
#

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # se existir arquivo estático (css, js, img)
    fp = os.path.join(app.static_folder, path)
    if path and os.path.exists(fp):
        return send_from_directory(app.static_folder, path)
    # senão devolve index.html (react-router)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
