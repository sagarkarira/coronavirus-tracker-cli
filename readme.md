# coronavirus-tracker-cli

Track The Corona virus from your CLI

## Screenshot

<img src="https://i.ibb.co/cxJkRHf/screenshot.png" width="960" height="720">

## CURL

### Complete Data

````sh
curl https://corona-stats.online/
````

### Filter by Country Stats

````sh
curl https://corona-stats.online/<country>
````

where <country> can be country name or its ISO code.

- US: ```curl https://corona-stats.online/US```
- Italy: ```curl https://corona-stats.online/Italy```
- UK: ```curl https://corona-stats.online/UK``` or ```curl https://corona-stats.online/GB```


## API

Add `?format=json` at the end of any API to get json formatted data.

**Example:**

````sh
curl https://corona-stats.online?format=json
````

## Local Command (For coloured ouput)

We recommend NodeJS version 12 which you can download [here](https://nodejs.org/en/download/).

**Install**

````sh
npm install coronavirus-tracker-cli -g
````

**Run command**

````sh
corona
````

**With emojis**

````sh
corona --emojis
````

**Filter by country**

````sh
corona italy
````

**Disable colors**

````sh
corona --color=false
````

**Top 10** (Working on native command)

Note: This command will cause colored output to be discarded.

````sh
# Grep the rank of 10 and the 23 lines preceding it
corona | grep -B 23 ' 10  '
````

### ToDos

* ~~Filter by country to get cases by local states.~~
* ~~Move from npm to curl~~
* ~~Add daily change.~~
* Add growth rate. (linear regression)
* Add latest updates from reddit / twitter.

### Contributors

```
 project  : curl-corona
 lines    :     2837
 authors  :
 2479 Sagar Karira              87.4%
  293 Alexandra Parker          10.3%
   30 Lucas Fernandez Nicolau   1.1%
   25 Shelton Koskie            0.9%
    6 Mo'men Tawfik             0.2%
    3 XhmikosR                  0.1%
    1 CyberDracula              0.0%
```

### Other Regional Trackers.

* [Italy](http://opendatadpc.maps.arcgis.com/apps/opsdashboard/index.html#/b0c68bce2cce478eaac82fe38d4138b1)
* [India](https://www.covid19india.org/)
* [USA](https://www.npr.org/sections/health-shots/2020/03/16/816707182/map-tracking-the-spread-of-the-coronavirus-in-the-u-s)
* [France](https://veille-coronavirus.fr/)
* [Japan](https://covid19japan.com/)


### Thanks to

* [CSSEGISandData](https://github.com/CSSEGISandData/COVID-19) for the data.
* [ExpDev07](https://github.com/ExpDev07/coronavirus-tracker-api) for the api.
* [Zeit Now](https://github.com/zeit/now) for hosting.

### Related Projects

* https://github.com/NovelCOVID/API
* https://github.com/javieraviles/covidAPI
* https://github.com/mathdroid/covid-19-api

## License

[WTFPL](http://www.wtfpl.net/)
