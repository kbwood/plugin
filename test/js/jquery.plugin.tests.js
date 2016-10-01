(function($) {
    test('jQuery bridge', function () {
        expect(4);
        $.JQPlugin.createPlugin({
            name: 'test'
        });
        ok($.test !== undefined, 'Singleton defined');
        ok($.fn.test !== undefined, 'Collection function defined');
        $.JQPlugin.createPlugin({
            name: 'jq-long-name'
        });
        ok($.jqLongName !== undefined, 'Long name singleton defined');
        ok($.fn.jqLongName !== undefined, 'Long name collection function defined');
    });
    test('Get marker', function () {
        expect(2);
        $.JQPlugin.createPlugin({
            name: 'test'
        });
        var div1 = $('#div1').test();
        ok(div1.hasClass('is-test'), 'Has marker class');
        equal($.test._getMarker(), 'is-test', 'Marker correct');
    });
    test('Instance settings', function () {
        expect(6);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234
            },
            _instSettings: function(elem, options) {
                return {content: 'New content'};
            }
        });
        var div1 = $('#div1').test();
        deepEqual($.test._getInst($('#div2')[0]), {}, 'No instance');
        var inst = div1.data('test');
        ok(inst !== undefined, 'Instance settings exists');
        deepEqual($.test._getInst(div1[0]), inst, 'Instance retrieval works');
        ok(inst.options !== undefined, 'Instance options exists');
        equal(inst.options.aString, 'String value', 'Instance option set');
        equal(inst.content, 'New content', 'Extra settings present');
    });
    test('Deep merge true', function () {
        expect(3);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true,
                anArray: ['one', 'two'],
                anObject: {
                    subString: 'Inner value',
                    subNumber: 5678
                }
            }
        });
        var div1 = $('#div1').test({aNumber: 2345, anObject: {subNumber: 6789, subBoolean: false}});
        equal(div1.test('option', 'aString'), 'String value', 'Default option set');
        equal(div1.test('option', 'aNumber'), 2345, 'Default option overridden');
        deepEqual(div1.test('option', 'anObject'), {subString: 'Inner value', subNumber: 6789, subBoolean: false},
            'Default object option merged');
    });
    test('Deep merge false', function () {
        expect(3);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true,
                anArray: ['one', 'two'],
                anObject: {
                    subString: 'Inner value',
                    subNumber: 5678
                }
            },
            deepMerge: false
        });
        var div1 = $('#div1').test({aNumber: 2345, anObject: {subNumber: 6789, subBoolean: false}});
        equal(div1.test('option', 'aString'), 'String value', 'Default option set');
        equal(div1.test('option', 'aNumber'), 2345, 'Default option overridden');
        deepEqual(div1.test('option', 'anObject'), {subNumber: 6789, subBoolean: false},
            'Default object option merged');
    });
    test('Inline metadata', function () {
        expect(6);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true,
                anArray: ['one', 'two'],
                anObject: {
                    subString: 'Inner value',
                    subNumber: 5678
                },
				aDate: null
            }
        });
        var div1 = $('#div1').attr('data-test',
            'aString: "http://www.example.com", aNumber: 3456, aBoolean: false, ' +
			'anObject: {subString: \'New\\\'s value\\: 3\'}, aDate: \'new Date(2016, 12-1, 25)\'');
        div1.test({aNumber: 2345});
        equal(div1.test('option', 'aString'), 'http://www.example.com', 'Option derived from metadata');
        equal(div1.test('option', 'aNumber'), 2345, 'Option in instantiation overrides metadata');
        equal(div1.test('option', 'aBoolean'), false, 'Option (Boolean) derived from metadata');
        deepEqual(div1.test('option', 'anArray'), ['one', 'two'], 'Option from defaults');
        deepEqual(div1.test('option', 'anObject'), {subString: 'New\'s value: 3', subNumber: 5678},
			'Sub-option from metadata');
		equal(div1.test('option', 'aDate').getTime(), new Date(2016, 12-1, 25).getTime(), 'Option date created');
    });
    test('Invalid inline metadata', function () {
        expect(1);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true
            }
        });
        var div1 = $('#div1').attr('data-test',
            'aString: invalidEntry: "http://www.example.com", aNumber: 3456, aBoolean: false');
        div1.test({aNumber: 2345});
        deepEqual(div1.test('option'), {
                aString: 'String value',
                aNumber: 2345,
                aBoolean: true
            }, 'Inline metadata not used');
    });
    test('Methods', function () {
        expect(6);
        $.JQPlugin.createPlugin({
            name: 'test',
            chained: function(elem) {
                $(elem).data('success', true);
            },
            unchained: function(elem, value) {
                return 'success ' + value;
            },
            _private: function() {
                fail('Shouldn\'t be called!');
            }
        });
        var divs = $('div').test();
        equal(divs.data('success'), undefined, 'No success initially');
        equal(divs.test('chained'), divs, 'Normal method returns jQuery object');
        equal(divs.data('success'), true, 'Success after method call');
        equal(divs.test('unchained', 'again'), 'success again', 'Getter method returns value');
        try {
            divs.test('unknown');
            fail('Unknown method succeeded');
        } catch (e) {
            equal(e, 'Unknown method: unknown', 'Unknown method should fail with error');
        }
        try {
            divs.test('_private');
            fail('Private method succeeded');
        } catch (e) {
            equal(e, 'Unknown method: _private', 'Private method should fail with error');
        }
    });
    test('Destroy', function () {
        expect(6);
        $.JQPlugin.createPlugin({
            name: 'test',
            _postAttach: function(elem, inst) {
                elem.data('attached', true);
            },
            _preDestroy: function(elem, inst) {
                elem.removeData('attached');
            }
        });
        var div1 = $('#div1').test();
        ok(div1.hasClass('is-test'), 'Marker applied');
        ok(div1.data('test') !== undefined, 'Instance object saved');
        equal(div1.data('attached'), true, 'postAttach called');
        div1.test('destroy');
        ok(!div1.hasClass('is-test'), 'Marker removed');
        ok(div1.data('test') === undefined, 'Instance object removed');
        equal(div1.data('attached'), undefined, 'preDestroy called');
    });
    test('Inheritance', function () {
        expect(6);
        $.JQPlugin.createPlugin({
            name: 'test',
            _postAttach: function(elem, inst) {
                elem.data('parent', true);
            },
            _preDestroy: function(elem, inst) {
                elem.removeData('parent');
            }
        });
        $.JQPlugin.createPlugin('test', {
            name: 'test',
            _postAttach: function(elem, inst) {
                elem.data('child', true);
                this._super(arguments);
            }
        });
        var div1 = $('#div1').test();
        ok(div1.hasClass('is-test'), 'Marker applied');
        ok(div1.data('parent') === true, 'Parent method called');
        ok(div1.data('child') === true, 'Child method called');
        div1.test('destroy');
        ok(!div1.hasClass('is-test'), 'Marker removed');
        ok(div1.data('parent') === undefined, 'Inherited method called');
        ok(div1.data('child') === true, 'No child method to call');
    });
    test('Option Inheritance with differing names', function () {
        expect(3);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                option: 'option'
            }
        });
        $.JQPlugin.createPlugin('test', {
            name: 'test',
            defaultOptions: {
                option2: 'option2'
            }
        });
        var div1 = $('#div1').test();
        ok(div1.hasClass('is-test'), 'Marker applied');
        equal(div1.test('option', 'option'), 'option', 'Parent option available');
        equal(div1.test('option', 'option2'), 'option2', 'Child option available');
    });
    test('Option Inheritance with same names', function () {
        expect(2);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                option: 'option'
            }
        });
        $.JQPlugin.createPlugin('test', {
            name: 'test',
            defaultOptions: {
                option: 'option2'
            }
        });
        var div1 = $('#div1').test();
        ok(div1.hasClass('is-test'), 'Marker applied');
        equal(div1.test('option', 'option'), 'option2', 'Child option overrides parent option');
    });
	test('Options', function() {
		expect(16);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true,
                anArray: ['one', 'two'],
                anObject: {
                    subString: 'Inner value',
                    subNumber: 5678
                }
            }
        });
		var div1 = $('#div1').test();
		equal(div1.test('option', 'aString'), 'String value', 'String value initialised');
		equal(div1.test('option', 'aNumber'), 1234, 'Number value initialised');
		equal(div1.test('option', 'aBoolean'), true, 'Boolean value initialised');
		deepEqual(div1.test('option', 'anArray'), ['one', 'two'], 'Array value initialised');
		deepEqual(div1.test('option', 'anObject'), {subString: 'Inner value', subNumber: 5678},
			'Object value initialised');
		div1.test('option', 'aString', 'New value')
		equal(div1.test('option', 'aString'), 'New value', 'String value updated');
		equal(div1.test('option', 'aNumber'), 1234, 'Number value unchanged');
		equal(div1.test('option', 'aBoolean'), true, 'Boolean value unchanged');
		deepEqual(div1.test('option', 'anArray'), ['one', 'two'], 'Array value unchanged');
		deepEqual(div1.test('option', 'anObject'), {subString: 'Inner value', subNumber: 5678},
			'Object value unchanged');
		div1.test('option', {aNumber: 4321, anArray: []});
		equal(div1.test('option', 'aString'), 'New value', 'String value still updated');
		equal(div1.test('option', 'aNumber'), 4321, 'Number value updated');
		equal(div1.test('option', 'aBoolean'), true, 'Boolean value still unchanged');
		deepEqual(div1.test('option', 'anArray'), [], 'Array value updated');
		deepEqual(div1.test('option', 'anObject'), {subString: 'Inner value', subNumber: 5678},
			'Object value still unchanged');
		deepEqual(div1.test('option'), {
                aString: 'New value',
                aNumber: 4321,
                aBoolean: true,
                anArray: [],
                anObject: {
                    subString: 'Inner value',
                    subNumber: 5678
                }
            }, 'All options correct');
    });
	test('Regional options', function() {
		expect(2);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true
            },
			regionalOptions: {
				'': {
					aString: 'A string',
					altString: 'Alt string'
				},
				'xx': {
					aString: 'X xxxxxx',
					altString: 'Xxx xxxxxx'
				}
			}
        });
		var div1 = $('#div1').test();
		equal(div1.test('option', 'aString'), 'A string', 'Regional string value overrides');
		equal(div1.test('option', 'altString'), 'Alt string', 'Regional string value initialised');
    });
	test('Set defaults', function() {
		expect(2);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true
            }
        });
		var div1 = $('#div1').test();
		deepEqual(div1.test('option'), {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true
            }, 'Default options initialised');
		$.test.setDefaults({
                aString: 'Another string',
                aBoolean: false
            });
		var div2 = $('#div2').test();
		deepEqual(div2.test('option'), {
                aString: 'Another string',
                aNumber: 1234,
                aBoolean: false
            }, 'New default options initialised');
	});
	test('Initialise once', function() {
		expect(2);
        $.JQPlugin.createPlugin({
            name: 'test',
            defaultOptions: {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true
            }
        });
		var div1 = $('#div1').test();
		deepEqual(div1.test('option'), {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true
            }, 'Default options initialised');
		div1.test({
                aString: 'Another string',
                aBoolean: false
            });
		deepEqual(div1.test('option'), {
                aString: 'String value',
                aNumber: 1234,
                aBoolean: true
            }, 'Default options unchanged');
	});
})(jQuery);