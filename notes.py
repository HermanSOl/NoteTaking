import _sqlite3
import os
import flask
from dotenv import load_dotenv

 # For now this is just a simple note with title, content and category
# NOTE: In the future, maybe expand subclasses to include different types of notes or add a time to complete
# OR!!!! An enjoyement meter?

load_dotenv()
DB_NAME = os.getenv("DB_NAME")

# ------------------------- HELPER FUNCTIONS -------------------#
def change_content(cur,content):
        cur.execute("UPDATE tab SET content = ? WHERE title = ? AND content = ? AND category = ?",(content,self.title,self.content,self.category))

def change_category(cur,category):
        cur.execute("UPDATE tab SET category = ? WHERE title = ? AND content = ? AND category = ?",(category,self.title,self.content,self.category))

def create_note(cur,title,content,category,created):
    # if(1 != 1): 
    #     #some condition              # TODO: take care of the case where title,content or category are invalid
    cur.execute("SELECT * FROM tab WHERE title = ? AND content = ?", (title,content))
    if cur.fetchone():
        return "Already exists"
    cur.execute("INSERT OR IGNORE INTO tab (title,content,category,created_at,updated_at) VALUES (?,?,?,?,?)",(title,content,category,created,created)) 

def get_db():
    copy = _sqlite3.connect(DB_NAME)
    return copy

#-----------------------------------------------------------------------------#

# DB Initialization
def init_db():
    tab = _sqlite3.connect(DB_NAME)
    cur = tab.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS tab (id INTEGER PRIMARY KEY, title TEXT,content TEXT, category TEXT,created_at DATE,updated_at DATE)")
    tab.close()

init_db()

app = flask.Flask(__name__)
@app.route('/',methods=["GET"])
def note_display():
    conn = get_db()         # we need to get only one connection to db per one request
    cur = conn.cursor()
    cur.execute("SELECT * FROM tab")
    displayed_notes = cur.fetchall()
    conn.close()        # closing the connection
    return flask.render_template("note_mainpage.html",notes=displayed_notes)




app.config['SERVER NAME'] = f"notes.localhost"
app.run(debug=True)
