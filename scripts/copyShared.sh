#!/bin/bash

SHARED_DIR="./shared"

SERVICES=(
  "./services/inventory"
  "./services/order"
  "./services/product"
  "./services/user"
  "./services/payment"
  "./services/email"

)

if [ ! -d "$SHARED_DIR" ]; then
  echo "Error: Shared directory not found at $SHARED_DIR. Please ensure it exists."
  exit 1
fi

for SERVICE in "${SERVICES[@]}"; do
  TARGET_DIR="$SERVICE/shared"
  if [ -d "$SERVICE" ]; then
    cp -r "$SHARED_DIR" "$TARGET_DIR"
    echo "Shared directory copied to $TARGET_DIR"
  else
    echo "Warning: Directory $SERVICE does not exist. Skipping."
  fi
done

echo "Done!"