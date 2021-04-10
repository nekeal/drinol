"""Role testing files using testinfra."""
import pytest


def get_ssh_key_by_name(name):
    with open(f'files/ssh/{name}.pub') as f:
        return f.read().strip()


def test_hosts_file(host):
    """Validate /etc/hosts file."""
    f = host.file("/etc/hosts")

    assert f.exists
    assert f.user == "root"
    assert f.group == "root"


@pytest.mark.parametrize('user,groups', (
    ('test1', ['test1', 'sudo', 'docker']),
    ('app', ['app']),
))
def test_user_groups(host, user, groups):
    assert host.user(user).groups == groups


@pytest.mark.parametrize('user,ssh_keys', (
    ('test1', ['test1', 'test2']),
    ('app', ['test2']),
))
def test_ssh_authorized_keys(host, user, ssh_keys, ssh_key_test1, ssh_key_test2):
    authorized_keys = host.file(f'/home/{user}/.ssh/authorized_keys')
    assert authorized_keys.content_string.count('\n') == len(ssh_keys)
    for key in ssh_keys:
        assert authorized_keys.contains(get_ssh_key_by_name(key))


@pytest.mark.parametrize('user,return_codes', (
    ('test1', [0]),
    ('app', [1]),
))
def test_something(host, user, return_codes):
    with host.sudo(user):
        a = host.run_expect(return_codes, 'sudo -n true')
        print(a)


def test_user_id(host):
    user = host.user('test1')
    assert user.uid == 1100
