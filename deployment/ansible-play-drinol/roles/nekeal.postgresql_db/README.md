postgresql_db [![Build Status](https://travis-ci.com/nekeal/ansible-role-postgresql-db.svg?branch=master)](https://travis-ci.com/nekeal/ansible-role-postgresql-db)
=========

Role which installs postgresql, configures users and databses.

Requirements
------------
None

Role Variables
--------------
    postgresql_install: yes

Defines if role should install postgresql. Helpfull when running role against
host which has postgresql already installed.

    postgresql_major_version: 12

Postgresql version which should be installed.

    postgresql_users:
      - name
        password
        encrypted
        priv
        role_attr_flags
        db
        login_host
        login_password
        login_user
        login_unix_socket
        port
        state

List of db users to create. `name` and `password` are mandatory.
Rest attributes corresponds to module variables.

    postgresql_databases:
      - name:
        lc_collate:
        lc_ctype:
        encoding:
        template:
        login_host:
        login_password:
        login_user:
        login_unix_socket:
        port:
        owner:
        state:

List of databases to create. Only `name` is mandatory. Rest of them corresponds to `postgresql_db` module variables.

Dependencies
------------
None.

Example Playbook
----------------

This is example playbook which install postgresql and creates user and database.

    - hosts: all
      roles:
        - role: nekeal.postgresql_db
          vars:
            postgresql_major_version: 11
            postgresql_users:
              - name: dbuser
                password: dbpassword
            postgresql_databases:
              - name: db
                owner: dbuser

License
-------

MIT

Author Information
------------------
Nekeal
