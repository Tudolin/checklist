import json
import os
import sqlite3
import time

from flask import Flask, jsonify, redirect, render_template, request, url_for

app = Flask(__name__)

DATABASE = 'checklists.db'

def connect_db():
    return sqlite3.connect(DATABASE)

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/checklists")
def checklists():
    checklists = []
    for file in os.listdir('checklists'):
        if file.endswith('.json'):
            with open(os.path.join('checklists', file), 'r') as f:
                checklists.append(json.load(f))
    return render_template("checklists.html", checklists=checklists)

@app.route("/checklist", methods=['GET', 'POST'])
def checklist():
    if request.method == 'POST':
        data = request.get_json()
        checklist_id = data.get('id', int(time.time()))
        checklist_name = data.get('name')
        checklist_description = data.get('description', '')
        checklist_data = {
            "id": checklist_id,
            "name": checklist_name,
            "description": checklist_description,
            "areas": data.get('areas', [])
        }
        file_name = f'{checklist_id}.json'
        directory = 'checklists'
        if not os.path.exists(directory):
            os.makedirs(directory)
        with open(os.path.join(directory, file_name), 'w') as file:
            json.dump(checklist_data, file, indent=4)
        return jsonify({'success': True, 'checklist_id': checklist_id})
    elif request.method == 'GET':
        checklist_id = request.args.get('id')
        if checklist_id:
            checklist_file = f'checklists/{checklist_id}.json'
            if os.path.exists(checklist_file):
                with open(checklist_file, 'r') as file:
                    checklist = json.load(file)
                return render_template("checklist.html", checklist=checklist)
            return jsonify({'error': 'Checklist not found'}), 404
        return render_template("checklist.html", checklist=None)


@app.route("/create-new-checklist", methods=['POST'])
def create_new_checklist():
    data = request.get_json()
    checklist_name = data.get('name')
    checklist_description = data.get('description', '')
    checklist_id = int(time.time())
    checklist_data = {
        "id": checklist_id,
        "name": checklist_name,
        "description": checklist_description,
        "areas": []
    }
    file_name = f'{checklist_id}.json'
    directory = 'checklists'
    if not os.path.exists(directory):
        os.makedirs(directory)
    with open(os.path.join(directory, file_name), 'w') as file:
        json.dump(checklist_data, file, indent=4)
    return jsonify({'success': True, 'checklist_id': checklist_id})

@app.route("/checklist/<int:checklist_id>/excluir", methods=['POST'])
def excluir_checklist(checklist_id):
    checklist_file = f'checklists/{checklist_id}.json'
    if os.path.exists(checklist_file):
        os.remove(checklist_file)
        return redirect(url_for('checklists'))
    return jsonify({'error': 'Checklist not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
