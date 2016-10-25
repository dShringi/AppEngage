"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '../../.jshintrc' // The path is relative to Gruntfile
      },

      // when this task is run, lint the Gruntfile and all js files in src
      build: ['Grunfile.js', 'routes/events.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint'); // Loading the plugin

  grunt.registerTask('default', ['jshint']); // Registering the tasks

  grunt.option('force', true); // This will ignore warning and continue te builds
};
