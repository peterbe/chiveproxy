#!/bin/bash

set -e

#echo "Check if it's a dirty branch..."
#git diff-files --quiet || (echo "Dirty branch!" && git status && exit 1)

echo "Build the build..."
./bin/build.sh

#echo "Committing this latest build..."
#git add build.zip
#git commit -m "latest build (`date`)"
#git push origin master
scp build.zip django@192.34.57.223:/home/django/chiveproxy/

echo "Actually deploying..."
UpgradeChiveproxy.sh
