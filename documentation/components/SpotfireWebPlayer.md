#### Examples:

__1:__ Sample SpotfireWebPlayer

```jsx

  const docs = require('../sampleData/Documents').default;

  docs.spotfire.fields.set('spotfireProps.startUpProperty', "nothing");
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {} 
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.spotfireEntitiesField = 'spotfire_entities';
  spotfireProps.generalFilterColumn = 'attivio_General_nometadata';

  <SpotfireWebPlayer document={docs.spotfire} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
        ])} {...spotfireProps}/>
```

__2:__ SpotfireWebPlayer filtered using Parameters

```jsx

  const docs = require('../sampleData/Documents').default;
  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  docs.spotfire.fields.set('spotfireEntitiesField', 'attivioEntities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.spotfireEntitiesField = 'spotfire_entities';
  spotfireProps.generalFilterColumn = 'attivio_General_nometadata';
  spotfireProps.startUpProperty = "nothing";
  spotfireProps.filters = [{ table: 'Data Table (2)', column: 'attivio_DetectionMethod', values: ['tip'] }];
    
  <SpotfireWebPlayer document={docs.spotfire} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
        ])} {...spotfireProps} />
```

__3:__ SpotfireWebPlayer filtered using a query (which matches an entity)

```jsx

  const docs = require('../sampleData/Documents').default;
  docs.spotfire.fields.set('spotfireEntitiesField', 'spotfire_entities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.spotfireEntitiesField = 'spotfire_entities';
  spotfireProps.generalFilterColumn = 'attivio_General_nometadata';
  spotfireProps.startUpProperty = "nothing";
  spotfireProps.query = "attivio_DetectionMethod:tip";
    
  <SpotfireWebPlayer document={docs.spotfire} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
          ['DetectionMethod', 'DetectionMethod'],
        ])} {...spotfireProps} />
```


__4:__ SpotfireWebPlayer filtered using a generic non entity matched query

```jsx

  const docs = require('../sampleData/Documents').default;
  docs.spotfire.fields.set('spotfireEntitiesField', 'spotfire_entities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_General_nometadata"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.spotfireEntitiesField = 'spotfire_entities';
  spotfireProps.generalFilterColumn = 'attivio_General_nometadata';
  spotfireProps.startUpProperty = "nothing";
  spotfireProps.query = "accident";
    
  <SpotfireWebPlayer document={docs.spotfire} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
          ['DetectionMethod', 'DetectionMethod'],
        ])} {...spotfireProps} />
```

__5:__ SpotfireWebPlayer setting a run on open property (in this example this triggers a page move)

```jsx
  const docs = require('../sampleData/Documents').default;
  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  docs.spotfire.fields.set('spotfireEntitiesField', 'spotfire_entities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.spotfireEntitiesField = 'spotfire_entities';
  spotfireProps.generalFilterColumn = 'attivio_General_nometadata';
  spotfireProps.startUpProperty = "attivioRunOnOpen";
  spotfireProps.filters = [{ table: 'Data Table (2)', column: 'attivio_DetectionMethod', values: ['tip'] }];

  <SpotfireWebPlayer document={docs.spotfire} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
        ])} {...spotfireProps}/>
```

__6:__ SpotfireWebPlayer setting a property (in this example this triggers a page move from a custom property)

```jsx
  const docs = require('../sampleData/Documents').default;
  docs.spotfire.fields.set('spotfireEntitiesField', 'attivioEntities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.spotfireEntitiesField = 'attivioEntities';
  spotfireProps.generalFilterColumn = 'attivio_General_nometadata';
  spotfireProps.startUpProperty = "nothing";
  spotfireProps.filters = [{ table: 'Data Table (2)', column: 'attivio_DetectionMethod', values: ['tip'] }];
  spotfireProps.documentProperties = [{name: 'attivioTest', value: 'anything'}];

  <SpotfireWebPlayer document={docs.spotfire} {...spotfireProps}/>
```
