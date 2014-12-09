"""Base class of parsing HTTP ARchive (HAR) files"""
import json
import os
import datetime
from dateutil import parser as time_parse

if os.path.isdir("/vagrant/"):
  STRESS_PATH = "/vagrant/benchmark"
else:
  STRESS_PATH = "/home/jonny/software/vagrant/bumblebee/benchmark"

__author__ = "Jonny Elliott"
__version__ = "0.1"
__maintainer__ = "Jonny Elliott"
__status__ = "Prototype"

class HTTPArchive(object):

  def __init__(self, file_name):
    self.name = "HTTP Archive File"
    self.file_name = file_name

    # Load the raw content of the file
    self.load_file()
    self.parse()

  def load_file(self):

    with open(self.file_name, "r") as f:
      self.file_output = json.load(f)

  def get_entry_summary(self):
    """This will execute all actions on the entry object"""
    self.log.entries.get_totals()

  def parse(self):

    self.log = Log()

    for key in ["version", "comment"]:
      try:
        setattr(self.log, key, self.file_output["log"][key])
      except:
        pass

    creator = Creator()
    for key in self.file_output["log"]["creator"]:
      setattr(creator, key, self.file_output["log"]["creator"][key])
    self.log.creator = creator

    browser = Browser()
    for key in self.file_output["log"]["browser"]:
      setattr(browser, key, self.file_output["log"]["browser"][key])
    self.log.browser = browser

    # Pages
    # -------------
    pages = Pages()
    for page_ in self.file_output["log"]["pages"]:
      page = Page()
      for key in ["id", "title", "comment"]:
        try:
          setattr(page, key, page_[key])
        except:
          pass

      try:
        page.startedDateTime = time_parse.parse(page_["startedDateTime"])
      except:
        pass

      pageTimings = PageTimings()
      pageTimings.onLoad = int(page_["pageTimings"]["onLoad"])
      pageTimings.onContentLoad = int(page_["pageTimings"]["onContentLoad"])
      pageTimings.comment = page_["pageTimings"]["comment"]

      page.pageTimings = pageTimings

      pages.page_list.append(page)

    self.log.pages = pages
    # -------------

    # Entries
    entries = Entries()
    for entry_ in self.file_output["log"]["entries"]:
      entry = Entry()
      for key in ["pageref", "serverIPAddress", "connection", "comment"]:
        try:
          setattr(entry, key, entry_[key])
        except:
          pass

      try:
        entry.time = int(entry_["time"])
      except:
        pass

      try:
         entry.startedDateTime = time_parse.parse(entry_["startedDateTime"])
      except:
        pass

      # Request
      request = Request()
      for key in ["method", "url", "httpVersion", "comment"]:
        try:
          setattr(request, key, entry_["request"][key])
        except:
          pass
      
      for key in ["headerSize", "bodySize"]:
        try:
          setattr(request, key, int(entry_["request"][key]))
        except:
          pass

      # Cookies
      cookies = Cookies()
      for cookie_ in entry_["request"]["cookies"]:
        cookie = Cookie()
        for key in ["name", "value", "path", "domain", "comment"]:
          try:
            setattr(cookie, key, cookie_[key])
          except:
            pass
        for key in ["httpOnly", "secure"]:
          try:
            setattr(cookie, key, bool(cookie_[key]))
          except:
            pass
          
        try:
          cookie.expires = time_parse.parse(cookie_["expires"])
        except:
          pass

        cookies.cookie_list.append(cookie)
       
      request.cookies = cookies


      # Headers
      headers = Headers()
      for header_ in entry_["request"]["headers"]:
        header = Header()
        for key in header_:
          setattr(header, key, header_[key])

        headers.header_list.append(header)

      request.headers = headers

      # QueryStrings
      querystrings = QueryStrings()
      for querystring_ in entry_["request"]["queryString"]:
        querystring = QueryString()
        for key in querystring_:
          setattr(querystring, key, querystring_[key])

        querystrings.querystring_list.append(querystring)

      request.querystrings = querystrings

      # PostData
      postdata = PostData()
      for key in ["mimeType", "text", "comment"]:
        try:
          setattr(postdata, key, entry_["request"]["postData"][key])
        except:
          pass
      request.postdata = postdata


      # Responses
      response = Response()

      for key in ["statusText", "httpVersion", "redirectURL", "comment"]:
        try:
          setattr(response, key, entry_["response"][key])
        except:
          pass
      
      for key in ["status", "headerSize", "bodySize"]:
        try:
          setattr(response, key, int(entry_["response"][key]))
        except:
          pass

       # Cookies
      cookies = Cookies()
      for cookie_ in entry_["response"]["cookies"]:
        cookie = Cookie()
        for key in ["name", "value", "path", "domain", "comment"]:
          try:
            setattr(cookie, key, cookie_[key])
          except:
            pass
        for key in ["httpOnly", "secure"]:
          try:
            setattr(cookie, key, bool(cookie_[key]))
          except:
            pass
          
        try:
          cookie.expires = time_parse.parse(cookie_["expires"])
        except:
          pass

        cookies.cookie_list.append(cookie)
       
      response.cookies = cookies

      # Headers
      headers = Headers()
      for header_ in entry_["response"]["headers"]:
        header = Header()
        for key in header_:
          setattr(header, key, header_[key])

        headers.header_list.append(header)

      response.headers = headers

      # Content
      content = Content()
      for key in ["mimeType", "text", "comment"]:
        try:
          setattr(content, key, entry_["response"]["content"][key])
        except:
          pass

      response.content = content

     
      entry.request = request
      entry.response = response

      # Cache
      cache = Cache()
      for key in entry_["cache"]:
        try:
          setattr(cache, key, entry_["cache"][key])
        except:
          pass

      # Before/After requests
      beforeRequest = BARequest()
      afterRequest = BARequest()
      if "beforeRequest" in entry_["cache"]:
        beforeRequest.expires = time_parse.parse(entry_["cache"]["beforeRequest"]["expires"])
        beforeRequest.lastAccess = time_parse.parse(entry_["cache"]["beforeRequest"]["lastAccess"])
        beforeRequest.hitCount = int(entry_["cache"]["beforeRequest"]["hitCount"])

        for key in ["eTag", "comment"]:
          try:
            setattr(beforeRequest, key, entry_["cache"]["beforeRequest"])
          except:
            pass

      if "afterRequest" in entry_["cache"]:

        afterRequest.expires = time_parse.parse(entry_["cache"]["afterRequest"]["expires"])
        afterRequest.lastAccess = time_parse.parse(entry_["cache"]["afterRequest"]["lastAccess"])
        afterRequest.hitCount = int(entry_["cache"]["afterRequest"]["hitCount"])

        for key in ["eTag", "comment"]:
          try:
            setattr(afterRequest, key, entry_["cache"]["afterRequest"])
          except:
            pass

      cache.beforeRequest = beforeRequest
      cache.afterRequest = afterRequest
      


      entry.cache = cache


      # Timings
      timings = Timings()
      for key in entry_["timings"]:
        try:
          setattr(timings, key, int(entry_["timings"][key]))
        except ValueError:
          setattr(timings, key, entry_["timings"][key])
        except:
          pass 
      entry.timings = timings




      entries.entry_list.append(entry)
    self.log.entries = entries
    # -------------

       


