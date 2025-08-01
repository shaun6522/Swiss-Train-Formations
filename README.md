# Swiss Train Formations
This is a website to allow you to find the formations of Swiss rail services. It is intended to be used by those looking for specific vehicles as opposed to providing general purpose information.

**Link:** https://swiss-train-formations.onrender.com/

## Usage

To search for a train, use the form on the home page. To view recent search history, use the 'Recent Searches' page.

## Data source

The data for the site comes from the [Train Formation Service](https://data.opentransportdata.swiss/dataset/formations) provided by https://opentransportdata.swiss/.

## Limitations

- The API only provides formations for train services from the current date up to two days in the future.
- Not all services/operators are available - only some non-Swiss vehicles and international trains are supported
- It is not possible to search by specific vehicle number (work in progress)
- The API only allows up to 5 queries per minute, so I cache the searches

## Cloning this repo

If you would like to run this yourself, you will need to specify the following in .env:
- OTD_VEHICLE_ENDPOINT, OTD_AUTH = your own OpenTransportData API key
- DB_URI = a link to a MongoDB database
- X509_CRED = a link to your local X509 credential file

Optional:
- PROXY_COUNT = how many proxies your server uses