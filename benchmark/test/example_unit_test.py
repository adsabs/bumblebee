import unittest
import time
from benchmark import WebPage

localhost = "http://localhost:8000"

class Test(unittest.TestCase):

  def test_load_page(self):
    """Simple test to ensure a basic load works."""
    myPage = WebPage(localhost)
    myPage.pageLoad()

    try:
      self.assertEqual("Bumblebee discovery", myPage.title)
      self.assertTrue(myPage.load_time > 0)
    finally:
      myPage.quit()

  def test_load_page_config(self):
    """Simple test that all the config parameters parse correctly."""

    config = {
        "headless": True,
        "fire_bug": False,
        "net_export": False,
        "fake_input": False,
        }
    
    myPage = WebPage(localhost, config=config)
    try:
      self.assertTrue("fake_input" not in myPage.config)
    finally:
      myPage.quit()

  def test_query_author(self):
    myPage = WebPage(localhost)
    try:
      myPage.pageLoad()
      myPage.sendQuery(query="Elliott")
      success_text = myPage.find_element_by_class_name("s-results-control-row-container")
      print success_text
#    self.assertTrue("Einmal anmelden." in success_text)
    finally:
      myPage.quit()
#    time.sleep(5)

#  def test_timing_logout_page(self):
#    myPage = WebPage("http://google.de")
#    myPage.pageLoad()
#    myPage.pageLogout(logout_value="gbqfba", confirm_value="//button[@id=\"gbqfbb\"]", wait="logo")
#    myPage.quit()
#    time.sleep(5)

#  def test_firebug_output(self):
#    import glob
#
#    config = {"fire_bug": True, "headless": False, "net_export": True}
#    myPage = WebPage("http://www.google.de", config=config)
#
#    num_files_start = glob.glob("{0}/*.har".format(myPage.har_output))
#
#    time.sleep(5)
#    myPage.pageLoad()
#    time.sleep(5)
#
#    myPage.quit()
#
#    num_files_end = glob.glob("{0}/*.har".format(myPage.har_output))
#
#    self.assertTrue(num_files_end > num_files_start)
#
#    time.sleep(5)


