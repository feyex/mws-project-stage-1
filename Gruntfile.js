module.exports = function(grunt) {
	grunt.initConfig({
    pkg: grunt.file.readJSON('package-lock.json'),
  //CLEAN: To delete everything from the image file
      clean:{
        dev: {
          src: ['dist/*'],
        }
      },
  //COPY: To move css, js, and unprocessed image files
      copy: {
        dev: {
          files: [
            {expand: true, cwd: 'app/', src:['sw.js'], dest: 'dist/'},
            {expand: true, cwd: 'app/', src:['css/*'], dest: 'dist/'},
            {expand: true, cwd: 'app/', src:['js/*'], dest: 'dist/'},
            {expand: true, cwd: 'app/', src:['img/fixed/*'], dest: 'dist/'},
          ]
        }
      },
  //STRING-REPLACE: To move my  MAP BOX API KEY from my html file to a folder that wont be accessible on github
      'string-replace':{
        dist: {
          files:[{expand: true, cwd: 'app/', src:['*.html'], dest: 'dist/'}],
          options: {
            replacements: [{
              pattern: '<API_KEY_HERE>',
              replaceent: '<%= grunt.file.read("GM_API_KEY") %>'
            }]
         }
        }
      },
  //IMAGEMIN: To minify my images.
        imagemin: {
            jpg: {
              options: {
                progressive: true
              },
              files: [
                {
                  expand: true,
                  cwd: 'app/img/',
                  src: ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg'],
                  dest: 'dist/img/',
                  ext: '.jpg'
                }
              ]
            }
        }
	});

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    grunt.registerTask('quick', ['copy', 'string-replace']);

  grunt.registerTask('default', ['clean', 'copy', 'string-replace',
    'contrib-imagemin']);

};
