'''Use below link to downgrade security for gmail account.
https://myaccount.google.com/u/1/lesssecureapps
'''

from flask import Flask
from flask_mail import Mail, Message

app = Flask(__name__)
mail= Mail(app)

app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'support@aceengineer.com'
app.config['MAIL_PASSWORD'] = 'rose109Gud'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

@app.route("/")
def index():
    msg = Message('Hello', sender = 'support@aceengineer.com', recipients = ['vamsee.achanta@aceengineer.com'])
    msg.body = "Hello Flask message sent from Flask-Mail"
    mail.send(msg)
    return "Sent"

if __name__ == '__main__':
    app.run(debug = True)
    