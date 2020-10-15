define([
  'js/widgets/classic_form/widget',
  'js/bugutils/minimal_pubsub',
], function(ClassicForm, MinimalPubSub) {
  var generateQuery = function(field, selector) {
    return function() {
      return $(selector, 'div[data-field=' + field + ']');
    };
  };

  var $Q = {
    dbAstronomy: generateQuery('database', 'input[name="astronomy"]'),
    dbPhysics: generateQuery('database', 'input[name="physics"]'),
    authorLogic: generateQuery('author', 'input[name="author-logic"]'),
    author: generateQuery('author', 'textarea[name="author-names"]'),
    objectLogic: generateQuery('object', 'input[name="object-logic"]'),
    object: generateQuery('object', 'textarea[name="object-names"]'),
    titleLogic: generateQuery('title', 'input[name="title-logic"]'),
    title: generateQuery('title', 'input[name="title"]'),
    absLogic: generateQuery('abs', 'input[name="abstract-logic"]'),
    abs: generateQuery('abs', 'input[name="abs"]'),
    date: generateQuery('date', 'input'),
    propertyRefereed: generateQuery('property', 'input[name="refereed"]'),
    propertyArticle: generateQuery('property', 'input[name="article"]'),
    bibstem: generateQuery('bibstem', 'input[name="bibstem"]'),
  };

  var triggerChanges = function() {
    _.forEach($Q, function(v) {
      v().trigger('input');
      v()
        .parent()
        .parent()
        .find(':checked')
        .trigger('change');
    });
  };

  describe('Classic Form (UI Widget)', function() {
    afterEach(function() {
      $('#test').empty();
    });

    it('should move = to outside quotes for author names', function(done) {
      var w = new ClassicForm();
      var minsub = new (MinimalPubSub.extend({
        request: function(apiRequest) {
          return '';
        },
      }))({verbose: false});
      var publishSpy = sinon.spy();

      minsub.beehive.getService('PubSub').publish = publishSpy;
      w.activate(minsub.beehive.getHardenedInstance());

      $('#test').append(w.render().el);
      var val = ['=Accomazzi, a', '=Kurtz, M'].join('\n');
      w.view
        .$('div[data-field=author]')
        .find('textarea')
        .val(val);
      w.view
        .$('div[data-field=author]')
        .find('textarea')
        .trigger('input');
      setTimeout(function() {
        w.view
          .$('button[type=submit]')
          .eq(0)
          .click();
        expect(publishSpy.args[0][3]['q'].toJSON()).to.eql({
          q: ['author:(="Accomazzi, a" ="Kurtz, M")'],
          fq: ['{!type=aqp v=$fq_database}'],
          __fq_database: ['AND', 'astronomy'],
          fq_database: ['database: astronomy'],
          sort: ['date desc'],
        });
        done();
      }, 300);
    });

    it('should turn a classic form into an apiQuery on submit', function(done) {
      var w = new ClassicForm();

      var minsub = new (MinimalPubSub.extend({
        request: function(apiRequest) {
          return '';
        },
      }))({verbose: false});

      var publishSpy = sinon.spy();

      minsub.beehive.getService('PubSub').publish = publishSpy;
      w.activate(minsub.beehive.getHardenedInstance());

      $('#test').append(w.render().el);

      w.onShow();

      // update fields
      $Q.dbPhysics().attr('checked', true);
      $Q.author().val('a, a\nb, m\n-j, a\n+b, b\n=w,w\n\n\nl,l');
      $Q.object().val('a, a\nb, m\n-j, a\n+b, b\n=w,w\n\n\nl,l');
      $($Q.date()[0]).val(10);
      $($Q.date()[1]).val(2010);
      $Q.title().val('a b c d +e -f =g +"h" -"i" i-i +i-i -"i-i"');
      $Q.abs().val('a b c d +e -f =g +"h" -"i"');
      $Q.bibstem().val('a b c d +e -f =g +"h" -"i"');
      triggerChanges();
      setTimeout(function() {
        
        expect(w.model.get('query')).to.eql({
          "q": [
            "pubdate:[2010-10 TO 9999-12]",
            "author:(\"a, a\" \"b, m\" -\"j, a\" +\"b, b\" =\"w,w\" \"l,l\")",
            "object:(\"a, a\" \"b, m\" -\"j, a\" +\"b, b\" =w,w l,l)",
            "title:(a b c d +e -f =g +\"h\" -\"i\" i-i +i-i -\"i-i\")",
            "abs:(a b c d +e -f =g +\"h\" -\"i\")",
            "-bibstem:(f OR \"i\")",
            "bibstem:(a OR b OR c OR d OR \"+e\" OR =g OR \"+\\\"h\\\"\")"
          ],
          "fq": [
            "{!type=aqp v=$fq_database}"
          ],
          "sort": [
            "date desc"
          ],
          "__fq_database": [
            "AND",
            "astronomy"
          ],
          "fq_database": [
            "database: astronomy"
          ]
        }, 'test A');
        $Q.dbPhysics().prop('checked', true);
        $($Q.authorLogic()[1]).prop('checked', true);
        $($Q.objectLogic()[1]).prop('checked', true);
        $($Q.titleLogic()[1]).prop('checked', true);
        $($Q.absLogic()[1]).prop('checked', true);
        $Q.author().val('a, a\nb, m\n-j, a\n+b, b\n=w,w\n\n\nl,l');
        $Q.object().val('a, a\nb, m\n-j, a\n+b, b\n=w,w\n\n\nl,l');
        $($Q.date()[0]).val(10);
        $($Q.date()[1]).val(2010);
        $Q.title().val('a b c (d +e -f (=g +"h") -"i" i-i) +i-i -"i-i"');
        $Q.abs().val('a b c d +e -f (=g +"h" -"i")');
        $Q.bibstem().val('a b c d +e -f =g +"h" -"i"');
        $Q.propertyRefereed().prop('checked', true);
        $Q.propertyArticle().prop('checked', true);
        triggerChanges();

        setTimeout(function() {
          expect(w.model.get('query')).to.eql({
            "q": [
              "pubdate:[2010-10 TO 9999-12]",
              "author:(\"a, a\" OR \"b, m\" OR -\"j, a\" OR +\"b, b\" OR =\"w,w\" OR \"l,l\")",
              "object:(\"a, a\" OR \"b, m\" OR -\"j, a\" OR +\"b, b\" OR =w,w OR l,l)",
              "title:(a OR b OR c OR (d OR +e OR -f OR (=g OR +\"h\") OR -\"i\" OR i-i) OR +i-i OR -\"i-i\")",
              "abs:(a OR b OR c OR d OR +e OR -f OR (=g OR +\"h\" OR -\"i\"))",
              "-bibstem:(f OR \"i\")",
              "bibstem:(a OR b OR c OR d OR \"+e\" OR =g OR \"+\\\"h\\\"\")"
            ],
            "fq": [
              "{!type=aqp v=$fq_database}",
              "{!type=aqp v=$fq_property}"
            ],
            "sort": [
              "date desc"
            ],
            "__fq_database": [
              "AND",
              "(astronomy OR physics)"
            ],
            "fq_database": [
              "database: (astronomy OR physics)"
            ],
            "__fq_property": [
              "AND",
              "(refereed AND article)"
            ],
            "fq_property": [
              "property: (refereed AND article)"
            ]
          }, 'test B');
          done();
        }, 100);
      }, 100);
    });

    it('Boolean logic text area correctly parses the input', function(done) {
      var w = new ClassicForm();

      var minsub = new (MinimalPubSub.extend({
        request: function() {
          return '';
        },
      }))({verbose: false});

      var publishSpy = sinon.spy();

      minsub.beehive.getService('PubSub').publish = publishSpy;
      w.activate(minsub.beehive.getHardenedInstance());

      $('#test').append(w.render().el);

      w.onShow();

      var setLogic = function(field, logic) {
        w.view
          .$('div[data-field=' + field + '] input[name=' + field + '-logic]')
          .val(logic);
      };

      var authorInput = function(str) {
        if (Array.isArray(str)) {
          str = str.join('\n');
        }
        w.view
          .$('div[data-field=author]')
          .find('textarea')
          .val(str);
        w.view
          .$('div[data-field=author]')
          .find('textarea')
          .trigger('input');
      };

      var submitForm = function() {
        w.view
          .$('button[type=submit]')
          .eq(0)
          .click();
      };

      // try simple combination
      authorInput('-Accomazzi, a\n+author2\n-author3\nauthor4');
      setLogic('author', 'BOOLEAN');
      setTimeout(function() {
        submitForm();

        expect(publishSpy.args[0][3]['q'].toJSON()).to.eql({
          q: ['author:(-"Accomazzi, a" +"author2" -"author3" "author4")'],
          fq: ['{!type=aqp v=$fq_database}'],
          __fq_database: ['AND', 'astronomy'],
          fq_database: ['database: astronomy'],
          sort: ['date desc'],
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
        setTimeout(function() {
          submitForm();
          expect(publishSpy.args[1][3]['q'].toJSON()).to.eql({
            q: [
              'author:("t e s t" "testing" -" test" "test" +"testing" -"testing")',
            ],
            fq: ['{!type=aqp v=$fq_database}'],
            __fq_database: ['AND', 'astronomy'],
            fq_database: ['database: astronomy'],
            sort: ['date desc'],
          });

          authorInput(['testing, t$']);
          setLogic('author', 'BOOLEAN');
          setTimeout(function () {
            submitForm();
            expect(publishSpy.args[2][3]['q'].toJSON()).to.eql({
              q: [
                'author:("testing, t") author_count:1',
              ],
              fq: ['{!type=aqp v=$fq_database}'],
              __fq_database: ['AND', 'astronomy'],
              fq_database: ['database: astronomy'],
              sort: ['date desc'],
            });
            done();
          }, 100);
        }, 100);
      }, 100);
    });
  });
});
