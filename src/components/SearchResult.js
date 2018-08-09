var _class, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var SUIT_TYPE_FIELD = 'pki.suit.type';

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
var SearchResult = (_temp = _class = function (_React$Component) {
  _inherits(SearchResult, _React$Component);

  SearchResult.getFirstDocumentType = function getFirstDocumentType(list) {
    var result = '';
    if (list && list.length > 0) {
      result = list[0].getFirstValue('table');
    }
    return result;
  };

  SearchResult.valueToDisplay = function valueToDisplay(value) {
    if (typeof value === 'string') {
      return value;
    }
    var json = JSON.stringify(value, null, 2);
    if (json.startsWith('{')) {
      return React.createElement(
        'pre',
        null,
        json
      );
    }
    return React.createElement(
      'span',
      null,
      json
    );
  };

  function SearchResult(props) {
    _classCallCheck(this, SearchResult);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = {
      currentTab: SearchResult.getFirstDocumentType(props.document.children)
    };
    _this.tabChanged = _this.tabChanged.bind(_this);
    _this.rateDocument = _this.rateDocument.bind(_this);
    return _this;
  }

  SearchResult.prototype.tabChanged = function tabChanged(newTab) {
    this.setState({
      currentTab: newTab
    });
  };

  SearchResult.prototype.rateDocument = function rateDocument(doc, rating) {
    if (doc.signal) {
      new Signals(this.props.baseUri).addSignal(doc, 'like', rating);
    }
  };

  SearchResult.prototype.renderListResult = function renderListResult() {
    var _this2 = this;

    var doc = this.props.document;
    var docId = doc.getFirstValue('.id');
    var table = doc.getFirstValue('table');
    var thumbnailUri = doc.getFirstValue('thumbnailImageUri');
    var previewUri = doc.getAllValues('previewImageUri');
    var scoreString = doc.getFirstValue(FieldNames.SCORE);
    var score = scoreString ? parseFloat(scoreString) : 0;
    var scoreDescription = doc.getFirstValue(FieldNames.SCORE_EXPLAIN);
    var text = doc.getFirstValue('teaser');
    var moreLikeThisQuery = doc.getFirstValue('morelikethisquery');
    var docTags = doc.getAllValues('tags');

    var nestedDocs = null;
    if (doc.children && doc.children.length > 0) {
      var childMap = new Map();
      doc.children.forEach(function (child) {
        var childTable = child.getFirstValue('table');
        var tableDocs = childMap.get(childTable);
        if (tableDocs) {
          tableDocs.push(child);
        } else {
          var newTableDocs = [child];
          childMap.set(childTable, newTableDocs);
        }
      });
      var tabInfos = [];
      childMap.forEach(function (tableDocs, tabTable) {
        var label = tableDocs.length === 1 ? '1 ' + tabTable : tableDocs.length + ' ' + tabTable;
        var docResults = tableDocs.map(function (tableDoc, index) {
          var childPosition = index + 1;
          return React.createElement(SearchResult, {
            document: tableDoc,
            key: tableDoc.getFirstValue('.id'),
            position: childPosition,
            baseUri: _this2.props.baseUri
          });
        });
        var docResultsList = React.createElement(
          'div',
          { className: 'attivio-nested-search-results' },
          docResults
        );
        tabInfos.push(new TabInfo(label, tabTable, docResultsList));
      });
      var tabLabel = void 0;
      if (doc.children.length === 1) {
        tabLabel = 'One Child Record:';
      } else {
        tabLabel = doc.children.length + ' Child Records:';
      }
      nestedDocs = React.createElement(TabPanel, {
        tabInfos: tabInfos,
        activeTabId: this.state.currentTab,
        tabChanged: this.tabChanged,
        tabLabel: tabLabel,
        nested: true
      });
    }

    return React.createElement(
      'div',
      { className: ' attivio-search-result' },
      React.createElement(
        'div',
        { className: 'attivio-search-result-col' },
        React.createElement(DocumentType, { docType: table, position: this.props.position }),
        React.createElement(DocumentThumbnail, { uri: thumbnailUri, previewUris: previewUri, previewTitle: doc.getFirstValue(FieldNames.TITLE) }),
        React.createElement(
          'dl',
          { className: 'attivio-labeldata-stacked attivio-labeldata-stacked-search-results' },
          this.props.showRatings ? React.createElement(
            'div',
            null,
            React.createElement(
              'dt',
              null,
              'Rating'
            ),
            React.createElement(
              'dd',
              null,
              React.createElement(StarRating, { onRated: function onRated(rating) {
                  _this2.rateDocument(doc, rating);
                } })
            )
          ) : null,
          this.props.showScores ? React.createElement(
            'dt',
            null,
            'Relevancy Score'
          ) : '',
          this.props.showScores ? React.createElement(
            'dd',
            null,
            React.createElement(RelevancyScore, { score: score, explanation: scoreDescription, id: docId })
          ) : ''
        )
      ),
      React.createElement(
        'div',
        { className: 'attivio-search-result-content' },
        React.createElement(SearchResultTitle, { doc: doc, baseUri: this.props.baseUri }),
        React.createElement(
          Row,
          null,
          React.createElement(
            Col,
            { xs: 7, sm: 7 },
            React.createElement(SearchResultBody, { body: text }),
            this.props.showTags ? React.createElement(SearchResultTags, { tags: docTags, moreLikeThisQuery: moreLikeThisQuery, docId: docId }) : null
          ),
          React.createElement(
            Col,
            { xs: 5, sm: 5 },
            React.createElement(DocumentEntityList, { doc: doc, entityFields: this.props.entityFields })
          )
        )
      ),
      nestedDocs
    );
  };

  SearchResult.prototype.renderSimpleResult = function renderSimpleResult() {
    var doc = this.props.document;
    var docId = doc.getFirstValue('.id');
    var table = doc.getFirstValue('table');
    var text = doc.getFirstValue('teaser');

    return React.createElement(
      Card,
      { key: docId, style: { marginBottom: '5px' } },
      React.createElement(
        'div',
        { className: 'row', style: { width: '100%', margin: 0 } },
        React.createElement(
          'div',
          { className: 'col-sm-3 col-xs-4 col-md-3 col-lg-3', style: { padding: 0 } },
          React.createElement(DocumentType, { docType: table, position: this.props.position })
        ),
        React.createElement(
          'div',
          { className: 'col-sm-9 col-xs-8 col-md-9 col-lg-9' },
          React.createElement(SearchResultTitle, { doc: doc, baseUri: this.props.baseUri })
        )
      ),
      React.createElement(
        'div',
        { className: 'row', style: { width: '100%', margin: 0 } },
        React.createElement(
          'div',
          {
            className: 'col-sm-12 col-xs-12 col-md-12 col-lg-12',
            style: {
              padding: 0
            }
          },
          StringUtils.stripSimpleHtml(text)
        )
      )
    );
  };

  SearchResult.prototype.renderDebugResult = function renderDebugResult() {
    var _this3 = this;

    var doc = this.props.document;
    var docId = doc.getFirstValue('.id');
    var table = doc.getFirstValue(FieldNames.TABLE);
    var thumbnailUri = doc.getFirstValue('thumbnailImageUri');
    var previewUri = doc.getAllValues('previewImageUri');
    var score = parseFloat(doc.getFirstValue(FieldNames.SCORE));
    var scoreDescription = doc.getFirstValue(FieldNames.SCORE_EXPLAIN);
    var moreLikeThisQuery = doc.getFirstValue('morelikethisquery');
    var docTags = doc.getAllValues('tags');

    var fieldRows = [];
    var fieldNames = this.props.document.fields.keys();
    var finished = false;
    while (!finished) {
      var nextField = fieldNames.next();
      if (nextField.done) {
        finished = true;
      } else {
        var fieldName = nextField.value;
        var value = void 0;
        var values = this.props.document.getAllValues(fieldName);
        if (values && values.length > 1) {
          (function () {
            var index = 0;
            var valueRows = values.map(function (singleValue) {
              var singleValueContents = SearchResult.valueToDisplay(singleValue);
              index += 1;
              return React.createElement(
                'li',
                { key: JSON.stringify(singleValue) + '-' + index },
                singleValueContents
              );
            });
            value = React.createElement(
              'ul',
              null,
              valueRows
            );
          })();
        } else if (values && values.length === 1) {
          value = SearchResult.valueToDisplay(values[0]);
        } else {
          value = React.createElement(
            'span',
            { className: { fontStyle: 'italic' } },
            'No value'
          );
        }
        fieldRows.push(React.createElement(
          'dt',
          { key: fieldName },
          fieldName
        ));
        fieldRows.push(React.createElement(
          'dd',
          { key: fieldName + 'value' },
          value
        ));
      }
    }

    return React.createElement(
      'div',
      { className: ' attivio-search-result row' },
      React.createElement(
        'div',
        { className: 'col-xs-2 col-sm-2' },
        React.createElement(DocumentType, { docType: table, position: this.props.position }),
        React.createElement(DocumentThumbnail, { uri: thumbnailUri, previewUris: previewUri, previewTitle: doc.getFirstValue(FieldNames.TITLE) }),
        React.createElement(
          'dl',
          { className: 'attivio-labeldata-stacked attivio-labeldata-stacked-search-results' },
          this.props.showRatings ? React.createElement(
            'div',
            null,
            React.createElement(
              'dt',
              null,
              'User Rating'
            ),
            React.createElement(
              'dd',
              null,
              React.createElement(StarRating, { onRated: function onRated(rating) {
                  _this3.rateDocument(doc, rating);
                } })
            )
          ) : null,
          React.createElement(
            'dt',
            null,
            'Relevancy Score'
          ),
          React.createElement(
            'dd',
            null,
            React.createElement(RelevancyScore, { score: score, description: scoreDescription, id: docId })
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'col-xs-8 col-sm-8' },
        React.createElement(SearchResultTitle, { doc: doc, baseUri: this.props.baseUri }),
        React.createElement(
          'dl',
          { className: 'attivio-labeldata-2col attivio-search-result-debugger' },
          fieldRows
        ),
        this.props.showTags ? React.createElement(SearchResultTags, { tags: docTags, moreLikeThisQuery: moreLikeThisQuery, vertical: true, docId: docId }) : null
      )
    );
  };

  SearchResult.prototype.renderSpotfireResult = function renderSpotfireResult() {
    var _this4 = this;

    var doc = this.props.document;
    var docId = doc.getFirstValue('.id');
    var table = doc.getFirstValue(FieldNames.TABLE);
    var docTags = doc.getAllValues('tags');

    var spotfireProps = {};
    var host = doc.getFirstValue('pki.spotfire.host');
    var file = doc.getFirstValue('pki.spotfire.file');
    if (host && file) {
      spotfireProps.host = host;
      spotfireProps.file = file;
    }

    // convert the spotfire entities field into JSON
    var spotfireEntityFields = JSON.parse(doc.getFirstValue('entities_mvs').replace(new RegExp("\&quot;", 'g'), '"'))["attivioEntities"];
    //const spotfireEntityFields = new Map(this.props.entityFields);
    //spotfireEntityFields.set('pki.spotfire.file', 'File');
    //spotfireEntityFields.set('pki.spotfire.host', 'Host');

    var filtersFound = "Filters (" + spotfireEntityFields[0].type + "): ";
    var entitiesFound = "Entities: ";
    // create array of filters
    var filters = [];

    // compare attivio entity fields with Spotfire entities to find matching filters
    if (spotfireEntityFields.length > 0){
      spotfireEntityFields.forEach((spotfireEntity) => {
        // check entity type as we want filters only
        if (spotfireEntity.type === "filter") {
          filtersFound += spotfireEntity.columnName + ", ";
          // check attivio entities for a match
          var keyName = spotfireEntity.columnName.replace("attivio_", "");

          this.props.entityFields.forEach(function (fieldLabel, fieldName) {
            // if we have a match on name - the spotfire tool can be filtered by this entity
            if (fieldLabel === keyName){
              entitiesFound += spotfireEntity.columnName + '|' + fieldLabel;
              // make the filter obkect and push it into the filters array
              filters.push({
                scheme: spotfireEntity.filterScheme,
                table: spotfireEntity.tableName,
                column: spotfireEntity.columnName,
                values: ['River Tay'],
              });
            }
          }, spotfireEntity);
        }
      });
    }

    var filter = {
      table: doc.getFirstValue('pki.spotfire.filter.table'),
      column: doc.getFirstValue('pki.spotfire.filter.column'),
      values: [doc.getFirstValue('pki.spotfire.filter.values')]
    };

    if (!filter.table || !filter.column) {
      filter = {};
    }
    spotfireProps.filters = filters;

    // <DocumentEntityList doc={doc} entityFields={spotfireEntityFields} />
    return React.createElement(
      'div',
      { className: 'attivio-search-result row' },
      React.createElement(
        'div',
        { className: 'attivio-search-result-content' },
        React.createElement(
          'div',
          { style: { float: 'left', paddingRight: '8px', width: '100px' } },
          React.createElement(DocumentType, { docType: table, position: this.props.position })
        ),
        React.createElement(
          'div',
          { style: { float: 'left' } },
          React.createElement(SearchResultTitle, { doc: doc, baseUri: this.props.baseUri }),
          React.createElement(
            'p',
            null,
            filtersFound
          ),
          React.createElement(
            'p',
            null,
            entitiesFound
          )
        ),
        React.createElement(
          'div',
          { style: { float: 'right' } },
          React.createElement(
            'div',
            { style: { float: 'left', paddingRight: '8px' } },
            React.createElement(
              'b',
              null,
              'Rating'
            )
          ),
          React.createElement(
            'div',
            { style: { float: 'left' } },
            React.createElement(StarRating, { onRated: function onRated(rating) {
                _this4.rateDocument(doc, rating);
              } })
          )
        ),
        React.createElement(
          Row,
          null,
          React.createElement(
            Col,
            { xs: 12, sm: 12 },
            React.createElement(SpotfireWebPlayer, spotfireProps),
            React.createElement(SearchResultTags, { tags: docTags, docId: docId, view360Label: null })
          )
        )
      )
    );
  };

  SearchResult.prototype.render = function render() {
    if (this.props.document.getFirstValue(SUIT_TYPE_FIELD) === 'spotfire') {
      return this.renderSpotfireResult();
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
  };

  return SearchResult;
}(React.Component), _class.defaultProps = {
  baseUri: '',
  format: 'list',
  showScores: false,
  entityFields: new Map(),
  showTags: true,
  showRatings: true
}, _class.displayName = 'SearchResult', _temp);
export { SearchResult as default };