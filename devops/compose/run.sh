#!/bin/bash

# Check if the ENVIRONMENT variable is set
if [[ -z "$1" ]]; then
  echo "Error: ENVIRONMENT variable not set. Use 'admin' or 'deployment'."
  exit 1
fi

ENVIRONMENT=$1

# Determine the folder and docker-compose file
case "$ENVIRONMENT" in
  admin)
    COMPOSE_DIR="admin"
    ;;
  deployment)
    COMPOSE_DIR="deployment"
    ;;
  *)
    echo "Error: Invalid ENVIRONMENT value. Use 'admin' or 'deployment'."
    exit 1
    ;;
esac

# Check if the docker-compose.yml file exists in the directory
if [[ ! -f "${COMPOSE_DIR}/docker-compose.yml" ]]; then
  echo "Error: docker-compose.yml not found in ${COMPOSE_DIR} directory."
  exit 1
fi

# Start docker-compose
echo "Starting docker-compose in the '${COMPOSE_DIR}' directory..."
docker-compose -f "${COMPOSE_DIR}/docker-compose.yml" up -d

# Verify success
if [[ $? -eq 0 ]]; then
  echo "docker-compose started successfully in '${COMPOSE_DIR}' directory."
else
  echo "Error: Failed to start docker-compose."
  exit 1
fi

docker ps