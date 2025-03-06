#!/bin/bash

export PYTHONPATH=src:$PYTHONPATH
pytest tests/**
