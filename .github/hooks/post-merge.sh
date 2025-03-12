#!/bin/sh
if [ "$GIT_BRANCH" = "master" ]; then
  sed -i 's|API_URL: "http://localhost:3000/api/"|API_URL: "https://core.pepijncolenbrander.com/api/"|g' src/app/app.config.ts
fi
