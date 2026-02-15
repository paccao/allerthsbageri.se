# Automatic provisioning and configuration of the infrastructure

## Setup

First, set up the [uv package manager](https://github.com/astral-sh/uv)

Dependencies are listed in `pyproject.toml`. Some are optional but requirements.txt contains all of the dependencies. If u only want to install the required, compile a new requirements file and install that one.

```bash
# Create and activate virtual environment and install from lockfile
uv venv && source .venv/bin/activate && uv run --frozen

## To install and automatically update lock file (not recommended)
uv run

# Then verify that ansible is installed
ansible --version

# Deactivate venv if needed
deactivate
```

## Ansible

If you are using the Zed editor, the [ansible extension](https://github.com/kartikvashistha/zed-ansible) requires `ansible` and `ansible-lint` to be installed on your host system.

Might have to do some symlink trickery to your venv here for it to work.

## Vagrant

Optional, only needed if u want a virtual machine to mimic the production environment. Note that it doesn't use the same base image as the production so it isn't a 1 to 1 copy.

```bash
vagrant up # Spin up the VM. It will run playbook.yaml as part of the provisioning.
```
