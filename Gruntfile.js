'use strict';

module.exports = function (grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var config = {
		clean: {
			build: {
				files: [
					{
						dot: true,
						src: ['dist/*', '!dist/.git', 'doc/*']
					}
				]
			},
			tests: {
				files: [
					{
						dot: true,
						src: ['test/*.min.tests.html']
					}
				]
			}
		},
		jsdoc: {
			options: {
				destination: 'doc'
			},
			all: {
				src: ['src/js/jquery.*.js'],
			}
		},
		jshint: {
			all: ['src/js/jquery.*.js']
		},
		qunit: {
			all: ['test/**/*.html']
		},
		replace: {
			mintest: {
				src: ['test/plugin.tests.html'],
				dest: 'test/plugin.min.tests.html',
				replacements: [
				    {
						from: /src\/js\/jquery\.(.*)\.js/g,
						to: 'dist/jquery.$1.min.js'
					}
				]
			}
		},
		uglify: {
			options: {
				preserveComments: 'some',
				sourceMap: true
			},
			plugin: {
				files: {
					'dist/jquery.plugin.min.js': ['src/js/jquery.plugin.js']
				}
			}
		}
	};
	
	grunt.initConfig(config);

	grunt.registerTask('test', [
		'replace',
		'qunit',
		'clean:tests'
	]);

	grunt.registerTask('build', [
		'clean:build',
		'jshint',
		'uglify',
		'test',
		'jsdoc'
	]);
};
