import unittest
import time
from benchmark import WebPage

localhost = "http://localhost:80"
#localhost = "http://adslabs.org/bumblebee/"

class Test(unittest.TestCase):

  def test_load_page(self):
    """Simple test to ensure a basic load works."""
    myPage = WebPage(localhost)
    myPage.pageLoad()

    try:
      self.assertEqual("Bumblebee discovery", myPage.title)
      self.assertTrue(myPage.load_time > 0)
    except Exception:
      myPage.log_fail(Exception)
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
    except Exception:
      myPage.log_fail(Exception)
    finally:
      myPage.quit()

  def test_query_author(self):

    success_text = ""

    config = {"headless": True, "fire_bug": False, "net_export": False}

    myPage = WebPage(localhost, config=config)
    myPage.pageLoad(wait={"type": "CLASS_NAME", "value": "q"})

    #myPage.logger.info("waiting...")
    #time.sleep(1)
    #class_identify = "list-of-things"
    #class_identify = "col-sm-5"
    #class_identify = "col-sm-4 col-xs-5 s-top-row-col identifier s-identifier"
    #class_identify = "col-sm-12 results-list  s-results-list list-unstyled s-display-block"
    #class_identify = "sr-only"
    #class_identify = "//*[contains(@class, \"results-list\")]"
    #class_identify = "li.col-sm-12.results-list"
    class_identify = "s-results-title"
    element = myPage.sendQuery(query="Elliott", wait={"type": "CLASS_NAME", "value": class_identify})

    try:
      self.assertTrue("Elliott" in myPage.page_source)
    except Exception:
      myPage.log_fail(Exception)
    finally:
      myPage.quit()

