// @flow
import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import SearchDocument from '../api/SearchDocument';
import FieldNames from '../api/FieldNames';
import StringUtils from '../util/StringUtils';

import Card from './Card';
import DocumentType from './DocumentType';
import SpotfireWebPlayer from './SpotfireWebPlayer';
import StarRating from './StarRating';
import SearchResultTitle from './SearchResultTitle';
import SearchResultBody from './SearchResultBody';
import SearchResultTags from './SearchResultTags';
import TabPanel, { TabInfo } from './TabPanel';
import DocumentThumbnail from './DocumentThumbnail';
import RelevancyScore from './RelevancyScore';
import DocumentEntityList from './DocumentEntityList';
import Signals from '../api/Signals';
import PropTypes from 'prop-types';

const suitTypeField = 'suit.type';

type SearchResultProps = {
  /**
   * Optional. The location of the node through which to interact with Attivio.
   * Defaults to the value in the configuration.
   */
  baseUri: string;
  /** The document to be displayed. */
  document: SearchDocument;
  /** The document’s position in the search results. */
  position: number,
  /** The format to use when displaying the document’s contents. */
  format: 'list' | 'usercard' | 'doccard' | 'debug' | 'simple';
  /** Whether or not the documents’ relevancy scores should be displayed. Defaults to false. */
  showScores: boolean;
  /** A map of the field names to the label to use for any entity fields */
  entityFields: Map<string, string>;
  /** Whether tags should be shown in the UI or not. Defaults to true. */
  showTags: boolean;
  /** Whether star ratings should be shown in the UI or not. Defaults to true. */
  showRatings: boolean;
}

type SearchResultDefaultProps = {
  baseUri: string;
  format: 'list' | 'usercard' | 'doccard' | 'debug' | 'simple';
  showScores: boolean;
  entityFields: Map<string, string>;
  showTags: boolean;
  showRatings: boolean;
}

type SearchResultState = {
  currentTab: string;
};

/**
 * An individual search result.
 * If the format is "list," then the document should contain these fields:
 *  .id
 *  table
 *  title
 *  text
 *
 * If it's "simple," then these:
 *  .id
 *  table
 *  title
 *  text
 *
 * If it's "usercard," these:
 *
 * If it's "doccard," these:
 *
 * For debug, any and all fields in the document are shown.
 */
export default class SearchResult extends React.Component<SearchResultDefaultProps, SearchResultProps, SearchResultState> {
  static defaultProps = {
    baseUri: '',
    format: 'list',
    showScores: false,
    entityFields: new Map(),
    showTags: true,
    showRatings: true,
  };

  static contextTypes = {
    searcher: PropTypes.any,
  };

  static displayName = 'SearchResult';

  static getFirstDocumentType(list: Array<SearchDocument>): string {
    let result = '';
    if (list && list.length > 0) {
      result = list[0].getFirstValue('table');
    }
    return result;
  }

  static valueToDisplay(value: any) {
    if (typeof value === 'string') {
      return value;
    }
    const json = JSON.stringify(value, null, 2);
    if (json.startsWith('{')) {
      return <pre>{json}</pre>;
    }
    return <span>{json}</span>;
  }

  constructor(props: SearchResultProps) {
    super(props);
    this.state = {
      currentTab: SearchResult.getFirstDocumentType(props.document.children),
    };

    (this: any).tabChanged = this.tabChanged.bind(this);
    (this: any).rateDocument = this.rateDocument.bind(this);
  }

  state: SearchResultState;

  tabChanged(newTab: string) {
    this.setState({
      currentTab: newTab,
    });
  }

  rateDocument(doc: SearchDocument, rating: number) {
    if (doc.signal) {
      new Signals(this.props.baseUri).addSignal(doc, 'like', rating);
    }
  }

