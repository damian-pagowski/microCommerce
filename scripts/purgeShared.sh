#!/bin/bash

services=(inventory order product user payment)

for service in "${services[@]}"; do
  target="./services/$service/shared"
  if [ -d "$target" ]; then
    echo "Removing $target"
    rm -rf "$target"
  else
    echo "Shared directory not found in $service"
  fi
done

echo "Purging complete."