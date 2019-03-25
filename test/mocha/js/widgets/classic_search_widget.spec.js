define([
  "js/widgets/classic_form/widget",
  'js/bugutils/minimal_pubsub'

], function(
    ClassicForm,
    MinimalPubSub
  ){

  describe("Classic Form (UI Widget)", function(){

    afterEach(function(){

      $("#test").empty();

    });

    it('should move = to outside quotes for author names', function (done) {
      var w = new ClassicForm();
      var minsub = new (MinimalPubSub.extend({
        request: function (apiRequest) {
          return "";
        }
      }))({verbose: false});
      var publishSpy = sinon.spy();

      minsub.beehive.getService("PubSub").publish = publishSpy;
      w.activate(minsub.beehive.getHardenedInstance());

      $("#test").append(w.render().el);
      var val = [
        '=Accomazzi, a',
        '=Kurtz, M'
      ].join('\n');
      w.view.$("div[data-field=author]").find("textarea").val(val);
      w.view.$("div[data-field=author]").find("textarea").trigger("input");
      w.view.$("button[type=submit]").eq(0).click();
      expect(publishSpy.args[0][3]["q"].toJSON()).to.eql({
        "q": [
          "author:(=\"Accomazzi, a\" AND =\"Kurtz, M\")"
        ],
        "fq": [
          "{!type=aqp v=$fq_database}"
        ],
        "fq_database": [
          "database: astronomy"
        ],
        "__fq_database": [
          "AND", "astronomy"
        ],
        "sort": [
          "date desc"
        ]
      });
      done();
    });

    it("should turn a classic form into an apiQuery on submit", function(){


      var w = new ClassicForm();

      var minsub = new (MinimalPubSub.extend({
        request: function (apiRequest) {
          return "";
        }
      }))({verbose: false});

      var publishSpy = sinon.spy();

      minsub.beehive.getService("PubSub").publish = publishSpy;
      w.activate(minsub.beehive.getHardenedInstance());

      $("#test").append(w.render().el);

      w.onShow();

      expect($("button[type=submit]").prop("disabled")).to.eql(true);

      w.view.$("div[data-field=database]").find("input").attr("checked", true);
      w.view.$("div[data-field=author]").find("textarea").val("Accomazzi,a\rKurtz,M");
      w.view.$("div[data-field=author]").find("textarea").trigger("input");

      w.view.$("div[data-field=date]").find("input[name=month_from]").val(10);
      w.view.$("div[data-field=date]").find("input[name=year_from]").val(2010);

      w.view.$("div[data-field=title]").find("input[type=text]").val('star planet "gliese 581"');

      //setting input[value=OR] prop "checked" to true isn't working in phantomjs for some reason :(
      w.view.$("div[data-field=title] input[name=title-logic]").val("OR")

      w.view.$("div[data-field=abs]").find("input[type=text]").val('-hawaii star');
      w.view.$("div[data-field=abs] input[name=abstract-logic]").val("BOOLEAN")

      w.view.$("div[data-field=bibstem]").find("input[name=bibstem]").val("apj,mnras,-aj,-bpj");

      w.view.$("div[data-field=property]").find("input[name=refereed]").click();
      w.view.$("div[data-field=property]").find("input[name=article]").click();

      expect(w.view.$("button[type=submit]").prop("disabled")).to.eql(false);


      w.view.$("button[type=submit]").eq(0).click();


      expect(JSON.stringify(publishSpy.args[0][3]["q"].toJSON())).to.eql('{"q":["pubdate:[2010-10 TO 9999-12] author:(\\"Accomazzi,a\\" AND \\"Kurtz,M\\") title:(star OR planet OR \\"gliese 581\\") abs:(-\\"hawaii star\\") -bibstem:(aj OR bpj) bibstem:(apj OR mnras)"],"fq":["{!type=aqp v=$fq_database}","{!type=aqp v=$fq_property}"],"__fq_database":["AND","(astronomy or physics)"],"fq_database":["database: (astronomy or physics)"],"__fq_property":["AND","(refereed or notrefereed)"],"fq_property":["property: (refereed or notrefereed)"],"sort":["date desc"]}');

      //one more

      w.view.render();

      w.view.$("div[data-field=author]").find("textarea").val("Accomazzi,a");
      w.view.$("div[data-field=author]").find("textarea").trigger("input");

      w.view.$("div[data-field=date]").find("input[name=month_from]").val(10);
      w.view.$("div[data-field=date]").find("input[name=year_from]").val(2010);
      w.view.$("div[data-field=date]").find("input[name=year_to]").val(2012);

      w.view.$("div[data-field=title]").find("input[type=text]").val('star planet "gliese 581"');
      //setting input[value=OR] prop "checked" to true isn't working in phantomjs for some reason :(
      w.view.$("div[data-field=title] input[name=title-logic]").val("OR")

      w.view.$("div[data-field=abs]").find("input[type=text]").val('-hawaii star');
      w.view.$("div[data-field=abs] input[name=abstract-logic]").val("BOOLEAN")

      w.view.$("div[data-field=bibstem]").find("input[name=bibstem]").val("    apj,     ");

      w.view.$("div[data-field=property]").find("input[name=refereed]").click();

      w.view.$("button[type=submit]").eq(0).click();

      expect(JSON.stringify(publishSpy.args[1][3]["q"].toJSON())).to.eql('{"q":["pubdate:[2010-10 TO 2012-12] author:(\\"Accomazzi,a\\") title:(star OR planet OR \\"gliese 581\\") abs:(-\\"hawaii star\\") bibstem:(apj)"],"fq":["{!type=aqp v=$fq_database}","{!type=aqp v=$fq_property}"],"__fq_database":["AND","astronomy"],"fq_database":["database: astronomy"],"__fq_property":["AND","refereed"],"fq_property":["property: refereed"],"sort":["date desc"]}');

    });

    it('Boolean logic text area correctly parses the input', function () {
      var w = new ClassicForm();

      var minsub = new (MinimalPubSub.extend({
        request: function () {
          return "";
        }
      }))({verbose: false});

      var publishSpy = sinon.spy();

      minsub.beehive.getService("PubSub").publish = publishSpy;
      w.activate(minsub.beehive.getHardenedInstance());

      $("#test").append(w.render().el);

      w.onShow();

      var setLogic = function (field, logic) {
        w.view.$("div[data-field=" + field + "] input[name=" + field + "-logic]").val(logic);
      };

      var authorInput = function (str) {
        if (Array.isArray(str)) {
          str = str.join('\n');
        }
        w.view.$("div[data-field=author]").find("textarea").val(str);
        w.view.$("div[data-field=author]").find("textarea").trigger("input");
      };

      var submitForm = function () {
        w.view.$("button[type=submit]").eq(0).click();
      };

      // try simple combination
      authorInput("-Accomazzi, a\n+author2\n-author3\nauthor4");
      setLogic('author', 'BOOLEAN');
      submitForm();

      expect(publishSpy.args[0][3]["q"].toJSON()).to.eql({
        "q": [
          "author:(-\"Accomazzi, a\" +author2 -author3 +author4)"
        ],
        "fq": [
          "{!type=aqp v=$fq_database}"
        ],
        "fq_database": [
          "database: astronomy"
        ],
        "sort": [
          "date desc"
        ],
        "__fq_database": [
          "AND", "astronomy"
        ],
      });

      w.view.render();

      // try some crappy input
      authorInput([
        't e s t',
        '    testing    ',
        ' - test ',
        'test',
        '+testing',
        '-testing'
      ]);
      setLogic('author', 'BOOLEAN');
      submitForm();

      expect(publishSpy.args[1][3]["q"].toJSON()).to.eql({
        "q": [
          "author:(+\"t e s t\" +testing -\" test\" +test +testing -testing)"
        ],
        "fq": [
          "{!type=aqp v=$fq_database}"
        ],
        "fq_database": [
          "database: astronomy"
        ],
        "sort": [
          "date desc"
        ],
        "__fq_database": [
          "AND", "astronomy"
        ],
      });
    });
  });
});
