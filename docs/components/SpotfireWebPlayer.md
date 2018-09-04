#### Examples:

__1:__ Sample SpotfireWebPlayer

```jsx
  <SpotfireWebPlayer />
```

__2:__ SpotfireWebPlayer filtered using Parameters

```jsx
  const filter = { table: 'Data Table (2)', column: 'Detection Method', values: ['Tip'] };
  <SpotfireWebPlayer filters={[filter]}/>
```

__3:__ SpotfireWebPlayer as part of a search result.

If the `pki.suit.type` field is `spotfire`, the `SearchResult` should render as a Spotfire Web Player:

```jsx
  const docs = require('../sampleData/Documents').default;

  const { StaticRouter } = require('react-router-dom');
  <StaticRouter context={{}}>
    <SearchResult document={docs.spotfire} position={1} />
  </StaticRouter>

```

__4:__ SpotfireWebPlayer as a SearchResult but with filters from the Document

```jsx
    const SearchDocument = require( '../../src/api/SearchDocument').default;

    const docs = require('../sampleData/Documents').default;
    const spotfireDoc = new SearchDocument(new Map(docs.spotfire.fields));
    spotfireDoc.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "filter", "filterScheme": "Filtering scheme", "tableName": "Data Table (2)", "columnName": "Detection Method"}]}']);

    const { StaticRouter } = require('react-router-dom');

    <StaticRouter context={{}}>
      <SearchResult document={spotfireDoc} position={1} />
    </StaticRouter>
```

__5:__ SpotfireWebPlayer as a SearchResult but with document properties from the Document

```jsx
    const SearchDocument = require( '../../src/api/SearchDocument').default;

    const docs = require('../sampleData/Documents').default;
    const spotfireDoc = new SearchDocument(new Map(docs.spotfire.fields));
    spotfireDoc.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "property", "propertyName": "attivioTest"}]}']);

    const { StaticRouter } = require('react-router-dom');

    <StaticRouter context={{}}>
      <SearchResult document={spotfireDoc} position={1} />
    </StaticRouter>
```

__6:__ SpotfireWebPlayer as a SearchResult butusing the default run at start attivio document property

```jsx
    const SearchDocument = require( '../../src/api/SearchDocument').default;

    const docs = require('../sampleData/Documents').default;
    const spotfireDoc = new SearchDocument(new Map(docs.spotfire.fields));
    spotfireDoc.fields.set('spotfire_entities', ['{"attivioEntities":[{"type": "property", "propertyName": "attivioRunOnOpen"}]}']);

    const { StaticRouter } = require('react-router-dom');

    <StaticRouter context={{}}>
      <SearchResult document={spotfireDoc} position={1} />
    </StaticRouter>
```
