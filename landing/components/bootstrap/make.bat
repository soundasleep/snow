@echo off
rd build /s /q
mkdir build\img
mkdir build\css
mkdir build\js

copy img\* build\img

call lessc -x less\bootstrap.less > build\css\bootstrap.css
call lessc -x less\responsive.less > build\css\bootstrap-responsive.css

del js\bootstrap.js
copy /b js\*.js js\bootstrap.js

call .\node_modules\.bin\uglifyjs --ascii .\js\bootstrap.js > build\js\bootstrap.min.js
