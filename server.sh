#!/bin/bash

# make sure the image is built
if [[ `docker images | grep bbb-nginx` == "" ]]; then
    docker build -t bbb-nginx .
fi

home=`pwd`
target=${1:-src} # workdir that will become webserver's root


docker rm -f bbb-nginx 2>/dev/null
docker run -p 8000:80 -v $home/$target/:/app/production -v $home/nginx.conf:/etc/nginx/nginx.conf bbb-nginx nginx