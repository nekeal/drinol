# syntax = docker/dockerfile:1.2
FROM node:14.16.1-slim as frontend-dev
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV YARN_CACHE_FOLDER /tmp/.yarn
ENV CYPRESS_SKIP_BINARY_INSTALL 1

COPY ["drinol/frontend/package.json",\
      "drinol/frontend/yarn.lock",\
      "./"\
     ]
RUN --mount=type=cache,target=/tmp/.yarn ls -R /tmp/.yarn
RUN --mount=type=cache,target=/tmp/.yarn yarn install

COPY drinol/frontend .
CMD yarn start

FROM frontend-dev as frontend-builder
WORKDIR /app
RUN yarn build

FROM alpine as frontend-build
WORKDIR /app
COPY --from=frontend-builder /app/build ./build
COPY --from=frontend-builder /app/webpack-stats.json ./

FROM python:3.8.7-slim as backend-base

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app

ADD requirements/base.txt .

FROM backend-base as backend-dev
ADD requirements/dev.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r dev.txt
ADD . ./


FROM backend-base as production
ADD requirements/prod.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r prod.txt
ADD . ./
COPY --from=frontend-build /app/build ./drinol/frontend/build
COPY --from=frontend-build /app/webpack-stats.json ./drinol/frontend
RUN python manage.py collectstatic --noinput
