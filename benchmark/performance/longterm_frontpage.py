#!/usr/bin/env python

"""
Long term performance testing of the front page with and without caching

Usage:

  python longterm_frontpage.py -r 4 -p 0

    -r/--run:  Run performance test  [0/N]
    -p/--plot: Make a new plot       [0/1]
"""

import logging
import argparse
from benchmark import WebPage, STRESS_PATH

__author__ = "Jonny Elliott"
__version__ = "0.1"
__maintainer__ = "Jonny Elliott"
__status__ = "Prototype"

HAR_PATH = "{0}/performance/longterm_frontpage/".format(STRESS_PATH)

logfmt = '%(levelname)s [%(asctime)s]:\t  %(message)s'
datefmt= '%m/%d/%Y %I:%M:%S %p'
formatter = logging.Formatter(fmt=logfmt,datefmt=datefmt)
logger = logging.getLogger('__main__')
logging.root.setLevel(logging.DEBUG)
#rfh = RotatingFileHandler(filename="{0}/logs/WebDriver.log".format(STRESS_PATH),maxBytes=1048576,backupCount=3,mode='a')
#rfh.setFormatter(formatter)
ch = logging.StreamHandler()
ch.setFormatter(formatter)
logger.handlers = []
logger.addHandler(ch)
#self.logger.addHandler(rfh)


def run_performance():

  localhost = "http://localhost:80"
  config = {"headless": True,
            "fire_bug": True,
            "net_export": True,
            "net_export_output": HAR_PATH,
           }
  bumblebee = WebPage(localhost, config=config)

  try:
    bumblebee.pageLoad(wait={"type": "CLASS_NAME", "value": "q"})
  except Exception:
    bumblebee.log_fail(Exception)
  finally:
    bumblebee.quit()

def plot_performance():
  import glob
  import numpy as np
  import matplotlib
  matplotlib.use("Agg")
  import matplotlib.pyplot as plt
  from harparser import HTTPArchive
  har_files = glob.glob("{0}*har".format(HAR_PATH))

  timings_keys = ["onLoad", "onContentLoad"]
  timings_dict = {}

  timings_dict["Cache-Hit"] = []

  for key in timings_keys: timings_dict[key] = []

  for har_file in har_files:
    HAR_file = HTTPArchive(file_name=har_file)
    pageTimings = HAR_file.log.pages.page_list[0].pageTimings
    entries = HAR_file.log.entries.entry_list

    cache = False
    for entry in entries:
      headers = entry.response.headers
      for header in headers.header_list:
        if header.name == "X-Cache-Hits" and int(header.value) > 0:
          cache = True
        if cache: break
      if cache: break
    
    timings_dict["Cache-Hit"].append(cache)
    for key in timings_keys: timings_dict[key].append(getattr(pageTimings, key))
 
  timings_dict["Cache-Hit"] = np.array(timings_dict["Cache-Hit"])

  for key in timings_keys: timings_dict[key] = np.array(timings_dict[key])

  x_axis = np.arange(timings_dict[timings_keys[0]].shape[0])
  #HAR_file.get_entry_summary()

  fig = plt.figure(0)
  ax = fig.add_subplot(111)

  # Remove negative values
  indx = timings_dict["onContentLoad"] >= 0
  for key in timings_dict:
    timings_dict[key] = timings_dict[key][indx]

  indx = np.invert(timings_dict["Cache-Hit"])
  indx2 = timings_dict["Cache-Hit"]

  keyt = "onLoad"

  vals = [np.mean(timings_dict[keyt][indx]), np.std(timings_dict[keyt][indx])]

  ax.errorbar(np.arange(indx.sum()), timings_dict[keyt][indx], fmt="o", ls="-", label="No-cache: {0:.2f}+/-{1:.2f}".format(vals[0], vals[1]))

  vals = [np.mean(timings_dict[keyt][indx2]), np.std(timings_dict[keyt][indx2])]
  ax.errorbar(np.arange(indx2.sum()), timings_dict[keyt][indx2], fmt="o", ls="-", label="Varnish-cache: {0:.2f}+/-{1:.2f}".format(vals[0], vals[1]))

  ax.set_xlabel("Run Number")
  ax.set_ylabel("Time [ms]")

  ax.set_ylim([0,300])

  ax.legend(loc=0)

  plt.savefig("{0}/plot.png".format(HAR_PATH), format="png")

def main(run, plot):
  # Run the test
  if run:
    for i in range(run):
      logger.info("  Running {0}/{1}".format(i, run))
      run_performance()

  # Plot things
  if plot:
    logger.info("  Remaking plot")
    plot_performance()

if __name__ == "__main__":

  parser = argparse.ArgumentParser(usage=__doc__)
  parser.add_argument('-r','--run',dest="run",default=0)
  parser.add_argument('-p','--plot',dest="plot",default=False)

  args = parser.parse_args()
  try:
    run = int(args.run)
  except:
    run = 0

  if args.plot:
    plot = True
  else:
    plot = args.plot

  logger.info("Running performance {0} times".format(run))
  logger.info("Making a new plot?: {0}".format(plot))

  main(run, plot)
