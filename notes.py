import _sqlite3

 # For now this is just a simple note with title, content and category
# NOTE: In the future, maybe expand subclasses to include different types of notes or add a time to complete
# OR!!!! An enjoyement meter?
class Note:
    def __init__(self,title,content,category):
        self.title = title
        self.content = content
        self.category = category
    
    def summarize(self):
        return f"{self.title} :{self.content} ({self.category})"
    
    def change_content(content):
        self.content = content
    
    def change_category(category):
        self.category = category
