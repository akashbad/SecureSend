import os
from flask import Flask, request, jsonify
from flask_cors import cross_origin
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
db = SQLAlchemy(app)

class Entry(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	email = db.Column(db.String(120), unique=True)
	pk = db.Column(db.Integer)
	sk_pad = db.Column(db.Integer)

	def __init__(self, email, pk, sk_pad):
		self.email = email
		self.pk = pk
		self.sk_pad = sk_pad

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
		if not entry:
			new_entry = Entry(data['email'], data['pk'], data['sk_pad'])
			db.session.add(new_entry)
		else:
			entry.pk = data['pk']
			entry.sk_pad = data['sk_pad']
		db.session.commit()
		result['success'] = True
	except:
		result['success'] = False
	return jsonify(result)

@app.route('/pk', methods=['GET'])
@cross_origin()
def get_pk():
	target_email = request.args.get('email')
	entry = db.session.query(Entry).filter(Entry.email == target_email).first()
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
	entry = db.session.query(Entry).filter(Entry.email == target_email).first()
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
