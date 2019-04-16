define([
  'es6!js/widgets/library_actions/widget.jsx',
  'js/bugutils/minimal_pubsub'
], function (Widget, MinSub) {

  var fakeLibraryController = function (metadata, fn) {
    var lc = _.extend({}, {
      getLibraryMetadata: _.constant($.Deferred().resolve(metadata).promise()),
    });
    if (_.isFunction(fn)) {
      return fn(lc);
    }
    return lc;
  }

  var pubSub = function (data) {
    return new (MinSub.extend(data));
  }

  var getBeehive = function (ps, metadata, cb) {
    return {
      active: true,
      getObject: _.constant(fakeLibraryController(metadata, cb)),
      getService: _.constant(ps),
      getPubSub: _.constant(ps)
    };
  }

  describe('Library Actions (js/widgets/library_actions/widget)', function () {
    beforeEach(function (done) {
      this.w = new Widget();
      $('#test-area').empty().html(this.w.render().el);
      done();
    })

    it('closes widget when no libraries exist', function (done) {
      var ps = pubSub({
        request: _.constant({ foo: 'bar' }),
        publish: function () {
          expect(_.toArray(arguments)).to.eql([
            '[Router]-Navigate-With-Trigger',
            'AllLibrariesWidget'
          ]);
          done();
        }
      });
      var beehive = getBeehive(ps, []);
      this.w.getPubSub = _.constant(ps);
      this.w.activate(beehive);
      this.w.reset();
    });

    it('restricts options when only a single library is found', function (done) {
      var ps = pubSub({
        request: _.constant({ foo: 'bar' })
      });
      var beehive = getBeehive(ps, [
        { name: 'myLib', permission: 'owner', id: 'foo' }
      ]);
      this.w.getPubSub = _.constant(ps);
      this.w.activate(beehive);
      this.w.reset();
      setTimeout(() => {
        expect(this.w.view.component.state.actions).to.eql(['empty']);
        expect(this.w.view.component.state.action).to.eql('empty');
        done();
      }, 10);
    });

    it('shows all options when more than 1 library is found', function (done) {
      var ps = pubSub({
        request: _.constant({ foo: 'bar' })
      });
      var beehive = getBeehive(ps, [
        { name: 'myLib', permission: 'owner', id: 'foo' },
        { name: 'myLib2', permission: 'owner', id: 'foo2' },
      ]);
      this.w.getPubSub = _.constant(ps);
      this.w.activate(beehive);
      this.w.reset();
      setTimeout(() => {
        expect(this.w.view.component.state.actions).to.eql([
          'union', 'intersection', 'difference', 'copy', 'empty'
        ]);
        expect(this.w.view.component.state.action).to.eql('union');
        done();
      }, 10);
    });

    it('provides list of libraries in each select', function (done) {
      var ps = pubSub({
        request: _.constant({ foo: 'bar' })
      });
      var libs = [
        { name: 'myLib', permission: 'owner', id: 'foo' },
        { name: 'myLib2', permission: 'owner', id: 'foo2' },
        { name: 'myLib3', permission: 'owner', id: 'foo3' },
      ];
      var beehive = getBeehive(ps, libs);
      this.w.getPubSub = _.constant(ps);
      this.w.activate(beehive);
      this.w.reset();
      var checkSelect = (count) => {
        var selects = $('select', this.w.view.$el);
        expect(selects.length).to.eql(count);
        selects.each(function () {
          var vals = $(this).find('option').map((i, e) => $(e).val()).toArray();
          var text = $(this).find('option').map((i, e) => $(e).text()).toArray();
          expect(vals).to.eql(libs.map((i) => i.id));
          expect(text).to.eql(libs.map((i) => i.name));
        });
      }

      setTimeout(() => {
        checkSelect(2);
        done();
      }, 10);
    });

    it('creates additional selects when clicking add library button', function (done) {
      var ps = pubSub({
        request: _.constant({ foo: 'bar' })
      });
      var libs = [
        { name: 'myLib', permission: 'owner', id: 'foo' },
        { name: 'myLib2', permission: 'owner', id: 'foo2' },
        { name: 'myLib3', permission: 'owner', id: 'foo3' },
      ];
      var beehive = getBeehive(ps, libs);
      this.w.getPubSub = _.constant(ps);
      this.w.activate(beehive);
      this.w.reset();
      var checkSelect = (count) => {
        var selects = $('select', this.w.view.$el);
        expect(selects.length).to.eql(count);
        selects.each(function () {
          var vals = $(this).find('option').map((i, e) => $(e).val()).toArray();
          var text = $(this).find('option').map((i, e) => $(e).text()).toArray();
          expect(vals).to.eql(libs.map((i) => i.id));
          expect(text).to.eql(libs.map((i) => i.name));
        });
      }

      setTimeout(() => {
        var addLibBtnSelector = 'button#addLibrary';
        var removeLibBtnSelector = 'button#removeLibrary';

        checkSelect(2);
        var removeLibBtn = $(removeLibBtnSelector, this.w.view.$el);
        var addLibBtn = $(addLibBtnSelector, this.w.view.$el);
        expect(addLibBtn.length).to.eql(1);
        expect(removeLibBtn.length).to.eql(0);
        addLibBtn.click();

        // should now have 3 select dropdowns
        checkSelect(3);

        // the add button will be disabled since the amount of selects and libraries match
        addLibBtn = $(addLibBtnSelector, this.w.view.$el);
        removeLibBtn = $(removeLibBtnSelector, this.w.view.$el);
        expect(addLibBtn.attr('disabled')).to.eql('disabled');
        expect(removeLibBtn.length).to.eql(1);
        removeLibBtn.click();

        checkSelect(2);
        addLibBtn = $(addLibBtnSelector, this.w.view.$el);
        removeLibBtn = $(removeLibBtnSelector, this.w.view.$el);
        expect(addLibBtn.attr('disabled')).to.eql(undefined);
        expect(removeLibBtn.length).to.eql(0);

        done();
      }, 10);
    });

    it('changes menu when selecting different actions', function (done) {
      var ps = pubSub({
        request: _.constant({ foo: 'bar' })
      });
      var libs = [
        { name: 'myLib', permission: 'owner', id: 'foo' },
        { name: 'myLib2', permission: 'owner', id: 'foo2' },
        { name: 'myLib3', permission: 'owner', id: 'foo3' },
      ];
      var beehive = getBeehive(ps, libs);
      this.w.getPubSub = _.constant(ps);
      this.w.activate(beehive);
      this.w.reset();
      var checkSelect = (count) => {
        var selects = $('select', this.w.view.$el);
        expect(selects.length).to.eql(count);
        selects.each(function () {
          var vals = $(this).find('option').map((i, e) => $(e).val()).toArray();
          var text = $(this).find('option').map((i, e) => $(e).text()).toArray();
          expect(vals).to.eql(libs.map((i) => i.id));
          expect(text).to.eql(libs.map((i) => i.name));
        });
      }

      var assertTargetInput = (bool, value) => {
        var input = $('input#new_library_name', this.w.view.$el);
        expect(!!input.length).to.eql(bool);
        if (bool) {
          expect(input.val()).to.eql(value);
        }
      }

      setTimeout(() => {
        var actionsList = $('input[type=radio]', this.w.view.$el);

        actionsList.each((i, el) => {
          $(el).click();
          if (i < 3) {
            // union, intersection, difference
            checkSelect(2);
            assertTargetInput(true, '');
          } else if (i === 3) {
            // copy
            checkSelect(2);
            assertTargetInput(false);
          } else {
            // empty
            checkSelect(1);
            assertTargetInput(false);
          }
        });
        done();
      }, 10);
    });

    it('submit fires library controller method properly', function (done) {
      var ps = pubSub({
        request: function () {
          console.log('sdlfksjdf', arguments);
        }
      });
      var libs = [
        { name: 'myLib', permission: 'owner', id: 'foo' },
        { name: 'myLib2', permission: 'owner', id: 'foo2' },
        { name: 'myLib3', permission: 'owner', id: 'foo3' },
      ];
      var performLibraryActionStub = sinon.stub().returns($.Deferred().resolve({}).promise());
      var beehive = getBeehive(ps, libs, (lc) => {
        return _.extend({}, lc, {
          performLibraryOperation: performLibraryActionStub
        });
      });
      this.w.getPubSub = _.constant(ps);
      this.w.activate(beehive);
      this.w.reset();

      var fireEvent = (el, event) => {
        var ev = new Event(event, { bubbles: true });
        el = _.isArray(el) ? el[0] : el;
        el.dispatchEvent(ev);
      }

      var updateSelect = (n, value) => {
        var el = $('select', this.w.view.$el).eq(n);
        el.val(value);
        fireEvent(el[0], 'change');
      }

      setTimeout(() => {
        // submit as is
        $('button[type=submit]', this.w.view.$el).click();
        var args = performLibraryActionStub.args;
        expect(args[0][0]).to.eql('foo');
        expect(args[0][1]).to.eql({
          action: 'union',
          libraries: ['foo'],
          name: undefined
        });

        // change some things
        $('#addLibrary', this.w.view.$el).click();
        _.forEach(libs, (l, i) => updateSelect(i, libs[libs.length - 1 - i].id));
        var targetInput = $('input#new_library_name', this.w.view.$el);
        targetInput.val('my new lib');
        fireEvent(targetInput[0], 'input');
        $('button[type=submit]', this.w.view.$el).click();
        expect(args[1][0]).to.eql('foo3');
        expect(args[1][1]).to.eql({
          action: 'union',
          libraries: ['foo2', 'foo'],
          name: 'my new lib'
        });

        done();
      }, 10);
    });
  });
});
