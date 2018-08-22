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

const SUIT_TYPE_FIELD = 'pki.suit.type';
const spotfireWidgetHome = '/Projects/Metadata Tools/Widgets/'

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
    const doc = this.props.document;
    const docId = doc.getFirstValue('.id');
    const table = doc.getFirstValue(FieldNames.TABLE);
    const docTags = doc.getAllValues('tags');

    const spotfireProps = {}
    let host = doc.getFirstValue('pki.spotfire.host');
    let file = doc.getFirstValue('pki.spotfire.file');

    var show360Link = false;
    if (spotfireType === "spotfire-widget"){
        file = spotfireWidgetHome + table + " Summary";
        show360Link = true;
    }
    if (host) {
      spotfireProps.host = host;
    }
    if (file) {
      spotfireProps.file = file;
    }

    // convert the spotfire entities field into JSON
    let spotfireEntityFields = [];
    if (doc.getFirstValue('entities_mvs') != ""){
      spotfireEntityFields = JSON.parse(doc.getFirstValue('entities_mvs').replace(new RegExp("\&quot;", 'g'), '"'))["attivioEntities"];
    }

    // create array of filters
    var filters = [];
    var documentProperties = [];

    // compare attivio entity fields with Spotfire entities to find matching filters
    if (spotfireEntityFields.length > 0){
      spotfireEntityFields.forEach((spotfireEntity) => {

        // extract value to pass based upon Spotfire type
        let spotfireValues= [];
        if (spotfireType === "spotfire"){
          //spotfireValues.push('river tay');
        }
        else if (spotfireType == "spotfire-widget"){
          spotfireValues.push(docId);
        }

        // check entity type
        if (spotfireEntity.type === "filter") {

          if (spotfireType === "spotfire"){

            // check attivio entities for a match
            var keyName = spotfireEntity.columnName.replace("attivio_", "");

            this.props.entityFields.forEach(function (fieldLabel, fieldName) {
              // if we have a match on name - the spotfire tool can be filtered by this entity
              if (fieldLabel === keyName){

                // make the filter object and push it into the filters array
                filters.push({
                  scheme: spotfireEntity.filterScheme,
                  table: spotfireEntity.tableName,
                  column: spotfireEntity.columnName,
                  values: spotfireValues,
                });
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
        }
        else if (spotfireEntity.type === "property"){

          // add property to array of properties that can be applied
          documentProperties.push({
            name: spotfireEntity.propertyName,
            value: spotfireValues[0]
          })
        }
      });
    }

    spotfireProps.filters = filters;
    spotfireProps.documentProperties = documentProperties;

    return (
      <div className="attivio-search-result row">
        <div className="attivio-search-result-col">
          <DocumentType docType={table} position={this.props.position} />
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
            <Col xs={12} sm={12}>
              <SpotfireWebPlayer {...spotfireProps} />
              <SearchResultTags tags={docTags} docId={docId} view360Label={show360Link} />
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.document.getFirstValue(SUIT_TYPE_FIELD).substring(0,8) === 'spotfire') {
      return this.renderSpotfireResult(this.props.document.getFirstValue(SUIT_TYPE_FIELD));
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