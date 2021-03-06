module('keyToTitle');

test('Transforms camelCased string to words', function() {
    var fn = Form.helpers.keyToTitle;
    
    equal(fn('test'), 'Test');
    equal(fn('camelCasedString'), 'Camel Cased String');
});



;(function() {
  
  module('createTemplate');
  
  var createTemplate = Form.helpers.createTemplate;

  test('returns a compiled template if just passed a string', function() {
    var template = createTemplate('Hello {{firstName}} {{lastName}}.');
    
    var result = template({ firstName: 'John', lastName: 'Smith' })
    
    equal(result, 'Hello John Smith.')
  })

  test('works when underscore template settings are different and restores them when done', function() {
    var originalSetting = /\[\[(.+?)\]\]/g;
    _.templateSettings.interpolate = originalSetting;
    
    var template = createTemplate('Bye {{firstName}} {{lastName}}!');
    
    var result = template({ firstName: 'John', lastName: 'Smith' })
    
    equal(result, 'Bye John Smith!')
    
    equal(_.templateSettings.interpolate, originalSetting)
  })

  test('returns the supplanted string if a context is passed', function() {
    var result = createTemplate('Hello {{firstName}} {{lastName}}.', {
      firstName: 'John',
      lastName: 'Smith'
    });
    
    equal(result, 'Hello John Smith.')
  })
  
})();




module('createEditor');

(function() {
    
    var create = Form.helpers.createEditor,
        editors = Form.editors;

    var options = {
        key: 'test',
        schema: {
            subSchema: {
                key: 'test'
            },
            model: 'test',
            options: []
        }
    };    
    
    test('Accepts strings for included editors', function() {
        ok(create('Text', options) instanceof editors.Text);
        ok(create('Number', options) instanceof editors.Number);
        ok(create('TextArea', options) instanceof editors.TextArea);
        ok(create('Password', options) instanceof editors.Password);
        ok(create('Select', options) instanceof editors.Select);
        ok(create('Object', options) instanceof editors.Object);
        ok(create('NestedModel', options) instanceof editors.NestedModel);
    });

    test('Accepts editor constructors', function() {
        ok(create(editors.Text, options) instanceof editors.Text);
        ok(create(editors.Select, options) instanceof editors.Select);
    });
    
})();



module('triggerCancellableEvent');

(function() {
    
    var trigger = Form.helpers.triggerCancellableEvent;
    
    test('Passes through arguments', function() {
        expect(2);
        
        var view = new Backbone.View();

        view.bind('add', function(arg1, arg2, next) {
            equal(arg1, 'foo');
            equal(arg2, 'bar');
        });

        trigger(view, 'add', ['foo', 'bar']);
    });
    
    test('Default action runs if next is called', function() {
        expect(1);
        
        var view = new Backbone.View();
        
        view.bind('remove', function(next) {
            next();
        });
        
        trigger(view, 'remove', [], function() {
            ok(true);
        });
    });

    test('Default action doesnt run if next is not called', function() {
        var view = new Backbone.View();
        
        view.bind('edit', function(next) {
            //Don't continue
        });
        
        trigger(view, 'edit', [], function() {
            ok(false); //Shouldn't run
        });
    });
    
    test('Default action run without anything bound', function() {
        expect(1);

        var view = new Backbone.View();

        trigger(view, 'remove', [], function() {
            ok(true);
        });
    });

})();



(function() {
  
  module('getValidator');
  
  var getValidator = Form.helpers.getValidator;

  test('Given a string, a bundled validator is returned', function() {
    var required = getValidator('required'),
        email = getValidator('email');
    
    equal(required(null).type, 'required');
    equal(email('invalid').type, 'email');
  });
  
  test('Given a string, throws if the bundled validator is not found', function() {
    expect(1);
    
    try {
      getValidator('unknown validator');
    } catch (e) {
      equal(e.message, 'Validator "unknown validator" not found');
    }
  });
  
  test('Given an object, a customised bundled validator is returned', function() {
    //Can customise error message
    var required = getValidator({ type: 'required', message: 'Custom message' });
    
    var err = required('');
    equal(err.type, 'required');
    equal(err.message, 'Custom message');
    
    //Can customise options on certain validators
    var regexp = getValidator({ type: 'regexp', regexp: /foobar/, message: 'Must include "foobar"' });
    
    var err = regexp('invalid');
    equal(err.type, 'regexp');
    equal(err.message, 'Must include "foobar"');
  });

  test('Given a regular expression, returns a regexp validator', function() {
    var regexp = getValidator(/hello/);
    
    equal(regexp('invalid').type, 'regexp');
  });

  test('Given a function, it is returned', function () {
    var myValidator = function () { return; };

    var validator = getValidator(myValidator);

    equal(validator, myValidator);
  });

  test('Given an unknown type, an error is thrown', function () {
    expect(1);
    
    try {
      getValidator(['array']);
    } catch (e) {
      equal(e.message, 'Invalid validator: array');
    }
  });

})();

