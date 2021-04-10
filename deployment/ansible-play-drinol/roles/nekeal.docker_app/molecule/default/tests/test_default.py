"""Role testing files using testinfra."""
import pytest
import requests


def test_nginx_is_accessible(host):
    r = requests.get('http://localhost/')
    r.raise_for_status()


def test_file_is_created_during_pre_release_command(host):
    file = host.file("/tmp/pre_release_part")
    assert file.exists


def test_file_is_created_during_post_release_command(host):
    file = host.file('/tmp/post_release_part')
    assert file.exists


def test_post_release_is_executed_after_pre_release_command(host):
    pre_release_file = host.file("/tmp/pre_release_part")
    post_release_file = host.file("/tmp/post_release_part")
    assert pre_release_file.mtime < post_release_file.mtime


def test_django_is_accessible(host):
    r = requests.get("http://localhost:8000")
    r.raise_for_status()
    assert b"The install worked successfully! Congratulations!" in r.content


@pytest.mark.parametrize('directory', ('/tmp/dir1', '/tmp/dir2'))
def test_directories_are_created(host, directory):
    directory = host.file(directory)
    assert directory.exists
    assert directory.user == 'root'
