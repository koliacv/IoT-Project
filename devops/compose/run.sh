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
    project_network="internal"
    #Prepare directories 
    sudo mkdir -p ./admin/include/postgres_data && sudo chmod -R 777 ./admin/include/postgres_data
    sudo mkdir -p ./admin/include/portainer_data && sudo chmod -R 777 ./admin/include/portainer_data
    ;;
  deployment)
    COMPOSE_DIR="deployment"
    project_network="app_network"
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

# Check Network creation
if [[ -z "$project_network" ]]; then
  echo "Project network variable is not set!" "Error!" "critical"
  exit 1
fi
if ! docker network inspect "$project_network" &>/dev/null; then
  echo "Creating network $project_network..."
  if docker network create --driver bridge --attachable "$project_network"; then
    echo "Network $project_network created successfully."
  else
    echo "Failed to create network $project_network!" "Error!" "critical"
    exit 1
  fi
else
  echo "Network $project_network already exists, skipping creation."
fi



# Start docker-compose
echo "Starting docker-compose in the '${COMPOSE_DIR}' directory..."
# docker-compose -f "${COMPOSE_DIR}/docker-compose.yml" up -d --remove-orphans
docker stack deploy --prune --with-registry-auth --compose-file ${COMPOSE_DIR}/docker-compose.yml ${COMPOSE_DIR}

# Verify success
if [[ $? -eq 0 ]]; then
  echo "docker-compose started successfully in '${COMPOSE_DIR}' directory."
else
  echo "Error: Failed to start docker-compose."
  exit 1
fi

docker ps