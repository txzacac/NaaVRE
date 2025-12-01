#!/bin/bash

# Usage: ./install-extension.sh <extension_name>
# Example: ./install-extension.sh collab-manager

if [ $# -eq 0 ]; then
    echo "Usage: $0 <extension_name>"
    echo "Example: $0 collab-manager"
    exit 1
fi

EXTENSION_NAME=$1
echo "Installing extension: $EXTENSION_NAME"

# Activate environment
source ~/anaconda3/etc/profile.d/conda.sh
conda activate jupyterlab

# Build extension
echo "Building extension..."
npx lerna run build --scope @jupyter_vre/$EXTENSION_NAME

# Install and link extension
echo "Installing extension into JupyterLab..."
cd packages/$EXTENSION_NAME
jupyter labextension install --no-build .
jupyter labextension link --no-build .

# Rebuild JupyterLab
echo "Rebuilding JupyterLab..."
cd /home/a/code/NaaVRE
jupyter lab build

echo "Installation completed!"
echo "Run 'jupyter labextension list' to verify the installation status"
