import unittest
import time
from harparser import HTTPArchive
from benchmark import STRESS_PATH
import logging

#log = logging.getLogger("HAR Unit Tests")

class Test(unittest.TestCase):

  def test_har_parse(self):

    HAR = HTTPArchive(file_name = "{0}/har/test.har".format(STRESS_PATH))
    self.assertTrue(HAR.name == "HTTP Archive File")
    self.assertTrue(HAR.log.creator.version == "2.0")
    self.assertTrue(HAR.log.browser.name == "Firefox")
    self.assertTrue(HAR.log.pages.page_list[0].title == "Bumblebee discovery")
    self.assertTrue(HAR.log.pages.page_list[0].startedDateTime.year == 2014)
    self.assertTrue(HAR.log.pages.page_list[0].pageTimings.onLoad == 208)
    self.assertTrue(HAR.log.entries.entry_list[0].startedDateTime.year == 2014)
    self.assertTrue(HAR.log.entries.entry_list[0].request.method == "GET")
    self.assertTrue(HAR.log.entries.entry_list[0].request.cookies.cookie_list == [])
    self.assertTrue(HAR.log.entries.entry_list[0].request.headers.header_list[0].name == "Host")
    self.assertTrue(HAR.log.entries.entry_list[0].request.querystrings.querystring_list == [])
    self.assertTrue(HAR.log.entries.entry_list[0].request.postdata.text == "")
    self.assertTrue(HAR.log.entries.entry_list[0].response.headers.header_list[0].name == "X-Powered-By")
    self.assertTrue(HAR.log.entries.entry_list[0].response.content.mimeType == "text/css")
    self.assertTrue(HAR.log.entries.entry_list[0].cache.comment == "")
    self.assertTrue(HAR.log.entries.entry_list[0].timings.blocked == 0)
    self.assertTrue(HAR.log.entries.entry_list[0].cache.afterRequest.hitCount == "")

  def test_har_timings(self):
    
    HAR = HTTPArchive(file_name = "{0}/har/test.har".format(STRESS_PATH))
    HAR.get_entry_summary()
    self.assertTrue(HAR.log.entries.blocked_total >= 0)

