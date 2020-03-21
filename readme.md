# coronavirus-tracker-cli [![Build Status](https://github.com/sagarkarira/coronavirus-tracker-cli/workflows/Tests/badge.svg)](https://github.com/sagarkarira/coronavirus-tracker-cli/actions?workflow=Tests)

Track The Corona virus from your CLI

## Screenshot

![Preview](./preview.png)

## CURL

### Complete Data

```sh
curl https://corona-stats.online
```

### Filter by Country Stats

```sh
curl https://corona-stats.online/<country>
```

where \<country\> can be a country name or its ISO code.

* US: `curl https://corona-stats.online/US`
* Italy: `curl https://corona-stats.online/Italy`
* UK: `curl https://corona-stats.online/UK` or `curl https://corona-stats.online/GB`

### Minimal Compact Table

```sh
curl https://corona-stats.online?minimal=true
```

### Only show top N countries

```sh
curl https://corona-stats.online?top=20
```
### Get realtime stats (NEW)

```sh
curl https://corona-stats.online?source=2
```

### Latest News (Work in Progress)

```sh
curl https://corona-stats.online/updates
```

## API

Add `?format=json` at the end of any API to get JSON formatted data.

### Example

```sh
curl https://corona-stats.online?format=json
```

## Local Command (For coloured output)

### Install

``` sh
npm install coronavirus-tracker-cli -g
```

### Run command

```sh
corona
```

### Filter by country

```sh
corona italy
```

### Get realtime stats (NEW)

```sh
corona --source=2
```

### Top N countries

```sh
corona --top=10
```

### With emojis

```sh
corona --emojis
```

### Set Minimal Compact Table

```sh
corona --minimal
```

### Disable colors

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

```text
 project  : curl-corona
 lines    :     3991
 authors  :
  3342 Sagar Karira             83.7%
  356 XhmikosR                  8.9%
  232 Alexandra Parker          5.8%
   26 Lucas Fernandez Nicolau   0.7%
   13 Daniel S                  0.3%
   10 Shelton Koskie            0.3%
    5 Sabu Siyad                0.1%
    4 Mo'men Tawfik             0.1%
    2 Steven                    0.1%
    1 Greg Myers                0.0%
```

## Other Regional Trackers

* [Italy](https://opendatadpc.maps.arcgis.com/apps/opsdashboard/index.html#/b0c68bce2cce478eaac82fe38d4138b1)
* [India](https://www.covid19india.org/)
* [USA](https://www.npr.org/sections/health-shots/2020/03/16/816707182/map-tracking-the-spread-of-the-coronavirus-in-the-u-s)
* [France](https://veille-coronavirus.fr/)
* [Japan](https://covid19japan.com/)
* [Philippines](https://ncovtracker.doh.gov.ph/)

## Thanks to

* [CSSEGISandData](https://github.com/CSSEGISandData/COVID-19) for the data.
* [ExpDev07](https://github.com/ExpDev07/coronavirus-tracker-api) for the API.
* [Zeit Now](https://github.com/zeit/now) for hosting.
* [https://github.com/NovelCOVID/API/](https://github.com/NovelCOVID/API/) for realtime stats API.

## Related Projects

* <https://github.com/NovelCOVID/API>
* <https://github.com/javieraviles/covidAPI>
* <https://github.com/mathdroid/covid-19-api>
* <https://github.com/warengonzaga/covid19-tracker-cli>
* <https://github.com/ahmadawais/corona-cli> 

## License

[WTFPL](http://www.wtfpl.net/)
