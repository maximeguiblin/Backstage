####################
# Copyright © 2022 Sodexo. All rights reserved.
# Author(s): hamed.ky@sodexo.com
####################
import os


def main_job():
    # Set up logging
    from aipsdk.core.utils.logger import BaseLogger

    logger = BaseLogger().get_logger()

    # Print hello world
    logger.info("Hello world from container")


def main_app():
    # Set up flask
    from aipsdk.core.utils.utils import install_packages

    install_packages({"flask": "*"})
    from flask import Flask

    app = Flask(__name__)

    @app.route("/")
    def hello():
        return "Hello world live !"

    app.run(host="0.0.0.0", port=8000)


if __name__ == "__main__":
    if os.environ.get("RUN_MODE") == "job":
        main_job()
    else:
        main_app()