  renderListResult() {
    const doc = this.props.document;
    const docId = doc.getFirstValue('.id');
    const table = doc.getFirstValue('table');
    const thumbnailUri = doc.getFirstValue('thumbnailImageUri');
    const scoreString = doc.getFirstValue(FieldNames.SCORE);
    const score = scoreString ? parseFloat(scoreString) : 0;
    const scoreDescription = doc.getFirstValue(FieldNames.SCORE_EXPLAIN);
    const text = doc.getFirstValue('teaser');
    const moreLikeThisQuery = doc.getFirstValue('morelikethisquery');
    const docTags = doc.getAllValues('tags');

    let nestedDocs = null;
    if (doc.children && doc.children.length > 0) {
      const childMap: Map<string, Array<SearchDocument>> = new Map();
      doc.children.forEach((child) => {
        const childTable = child.getFirstValue('table');
        const tableDocs = childMap.get(childTable);
        if (tableDocs) {
          tableDocs.push(child);
        } else {
          const newTableDocs = [child];
          childMap.set(childTable, newTableDocs);
        }
      });
      const tabInfos = [];
      childMap.forEach((tableDocs, tabTable) => {
        const label = tableDocs.length === 1 ? `1 ${tabTable}` : `${tableDocs.length} ${tabTable}`;
        const docResults = tableDocs.map((tableDoc, index) => {
          const childPosition = index + 1;
          return (
            <SearchResult
              document={tableDoc}
              key={tableDoc.getFirstValue('.id')}
              position={childPosition}
              baseUri={this.props.baseUri}
            />
          );
        });
        const docResultsList = (
          <div className="attivio-nested-search-results">
            {docResults}
          </div>
        );
        tabInfos.push(new TabInfo(label, tabTable, docResultsList));
      });
      let tabLabel;
      if (doc.children.length === 1) {
        tabLabel = 'One Child Record:';
      } else {
        tabLabel = `${doc.children.length} Child Records:`;
      }
      nestedDocs = (
        <TabPanel
          tabInfos={tabInfos}
          activeTabId={this.state.currentTab}
          tabChanged={this.tabChanged}
          tabLabel={tabLabel}
          nested
        />
      );
    }

    return (
      <div className=" attivio-search-result">
        <div className="attivio-search-result-col">
          <DocumentType docType={table} position={this.props.position} />
          <DocumentThumbnail uri={thumbnailUri} />
          <dl className="attivio-labeldata-stacked attivio-labeldata-stacked-search-results">
            {this.props.showRatings ? (
              <div>
                <dt>Rating</dt>
                <dd>
                  <StarRating onRated={(rating) => { this.rateDocument(doc, rating); }} />
                </dd>
              </div>
            ) : null}
            {this.props.showScores ? <dt>Relevancy Score</dt> : ''}
            {this.props.showScores ? <dd><RelevancyScore score={score} explanation={scoreDescription} id={docId} /></dd> : ''}
          </dl>
        </div>
        <div className="attivio-search-result-content">
          <SearchResultTitle doc={doc} baseUri={this.props.baseUri} />
          <Row>
            <Col xs={7} sm={7}>
              <SearchResultBody body={text} />
              {this.props.showTags ? (
                <SearchResultTags tags={docTags} moreLikeThisQuery={moreLikeThisQuery} docId={docId} />
              ) : null}
            </Col>
            <Col xs={5} sm={5}>
              <DocumentEntityList doc={doc} entityFields={this.props.entityFields} />
            </Col>
          </Row>
        </div>
        {nestedDocs}
      </div>
    );
  }

  renderSimpleResult() {
    const doc = this.props.document;
    const docId = doc.getFirstValue('.id');
    const table = doc.getFirstValue('table');
    const text = doc.getFirstValue('teaser');

    return (
      <Card key={docId} style={{ marginBottom: '5px' }}>
        <div className="row" style={{ width: '100%', margin: 0 }} >
          <div className="col-sm-3 col-xs-4 col-md-3 col-lg-3" style={{ padding: 0 }}>
            <DocumentType docType={table} position={this.props.position} />
          </div>
          <div className="col-sm-9 col-xs-8 col-md-9 col-lg-9">
            <SearchResultTitle doc={doc} baseUri={this.props.baseUri} />
          </div>
        </div>
        <div className="row" style={{ width: '100%', margin: 0 }} >
          <div
            className="col-sm-12 col-xs-12 col-md-12 col-lg-12"
            style={{
              padding: 0,
            }}
          >
            {StringUtils.stripSimpleHtml(text)}
          </div>
        </div>
      </Card>
    );
  }

