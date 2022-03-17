# Postman API Testing with Wiremock

Below, is a guide to configuring a wiremock server to imitate a real api.
For this particular walkthrough; we're using the Prismic API as it's complicated enough to give a fair demonstration.

## Pre Requisites

- **Docker** - saves us having to install JRE for running wiremock locally.
- **Postman** - runs our api tests.

## Guide

### Running API Tests via Postman

1. First set your environment variables. You can copy `.dev.env` which has the variable names and assign them in `.env`.

```console
mv .dev.env .env
```

2. Run the app via `docker compose` to make sure it can start up okay.

```console
docker compose --profile app up --build
```

3. Import the collection at `postman/collections/wiremock_prismic_poc.postman_collection.json` into Postman. In the Postman UI it can be found above the navigation menu while collections are highlighted.

You can run the whole test collection by highlighting the imported collection and clicking the `Run` button which will be to the far right of the collection name.


### Mocking the Prismic API via Wiremock

1. In the docker compose file there are two services which are used for api testing; `app-test` and `wiremock`. To start these we can use;

```
docker compose --profile api-testing up --build
```

`app-test` runs the same image as `app` but has different environment variables and dependencies defined as the main app.

2. Now try running the Postman collection tests. Tests will be run when a single request is fired off from Postman too.
We can see that the request to the wiremock API failed because the stub doesn't exist.
So, we need to define the stub.

3. You could write these stubs manually (see [here](https://wiremock.org/docs/stubbing/)), but wiremock has a neat feature where you can record requests and auto generate the stubs ([docs](https://wiremock.org/docs/record-playback/)).

Let's start wiremock up on its own first.

```
docker compose run --service-ports -d --name wiremock wiremock
```

Now go to http://localhost:8080/__admin/recorder/.
The `Target URL` is the url of the actual API we want to mock. So, we can put our prismic endpoint here.
When we hit record; Wiremock will forward any requests to the target endpoint and return the response.
But record the request and response as a stub in wiremock.

4. So, the easiest way to do this would be pointing our real app towards wiremock.
Update the `PRISMIC_ENDPOINT` environment variable in `.env` to `http://wiremock:8080`.
Then start the app again.

```
docker compose --profile app up
```

Now run the postman api tests again and they should pass.
In the browser stop the recording in wiremock.
It should report that 4 stubs were captured, one for each request made to the Prismic API.
You can find them at `wiremock/mappings`.

An issue here is that the stubs contain the access tokens as they're used to forward the real request.
So, there is some manual sanitisation on the files necessary (I'm looking into a nice work around for this).
You can safely rename the mapping files, the file names aren't important to wiremock.
For now, replace the access tokens in the stubbed files with the api testing access token `fake-api-token`.

5. Now we can run the api-testing app.
Let's make sure all api testing service are stopped.
The wiremock service from our recording will conflict on the port otherwise.

```console
docker compose --profile api-testing down 
```

```console
docker compose --profile api-testing up
```

Then run the tests in Postman again.
They should pass!