class Log(object):

  def __init__(self):
    self.version = ""
    self.creator = ""
    self.browser = ""
    self.pages = ""
    self.entries = ""
    self.comment = ""

class Creator(object):

  def __init__(self):
    self.name = ""
    self.version = ""
    self.comment = ""

class Browser(Creator):
  def __init__(self):
    Creator.__init__(self)

class Pages(object):
  def __init__(self):
    self.page_list = []

class Page(object):

  def __init__(self):
    self.startedDateTime = ""
    self.id = ""
    self.title = ""
    self.page_timings = []
    self.comment = ""

class PageTimings(object):
  def __init__(self):
    self.onContentLoad = ""
    self.onLoad = ""
    self.comment = ""

class Entries(object):
  def __init__(self):
    self.entry_list = []

  def get_totals(self):
    item_list = ["blocked", "dns", "connect", \
    "send", "wait", "receive", "ssl"]
    entry_dict = {}
    for item in item_list:
      entry_dict[item] = 0

    for entry in self.entry_list:
      for item in item_list:
        try:
          entry_dict[item] += getattr(entry.timings, item)
        except TypeError:
          print item

    for item in item_list:
      setattr(self, item + "_total", entry_dict[item])
      

class Entry(object):
  def __init__(self):
    self.pageref = ""
    self.startedDateTime = ""
    self.time = ""
    self.request = ""
    self.response = ""
    self.cache = ""
    self.timings = ""
    self.serverIPAddress = ""
    self.connection = ""
    self.comment = ""

class Request(object):
  def __init__(self):
    self.GET = ""
    self.url = ""
    self.httpVersion = ""
    self.cookies = ""
    self.headers = ""
    self.queryString = ""
    self.postData = ""
    self.headersSize = ""
    self.bodySize = ""
    self.comment = ""

class Response(object):
  def __init__(self):
    self.status = ""
    self.statusText = ""
    self.httpVersion = ""
    self.cookies = []
    self.headers = []
    self.content = ""
    self.redirectURL = ""
    self.headersSize = ""
    self.bodySize = ""
    self.comment = ""

class Cookies(object):
  def __init__(self):
    self.cookie_list = []

class Cookie(object):
  def __init__(self):
    self.name = ""
    self.value = ""
    self.path = ""
    self.domain = ""
    self.expires = ""
    self.httpOnly = ""
    self.secure = ""
    self.comment = ""

class QueryStrings(object):
  def __init__(self):
    self.querystring_list = []

class QueryString(object):
  def __init__(self):
    self.name = ""
    self.value = ""
    self.comment = ""

class Headers(object):
  def __init__(self):
    self.header_list = []

class Header(QueryString):
  def __init__(self):
    QueryString.__init__(self)

class PostData(object):
  def __init__(self):
    self.mimeType = ""
    self.params = ""
    self.text = ""
    self.comment = ""

class Params(object):
  def __init__(self):
    self.params_list = []

class Param(object):
  def __init__(self):
    self.name = ""
    self.value = ""
    self.fileName = ""
    self.contentType = ""
    self.comment = ""

class Content(object):
  def __init__(self):
    self.size = ""
    self.compression = ""
    self.mimeType = ""
    self.text = ""
    self.comment = ""

class Cache(object):
  def __init__(self):
    self.beforeRequest = None
    self.afterRequest = None
    self.comment = ""

class Timings(object):
  def __init__(self):
    self.blocked = 0
    self.dns = 0
    self.connect = 0
    self.send = 0
    self.wait = 0
    self.receive = 0
    self.ssl = 0
    self.comment = ""

class BARequest(object):
  def __init__(self):
    self.expires = ""
    self.lastAccess = ""
    self.eTag = ""
    self.hitCount = ""
    self.comment = ""
