#!/bin/bash
set -e

# Uses the environment variable DATABASE_USER provided by Docker/Compose
mysql -u root -p"$DATABASE_ROOT_PASSWORD" <<-EOSQL
    GRANT ALL PRIVILEGES ON *.* TO '$DATABASE_USER'@'%';
    FLUSH PRIVILEGES;
EOSQL