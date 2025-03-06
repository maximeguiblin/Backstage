"""
You can implement your tests here and run them using pytest framework
"""

import pytest


@pytest.fixture
def input_value():
    return 39


def test_divisible_by_3(input_value):
    assert input_value % 3 == 0
