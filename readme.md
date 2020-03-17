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

**Install**

````sh
npm install coronavirus-tracker-cli -g
````

**Run command**

````sh
corona
````

**Top 10**

Note: This command will cause colored output to be discarded.

````sh
# Grep the rank of 10 and the 23 lines preceding it
corona | grep -B 23 ' 10  '
````

**Your country**

Note: These commands will cause colored output to be discarded.

- Replace the `US` part of the command with your country code.
- If you want to also see the `World` stats, replace the `3` with a `5`
````sh
# sed the first 3 (or 5) lines; your country; bottom table border
corona | sed -n '1,3p;/\(US\)/p;/╚═/p'
````

Or, get your country within context of your rank
````sh
# grep with 2 lines of context for each result
# output the 'World' stats and headers; the country stats; the bottom table border
corona | grep --color=none -C 2 -e 'World' -e '\(US\)' -e 'Stay'
````

### ToDos

* ~~Filter by country to get cases by local states.~~
* ~~Move from npm to curl~~
* ~~Add daily change.~~
* Add growth rate. (linear regression)
* Add latest updates from reddit / twitter.

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
