var config = require('konfu')

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:mm") %> */\n'
            },
            main: {
                src: 'landing.js',
                dest: 'build/<%= pkg.name %>.min.js'
            },
            vendor: {
                src: ['bower_components/jquery/jquery.min.js', 'vendor/highstock.js'],
                dest: 'build/vendor.min.js'
            }
        },
        stylus: {
            compile: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd HH:mm") %> */\n',
                    'include css': true
                },
                files: {
                    'build/styles.min.css': ['index.styl']
                }
            }
        },
        ejs: {
            options: {
                segment: config.segment
            },
            'en-US': {
                src: 'index.en-US.ejs',
                dest: 'public/index.html'
            },
            'nb-NO': {
                src: 'index.nb-NO.ejs',
                dest: 'public/index.no.html'
            }
        },
        img: {
            all: {
                src: ['assets/*.png', 'assets/*.jpg'],
                dest: 'public'
            }
        }
    })

    grunt.loadNpmTasks('grunt-img')
    grunt.loadNpmTasks('grunt-bower-task')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-stylus')
    grunt.loadNpmTasks('grunt-ejs')
    grunt.registerTask('default', ['bower', 'uglify', 'stylus', 'ejs', 'img'])
}
