import sqlite3
from flask import Flask, request, jsonify, send_from_directory, g
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)
DATABASE = 'confyra.db'
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS papers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                abstract TEXT,
                authorEmail TEXT NOT NULL,
                status TEXT NOT NULL,
                date TEXT NOT NULL,
                filename TEXT
            )
        ''')

        cursor.execute("PRAGMA table_info(papers)")
        columns = [col[1] for col in cursor.fetchall()]

        if 'filename' not in columns:
            cursor.execute('ALTER TABLE papers ADD COLUMN filename TEXT')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT NOT NULL,
                date TEXT NOT NULL,
                type TEXT NOT NULL,
                meeting_link TEXT
            )
        ''')

        # Handle migration if meetings table already exists without meeting_link
        cursor.execute("PRAGMA table_info(meetings)")
        columns = [col[1] for col in cursor.fetchall()]

        if 'meeting_link' not in columns:
            cursor.execute('ALTER TABLE meetings ADD COLUMN meeting_link TEXT')

        db.commit()

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# --- AUTH API ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    db = get_db()
    cursor = db.cursor()

    data['role'] = 'author'

    # Check if user exists
    cursor.execute('SELECT * FROM users WHERE email = ?', (data['email'],))
    if cursor.fetchone():
        return jsonify({'error': 'User ID (Email) already registered'}), 400
        
    cursor.execute('''
        INSERT INTO users (email, name, password, role)
        VALUES (?, ?, ?, ?)
    ''', (data['email'], data['name'], data['password'], data['role']))
    db.commit()
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('SELECT * FROM users WHERE email = ? AND password = ?', (data['email'], data['password']))
    user = cursor.fetchone()
    
    if user:
        return jsonify({
            'email': user['email'],
            'name': user['name'],
            'role': user['role']
        })
    return jsonify({'error': 'Invalid User ID or Password'}), 401

@app.route('/api/me/password', methods=['PUT'])
def update_password():
    data = request.json
    email = request.headers.get('x-user-email')
    if not email:
        return jsonify({'error': 'Unauthorized'}), 401
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE users SET password = ? WHERE email = ?', (data['newPassword'], email))
    db.commit()
    return jsonify({'message': 'Password updated'})

# --- PAPERS API ---
@app.route('/api/papers', methods=['GET'])
def get_papers():
    email = request.headers.get('x-user-email')

    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT role FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    cursor.execute('SELECT * FROM papers ORDER BY id DESC')
    papers = [dict(row) for row in cursor.fetchall()]

    return jsonify(papers)

