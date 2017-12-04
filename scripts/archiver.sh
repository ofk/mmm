#!/bin/sh

find packages ! -path packages -type f -maxdepth 1 | xargs rm -rf
find packages ! -path packages -type d -maxdepth 1 -exec zip -r {}.zip {} \;
