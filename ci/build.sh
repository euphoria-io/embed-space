#!/bin/bash

set -ex

NODE_MODULES_REV=$(git log --pretty=format:%H package.json | head -n 1)

if s3cmd get s3://alpha.euphoria.io/embed.space/node_modules-${NODE_MODULES_REV}.tar.gz node_modules.tar.gz; then
  echo 'Using cached node_modules'
  tar xzf node_modules.tar.gz
else
  echo 'Installing node_modules'
  npm install
  echo 'Caching node_modules'
  tar cf node_modules-${NODE_MODULES_REV}.tar node_modules
  gzip -9 node_modules-${NODE_MODULES_REV}.tar
  s3cmd put node_modules-${NODE_MODULES_REV}.tar.gz s3://alpha.euphoria.io/embed.space
fi

npm run-script cover

echo 'Building static assets'
NODE_ENV=production HEIM_ORIGIN='https://alpha.euphoria.io' DOMAIN=alpha.euphoria.io node_modules/.bin/webpack

if [ ${DRONE_BRANCH} == master -o ${DRONE_BRANCH} == drone ]; then
  echo 'Uploading static assets'
  cd build
  s3cmd put -m text/css *.css s3://alpha.euphoria.io/embed.space
  s3cmd put *.html *.js *.map s3://alpha.euphoria.io/embed.space
fi
