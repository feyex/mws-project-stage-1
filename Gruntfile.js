module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package-lock.json'),
        imagemin: {
            jpg: {
              options: {
                progressive: true
              },
              files: [
                {
                  expand: true,
                  cwd: 'img/',
                  src: ['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg'],
                  dest: 'imgs/',
                  ext: '.jpg'
                }
              ]
            }
        }
	});

    grunt.loadNpmTasks('grunt-contrib-imagemin');

}
