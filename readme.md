# coronavirus-tracker-cli

Track The Corona virus from your CLI

## Screenshot

<img src="https://i.ibb.co/cxJkRHf/screenshot.png" width="960" height="720">

## CURL

### Complete Data

```sh
curl https://corona-stats.online
```

### Filter by Country Stats

```sh
curl https://corona-stats.online/<country>
```

where \<country\> can be country name or its ISO code.

* US: `curl https://corona-stats.online/US`
* Italy: `curl https://corona-stats.online/Italy`
* UK: `curl https://corona-stats.online/UK` or `curl https://corona-stats.online/GB`

**Minimal Compact Table**

```sh
curl https://corona-stats.online?minimal=true
```

**Only show top N countries**

```sh
curl https://corona-stats.online?top=20
```

**Latest News (Work in Progress)**

```sh
curl https://corona-stats.online/updates
```

## API

Add `?format=json` at the end of any API to get JSON formatted data.

**Example:**

```sh
curl https://corona-stats.online?format=json
```

## Local Command (For coloured output)

**Install**

```sh
npm install coronavirus-tracker-cli -g
```

**Run command**

```sh
corona
```

**Filter by country**

```sh
corona italy
```

**Top N countries**

```sh
corona --top=10
```

**With emojis**

```sh
corona --emojis
```

**Minimal Compact Table**

```sh
corona --minimal
```

**Disable colors**

```sh
corona --color=false
```

## ToDos

* ~~Filter by country to get cases by local states.~~
* ~~Move from npm to curl~~
* ~~Add daily change.~~
* Add growth rate. (linear regression)
* Add latest updates from reddit / twitter.

## Contributors

```
 project  : curl-corona
 lines    :     2984
 authors  :
 2617 Sagar Karira              87.7%
  283 Alexandra Parker          9.5%
   29 Lucas Fernandez Nicolau   1.0%
   25 Shelton Koskie            0.8%
   21 Daniel S                  0.7%
    4 Mo'men Tawfik             0.1%
    3 XhmikosR                  0.1%
    1 Greg Myers                0.0%
    1 CyberDracula              0.0%
```

## Other Regional Trackers.

* [Italy](https://opendatadpc.maps.arcgis.com/apps/opsdashboard/index.html#/b0c68bce2cce478eaac82fe38d4138b1)
* [India](https://www.covid19india.org/)
* [USA](https://www.npr.org/sections/health-shots/2020/03/16/816707182/map-tracking-the-spread-of-the-coronavirus-in-the-u-s)
* [France](https://veille-coronavirus.fr/)
* [Japan](https://covid19japan.com/)

## Thanks to

* [CSSEGISandData](https://github.com/CSSEGISandData/COVID-19) for the data.
* [ExpDev07](https://github.com/ExpDev07/coronavirus-tracker-api) for the API.
* [Zeit Now](https://github.com/zeit/now) for hosting.

## Related Projects

* <https://github.com/NovelCOVID/API>
* <https://github.com/javieraviles/covidAPI>
* <https://github.com/mathdroid/covid-19-api>

## License

[WTFPL](http://www.wtfpl.net/)
