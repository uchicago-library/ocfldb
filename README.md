# ocfldb

This website provides a live view of the OCFL database we use to manage ARK identifiers and digital collections materials. 

## Building the Site

This project uses both Flask and React. Inside src/frontend you'll find React code. To run a the site on a development machine, 
use:

```console
npm run dev
```

To build static HTML, CSS and JavaScript for the production site do:

```console
npm run build
```

Backend code lives in src/backend. After making changes to the code, be sure to touch app.wsgi and wsgi.conf so that the 
most recent changes are viewable though mod_wsgi. 
