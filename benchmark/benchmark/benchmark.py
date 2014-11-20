"""Base class of stress testing"""
import time
import logging
import sys
from logging.handlers import RotatingFileHandler
from selenium.webdriver import Firefox, FirefoxProfile
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from xvfbwrapper import Xvfb

STRESS_PATH = "/vagrant/benchmark"
FIREBUG_EXTENSION = "{0}/plugins/firebug-2.0.6.xpi".format(STRESS_PATH)
NETEXPORT_EXTENSION = "{0}/plugins/netExport-0.9b6.xpi".format(STRESS_PATH)

__author__ = "Jonny Elliott"
__version__ = "0.1"
__maintainer__ = "Jonny Elliott"
__status__ = "Prototype"

class WebPage(Firefox):
  
  def __init__(self, url, config={}):
    
    # Logging
    # -------------------------
    logfmt = '%(levelname)s [%(asctime)s]:\t  %(message)s'
    datefmt= '%m/%d/%Y %I:%M:%S %p'
    formatter = logging.Formatter(fmt=logfmt,datefmt=datefmt)
    self.logger = logging.getLogger('__main__')
    logging.root.setLevel(logging.DEBUG)
    rfh = RotatingFileHandler(filename="{0}/logs/WebDriver.log".format(STRESS_PATH),maxBytes=1048576,backupCount=3,mode='a')
    rfh.setFormatter(formatter)
    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    self.logger.handlers = []
    self.logger.addHandler(ch)
    self.logger.addHandler(rfh)
    # -------------------------

    # Centralise config
    self.config = self.check_config(config)

    # Headless Xvfb
    self.headless = self.makeHeadLess(self.config)

    # NetExport output dir
    self.har_output = "{0}/har".format(STRESS_PATH)

    # Firefox profiles
    self.profile = self.makeProfile(self.config)

    # Pre-defined attributes
    self.url = url
    self.minimum_timeout = 120
    self.timed_out = False

    self.load_time = -99
    self.login_time = -99
    self.logout_time = -99

    Firefox.__init__(self, firefox_profile=self.profile)


  def log_fail(self, failure):

    self.logger.warning("Failure: {0}".format(failure))
    name_stamp = time.strftime("%Y-%m-%d_%H:%M:%S", time.localtime())
    self.logger.warning("Dumping contents to file: {0}".format(name_stamp))

    self.take_screenshot("FAIL_DUMP_{0}.png".format(name_stamp))
    self.dump_html("FAIL_DUMP_{0}.html".format(name_stamp))

  def take_screenshot(self, screenshot_out):

    self.logger.info("Taking screenshot")
    self.save_screenshot("{0}/dump/{1}".format(STRESS_PATH, screenshot_out))

  def dump_html(self, html_out):

    self.logger.info("Writing HTML to file")
    with open("{0}/dump/{1}".format(STRESS_PATH, html_out), 'w') as f:
            f.write(self.page_source.encode('utf-8'))

  def check_config(self, config):
    """
    Checks the input config matches. Places missing values in config.
    
    headless: Run WebDriver as headless instance using Xvfb [True/False]
    fire_bug: Run Firebug plugin in Firefox [True/False]
    net_export: Run NetExport, a Firebug extension, in Firefox [True/False]
    """

    default_config = {
        "headless": True,
        "fire_bug": False,
        "net_export": False,
        }

    config_out = {}

    # Take out the correct names
    for key in config.keys():
      if key in default_config.keys():
        config_out[key] = config[key]

    for key in default_config.keys():
      if key not in config.keys():
        config_out[key] = default_config[key]

    return config_out

  def makeProfile(self, config):
    
    profile = FirefoxProfile()

    # Disable Firefox auto update
    profile.set_preference("app.update.enabled", False)

    try:
      if config["fire_bug"]:
        profile.add_extension(FIREBUG_EXTENSION)
    
        domain = "extensions.firebug."
        # Set default Firebug preferences
       
        # Avoid Firebug start page
        profile.set_preference(domain + "currentVersion", "2.0.6")
        # Activate everything
        profile.set_preference(domain + "allPagesActivation", "on")
        profile.set_preference(domain + "defaultPanelName", "net")
        # Enable Firebug on all sites
        profile.set_preference(domain + "net.enableSites", True)
       
        self.logger.info("Firebug profile settings enabled")

    except KeyError:
      self.logger.warning("Firebug profile settings failed")
      pass 


    try:
      if config["net_export"]:
        profile.add_extension(NETEXPORT_EXTENSION)

        # Set default NetExport preferences
        #self.logger.info("Output HAR directory: {0}/har/".format(STRESS_PATH))
        profile.set_preference(domain + "netexport.defaultLogDir", self.har_output)
        profile.set_preference(domain + "netexport.autoExportToFile", True)
        profile.set_preference(domain + "netexport.alwaysEnableAutoExport", True)
        # Do not show preview output
        profile.set_preference(domain + "netexport.showPreview", True)
        # Log dir

        self.logger.info("NetExport profile settings enabled.")

    except KeyError:
      self.logger.warning("NetExport profile settings failed")
      print "Passing"
      pass

    profile.update_preferences()
    return profile

  def makeHeadLess(self, config):
 
    if config["headless"]:
      self.xvfb = Xvfb(width=1280, height=720)
      self.xvfb.start()
    
    return config["headless"]

  def waitFor(self, wait):
    
    try:
      wait_type = getattr(By, wait["type"])
      wait_value = wait["value"]
    except ValueError:
      self.logger.warning("You gave the format")
      self.quit()
      sys.exit()

    try:
      element = WebDriverWait(self, self.minimum_timeout).until(EC.presence_of_element_located((wait_type, wait_value)))

    except TimeoutException:
      self.log_fail(TimeoutException)
      self.timed_out = True

      element = Null

    except:
      self.logger.error("Unexpected behaviour. Terminating.")
      self.quit()
      sys.exit()

    return element

  def pageLoad(self, wait=False):

    self.logger.info("Loading page.")
    
    start_time = time.time()
    self.get(self.url)

    if wait:
      success = self.waitFor(wait)

    end_time = time.time()

    self.load_time = end_time - start_time
     
    self.logger.info("Page loaded successfully.")


  def sendQuery(self, query="Elliott", wait=False):

    input_query = self.find_element(value="//input[starts-with(@class,\"form-control q\")]", by=By.XPATH)
    input_query.send_keys(query)

    input_query.send_keys(Keys.RETURN) # click() and submit() do not work

    if wait:
      element = self.waitFor(wait)
    else:
      element = Null

    self.logger.info("Search completed")

    return element

