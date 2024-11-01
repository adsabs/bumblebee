FROM nginx:latest
EXPOSE 80

RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

RUN echo "load_module modules/ngx_http_subs_filter_module.so;" > /etc/nginx/modules/subs-filter.conf

CMD ["nginx"]
