#!/bin/bash

# Load environment variables from the .env file
if [ -f .env ]; then
  # Export only the specific variables we are interested in
  export $(grep -E '^ADMIN_USERNAME=|^ADMIN_PASSWORD=' .env | xargs)
fi

# Check if the variables are defined
if [ -z "$ADMIN_USERNAME" ] || [ -z "$ADMIN_PASSWORD" ]; then
  echo "The required variables (ADMIN_USERNAME and/or ADMIN_PASSWORD) are not defined in the .env file."
  exit 1
else
  echo "ADMIN_USERNAME and ADMIN_PASSWORD have been set."
  docker-compose -f livechat.compose.yml build
  docker compose -f livechat.compose.yml --env-file .env up
fi

