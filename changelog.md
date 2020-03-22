# Changelog

## Version 0.8.0

* Added confirmed cases graphs ``corona -g`` or ``corona italy -g`

## Version 0.7.0

* Added new source to fetch realtime data. ``corona --source=2``
* Code refactored and some bug fixes.

## Version 0.6.0

* Added filter to show top N countries. ``corona --top=20``

## Version 0.5.0

* Added minimal / comapct table command. ``corona --minimal``
* Added world total stats at the bottom of the table too.
* Refactor: moved table formatting functions to helpers.
* Added total stats object when using `?format=json`

## Version 0.4.0

* Added country filter. Ex:  ``corona Italy``
* Added command to show emojis. Ex: ``corona --emojis``
* Added command to disable colors using. Ex: ``corona --color=false``

## Version 0.2.0

* Added daily and weekly column.

## Version 0.1.0

* Lauched command `corona`