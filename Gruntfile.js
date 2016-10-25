'use strict';

module.exports = function (grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var config = {
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			build: ['dist/*', 'doc/*', 'report/*', 'temp/*'],
			tests: ['test/*.min.tests.html']
		},
		copy: {
			dist: {
				files: [
					{
						expand: true,
						cwd: 'src',
						src: ['*.html', 'css/*.*', 'img/*.*', 'js/*.*'],
						dest: 'dist'
					}
				]
			}
		},
		jsdoc: {
			options: {
				destination: 'doc'
			},
			all: {
				src: ['src/js/*.js'],
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			all: ['src/js/*.js']
		},
		qunit: {
			options: {
				coverage: {
					disposeCollector: true,
					src: ['src/js/*.js', '!src/js/*-*.js'],
					instrumentedFiles: 'temp/',
					htmlReport: 'report/',
					linesThresholdPct: 95,
					statementsThresholdPct: 95,
					functionsThresholdPct: 95,
					branchesThresholdPct: 90
				}
			},
			all: ['test/*.html']
		},
		replace: {
			testmin: {
				src: ['test/plugin.tests.html'],
				dest: 'test/plugin.min.tests.html',
				replacements: [
					{
						from: /src\/js\/jquery\.(.*)\.js/g,
						to: 'dist/js/jquery.$1.min.js'
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
				files: [
					{
						expand: true,
						cwd: 'src/js',
						src: ['*.js', '!*-*.js'],
						dest: 'dist/js',
						ext: '.min.js',
						extDot: 'last'
					}
				]
			}
		}
	};
	
	grunt.initConfig(config);

	grunt.registerTask('default', [
		'clean:build',
		'jshint',
		'uglify',
		'test',
		'jsdoc',
		'dist'
	]);

	grunt.registerTask('dist', [
		'copy:dist'
	]);

	grunt.registerTask('test', [
		'replace',
		'qunit',
		'clean:tests'
	]);
};
