import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps
from database import SessionLocal
from models import User, Jogadora, Jogo, Estatistica, Acao

# 1) Servir build do React
app = Flask(
    __name__,
    static_folder='frontend/build',
    static_url_path=''     # faz com que "/static/..." e "/" sejam servidos
)
CORS(app)

# JWT
SECRET_KEY = os.environ.get('SECRET_KEY', 'troque_para_uma_chave_secreta')

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

# 2) Rotas de API (sempre prefixo /api)
@app.route('/api/login', methods=['POST'])
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

@app.route('/api/jogadoras', methods=['GET'])
@token_required
def get_jogadoras(current_user):
    db = SessionLocal()
    try:
        jogadoras = db.query(Jogadora).all()
        return jsonify([{'id': j.id, 'nome': j.nome} for j in jogadoras])
    finally:
        db.close()

@app.route('/api/jogos', methods=['GET', 'POST'])
@token_required
def jogos(current_user):
    db = SessionLocal()
    if request.method == 'POST':
        data = request.get_json()
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
    else:
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
    data = request.get_json()
    db = SessionLocal()
    try:
        nova = Estatistica(
            id_jogadora=data['id_jogadora'],
            id_jogo=data['id_jogo'],
            tipo=data['tipo']
        )
        db.add(nova); db.commit(); db.refresh(nova)
        # registra ação
        ac = Acao(id_estatistica=nova.id)
        db.add(ac); db.commit()
        return jsonify({'message': 'OK'})
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/api/desfazer', methods=['POST'])
@token_required
def desfazer(current_user):
    db = SessionLocal()
    try:
        ult = db.query(Acao).order_by(Acao.timestamp.desc()).limit(5).all()
        if not ult:
            return jsonify({'message': 'Nada a desfazer!'})
        acao = ult[0]
        est = db.query(Estatistica).filter_by(id=acao.id_estatistica).first()
        if est:
            db.delete(est)
            db.delete(acao)
            db.commit()
            return jsonify({'message': 'Desfeito!'})
        return jsonify({'message': 'Erro!'}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    jogo_id = request.args.get('jogo_id')
    if not jogo_id:
        return jsonify({'message': 'ID não fornecido!'}), 400
    db = SessionLocal()
    try:
        estat = db.query(Estatistica).filter_by(id_jogo=jogo_id).all()
        totais = {}
        destaques = {}
        for e in estat:
            totais[e.tipo] = totais.get(e.tipo, 0) + 1
            destaques.setdefault(e.tipo, {})
            destaques[e.tipo][e.jogadora.nome] = destaques[e.tipo].get(e.jogadora.nome, 0) + 1

        desta = []
        for tipo, jogs in destaques.items():
            top = max(jogs.items(), key=lambda x: x[1])
            desta.append({'tipo': tipo, 'jogadora': top[0], 'quantidade': top[1]})
        return jsonify({'totais': totais, 'destaques': desta})
    finally:
        db.close()

# 3) Catch-all do React (deixe no final)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    build = app.static_folder
    full_path = os.path.join(build, path)
    if path and os.path.exists(full_path):
        return send_from_directory(build, path)
    return send_from_directory(build, 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
