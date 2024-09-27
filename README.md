# ocfldb

This website provides a live view of the OCFL database we use to manage ARK identifiers and digital collections materials. 

## Running the Site on a Development Machine

Add a configuration file at src/backend/config.py.

This file should contain a path to the ark_data.db database:

```console
class Config:
    DATABASE_URI = '/absolute/path/to/ark_data.db'
```

Set up a Python virtual environment and run pip install -r requirements.txt. See the production sites for the location of the 
virtual env. On a development machine I usually place this outside of the git repo. 

For local development you can use the Flask dev server by changing directory to src/backend and running the following commands:

```console
export FLASK_APP=app
flask run
```

Then, in a separate window, change directory to src/frontend and run the frontend:

```console
npm run dev
```

## Running the Site in Production

In production, you'll use mod_wsgi to run the Flask app through Apache. Apache has been set up to serve static
React files- to build them, do:

```console
npm run build
```

If you make any changes to the code in production, be sure to touch app.wsgi
and wsgi.conf so that the most recent changes are viewable though mod_wsgi. 