# Obsolete code

#  def findAndClick(self, value, by=By.ID):
#    self.find_element(by=by, value=value).click()
#
#  def pageLogin(self, username="test", password="test", 
#                      username_value="test", password_value="test", login_value="test",
#                      wait=False):
#
#    self.logger.info("Logging into page.")
#
#    username_element = self.find_element(by=By.ID, value=username_value)
#    password_element = self.find_element(by=By.ID, value=password_value)
#
#    username_element.send_keys(username) 
#    password_element.send_keys(password)
#
#    start_time = time.time()
#    self.findAndClick(login_value)
#    
#    if wait:
#      try:
#        element = WebDriverWait(self, self.minimum_timeout).until(EC.presence_of_element_located((By.ID, wait)))
#      except TimeoutException:
#        start_time = 0
#        self.logger.warning("TimeoutException thrown. Continuing.")
#      except: 
#        self.logger.error("Unexpected behaviour. Terminating.")
#        sys.exit()
#
#    end_time = time.time()
#    self.login_time = end_time - start_time
#   
#    self.logger.info("Page logged into sucessfully.")
# 
#  def pageLogout(self, logout_value="tool-exit", confirm_value="//button[text()=\"Yes\"]", wait=False):
#
#    self.logger.info("Logging out of page.")
#
#    start_time = time.time()
#    self.findAndClick(value=logout_value)
#    self.findAndClick(value=confirm_value, by=By.XPATH)
#    if wait:
#      try:
#        element = WebDriverWait(self, self.minimum_timeout).until(EC.presence_of_element_located((By.ID, wait)))
#      except TimeoutException:
#        start_time = 0
#        self.logger.warning("TimeoutException thrown. Continuing.")
#      except:
#        self.logger.error("Unexpected behaviour. Terminating.")
#        sys.exit()
#
#    end_time = time.time()
# 
#    self.logout_time = end_time - start_time
#   
#    self.logger.info("Page logged out successfully.")
#
  def quit(self):
    if self.headless:
      self.xvfb.stop()
    super(WebPage, self).quit()