  renderDebugResult() {
    const doc = this.props.document;
    const docId = doc.getFirstValue('.id');
    const table = doc.getFirstValue(FieldNames.TABLE);
    const thumbnailUri = doc.getFirstValue('thumbnailImageUri');
    const score = parseFloat(doc.getFirstValue(FieldNames.SCORE));
    const scoreDescription = doc.getFirstValue(FieldNames.SCORE_EXPLAIN);
    const moreLikeThisQuery = doc.getFirstValue('morelikethisquery');
    const docTags = doc.getAllValues('tags');

    const fieldRows = [];
    const fieldNames = this.props.document.fields.keys();
    let finished = false;
    while (!finished) {
      const nextField = fieldNames.next();
      if (nextField.done) {
        finished = true;
      } else {
        const fieldName = nextField.value;
        let value;
        const values = this.props.document.getAllValues(fieldName);
        if (values && values.length > 1) {
          let index = 0;
          const valueRows = values.map((singleValue) => {
            const singleValueContents = SearchResult.valueToDisplay(singleValue);
            index += 1;
            return <li key={`${JSON.stringify(singleValue)}-${index}`}>{singleValueContents}</li>;
          });
          value = <ul>{valueRows}</ul>;
        } else if (values && values.length === 1) {
          value = SearchResult.valueToDisplay(values[0]);
        } else {
          value = <span className={{ fontStyle: 'italic' }}>No value</span>;
        }
        fieldRows.push(<dt key={fieldName}>{fieldName}</dt>);
        fieldRows.push(<dd key={`${fieldName}value`}>{value}</dd>);
      }
    }

    return (
      <div className=" attivio-search-result row">
        <div className="col-xs-2 col-sm-2">
          <DocumentType docType={table} position={this.props.position} />
          <DocumentThumbnail uri={thumbnailUri} />
          <dl className="attivio-labeldata-stacked attivio-labeldata-stacked-search-results">
            {this.props.showRatings ? (
              <div>
                <dt>User Rating</dt>
                <dd>
                  <StarRating onRated={(rating) => { this.rateDocument(doc, rating); }} />
                </dd>
              </div>
            ) : null}
            <dt>Relevancy Score</dt>
            <dd><RelevancyScore score={score} description={scoreDescription} id={docId} /></dd>
          </dl>
        </div>
        <div className="col-xs-8 col-sm-8">
          <SearchResultTitle doc={doc} baseUri={this.props.baseUri} />
          <dl className="attivio-labeldata-2col attivio-search-result-debugger">
            {fieldRows}
          </dl>
          {this.props.showTags ? (
            <SearchResultTags tags={docTags} moreLikeThisQuery={moreLikeThisQuery} vertical docId={docId} />
          ) : null}
        </div>
      </div>
    );
  }

