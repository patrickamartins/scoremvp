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

# Chave secreta para JWT (em produção, use uma chave segura)
SECRET_KEY = os.environ.get('SECRET_KEY', 'sua_chave_secreta_aqui')

# Decorator para verificar o token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token não fornecido!'}), 401
        try:
            token = token.split(' ')[1]  # Remove o 'Bearer ' do token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['username']
        except:
            return jsonify({'message': 'Token inválido!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Servir arquivos estáticos do React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Login hardcoded para MVP
    if username == 'admin' and password == 'admin':
        token = jwt.encode({
            'username': username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY)
        return jsonify({'token': token})
    
    return jsonify({'message': 'Credenciais inválidas!'}), 401

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
        
        # Registra a ação para possível desfazer
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
        # Busca as últimas 5 ações
        ultimas_acoes = db.query(Acao).order_by(Acao.timestamp.desc()).limit(5).all()
        
        if not ultimas_acoes:
            return jsonify({'message': 'Não há ações para desfazer!'})
        
        # Remove a ação mais recente
        acao_para_remover = ultimas_acoes[0]
        estatistica_para_remover = db.query(Estatistica).filter_by(id=acao_para_remover.id_estatistica).first()
        
        if estatistica_para_remover:
            db.delete(estatistica_para_remover)
            db.delete(acao_para_remover)
            db.commit()
            return jsonify({'message': 'Ação desfeita com sucesso!'})
        
        return jsonify({'message': 'Erro ao desfazer ação!'}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'message': str(e)}), 400
    finally:
        db.close()

@app.route('/dashboard', methods=['GET'])
def get_dashboard():
    jogo_id = request.args.get('jogo_id')
    if not jogo_id:
        return jsonify({'message': 'ID do jogo não fornecido!'}), 400
    
    db = SessionLocal()
    try:
        # Busca todas as estatísticas do jogo
        estatisticas = db.query(Estatistica).filter_by(id_jogo=jogo_id).all()
        
        # Calcula totais por tipo
        totais = {}
        for est in estatisticas:
            if est.tipo not in totais:
                totais[est.tipo] = 0
            totais[est.tipo] += 1
        
        # Encontra destaques
        destaques = {}
        for est in estatisticas:
            if est.tipo not in destaques:
                destaques[est.tipo] = {}
            if est.jogadora.nome not in destaques[est.tipo]:
                destaques[est.tipo][est.jogadora.nome] = 0
            destaques[est.tipo][est.jogadora.nome] += 1
        
        # Formata os destaques
        destaques_formatados = []
        for tipo, jogadoras in destaques.items():
            if jogadoras:
                melhor_jogadora = max(jogadoras.items(), key=lambda x: x[1])
                destaques_formatados.append({
                    'tipo': tipo,
                    'jogadora': melhor_jogadora[0],
                    'quantidade': melhor_jogadora[1]
                })
        
        return jsonify({
            'totais': totais,
            'destaques': destaques_formatados
        })
    finally:
        db.close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False) 