FROM nginx

ADD nginx.conf /etc/nginx/nginx.conf

 
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80
EXPOSE 8080
CMD ["nginx"] 
