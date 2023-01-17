from flask_wtf import FlaskForm, CSRFProtect
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Email

csrf = CSRFProtect()

class ContactForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired('Name is required')])
    email = StringField('E-mail', validators=[DataRequired('E-mail is required'),Email('Please provide a valid email')])
    subject = StringField('Subject', validators=[DataRequired('Subject is required')])
    message = TextAreaField('Message', validators=[DataRequired('Message is required')])
    submit = SubmitField("Submit")