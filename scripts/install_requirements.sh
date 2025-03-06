#!/bin/bash
####################
# Copyright © 2021 Sodexo. All rights reserved.
# Author(s): hamed.ky@sodexo.com
####################


# Parse arguments
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    --python_version)
      PYTHON_VERSION="$2"
      shift # past argument
      shift # past value
      ;;
    --no_venv)
      NO_VENV=YES
      shift # past argument
      ;;
    --configure_only)
      CONFIGURE_ONLY=YES
      shift # past argument
      ;;
    --install_dev)
      INSTALL_DEV=YES
      shift # past argument
      ;;
    --install_group)
      INSTALL_GROUP="$2"
      shift # past argument
      shift # past value
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      echo "Unknown positional arg $1"
      exit 1
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done

# Set default values
PYTHON_VERSION=${PYTHON_VERSION:-'3'}
set -- "${POSITIONAL_ARGS[@]}" # restore positional parameters

# Clean current context
if [[ $NO_VENV != "YES" ]] && [[ ! -z $VIRTUAL_ENV ]];
then
    echo "You must get out of the current venv first by running the command: deactivate"
    exit 1
fi

# Identify correct version
if [[ $PYTHON_VERSION == *"python"* ]];
then
    PYTHON=$PYTHON_VERSION
else
    echo "Looking for python interpreter with version $PYTHON_VERSION"
    res=$(python -c 'import sys; print("{}.{}".format(sys.version_info.major,sys.version_info.minor))')
    if [[ $res == $PYTHON_VERSION* ]]; then
        PYTHON="python";
    else
        res=$(python3 -c 'import sys; print("{}.{}".format(sys.version_info.major,sys.version_info.minor))')
        if [[ $res == $PYTHON_VERSION* ]]; then
            PYTHON="python3";
        else
            PYTHON="python$PYTHON_VERSION";
        fi
    fi
fi

# Verify python informations
set -e
echo "Using interpreter $PYTHON at location $(which $PYTHON) with version $($PYTHON --version)"

# Install poetry if not done yet with pipx if possible
if ! command -v poetry &> /dev/null
then
    echo "Poetry not found. Trying to install poetry using pipx..."
    if command -v pipx &> /dev/null
    then
        pipx install poetry --python $PYTHON
    else
        echo "pipx not found. Installing poetry using pip..."
        $PYTHON -m pip install --upgrade pip
        $PYTHON -m pip install poetry
    fi
else
    echo "Poetry is already installed."
fi

# Ensure poetry-plugin-export is installed
if ! poetry self show plugins | grep -q 'poetry-plugin-export'
then
    echo "poetry-plugin-export not found. Installing poetry-plugin-export..."
    poetry self add poetry-plugin-export
else
    echo "poetry-plugin-export is already installed."
fi

# Configure authentication
if [ -n "$PIP_INDEX_URL" ] || [ -n "$PIP_EXTRA_INDEX_URL" ]; then
    export PYTHON_KEYRING_BACKEND=keyring.backends.fail.Keyring
    PIP_URL=${PIP_INDEX_URL:-$PIP_EXTRA_INDEX_URL}
    PPP_PASSWORD=$(echo "$PIP_URL" | sed 's/.*:\(.*\)@.*/\1/')
    poetry config http-basic.PPP build "$PPP_PASSWORD"
elif [ -n "$POETRY_HTTP_BASIC_PPP_USERNAME" ] && [ -n "$POETRY_HTTP_BASIC_PPP_PASSWORD" ]; then
    poetry config http-basic.PPP "$POETRY_HTTP_BASIC_PPP_USERNAME" "$POETRY_HTTP_BASIC_PPP_PASSWORD"
else
    echo "Missing credentials to configure poetry. Please make sure poetry auth is manually configured."
fi

# Create virtual env or not
if [[ $NO_VENV == "YES" ]];
then
    echo "Configure poetry to not create venv"
    poetry config virtualenvs.create false
else
    echo "Configuring poetry to create venv"
    poetry config virtualenvs.create true
    poetry config virtualenvs.in-project true
    # Configure poetry to use python version
    if [ -n "$PYTHON_VERSION" ]; then
        poetry env use -- $PYTHON_VERSION
    fi
fi

# Stop here if only configuration is needed
if [[ $CONFIGURE_ONLY == "YES" ]];
then
    exit 0
fi

# Install manually these packages
$PYTHON -m pip install setuptools wheel

# Prepare deps groups to install
DEPS_GROUPS=""
if [[ $INSTALL_DEV == "YES" ]];
then
    DEPS_GROUPS="$DEPS_GROUPS --with dev"
fi
if [ -z "$INSTALL_GROUP" ];
then
    # By default install no variant
    echo "No group specified. Installing no variant by default"
    DEPS_GROUPS="$DEPS_GROUPS"
else
    echo "Installing group $INSTALL_GROUP"
    DEPS_GROUPS="$DEPS_GROUPS --with $INSTALL_GROUP"
fi

# Install requirements with poetry
poetry install $DEPS_GROUPS --no-root

echo "The installation is completed. You can activate your virtual env using the command: poetry shell"
