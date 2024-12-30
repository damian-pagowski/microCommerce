#!/bin/bash

ENV_FILE=".env"

SERVICES=(
  "./services/inventory"
  "./services/order"
  "./services/product"
  "./services/user"
  "./services/payment"
  "./services/email"

)

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found in project root. Please ensure it exists."
  exit 1
fi

for SERVICE in "${SERVICES[@]}"; do
  if [ -d "$SERVICE" ]; then
    cp "$ENV_FILE" "$SERVICE/.env"
    echo ".env file copied to $SERVICE"
  else
    echo "Warning: Directory $SERVICE does not exist. Skipping."
  fi
done

echo "Done!"