  renderSpotfireResult(spotfireType) {

    const searcher = this.context.searcher;
    const doc = this.props.document;
    const table = doc.getFirstValue(FieldNames.TABLE);
    const docTags = doc.getAllValues('tags');
    const startUpProperty = "attivioRunOnOpen";
    const suitSpotfireIdField = 'spotfire.id.field';
    const suitSpotfireHostField = 'spotfire.host';
    const suitSpotfireLogInUrlField = 'spotfire.login.url';
    const suitSpotfireHostFile = 'spotfire.file';
    const spotfireWidgetHome = '/Projects/Metadata Tools/Widgets/';
    const docId = doc.getFirstValue('.id');
    const spotfireEntitiesField = "spotfire_entities";
    const generalFilterField = "attivio_General_nometadata";

    // set properties to be used by this function but also to pass tot he SpotfireWebPlayer react component
    const spotfireProps = {}

    // whether to show the 360 link or not..
    let show360Link = null;

    // do you wan to show the document entities panel beside the Spotfire widget - comes from field property
    let showEntitiesProperty = doc.getFirstValue('spotfire.show.entities');
    let showEntities = false;
    if (showEntitiesProperty.toLowerCase() === "yes" || showEntitiesProperty.toLowerCase() === "true"){
      showEntities = true;
    }

    // take Spotfire host from either document field of configuration properties
    let host = doc.getFirstValue(suitSpotfireHostField);
    if (host) {
      spotfireProps.host = host;
    }

    // take Spotfire host from either document field of configuration properties
    let loginUrl = doc.getFirstValue(suitSpotfireLogInUrlField);
    if (loginUrl) {
      spotfireProps.loginUrl = loginUrl;
    }

    // get path to Spotfire dxp
    let file = doc.getFirstValue(suitSpotfireHostFile);
    if (spotfireType === "spotfire-widget"){
        file = spotfireWidgetHome + table + " Summary";
        show360Link = "Show 360° View";
    }
    if (file) {
      spotfireProps.file = file;
    }  

    // convert the spotfire entities field into JSON
    let spotfireEntityFields = [];
    if (doc.getFirstValue(spotfireEntitiesField) != ""){
      spotfireEntityFields = JSON.parse(doc.getFirstValue(spotfireEntitiesField).replace(new RegExp("\&quot;", 'g'), '"'))["attivioEntities"];
    }

    // create array of filters
    var filters = [];
    var documentProperties = [];

    // grab the query ran or written by query frames so we can extract entities from it
    let query = doc.signal.query;
    if (!query || query === ""){
      query = searcher.state.query;
    }
  
    // compare attivio entity fields with Spotfire entities to find matching filters
    if (spotfireEntityFields.length > 0){

      let countOfEntityFieldsFounds = 0;
      spotfireEntityFields.forEach((spotfireEntity) => {

      // extract value to pass based upon Spotfire type
      let spotfireValues = [];
      if (spotfireType == "spotfire-widget"){
        if (doc.getFirstValue(suitSpotfireIdField) != ""){
          spotfireValues.push(doc.getFirstValue(doc.getFirstValue(suitSpotfireIdField)));
        }
        else{
          spotfireValues.push(docId);
        }
      }

      if (spotfireType === "spotfire"){

        let keyName = spotfireEntity.columnName;
        if (spotfireEntity.type === "property"){
          keyName = spotfireEntity.propertyName;
        }
      
        // remove attivo prefix from key
        let fieldNameRegex = new RegExp("attivio_?", "gi");
        keyName = keyName.replace(fieldNameRegex, "");

        this.props.entityFields.forEach(function (fieldLabel, fieldName) {
          // if we have a match on name - the spotfire tool can be filtered by this entity
          if (fieldName.toLowerCase() === keyName.toLowerCase() && query.includes(fieldName + ":")){

            // set the regex for getting the searched for values out the query frame
            let queryRegex = new RegExp(".*" + fieldName.toLowerCase() + ":or\\(\"?([A-z0-9 -_]+?)\"?\\).*$", "gi");
            // this handle queries in the form of entity:value
            let queryRegex2 = new RegExp(".*" + fieldName.toLowerCase() + ":([A-z0-9 -_]+?)", "gi");
            // get the values out
            let queryValues = query.replace(queryRegex,'$1').replace(queryRegex2, '$1');
            if (queryValues){
              if (spotfireEntity.type === "filter"){

                // add the values to the array
                spotfireValues.push(queryValues.toLowerCase());

                // make the filter object and push it into the filters array
                filters.push({
                  scheme: spotfireEntity.filterScheme,
                  table: spotfireEntity.tableName,
                  column: spotfireEntity.columnName,
                  values: spotfireValues,
                });

                countOfEntityFieldsFounds++;
              }
              else if (spotfireEntity.type === "property"){

                let documentPropertyValue = queryValues;
                if (spotfireEntity.propertyName !== startUpProperty){
                  documentProperties.push({
                    name: spotfireEntity.propertyName,
                    value: documentPropertyValue
                  });

                  countOfEntityFieldsFounds++;
                }
              }
            }
          }
        }, spotfireEntity);
      }
      else if (spotfireType === "spotfire-widget"){
        // make the filter object and push it into the filters array
        filters.push({
          scheme: spotfireEntity.filterScheme,
          table: spotfireEntity.tableName,
          column: spotfireEntity.columnName,
          values: spotfireValues,
        }); 
      }
      
      });
      
/*      if (countOfEntityFieldsFounds === 0){

        spotfireEntityFields.forEach((spotfireEntity) => {

          if (spotfireEntity.columnName === generalFilterField){
            filters.push({
              scheme: spotfireEntity.filterScheme,
              table: spotfireEntity.tableName,
              column: generalFilterField,
              values: [query],
            });
          }
        });
      }*/

    }

    spotfireProps.filters = filters;
    spotfireProps.documentProperties = documentProperties;

    return (
      <div className="attivio-search-result row">
        <div className="attivio-search-result-content">
          <div style={{ float: 'left', paddingRight: '8px' }}>
            <DocumentType docType={table} position={this.props.position} />
          </div>
          <div style={{ float: 'left' }}>
            <SearchResultTitle doc={doc} baseUri={this.props.baseUri} />
          </div>
          {this.props.showRatings ?  
          <div style={{float: 'right'}}>
            <b style={{ float: 'left', paddingRight: '8px' }}>Rating</b>
            <div style={{ float: 'left', paddingRight: '6px' }}>
            <StarRating onRated={(rating) => { this.rateDocument(doc, rating); }} /> 
            </div>
          </div>
          : null}
          {this.props.showScores ? <dt>Relevancy Score</dt> : ''}
          {this.props.showScores ? <dd><RelevancyScore score={score} explanation={scoreDescription} id={docId} /></dd> : ''}
          <Row>
            <Col xs={showEntities ? 9 : 12} sm={showEntities ? 9 : 12}>
              <SpotfireWebPlayer {...spotfireProps} />
              <SearchResultTags tags={docTags} docId={docId} view360Label={show360Link} />
            </Col>
            {showEntities ? <Col xs={3} sm={3}>
              <DocumentEntityList doc={doc} entityFields={this.props.entityFields} />
            </Col> : null
            }
          </Row>
        </div>
      </div>
    );
  }

  render() {

    // if we are running debug mode - don't show spotfire 
    if (this.props.format !== 'debug'){
      if (this.props.document.getFirstValue(suitTypeField).substring(0,8) === 'spotfire') {
        return this.renderSpotfireResult(this.props.document.getFirstValue(suitTypeField));
      }
    }

    switch (this.props.format) {
      case 'debug':
        return this.renderDebugResult();
      case 'usercard':
        return this.renderListResult();
      case 'doccard':
        return this.renderListResult();
      case 'simple':
        return this.renderSimpleResult();
      case 'list':
      default:
        return this.renderListResult();
    }
  }
}