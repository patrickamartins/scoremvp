import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime, timedelta
import jwt
from functools import wraps

from database import engine, Base, SessionLocal
from models import Jogadora, Jogo, Estatistica, Acao

# 1) JWT: chave **sempre** pela env var
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError("Defina SECRET_KEY nas Variables do Railway!")

# 2) Cria as tabelas ao subir
Base.metadata.create_all(bind=engine)

# 3) Servir o build React + CORS
app = Flask(__name__, static_folder='frontend/build', static_url_path='')
CORS(app)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization','')
        if not auth.startswith('Bearer '):
            return jsonify({'message':'Token não fornecido!'}), 401
        token = auth.split()[1]
        try:
            jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message':'Token expirado!'}), 401
        except Exception:
            return jsonify({'message':'Token inválido!'}), 401
        return f(*args, **kwargs)
    return decorated

# 4) Rotas de API (prefixo /api)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    if data.get('username')=='admin' and data.get('password')=='admin':
        token = jwt.encode({
            'username':'admin',
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')
        return jsonify({'token': token})
    return jsonify({'message':'Credenciais inválidas!'}), 401

@app.route('/api/jogadoras', methods=['GET'])
@token_required
def api_jogadoras():
    db = SessionLocal()
    try:
        items = db.query(Jogadora).all()
        return jsonify([{'id': j.id, 'nome': j.nome} for j in items])
    finally:
        db.close()

@app.route('/api/jogos', methods=['GET','POST'])
@token_required
def api_jogos():
    db = SessionLocal()
    if request.method=='POST':
        d = request.get_json() or {}
        novo = Jogo(
            data=datetime.strptime(d['data'],'%Y-%m-%d'),
            local=d['local'], horario=d['horario'],
            adversario=d['adversario'], categoria=d['categoria']
        )
        try:
            db.add(novo); db.commit(); db.refresh(novo)
            return jsonify({'id': novo.id, 'message':'Jogo criado!'})
        except Exception as e:
            db.rollback(); return jsonify({'message':str(e)}), 400
        finally:
            db.close()
    else:
        try:
            jogos = db.query(Jogo).all()
            return jsonify([{
                'id': j.id,
                'data': j.data.strftime('%Y-%m-%d'),
                'local': j.local, 'horario': j.horario,
                'adversario': j.adversario,'categoria': j.categoria
            } for j in jogos])
        finally:
            db.close()

@app.route('/api/estatistica', methods=['POST'])
@token_required
def api_estatistica():
    d = request.get_json() or {}
    db = SessionLocal()
    try:
        est = Estatistica(id_jogadora=d['id_jogadora'], id_jogo=d['id_jogo'], tipo=d['tipo'])
        db.add(est); db.commit(); db.refresh(est)
        ac = Acao(id_estatistica=est.id)
        db.add(ac); db.commit()
        return jsonify({'message':'Estatística registrada!'})
    except Exception as e:
        db.rollback(); return jsonify({'message':str(e)}), 400
    finally:
        db.close()


# 5) “Catch-all” para servir o index do React
@app.route('/', defaults={'path':''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(app.static_folder+'/'+path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/health')
def health():
    return jsonify({'status':'OK'}), 200

if __name__ == "__main__":
    # localmente
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT",8080)), debug=False)
