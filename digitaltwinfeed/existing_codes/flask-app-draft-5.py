import json  # # Import json module

## Import Flask framework module  ## render_template module
from flask import Flask, render_template

app = Flask(__name__)
## Define json object 
data = json.load(open('sample.json', 'r'))

@app.route("/")  ## routing to localhost:5000
def hello():
    return render_template('index.html', data=data)
    
@app.route("/next", methods=['GET', 'next'])  ## routing to localhost:5000/next
def next():
    return render_template('next.html', data=data)    

@app.route("/page2", methods=['GET', 'page2'])  ## routing to localhost:5000/next
def page2():
    return render_template('page2.html', data=data)    
 
if __name__ == "__main__":
    app.run()

