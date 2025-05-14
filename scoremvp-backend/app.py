from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps
from database import SessionLocal
from models import User, Jogadora, Jogo, Estatistica, Acao
import os

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

SECRET_KEY = os.environ.get('SECRET_KEY', 'sua_chave_secreta_aqui')

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

# —— STATIC REACT SERVE ——  
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# —— API ENDPOINTS COM E SEM /api ——  

@app.route('/login', methods=['POST'])
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


@app.route('/jogadoras', methods=['GET'])
@app.route('/api/jogadoras', methods=['GET'])
@token_required
def get_jogadoras(current_user):
    db = SessionLocal()
    try:
        jogadoras = db.query(Jogadora).all()
        return jsonify([{'id': j.id, 'nome': j.nome} for j in jogadoras])
    finally:
        db.close()


@app.route('/jogos', methods=['POST', 'GET'])
@app.route('/api/jogos', methods=['POST', 'GET'])
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


@app.route('/estatistica', methods=['POST'])
@app.route('/api/estatistica', methods=['POST'])
@token_required
def add_estatistica(current_user):
    data = request.get_json()
    db = SessionLocal()
    try:
        est = Estatistica(
            id_jogadora=data['id_jogadora'],
            id_jogo   =data['id_jogo'],
            tipo      =data['tipo']
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


@app.route('/desfazer', methods=['POST'])
@app.route('/api/desfazer', methods=['POST'])
@token_required
def desfazer_acao(current_user):
    db = SessionLocal()
    try:
        ult = db.query(Acao).order_by(Acao.timestamp.desc()).limit(5).all()
        if not ult:
            return jsonify({'message': 'Nada para desfazer!'})
        acao = ult[0]
        stat = db.query(Estatistica).filter_by(id=acao.id_estatistica).first()
        if stat:
            db.delete(stat); db.delete(acao); db.commit()
            return jsonify({'message': 'Ação desfeita!'})
        return jsonify({'message': 'Erro ao desfazer!'}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()


@app.route('/dashboard', methods=['GET'])
@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    jogo_id = request.args.get('jogo_id')
    if not jogo_id:
        return jsonify({'message': 'ID do jogo não fornecido!'}), 400

    db = SessionLocal()
    try:
        estatisticas = db.query(Estatistica).filter_by(id_jogo=jogo_id).all()
        totais, destaques = {}, {}
        for e in estatisticas:
            totais[e.tipo] = totais.get(e.tipo, 0) + 1
            destaques.setdefault(e.tipo, {}).setdefault(e.jogadora.nome, 0)
            destaques[e.tipo][e.jogadora.nome] += 1

        destaques_fmt = [
            {'tipo': t, 'jogadora': max(j.items(), key=lambda x: x[1])[0], 'quantidade': max(j.items(), key=lambda x: x[1])[1]}
            for t,j in destaques.items() if j
        ]
        return jsonify({'totais': totais, 'destaques': destaques_fmt})
    finally:
        db.close()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
