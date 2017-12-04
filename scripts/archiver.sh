#!/bin/sh

cd packages
find . -type f -depth 1 | xargs rm -rf
find . -type d -depth 1 -exec zip -r {}.zip {} \;
