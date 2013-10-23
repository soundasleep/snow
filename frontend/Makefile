PATH := node_modules/.bin:bin:$(PATH)

all: dist public

HEAD = \
    vendor/modernizr.js \
    vendor/raven.min.js

VENDOR = \
	bower_components/jquery/jquery.min.js \
	vendor/jquery.cookie.js \
	vendor/sjcl.js \
	bower_components/alertify/alertify.min.js \
	vendor/bootstrap/js/bootstrap.min.js \
	vendor/highstock.js

VENDOR_CSS = \
	bower_components/alertify/themes/alertify.core.css \
	bower_components/alertify/themes/alertify.bootstrap.css \
	vendor/bootstrap/css/bootstrap.min.css

clean:
	@rm -rf dist public

tmp-directory:
	@mkdir -p tmp

public: \
	clean \
	public-directory \
	public/app.js \
	public/styles.css \
	public/vendor.js \
	public/head.js \
	public/index.html \
	public/img

public/img:
	echo $@
	mkdir -p $@
	cp -fr assets/img/* public/img

public-directory:
	@mkdir -p public

public/app.js:
	@browserify ./index.js --debug --transform ./node_modules/browserify-ejs --outfile $@

public/head.js: $(HEAD)
	@cat $^ > $@

public/vendor.js: $(VENDOR)
	@cat $^ > $@

public/styles.css:
	@(cat $(VENDOR_CSS); stylus < index.styl) > $@

public/index.html:
	node compile-ejs.js > $@

dist: \
	dist-directory \
	dist/app.js \
	dist/styles.css \
	dist/vendor.js \
	dist/head.js \
	dist/index.html \
	dist/img

dist/img:
	@mkdir -p $@
	@cp -fr assets/img/* dist/img

dist-directory:
	@mkdir -p dist

dist/img:
	@mkdir -p $@
	@cp -fr assets/img/* dist/img

dist/app.js:
	@browserify ./index.js --transform ./node_modules/browserify-ejs --outfile $@

dist/head.js: $(HEAD)
	@cat $^ > $@

dist/vendor.js: $(VENDOR)
	@uglifyjs $^ --compress > $@ 2>/dev/null

tmp/styles.css: $(VENDOR_CSS) tmp-directory
	@(cat $(VENDOR_CSS); stylus < index.styl) > $@

dist/styles.css: tmp/styles.css
	@cleancss tmp/styles.css --output $@

dist/index.html:
	@node compile-ejs.js > $@
