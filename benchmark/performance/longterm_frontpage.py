#!/usr/bin/env python

"""
Long term performance testing of the front page with and without caching
"""

from benchmark import WebPage

__author__ = "Jonny Elliott"
__version__ = "0.1"
__maintainer__ = "Jonny Elliott"
__status__ = "Prototype"

def run_performance():

  localhost = "http://localhost:80"
  config = {"headless": True,
            "fire_bug": True,
            "net_export": True,
           }
  bumblebee = WebPage(localhost, config=config)

  try:
    bumblebee.pageLoad(wait={"type": "CLASS_NAME", "value": "q"})
  except Exception:
    bumblebee.log_fail(Exception)
  finally:
    bumblebee.quit()

def plot_performance():
  return 0

def main():
  return 0

if __name__ == "__main__":
  main()
