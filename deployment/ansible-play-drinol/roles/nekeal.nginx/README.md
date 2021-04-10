# Ansible Role: Nginx

[![Build Status](https://travis-ci.com/nekeal/ansible-role-nginx.svg?branch=master)](https://travis-ci.com/nekeal/ansible-role-nginx)

**Note:** Please consider using the official [NGINX Ansible role](https://github.com/nginxinc/ansible-role-nginx) from NGINX, Inc.

Installs Nginx on RedHat/CentOS, Debian/Ubuntu, Archlinux, FreeBSD or OpenBSD servers.

This role installs and configures the latest version of Nginx from the Nginx yum repository (on RedHat-based systems), apt (on Debian-based systems), pacman (Archlinux), pkgng (on FreeBSD systems) or pkg_add (on OpenBSD systems). You will likely need to do extra setup work after this role has installed Nginx, like adding your own [virtualhost].conf file inside `/etc/nginx/conf.d/`, describing the location and options to use for your particular website.

## Requirements

None.

## Role Variables


Available variables are listed below, along with default values (see `defaults/main.yml`):

    nginx_selfsigned_certificate_directory: /etc/nginx/ssl
    nginx_selfsigned_certificate_privkey: "{{ nginx_selfsigned_certificate_directory }}/privkey.pem"
    nginx_selfsigned_certificate_fullchain: "{{ nginx_selfsigned_certificate_directory }}/fullchain.pem"
    nginx_selfsigned_certificate_csr: "{{ nginx_selfsigned_certificate_directory }}/cert.csr"

Variables which define where selfsigned certificate should be created. It will be used in `catchall-vhost` and as a replacement for missing certificates in `nginx-vhost` config.

    nginx_copy_missing_certs: yes

Defines whether role should copy selfsigned certs for vhosts.

    nginx_vhosts: []

A list of vhost definitions (server blocks) for Nginx virtual hosts. Each entry will create a separate config file named by `name`. If left empty, you will need to supply your own virtual host configuration. See the commented example in `defaults/main.yml` for available server options. If you have a large number of customizations required for your server definition(s), you're likely better off managing the vhost configuration file yourself, leaving this variable set to `[]`. As I mostly code in Django I've created `django-vhost.j2` template with ability to extend it with snippets mechanism.

    nginx_vhosts:
      - name: localhost-django
        server_names:
          - "localhost"
        upstreams:
          - name: local
            server: localhost:8000
        template: django-vhost.j2
        extra_static_roots:
          - location: "/www/"
            root: /var/
        snippets:
          - location: "~* /static/(.*\\.)(js|css)"
            expiries: 365d
            alias: "/var/www/static/$1$2"
            template: cache.j2
          - location: "/"
            upstream: "local"
            template: "proxy.j2"
        enable_https: true
        static_root: /var/www/static/
        media_root: /var/www/media/
        certificate: /etc/letsencrypt/live/localhost/fullchain.pem
        private_key: /etc/letsencrypt/live/localhost/privkey.pem

In this example if there is missing certificate under above path it will be copied from `nginx_selfsigned_certificate_directory`. It will ensure that nginx will start properly but you should propably provide valid certificate by yourself.


    nginx_remove_default_vhost: false

Whether to remove the 'default' virtualhost configuration supplied by Nginx. Useful if you want the base `/` URL to be directed at one of your own virtual hosts configured in a separate .conf file.

    nginx_upstreams: []

If you are configuring Nginx as a load balancer, you can define one or more upstream sets using this variable. In addition to defining at least one upstream, you would need to configure one of your server blocks to proxy requests through the defined upstream (e.g. `proxy_pass http://myapp1;`). See the commented example in `defaults/main.yml` for more information.

    nginx_user: "nginx"

The user under which Nginx will run. Defaults to `nginx` for RedHat, `www-data` for Debian and `www` on FreeBSD and OpenBSD.

    nginx_worker_processes: "{{ ansible_processor_vcpus|default(ansible_processor_count) }}"
    nginx_worker_connections: "1024"
    nginx_multi_accept: "off"

`nginx_worker_processes` should be set to the number of cores present on your machine (if the default is incorrect, find this number with `grep processor /proc/cpuinfo | wc -l`). `nginx_worker_connections` is the number of connections per process. Set this higher to handle more simultaneous connections (and remember that a connection will be used for as long as the keepalive timeout duration for every client!). You can set `nginx_multi_accept` to `on` if you want Nginx to accept all connections immediately.

    nginx_error_log: "/var/log/nginx/error.log warn"
    nginx_access_log: "/var/log/nginx/access.log main buffer=16k"

Configuration of the default error and access logs. Set to `off` to disable a log entirely.

    nginx_sendfile: "on"
    nginx_tcp_nopush: "on"
    nginx_tcp_nodelay: "on"

TCP connection options. See [this blog post](https://t37.net/nginx-optimization-understanding-sendfile-tcp_nodelay-and-tcp_nopush.html) for more information on these directives.

    nginx_keepalive_timeout: "65"
    nginx_keepalive_requests: "100"

Nginx keepalive settings. Timeout should be set higher (10s+) if you have more polling-style traffic (AJAX-powered sites especially), or lower (<10s) if you have a site where most users visit a few pages and don't send any further requests.

    nginx_server_tokens: "on"

Nginx server_tokens settings. Controls whether nginx responds with it's version in HTTP headers. Set to `"off"` to disable.

    nginx_client_max_body_size: "64m"

This value determines the largest file upload possible, as uploads are passed through Nginx before hitting a backend like `php-fpm`. If you get an error like `client intended to send too large body`, it means this value is set too low.

    nginx_server_names_hash_bucket_size: "64"

If you have many server names, or have very long server names, you might get an Nginx error on startup requiring this value to be increased.

    nginx_proxy_cache_path: ""

Set as the `proxy_cache_path` directive in the `nginx.conf` file. By default, this will not be configured (if left as an empty string), but if you wish to use Nginx as a reverse proxy, you can set this to a valid value (e.g. `"/var/cache/nginx keys_zone=cache:32m"`) to use Nginx's cache (further proxy configuration can be done in individual server configurations).

    nginx_extra_http_options: ""

Extra lines to be inserted in the top-level `http` block in `nginx.conf`. The value should be defined literally (as you would insert it directly in the `nginx.conf`, adhering to the Nginx configuration syntax - such as `;` for line termination, etc.), for example:

    nginx_extra_http_options: |
      proxy_buffering    off;
      proxy_set_header   X-Real-IP $remote_addr;
      proxy_set_header   X-Scheme $scheme;
      proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header   Host $http_host;

See the template in `templates/nginx.conf.j2` for more details on the placement.

    nginx_extra_conf_options: ""

Extra lines to be inserted in the top of `nginx.conf`. The value should be defined literally (as you would insert it directly in the `nginx.conf`, adhering to the Nginx configuration syntax - such as `;` for line termination, etc.), for example:

    nginx_extra_conf_options: |
      worker_rlimit_nofile 8192;

See the template in `templates/nginx.conf.j2` for more details on the placement.

    nginx_log_format: |-
      '$remote_addr - $remote_user [$time_local] "$request" '
      '$status $body_bytes_sent "$http_referer" '
      '"$http_user_agent" "$http_x_forwarded_for"'

Configures Nginx's [`log_format`](http://nginx.org/en/docs/http/ngx_http_log_module.html#log_format). options.

    nginx_default_release: ""

(For Debian/Ubuntu only) Allows you to set a different repository for the installation of Nginx. As an example, if you are running Debian's wheezy release, and want to get a newer version of Nginx, you can install the `wheezy-backports` repository and set that value here, and Ansible will use that as the `-t` option while installing Nginx.

    nginx_ppa_use: false
    nginx_ppa_version: stable

(For Ubuntu only) Allows you to use the official Nginx PPA instead of the system's package. You can set the version to `stable` or `development`.

    nginx_yum_repo_enabled: true

(For RedHat/CentOS only) Set this to `false` to disable the installation of the `nginx` yum repository. This could be necessary if you want the default OS stable packages, or if you use Satellite.

    nginx_service_state: started
    nginx_service_enabled: yes

By default, this role will ensure Nginx is running and enabled at boot after Nginx is configured. You can use these variables to override this behavior if installing in a container or further control over the service state is required.

## Overriding configuration templates

If you can't customize via variables because an option isn't exposed, you can override the template used to generate the virtualhost configuration files or the `nginx.conf` file.

```yaml
nginx_conf_template: "nginx.conf.j2"
nginx_catchall_template: "default-catchall.j2"
nginx_vhost_template: "vhost.j2"
```

If necessary you can also set the template on a per vhost basis.

```yaml
nginx_vhosts:
  - listen: "80 default_server"
    server_name: "site1.example.com"
    root: "/var/www/site1.example.com"
    index: "index.php index.html index.htm"
    template: "{{ playbook_dir }}/templates/site1.example.com.vhost.j2"
  - server_name: "site2.example.com"
    root: "/var/www/site2.example.com"
    index: "index.php index.html index.htm"
    template: "{{ playbook_dir }}/templates/site2.example.com.vhost.j2"
```

You can either copy and modify the provided template, or extend it with [Jinja2 template inheritance](http://jinja.pocoo.org/docs/2.9/templates/#template-inheritance) and override the specific template block you need to change.

### Example: Configure gzip in nginx configuration

Set the `nginx_conf_template` to point to a template file in your playbook directory.

```yaml
nginx_conf_template: "{{ playbook_dir }}/templates/nginx.conf.j2"
```

Create the child template in the path you configured above and extend `nekeal.nginx` template file relative to your `playbook.yml`.

```
{% extends 'roles/nekeal.nginx/templates/nginx.conf.j2' %}

{% block http_gzip %}
    gzip on;
    gzip_proxied any;
    gzip_static on;
    gzip_http_version 1.0;
    gzip_disable "MSIE [1-6]\.";
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/x-javascript
        application/json
        application/xml
        application/xml+rss
        application/xhtml+xml
        application/x-font-ttf
        application/x-font-opentype
        image/svg+xml
        image/x-icon;
    gzip_buffers 16 8k;
    gzip_min_length 512;
{% endblock %}
```

## Dependencies

None.

## Example Playbook

    - hosts: server
      roles:
        - { role: nekeal.nginx }

## License

MIT / BSD

## Author Information

This role was created in 2014 by [Jeff Geerling](https://www.jeffgeerling.com/), author of [Ansible for DevOps](https://www.ansiblefordevops.com/).
