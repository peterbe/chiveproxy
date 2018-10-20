#!/bin/bash

set -e

yarn run build
zopfli build/static/**/*.css
zopfli build/static/**/*.js
rm -fr build.zip && apack build.zip build
