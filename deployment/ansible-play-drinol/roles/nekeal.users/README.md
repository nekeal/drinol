Users [![Build Status](https://travis-ci.com/nekeal/ansible-role-users.svg?branch=master)](https://travis-ci.com/nekeal/ansible-role-users)
=========

Simple role for creating users and groups.

Requirements
------------

To develop this role you should install requirements via `pip install -r requirements.txt`

Role Variables
--------------

    users:
      - username: admin
        shell: /bin/zsh
        uid: 1100
        groups:
          - sudo
          - docker
        ssh_keys:
          - test

List of users to create with groups and ssh keys added.
Keys should be stored in `files/ssh/`. In the above example role will search for `test.pub` key.

    users_groups:
      - docker
      - deployer

List of groups to create before creating users.

Dependencies
------------
None.

Example Playbook
----------------

This is example playbook which create sudo-enabled user `admin`:

    - hosts: all
      roles:
        - role: users
          vars:
            users:
              - username: admin
                groups:
                  - sudo

License
-------

MIT

Author Information
------------------
Nekeal
