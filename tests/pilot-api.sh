#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/../../api"
pilot_dir=$(mktemp -d)
trap 'rm -f "$pilot_dir/test.sqlite3"; rmdir "$pilot_dir"' EXIT
export DATABASE_URL="sqlite:///$pilot_dir/test.sqlite3" KANTO62_LOCAL_FIXTURES=1
uv run --locked python manage.py migrate --noinput
uv run --locked python manage.py seed_pilot
uv run --locked python manage.py runserver 127.0.0.1:8162 --noreload
