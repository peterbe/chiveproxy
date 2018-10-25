#!/bin/bash

set -e

find . | grep --color=never '\~$' | xargs rm -f
yarn run build
zopfli build/static/**/*.css
zopfli build/static/**/*.js
rm -fr build.zip && apack build.zip build
