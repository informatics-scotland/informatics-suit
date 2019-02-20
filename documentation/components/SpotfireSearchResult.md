__1:__ SpotfireWebPlayer as part of a search result.

If the `suit.type` field is `spotfire`, the `SearchResult` should render as a Spotfire Web Player:

```jsx
  const docs = require('../sampleData/Documents').default;

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  docs.spotfire.fields.set('suitSpotfireFileField', 'spotfire.file');
  docs.spotfire.fields.set('suitSpotfireHost', 'spotfire.host');
  docs.spotfire.fields.set('suitSpotfireLoginUrl', 'spotfire.login.url');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.signal.query = "";

  const { StaticRouter } = require('react-router-dom');
  <StaticRouter context={{}}>
    <SpotfireSearchResult document={docs.spotfire} position={1} showRatings={true} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
        ])} />
  </StaticRouter>

```

__2:__ SpotfireWebPlayer as a SearchResult but with filters from the Document

```jsx
  const docs = require('../sampleData/Documents').default;

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.signal.query = "DetectionMethod:tip";

  const { StaticRouter } = require('react-router-dom');
  <StaticRouter context={{}}>
    <SpotfireSearchResult document={docs.spotfire} position={1} showRatings={true}  entityFields={
        new Map([
          ['DetectionMethod', 'DetectionMethod'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
        ])}/>
  </StaticRouter>
```

__3:__ SpotfireWebPlayer as a SearchResult but with filters not matching an entity

```jsx
  const docs = require('../sampleData/Documents').default;

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.signal.query = "accident";

  const { StaticRouter } = require('react-router-dom');
  <StaticRouter context={{}}>
    <SpotfireSearchResult document={docs.spotfire} position={1} showRatings={true} entityFields={
        new Map([
          ['DetectionMethod', 'DetectionMethod'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
        ])}/>
  </StaticRouter>
```