@app.route('/api/papers', methods=['POST'])
def submit_paper():
    email = request.headers.get('x-user-email')
    if not email:
        return jsonify({'error': 'Unauthorized'}), 401
        
    title = request.form.get('title')
    abstract = request.form.get('abstract', '')
    
    file = request.files.get('file')
    filename = None
    if file and file.filename != '':
        filename = secure_filename(file.filename)
        filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
    db = get_db()
    cursor = db.cursor()
    date_str = datetime.now().strftime('%Y-%m-%d')
    cursor.execute('''
        INSERT INTO papers (title, abstract, authorEmail, status, date, filename)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (title, abstract, email, 'Pending', date_str, filename))
    db.commit()
    return jsonify({'message': 'Paper submitted'}), 201

@app.route('/api/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/papers/<int:paper_id>/review', methods=['POST'])
def review_paper(paper_id):
    data = request.json
    email = request.headers.get('x-user-email')

    decision = data.get('decision')

    if decision not in ['Accepted', 'Rejected']:
        return jsonify({'error': 'Invalid decision'}), 400

    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        'SELECT role FROM users WHERE email = ?',
        (email,)
    )
    user = cursor.fetchone()

    if not user or user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    cursor.execute(
        'UPDATE papers SET status = ? WHERE id = ?',
        (decision, paper_id)
    )

    if cursor.rowcount == 0:
        return jsonify({'error': 'Paper not found'}), 404

    db.commit()

    return jsonify({
        'message': f'Paper {decision}'
    })

# --- MEETINGS API ---
@app.route('/api/meetings', methods=['GET'])
def get_meetings():
    email = request.headers.get('x-user-email')

    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT role FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    cursor.execute('''
        SELECT * FROM meetings
        ORDER BY
            CASE WHEN type = 'Instant' THEN 0 ELSE 1 END,
            date DESC
    ''')

    meetings = [dict(row) for row in cursor.fetchall()]
    
    return jsonify(meetings)

@app.route('/api/meetings', methods=['POST'])
def schedule_meeting():
    data = request.json
    email = request.headers.get('x-user-email')

    if not email:
        return jsonify({'error': 'Unauthorized'}), 401

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        'SELECT role FROM users WHERE email = ?',
        (email,)
    )
    user = cursor.fetchone()

    if not user or user['role'] != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    topic = data['topic']
    date = data['date']
    meeting_type = data.get('type', 'Scheduled')
    meeting_link = data.get('meeting_link', '')

    if meeting_type == 'Instant':
        meeting_link = f'http://127.0.0.1:5000/meeting-room/{topic.replace(" ", "-")}'

    cursor.execute('''
        INSERT INTO meetings (topic, date, type, meeting_link)
        VALUES (?, ?, ?, ?)
    ''', (
        topic,
        date,
        meeting_type,
        meeting_link
    ))

    db.commit()

    return jsonify({'message': 'Meeting scheduled'}), 201

@app.route('/meeting-room/<path:meeting_name>')
def meeting_room(meeting_name):
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Confyra Meeting Room</title>
        <style>
            * {{
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
            }}

            body {{
                background: #F5F7FA;
                color: #1F2937;
                min-height: 100vh;
            }}

            .header {{
                height: 70px;
                background: #17324D;
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 30px;
            }}

            .logo {{
                font-size: 24px;
                font-weight: 700;
            }}

            .meeting-title {{
                font-size: 15px;
                opacity: 0.9;
            }}

            .room {{
                min-height: calc(100vh - 70px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
            }}

            .meeting-card {{
                width: 850px;
                max-width: 95%;
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 18px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(15, 38, 59, 0.10);
                text-align: center;
            }}

            .video-area {{
                height: 400px;
                background: #172B3A;
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                margin-bottom: 25px;
            }}

            .video-content h2 {{
                font-size: 25px;
                margin-bottom: 10px;
            }}

            .video-content p {{
                color: #CBD5E1;
            }}

            .controls {{
                display: flex;
                justify-content: center;
                gap: 14px;
                flex-wrap: wrap;
            }}

            button {{
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
            }}

            .control-btn {{
                background: #E6F5F5;
                color: #0F6F71;
            }}

            .control-btn:hover {{
                background: #D5EEEE;
            }}

            .leave-btn {{
                background: #C94C4C;
                color: white;
            }}

            .leave-btn:hover {{
                background: #A83D3D;
            }}
        </style>
    </head>

    <body>

        <div class="header">
            <div class="logo">Confyra</div>
            <div class="meeting-title">
                Meeting: {meeting_name.replace('-', ' ')}
            </div>
        </div>

        <div class="room">

            <div class="meeting-card">

                <div class="video-area">
                    <div class="video-content">
                        <h2>Confyra Meeting Room</h2>
                        <p>Your meeting has started</p>
                    </div>
                </div>

                <div class="controls">

                    <button class="control-btn" onclick="toggleMic(this)">
                        🎙️ Microphone
                    </button>

                    <button class="control-btn" onclick="toggleCamera(this)">
                        📹 Camera
                    </button>

                    <button class="control-btn" onclick="shareScreen()">
                        🖥️ Share Screen
                    </button>

                    <button class="leave-btn" onclick="leaveMeeting()">
                        📞 Leave Meeting
                    </button>

                </div>

            </div>

        </div>

        <script>
            function toggleMic(button) {{
                button.innerText =
                    button.innerText.includes('Microphone')
                    ? '🔇 Microphone Off'
                    : '🎙️ Microphone';
            }}

            function toggleCamera(button) {{
                button.innerText =
                    button.innerText.includes('Camera')
                    ? '📷 Camera Off'
                    : '📹 Camera';
            }}

            function shareScreen() {{
                alert('Screen sharing will be available in the next version.');
            }}

            function leaveMeeting() {{
                window.location.href = '/';
            }}
        </script>

    </body>
    </html>
    '''
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)

    