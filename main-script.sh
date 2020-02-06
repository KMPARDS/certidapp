#!/bin/bash
npm run build && git stash && git checkout gh-pages && ./script.sh && git add . && git commit -m "build update $1" && git push
git checkout master
git stash pop
