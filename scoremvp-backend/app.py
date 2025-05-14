# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps
from database import SessionLocal
from models import Jogadora, Jogo, Estatistica, Acao

SECRET_KEY = os.environ.get('SECRET_KEY', 'troque_para_uma_chave_secreta')

app = Flask(__name__)
CORS(app)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization')
        if not auth or not auth.startswith('Bearer '):
            return jsonify({'message':'Token não fornecido'}), 401
        token = auth.split()[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except Exception:
            return jsonify({'message':'Token inválido'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    body = request.get_json()
    if body.get('username')=='admin' and body.get('password')=='admin':
        token = jwt.encode({
            'username':'admin',
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY)
        return jsonify({'token': token})
    return jsonify({'message':'Credenciais inválidas'}), 401

@app.route('/api/jogadoras', methods=['GET'])
@token_required
def get_jogadoras():
    db = SessionLocal()
    jogs = db.query(Jogadora).all()
    db.close()
    return jsonify([{'id':j.id,'nome':j.nome} for j in jogs])

@app.route('/api/jogos', methods=['GET'])
@token_required
def get_jogos():
    db = SessionLocal()
    jogos = db.query(Jogo).all()
    db.close()
    return jsonify([{
      'id':j.id,
      'data':j.data.strftime('%Y-%m-%d'),
      'local':j.local,
      'horario':j.horario,
      'adversario':j.adversario,
      'categoria':j.categoria
    } for j in jogos])

@app.route('/api/jogos', methods=['POST'])
@token_required
def create_jogo():
    d = request.get_json()
    db = SessionLocal()
    novo = Jogo(
      data = datetime.strptime(d['data'],'%Y-%m-%d'),
      local = d['local'],
      horario = d['horario'],
      adversario = d['adversario'],
      categoria = d['categoria']
    )
    db.add(novo); db.commit(); db.refresh(novo); db.close()
    return jsonify({'id':novo.id})

@app.route('/api/estatistica', methods=['POST'])
@token_required
def add_estat():
    d = request.get_json()
    db = SessionLocal()
    est = Estatistica(id_jogadora=d['id_jogadora'],
                      id_jogo=d['id_jogo'],
                      tipo=d['tipo'])
    db.add(est); db.commit(); db.refresh(est)
    ac = Acao(id_estatistica=est.id)
    db.add(ac); db.commit(); db.close()
    return jsonify({'message':'OK'})

@app.route('/api/dashboard', methods=['GET'])
@token_required
def dashboard():
    jid = request.args.get('jogo_id')
    db = SessionLocal()
    dados = db.query(Estatistica).filter_by(id_jogo=jid).all()
    db.close()
    totais = {}
    for e in dados:
        totais[e.tipo] = totais.get(e.tipo, 0) + 1
    return jsonify({'totais':totais})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
