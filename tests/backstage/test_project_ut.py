"""
You can implement your tests here using unittest framework
"""

import unittest


def func(a):
    return a - 1


class TestProject(unittest.TestCase):
    """Tests for `backstage` package."""

    def setUp(self):
        """Set up test fixtures, if any."""
        pass

    def tearDown(self):
        """Tear down test fixtures, if any."""
        pass

    def test_func(self):
        assert func(6) == 5
