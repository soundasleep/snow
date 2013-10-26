module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            development: 'public',
            production: 'dist'
        },

        copy: {
            development: {
                expand: true,
                cwd: 'assets',
                src: 'img/**',
                dest: 'public',
                filter: 'isFile'
            },

            production: {
                expand: true,
                cwd: 'assets',
                src: 'img/**',
                dest: 'dist',
                filter: 'isFile'
            }
        },

        ejs: {
            options: {
                segment: process.env.SEGMENT
            },

            'index.html': {
                src: 'index.ejs',
                dest: 'public/index.html'
            }
        },

        stylus: {
            development: {
                files: {
                    'public/app.css': 'index.styl'
                }
            }
        },

        concat: {
            development_js: {
                options: {
                    separator: ';'
                },

                files: {
                    'public/head.js': [
                        'vendor/modernizr-2.6.2.js'
                    ],
                    'public/vendor.js': [
                        'vendor/jquery-*.js',
                        'vendor/jquery.cookie-*.js',
                        'vendor/sjcl.js',
                        'vendor/highstock.js',
                        'vendor/alertify/lib/alertify.js',
                        'vendor/bootstrap/js/bootstrap.js'
                    ]
                }
            },

            development_css: {
                options: {
                    separator: ';'
                },

                files: {
                    'public/vendor.css': [
                        'vendor/bootstrap/css/bootstrap.css',
                        'vendor/alertify/themes/alertify.core.css',
                        'vendor/alertify/themes/alertify.bootstrap.css'
                    ]
                }
            }
        },

        browserify: {
            options: {
                detectGlobals: false,
                transform: ['browserify-ejs']
            },

            development: {
                options: {
                    debug: true
                },

                files: {
                    'public/app.js': 'index.js'
                }
            },

            production: {
                files: {
                    'dist/app.js': 'index.js'
                }
            }
        },

        uglify: {
            libraries: {
                files: {
                    'dist/head.js': ['vendor/raven-*.js', 'public/head.js'],
                    'dist/vendor.js': 'public/vendor.js'
                }
            },

            application: {
                options: {
                    beautify: true
                },

                files: {
                    'dist/app.js': 'dist/app.js'
                }
            }
        },

        htmlmin: {
            options: {
                collapseWhitespace: true
            },

            production: {
                files: {
                    'dist/index.html': 'public/index.html'
                }
            }
        },

        cssmin: {
            production: {
                files: {
                    'dist/app.css': 'public/app.css',
                    'dist/vendor.css': 'public/vendor.css'
                }
            }
        },

        connect: {
            development: {
                options: {
                    hostname: 'localhost',
                    port: 5072,
                    base: 'public',
                    open: false,
                    keepalive: true,
                    middleware: function(connect, options) {
                        var proxy = require('http-proxy').createServer(function(req, res, proxy) {
                            if (req.url.match(/^\/api\//)) {
                                // remove /api prefix
                                req.url = req.url.substr(4)
                                return proxy.proxyRequest(req, res, {
                                    host: 'localhost',
                                    port: 5071
                                })
                            }

                            proxy.proxyRequest(req, res, {
                                host: 'localhost',
                                port: 5072
                            })
                        })

                        proxy.listen(5073)

                        return [
                            function(req, res, next) {
                                next()
                            },

                            connect['static'](options.base)
                        ]
                    }
                }
            }
        },

        watch: {
            gruntfile: {
                files: ['Gruntfile.js'],
                tasks: ['stylus', 'browserify:development']
            },

            styles: {
                files: ['modules/**/*.styl', 'assets/**/*.styl'],
                tasks: 'stylus'
            },

            modules: {
                files: ['modules/**/*', 'i18n/**/*.json', 'helpers/**/*'],
                tasks: 'browserify:development'
            },

            livereload: {
                options: {
                    livereload: true
                },

                files: [
                    'public/*.js',
                    'public/*.css'
                ]
            }
        },

        concurrent: {
            options: {
                logConcurrentOutput: true
            },

            serve: ['watch', 'connect:development']
        }
    })

    grunt.loadNpmTasks('grunt-browserify')
    grunt.loadNpmTasks('grunt-concurrent')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-connect')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-contrib-htmlmin')
    grunt.loadNpmTasks('grunt-contrib-stylus')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-ejs')

    grunt.registerTask('development', [
        'ejs',
        'copy:development',
        'stylus',
        'concat',
        'browserify:development'
    ])

    grunt.registerTask('production', [
        'ejs',
        'copy:production',
        'stylus',
        'concat',
        'browserify:production',
        'uglify',
        'htmlmin',
        'cssmin'
    ])

    grunt.registerTask('serve', ['development', 'concurrent:serve'])
    grunt.registerTask('default', ['development'])
}
