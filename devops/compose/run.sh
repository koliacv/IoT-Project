#!/bin/bash
unset current_dir
unset project_network
unset 
# Check if the ENVIRONMENT variable is set
if [[ -z "$1" ]]; then
  echo "Error: ENVIRONMENT variable not set. Use 'admin' or 'deployment'."
  exit 1
fi

ENVIRONMENT=$1
current_dir=$(pwd)
temp_dir="/tmp"

echo "${current_dir}/"
# Determine the folder and docker-compose file
case "$ENVIRONMENT" in
  admin)
    compose_dir="admin"
    project_network="internal"
    #Prepare directories 
    sudo mkdir -p ${temp_dir}/admin/include/postgres_data && sudo chmod -R 755 ${temp_dir}/admin/include/postgres_data
    sudo mkdir -p ${temp_dir}/admin/include/portainer_data && sudo chmod -R 755 ${temp_dir}/admin/include/portainer_data 
    sudo cp -R ${current_dir}/admin/* ${temp_dir}/admin/ && sudo chmod -R 755 ${temp_dir}/admin/
    ;;
  deployment)
    compose_dir="deployment"
    project_network="app_network"
    ;;
  *)
    echo "Error: Invalid ENVIRONMENT value. Use 'admin' or 'deployment'."
    exit 1
    ;;
esac

# Check if the docker-compose.yml file exists in the directory
if [[ ! -f "${current_dir}/${compose_dir}/docker-compose.yml" ]]; then
  echo "Error: docker-compose.yml not found in ${compose_dir} directory."
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
echo "Starting docker-compose in the '${current_dir}/${compose_dir}' directory..."
cd ${current_dir}/${compose_dir}
git pull

# Start Jenkins Simulation
if ! netstat -tuln | grep "0.0.0.0:9595"; then
  echo "Jenkins Reciver is not Started... Start..."
  python3 "${current_dir}/jenkins_simulator.py"
fi 

# docker-compose -f "${compose_dir}/docker-compose.yml" up -d --remove-orphans
docker stack deploy --prune --with-registry-auth --compose-file "${current_dir}/${compose_dir}/docker-compose.yml" ${ENVIRONMENT}

# Verify success
if [[ $? -eq 0 ]]; then
  echo "docker-compose started successfully in '${current_dir}/${compose_dir}' directory."
else
  echo "Error: Failed to start docker-compose."
  exit 1
fi

docker service ls