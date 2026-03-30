import sqlite3
import os
import flask
from datetime import datetime
from dotenv import load_dotenv

 # For now this is just a simple note with title, content and category
# NOTE: In the future, maybe expand subclasses to include different types of notes or add a time to complete
# OR!!!! An enjoyement meter?

load_dotenv()
DB_NAME = os.getenv("DB_NAME")

# ------------------------- HELPER FUNCTIONS -------------------#
def clear_db(cur):
     cur.execute("DROP TABLE tab")

def change_content(cur, title, new_content):
    cur.execute("UPDATE tab SET content = ? WHERE title = ?", (new_content, title))

def change_category(cur, title, new_category):
    cur.execute("UPDATE tab SET category = ? WHERE title = ?", (new_category, title))

def create_note(cur,title,content,category,created,enjoyment=None):
    # if(1 != 1):
    #     #some condition              # TODO: take care of the case where title,content or category are invalid
    cur.execute("SELECT * FROM tab WHERE title = ? AND content = ?", (title,content))
    if cur.fetchall():
        return "Already exists"
    cur.execute("INSERT OR IGNORE INTO tab (title,content,category,created_at,updated_at,enjoyment) VALUES (?,?,?,?,?,?)",(title,content,category,created,created,enjoyment))

def get_db():
    copy = sqlite3.connect(DB_NAME)
    return copy

#-----------------------------------------------------------------------------#

# DB Initialization
def init_db():
    tab = sqlite3.connect(DB_NAME)
    cur = tab.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS tab (id INTEGER PRIMARY KEY, title TEXT,content TEXT, category TEXT,created_at DATE,updated_at DATE, enjoyment INTEGER)")
    try:
        cur.execute("ALTER TABLE tab ADD COLUMN enjoyment INTEGER")
    except sqlite3.OperationalError:
        pass  # column already exists
    tab.commit()
    tab.close()

init_db()

app = flask.Flask(__name__)
@app.route('/notes',methods=["GET"])
def note_display():
    conn = get_db()         # we need to get only one connection to db per one request
    cur = conn.cursor()

    titles = flask.request.args.get('title')
    if titles:
        cur.execute("SELECT * FROM tab WHERE title = ?", (titles,))
        displayed_notes=cur.fetchall()
    else:
        cur.execute("SELECT * FROM tab ORDER BY created_at DESC")
        displayed_notes = cur.fetchall()
    conn.close()
    return flask.render_template("note_mainpage.html", notes=displayed_notes)

@app.route('/notes/post',methods=['POST'])
def post_note():
    now = datetime.now().strftime("%Y-%m-%d")

    note = flask.request.form['title']
    content = flask.request.form.get('content', '').strip() or None
    category = flask.request.form.get('category', '').strip() or None
    enjoyment_raw = flask.request.form.get('enjoyment', '').strip()
    enjoyment = int(enjoyment_raw) if enjoyment_raw else None
    conn = get_db()                            # JUST A PROTOTYPE FOR NOW. ONLY TAKES IN TITLE
    cur = conn.cursor()
    create_note(cur,note,content,category,now,enjoyment)
    conn.commit()
    return flask.redirect('/notes')

@app.route('/notes/<int:id>',methods=['PUT'])
def update_note(id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tab WHERE id = ?", (id,))
    if not cur.fetchall():
        conn.close()
        return flask.jsonify({"error": "No such note exists"}), 404

    input = flask.request.get_json() #if this wasnt localhost user could look up any note of other users (which is bad)
    now = datetime.now().strftime("%Y-%m-%d")  # but it is on localhost! so its obv not a problem. maybe implement cookies for funzies?
    if 'title' in input:
        cur.execute("UPDATE tab SET title = ? WHERE id = ?", (input['title'], id))
    if 'content' in input:
        cur.execute("UPDATE tab SET content = ? WHERE id = ?", (input['content'], id))
    if 'category' in input:
        cur.execute("UPDATE tab SET category = ? WHERE id = ?", (input['category'], id))
    if 'enjoyment' in input:
        cur.execute("UPDATE tab SET enjoyment = ? WHERE id = ?", (input['enjoyment'], id))
    cur.execute("UPDATE tab SET updated_at = ? WHERE id = ?", (now, id))

    conn.commit()
    conn.close()
    return flask.redirect('/notes')

@app.route('/notes/delete/<int:id>',methods=['DELETE'])
def delete_note(id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tab WHERE id = ?", (id,))
    if not cur.fetchall():
        conn.close()
        return flask.jsonify({"error": "No such note exists"}), 404

    cur.execute("DELETE FROM tab WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return flask.redirect('/notes')



app.config['SERVER NAME'] = f"notes.localhost"
app.run(debug=True)
