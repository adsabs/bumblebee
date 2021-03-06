#!/bin/bash

# make sure the image is built
if [[ `docker images | grep bbb-nginx` == "" ]]; then
    docker build -t bbb-nginx .
fi

home=`pwd`
target=${1:-src} # workdir that will become webserver's root
extraargs=${2:- -m=1g}

# add extra args (to docker) like this:
# ./server.sh src '-m=1g --memory-swap=1g ...'

docker rm -f bbb-nginx 2>/dev/null
docker run -p 8000:80 -v $home/$target/:/app/production -v $home/nginx.conf:/etc/nginx/nginx.conf $extraargs bbb-nginx nginx
