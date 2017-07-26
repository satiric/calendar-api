# vlife2

a [Sails](http://sailsjs.org) application

# Installation

1. Clone repository:
~~~
git clone git@gitlab.cleveroad.com:commercial/vlife/vlife-web-backend.git
~~~

2. Install dependencies in the root folder of project:
~~~
$: npm i
~~~
3. Create vlife db with utf8_general_ci encoding.
4. The local.js file contain configs for your local settings and has priority over other configs.
Also, local.js file added to .gitignore, so next step is prepare the local.js file.
Open ~/config folder, rename local.js.example to local.js and put your configs for db.<br>
   Note that DB on this point must be empty.
5. Install sails-migrations with flag -g:
~~~
$: npm i sails-migrations -g
~~~
OR: use ~/node_modules/sails-migrations/bin/cli.js locally<br />
Actually, you have to execute next command:
~~~
$: sails-migrations migrate
~~~
OR
~~~
$: node node_modules/sails-migrations/bin/cli.js migrate
~~~
6. Install sails with flag -g:
~~~
$: npm i sails -g
~~~
OR use ~/node_modules/sails/bin/sails.js locally<br />
Actually, you have to execute next command:
~~~
$: sails l
~~~
OR
~~~
$: node node_modules/sails/bin/sails.js l
~~~
Note that for keeping server alive you should use <a href=http://pm2.keymetrics.io/>PM2</a> or another node proccess manager

# Requirements
Must be pre installed:
- node v6.10.3 or v8.1.0 (both was tested)
- mysql
Optional:
- pm2