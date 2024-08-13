from flask import Flask,jsonify, request
from models import get_db_connection

def setup_routes(app):
    
    @app.route('/players', methods=['GET'])
    def get_players():
        conn = get_db_connection()
        players = conn.execute('SELECT * FROM players').fetchall()
        conn.close()

        return jsonify([dict(player) for player in players])

    @app.route('/players', methods=['POST'])
    def create_player():
        data = request.get_json()
        name = data['name']
        position = data['position']

        conn = get_db_connection()
        conn.execute('INSERT INTO players (name, position) VALUES (?, ?)', (name, position))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Player created!'}), 201

    @app.route('/players/<int:id>', methods=['PUT'])
    def update_player(id):
        data = request.get_json()
        name = data['name']
        position = data['position']

        conn = get_db_connection()
        conn.execute('UPDATE players SET name = ?, position = ? WHERE id = ?', (name, position, id))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Player updated!'})

    @app.route('/players/<int:id>', methods=['DELETE'])
    def delete_player(id):
        conn = get_db_connection()
        conn.execute('DELETE FROM players WHERE id = ?', (id,))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Player deleted!'})



def app():

def setup_routes():

def main():




