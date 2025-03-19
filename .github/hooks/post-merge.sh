#!/bin/sh
if [ "$GIT_BRANCH" = "master" ]; then
  sed -i 's|"http://localhost:8000/api/"|"https://core.pepijncolenbrander.com/api/"|g' src/app/app.config.ts
fi
