#!/bin/sh

exec wget -q -O - -S --auth-no-challenge --http-user=superkassa --http-password=eraehah7Opek9uthae8Mie5oP --header="Content-Type: application/json" --post-data='{}' 'http://0.0.0.0:3999/entrypoint?ident=SOMESPECIFICINFORMATION'

