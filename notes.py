import _sqlite3
import flask
 # For now this is just a simple note with title, content and category
# NOTE: In the future, maybe expand subclasses to include different types of notes or add a time to complete
# OR!!!! An enjoyement meter?



# ------------------------- HELPER FUNCTIONS -------------------#
def change_content(content):
        cur.execute("UPDATE notes SET content = ? WHERE title = ? AND content = ? AND category = ?",(content,self.title,self.content,self.category))

def change_category(category):
        cur.execute("UPDATE notes SET category = ? WHERE title = ? AND content = ? AND category = ?",(category,self.title,self.content,self.category))

def create_note(title,content,category):
    # if(1 != 1): 
    #     #some condition              # TODO: take care of the case where title,content or category are invalid
    cur.execute("SELECT * FROM notes WHERE title = ? AND content = ?", (title,content))
    if cur.fetchone():
        return "Already exists"
    cur.execute("INSERT OR IGNORE INTO notes (title,content,category) VALUES (?,?,?)",(title,content,category)) 

#-----------------------------------------------------------------------------#

notes = _sqlite3.connect("note_database.db")
cur = notes.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT,content TEXT, category TEXT)")


# Checking for create_note, prints Already Exists as needed
print(create_note("LOL","SOMNETHING NEW","Default"))
cur.execute("SELECT * FROM notes")
notes.commit()
print(cur.fetchall())







