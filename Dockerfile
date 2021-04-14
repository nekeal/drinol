# syntax = docker/dockerfile:1.2
FROM node:14.16.1-slim as frontend-dev
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ["drinol/frontend/package.json",\
      "drinol/frontend/package-lock.json",\
      "./"\
     ]
RUN --mount=type=cache,target=/root/.npm npm install
COPY drinol/frontend .
CMD npm run start

FROM node:14.16.1-slim as frontend-builder
WORKDIR /app
COPY --from=frontend-dev /app ./
RUN npm run build

FROM alpine as frontend-build
WORKDIR /app
COPY --from=frontend-builder /app/build ./build
COPY --from=frontend-builder /app/webpack-stats.json ./

FROM python:3.8.7-slim as backend-base

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app

ADD requirements/base.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r base.txt
ADD . ./
CMD ["./entrypoint.sh"]

FROM backend-base as backend-dev
ADD requirements/dev.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r dev.txt

FROM backend-base as production
ADD requirements/prod.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r prod.txt
COPY --from=frontend-build /app/build ./drinol/frontend/build
COPY --from=frontend-build /app/webpack-stats.json ./drinol/frontend
RUN python manage.py collectstatic --noinput
