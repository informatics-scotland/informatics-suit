#### Examples:

__1:__ Sample SpotfireWebPlayer

```jsx
  const SearchDocument = require( '../../src/api/SearchDocument').default;

  const docs = require('../sampleData/Documents').default;
  const doc = new SearchDocument(new Map(docs.spotfire.fields));
  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  const spotfireProps = {}
  spotfireProps.host =  doc.getFirstValue('spotfire.host');
  spotfireProps.loginUrl =  doc.getFirstValue('spotfire.login.url');
  spotfireProps.toolType =  doc.getFirstValue('suit.type');
  spotfireProps.startUpProperty = "";

  spotfireProps.file = '/Projects/Metadata Tools/Attivio Test Tool/Examples';
  spotfireProps.spotfireEntities = '{"attivioEntities":[{"type": "filter", "Filtering Scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}';

  <SpotfireWebPlayer {...spotfireProps} />
```

__2:__ SpotfireWebPlayer filtered using Parameters

```jsx
  const SearchDocument = require( '../../src/api/SearchDocument').default;

  const docs = require('../sampleData/Documents').default;
  const doc = new SearchDocument(new Map(docs.spotfire.fields));
  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  const spotfireProps = {}
  spotfireProps.host =  doc.getFirstValue('spotfire.host');
  spotfireProps.loginUrl =  doc.getFirstValue('spotfire.login.url');
  spotfireProps.toolType =  doc.getFirstValue('suit.type');
  spotfireProps.startUpProperty = "nothing";
  spotfireProps.filters = [{ table: 'Data Table (2)', column: 'attivio_DetectionMethod', values: ['tip'] }];

  spotfireProps.file = '/Projects/Metadata Tools/Attivio Test Tool/Examples';
  spotfireProps.spotfireEntities = '{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}';
    
  <SpotfireWebPlayer {...spotfireProps}/>
```

__3:__ SpotfireWebPlayer setting a run on open property (in this examples triggers a page move)

```jsx
  const SearchDocument = require( '../../src/api/SearchDocument').default;

  const docs = require('../sampleData/Documents').default;
  const doc = new SearchDocument(new Map(docs.spotfire.fields));
  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  const spotfireProps = {}
  spotfireProps.host =  doc.getFirstValue('spotfire.host');
  spotfireProps.loginUrl =  doc.getFirstValue('spotfire.login.url');
  spotfireProps.toolType =  doc.getFirstValue('suit.type');
  spotfireProps.startUpProperty = "attivioRunOnOpen";
  spotfireProps.filters = [{ table: 'Data Table (2)', column: 'attivio_DetectionMethod', values: ['tip'] }];

  spotfireProps.file = '/Projects/Metadata Tools/Attivio Test Tool/Examples';
  spotfireProps.spotfireEntities = '{"attivioEntities":[{"type": "filter", "Filtering Scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}';

  <SpotfireWebPlayer {...spotfireProps}/>
```

__4:__ SpotfireWebPlayer setting a property (in this examples triggers a page move from a custom property)

```jsx
  const SearchDocument = require( '../../src/api/SearchDocument').default;

  const docs = require('../sampleData/Documents').default;
  const doc = new SearchDocument(new Map(docs.spotfire.fields));
  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  const spotfireProps = {}
  spotfireProps.host =  doc.getFirstValue('spotfire.host');
  spotfireProps.loginUrl =  doc.getFirstValue('spotfire.login.url');
  spotfireProps.toolType =  doc.getFirstValue('suit.type');
  spotfireProps.filters = [{ table: 'Data Table (2)', column: 'attivio_DetectionMethod', values: ['tip'] }];
  spotfireProps.documentProperties = [{name: 'attivioTest', value: 'anything'}];

  spotfireProps.file = '/Projects/Metadata Tools/Attivio Test Tool/Examples';
  spotfireProps.spotfireEntities = '{"attivioEntities":[{"type": "filter", "Filtering Scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}';

  <SpotfireWebPlayer {...spotfireProps}/>
```
