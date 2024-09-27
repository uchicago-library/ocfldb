import io
import json
import math
import openpyxl
import os
import sys
import time

try:
    from config import Config
except ModuleNotFoundError:
    from .config import Config

from flask import Flask, jsonify, request, send_file
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, desc
from sqlalchemy.ext.automap import automap_base

import logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.config.from_object(Config)
db_path = app.config.get('DATABASE_URI')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///{}'.format(db_path)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
Base = automap_base()
Base.prepare(engine, reflect=True)
Arks = Base.classes.arks

def to_dict(ark):
    return {
        'ark': ark.ark,
        'original_identifier': ark.original_identifier,
        'project': ark.project,
        'url': ark.url,
        'path': ark.path,
        'valid': ark.valid,
        'validation_date': ark.validation_date
    }

@app.route('/')
def data():
    sort_by = request.args.get('sortBy', None)
    order = request.args.get('order', None)
    page = request.args.get('page', default=0, type=int)
    page_size = request.args.get('pageSize', default=10, type=int)

    ark = request.args.get('ark', None)
    original_identifier = request.args.get('original_identifier', None)
    project = request.args.get('project', None)
    path = request.args.get('path', None)

    assert sort_by in (None, 'ark', 'original_identifier', 'project', 'path')
    assert order in (None, 'asc', 'desc')

    offset = page_size * page

    results = db.session.query(Arks)

    if ark:
        results = results.filter(Arks.ark.contains(ark))
    elif original_identifier:
        results = results.filter(Arks.original_identifier.contains(original_identifier))
    elif project:
        results = results.filter(Arks.project.contains(project))
    elif path:
        results = results.query(Arks).filter(Arks.path.contains(path))

    if sort_by and order:
        if order == 'asc':
            results = results.order_by(getattr(Arks, sort_by))
        else:
            results = results.order_by(desc(getattr(Arks, sort_by)))

    total_results = results.count()
    total_pages = math.ceil(total_results / page_size)

    results = results.limit(page_size)

    results = results.offset(offset)

    output = {
        'data': [to_dict(ark) for ark in results],
        'page': page,
        'pageSize': page_size,
        'totalPages': total_pages,
        'totalResults': total_results
    }
 
    response = jsonify(output)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/download')
def download():
    output = io.BytesIO()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(['ARK', 'Original Identifier', 'Project', 'URL', 'Path'])

    results = db.session.query(Arks)
    for row in [to_dict(ark) for ark in results]:
        ws.append([
            row['ark'],
            row['original_identifier'],
            row['project'],
            row['url'],
            row['path']
        ])

    wb.save(output)
    output.seek(0)
   
    return send_file( 
        output,
        as_attachment=True,
        download_name='ark_data.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
