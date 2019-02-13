#### Examples:

__1:__ Sample SpotfireWebPlayer

```jsx

  const docs = require('../sampleData/Documents').default;
  //docs.spotfire.fields.set('spotfireProps.startUpProperty', "nothing");
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  //docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {} 
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.generalFilterColumn = 'General_nometadata';

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
  //docs.spotfire.fields.set('spotfireEntitiesField', 'attivioEntities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  //docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.generalFilterColumn = 'General_nometadata';
  spotfireProps.startUpProperty = "attivioConfiguration";
  spotfireProps.spotfireEntities = {"DetectionMethod":"tip"};
    
  <SpotfireWebPlayer document={docs.spotfire} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
          ['DetectionMethod', 'DetectionMethod'],
        ])} {...spotfireProps} />
```

__3:__ SpotfireWebPlayer filtered using a query (which matches an entity)

```jsx

  const docs = require('../sampleData/Documents').default;
  docs.spotfire.fields.set('spotfireEntitiesField', 'spotfireEntities');
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  //docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.generalFilterColumn = 'General_nometadata';
  spotfireProps.startUpProperty = "attivioConfiguration";
  spotfireProps.query = "DetectionMethod:tip";
    
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
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  //docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_General_nometadata"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.generalFilterColumn = 'General_nometadata';
  spotfireProps.startUpProperty = "attivioConfiguration";
  spotfireProps.query = "accident";
    
  <SpotfireWebPlayer document={docs.spotfire} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
          ['DetectionMethod', 'DetectionMethod'],
        ])} {...spotfireProps} />
```

__5:__ SpotfireWebPlayer setting a property (in this example this triggers a page move from a custom property)

```jsx
  const docs = require('../sampleData/Documents').default;
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  //docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.generalFilterColumn = 'General_nometadata';
  spotfireProps.startUpProperty = "attivioConfiguration";
  spotfireProps.spotfireEntities = {"DetectionMethod":"tip", "General":"dslfjsldkjf"};

  <SpotfireWebPlayer document={docs.spotfire} {...spotfireProps}/>
```

__6:__ SpotfireWebPlayer set property using a generic non entity matched query

```jsx

  const docs = require('../sampleData/Documents').default;
  docs.spotfire.fields.set('spotfire.file',['/Projects/Metadata Tools/Attivio Test Tool/Examples']);
  //docs.spotfire.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_DetectionMethod"},{"type": "filter", "Filtering scheme": "attivio", "tableName": "Data Table (2)", "columnName": "attivio_General_nometadata"},{"type": "property", "propertyName": "attivioUri"},{"type": "property", "propertyName": "attivioRunOnOpen"},{"type": "property", "propertyName": "attivioKeywords"},{"type": "property", "propertyName": "attivioGeneral"}]}']);

  // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
  // NOTE these would normally come from your configuration.properties.js
  const spotfireProps = {}
  spotfireProps.host =  docs.spotfire.getFirstValue('host');
  spotfireProps.loginUrl = docs.spotfire.getFirstValue('login.url');
  spotfireProps.toolType = docs.spotfire.getFirstValue('suit.type');
  spotfireProps.suitSpotfireIdField = 'spotfire.id.field';
  spotfireProps.suitSpotfireFile = 'spotfire.file';
  spotfireProps.generalFilterColumn = 'nothing';
  spotfireProps.generalPropertyName = 'Test';
  spotfireProps.startUpProperty = "attivioConfiguration";
  spotfireProps.query = "accident";
    
  <SpotfireWebPlayer document={docs.spotfire} entityFields={
       new Map([
          ['Catchment', 'Catchment'],
          ['Licence', 'Licence'],
          ['keyphrases', 'Key Phrases'],
          ['DetectionMethod', 'DetectionMethod'],
        ])} {...spotfireProps} />
```
