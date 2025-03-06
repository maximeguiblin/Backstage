import argparse
import logging
import os
import subprocess
import sys

import toml


# Get the base version
def get_base_version():
    if os.path.exists("pyproject.toml"):
        project = toml.load("pyproject.toml")
        if "version" in project.get("tool", {}).get("poetry", {}):
            return project["tool"]["poetry"]["version"]
    raise Exception("No base version found in pyproject.toml")


# Get the next version to be used to deploy
def get_next_version():
    result = subprocess.run(["git", "tag", "-l"], stdout=subprocess.PIPE)
    if result.returncode != 0:
        raise Exception(
            f"Failed to run {sys.argv} 'git tag -l' command. Return code {result.returncode}. Stderr: {result.stderr}"
        )
    result = result.stdout.decode().split("\n")
    result = [tag.strip() for tag in result if tag.strip() and len(tag.strip().split(".")) == 3]
    version = get_base_version()
    for tag in result:
        tag_arr = [str(v) for v in tag.split(".")]
        if len(tag_arr) != 3 or not tag_arr[-1].isdigit():
            continue
        version_arr = [str(v) for v in version.split(".")]
        if tag_arr[:-1] == version_arr[:-1]:
            if int(tag_arr[-1]) >= int(version_arr[-1]):
                version = ".".join(version_arr[:-1] + [str(int(tag_arr[-1]) + 1)])
    for path in os.listdir("src"):
        if not path.startswith("_") and os.path.isdir(f"src/{path}"):
            with open(f"src/{path}/__version__.py", "w") as fp:
                fp.write(f'__version__ = "{version}"')
    print(f"Got version {version}")
    return version


# Tag version
def add_tag_version(version):
    result = subprocess.run(["git", "tag", version], stdout=subprocess.PIPE)
    if result.returncode != 0:
        raise Exception(f"Failed to run 'git tag {version}' command. Returned {result.returncode}: {result.stderr}")
    print(f"Added tag {version}")


def setup_poetry(path_root: str = "."):
    path_pyproject = os.path.join(path_root, "pyproject.toml")
    project = toml.load(path_pyproject)
    project["tool"]["poetry"]["version"] = get_next_version()
    with open(os.path.join(os.path.join(path_root, "README.md"))) as f:
        description = [l.strip() for l in f.read().splitlines() if l.strip() and not l.strip().startswith("#")]
        description = description[0] if description else ""
    project["tool"]["poetry"]["description"] = description
    with open(path_pyproject, "w") as f:
        toml.dump(project, f)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--setup_poetry", action="store_true", help="Configure pyproject for poetry packaging")
    parser.add_argument("--setup_tagging", action="store_true", help="Add tagging with next available version")
    args = parser.parse_args()

    if args.setup_poetry:
        setup_poetry()

    if args.setup_tagging:
        next_version = get_next_version()
        add_tag_version(next_version)

    if not args.setup_poetry and not args.setup_tagging:
        logging.error("No action requested")
