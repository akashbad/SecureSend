import hashlib
import os
import random
import requests
import string
import urllib
from flask import Flask, request, jsonify
from flask_cors import cross_origin
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
db = SQLAlchemy(app)
EMAIL_CONFIRMATION_ON = False  # TODO, turn on for prod

def gen_random_token():
	seed = random.SystemRandom()
	possible_chars = string.letters + string.digits
	return ''.join(seed.choice(possible_chars) for i in xrange(32))

def send_confirmation_email(email, pk, sk_pad, verification_token):
	return requests.post(
        "https://api.mailgun.net/v2/sandboxe633d59286ed4a8daefd9c88f09742d3.mailgun.org/messages",
        auth=("api", "key-43tq9rgx30dr7hwsmnw-hy-v-vpmt5j1"),
        data={"from": "Mailgun Sandbox <postmaster@sandboxe633d59286ed4a8daefd9c88f09742d3.mailgun.org>",
              "to": "SendSecure User <" + email +">",
              "subject": "Confirm your SendSecure registration!",
              "text": "Confirm your SendSecure registration by clicking the link: https://peaceful-ocean-5864.herokuapp.com/confirm?email=" + urllib.quote(email) + "&pk=" + urllib.quote(pk) + "&sk_pad=" + urllib.quote(sk_pad) + "&verification_token=" + urllib.quote(verification_token)})

class Entry(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(120), unique=True)
	pk = db.Column(db.Text)
	sk_pad = db.Column(db.Text)
	verified = db.Column(db.Boolean)
	verification_token_hash = db.Column(db.Text)

	def __init__(self, email, pk, sk_pad, verified, verification_token_hash):
		self.email = email
		self.pk = pk
		self.sk_pad = sk_pad
		self.verified = verified
		self.verification_token_hash = verification_token_hash

@app.route('/')
def hello_world():
	return "Secure Send."

@app.route('/register', methods=['POST'])
@cross_origin(headers=['Content-Type'])
def register():
	data = request.get_json(force=True)
	entry = db.session.query(Entry).filter(Entry.email == data['email']).first()
	result = {}
	try:
		if not EMAIL_CONFIRMATION_ON:
			if not entry:
				new_entry = Entry(data['email'], data['pk'], data['sk_pad'], True, '')
				db.session.add(new_entry)
			else:
				entry.pk = data['pk']
				entry.sk_pad = data['sk_pad']
				entry.verified = True
			db.session.commit()
		else:
			random_token = gen_random_token()
			if not entry:
				new_entry = Entry(data['email'], 0, 0, False, hashlib.sha256(random_token).hexdigest())
				db.session.add(new_entry)
			else:
				entry.verification_token_hash = hashlib.sha256(random_token).hexdigest()
			db.session.commit()
			send_confirmation_email(data['email'], data['pk'], data['sk_pad'], random_token)
		result['success'] = True
	except:
		result['success'] = False
	return jsonify(result)

@app.route('/confirm', methods=['GET'])
@cross_origin()
def confirm_registration():
	email = request.args.get('email')
	pk = request.args.get('pk')
	sk_pad = request.args.get('sk_pad')
	verification_token = request.args.get('verification_token')
	entry = db.session.query(Entry).filter(Entry.email == email).first()
	result = {}
	if not entry:
		result['success'] = False
	elif entry.verification_token_hash != hashlib.sha256(verification_token).hexdigest():
		result['success'] = False
	else:
		entry.pk = pk
		entry.sk_pad = sk_pad
		entry.verified = True
		db.session.commit()
		result['success'] = True
	return jsonify(result)

@app.route('/pk', methods=['GET'])
@cross_origin()
def get_pk():
	target_email = request.args.get('email')
	entry = db.session.query(Entry).filter(Entry.email == target_email).filter(Entry.verified == True).first()
	result = {}
	if not entry:
		result['success'] = False
	else:
		result['success'] = True
		result['pk'] = entry.pk
	return jsonify(result)

@app.route('/sk_pad', methods=['GET'])
@cross_origin()
def get_sk_pad():
	target_email = request.args.get('email')
	entry = db.session.query(Entry).filter(Entry.email == target_email).filter(Entry.verified == True).first()
	result = {}
	if not entry:
		result['success'] = False
	else:
		result['success'] = True
		result['sk_pad'] = entry.sk_pad
	return jsonify(result)

if __name__ == '__main__':
	app.debug = True  # TODO, get rid of for prod
	app.run()
