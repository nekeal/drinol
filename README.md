# Drinol

[![CI](https://github.com/nekeal/drinol/workflows/backend.yml/badge.svg)](https://github.com/nekeal/drinol/actions)

App for coordinating drinking during party

# Prerequisites

## Native way with virtualenv
- [Python3.8](https://www.python.org/downloads/)
- [Virtualenv](https://virtualenv.pypa.io/en/latest/)

## Docker way
- [Docker](https://docs.docker.com/engine/install/)  
- [Docker Compose](https://docs.docker.com/compose/install/)

## Local Development

## Native way with virtualenv

First create postgresql database:

```sql
create user drinol with createdb;
alter user drinol password 'drinol';
create database drinol owner drinol;
```
Now you can setup virtualenv and django:
```bash
virtualenv venv
source venv/bin/activate
pip install pip-tools
make bootstrap
```

## Docker way

Start the dev server for local development:
```bash
docker-compose up
```

Run a command inside the docker container:

```bash
docker-compose run --rm web [command]
```
