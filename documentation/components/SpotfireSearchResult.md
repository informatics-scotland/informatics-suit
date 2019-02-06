__1:__ SpotfireWebPlayer as part of a search result.

If the `suit.type` field is `spotfire`, the `SearchResult` should render as a Spotfire Web Player:

```jsx
  const docs = require('../sampleData/Documents').default;

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  docs.spotfire.fields.set('suitSpotfireIdField', 'spotfire.id.field');
  docs.spotfire.fields.set('suitSpotfireFileField', 'spotfire.file');
  docs.spotfire.fields.set('suitSpotfireHost', 'spotfire.host');
  docs.spotfire.fields.set('suitSpotfireLoginUrl', 'spotfire.login.url');
  docs.spotfire.fields.set('spotfireEntitiesField', 'spotfire_entities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

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
  docs.spotfire.fields.set('spotfireEntitiesField', 'attivioEntities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);
  docs.spotfire.signal.query = "DetectionMethod:Tip"

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

__3:__ SpotfireWebPlayer as a SearchResult but with filters from the Document and a start up property

```jsx
  const docs = require('../sampleData/Documents').default;

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  docs.spotfire.fields.set('spotfireEntitiesField', 'attivioEntities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);
  docs.spotfire.signal.query = "DetectionMethod:Tip"

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

__4:__ SpotfireWebPlayer as a SearchResult but with triggering a property from a query

```jsx
  const docs = require('../sampleData/Documents').default;

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  docs.spotfire.fields.set('spotfireEntitiesField', 'attivioEntities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioTest"}]}']);
  docs.spotfire.signal.query = "attivioTest:anything";

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