"""Role testing files using testinfra."""


def test_is_postgresql_runnnig_and_enabled(host):
    postgresql = host.service('postgresql')

    assert postgresql.is_running
    assert postgresql.is_enabled
