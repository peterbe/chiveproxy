#!/bin/bash

set -e

find . | grep --color=never '\~$' | xargs rm -f

yarn run build
zopfli build/static/**/*.css
zopfli build/static/**/*.js

./bin/update_version.js > build/version.json
./bin/insert_version.js build/version.json build/index.html

rm -fr build.zip && apack build.zip build
