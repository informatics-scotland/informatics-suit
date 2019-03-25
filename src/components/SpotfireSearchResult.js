// @flow
import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import SearchDocument from '../api/SearchDocument';
import FieldNames from '../api/FieldNames';
import Configuration from './Configuration';
import DocumentEntityList from './DocumentEntityList';
import DocumentType from './DocumentType';
import SpotfireWebPlayer from './SpotfireWebPlayer';
import RelevancyScore from './RelevancyScore';
import SearchResultTags from './SearchResultTags';
import SearchResultTitle from './SearchResultTitle';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

type SpotfireSearchResultProps = {
    /**
     * Optional. The location of the node through which to interact with Attivio.
     * Defaults to the value in the configuration.
     */
    baseUri: string;
    /** The document to be displayed. */
    document: SearchDocument;
    /** The document’s position in the search results. */
    position: number,
    /** A map of the field names to the label to use for any entity fields */
    entityFields: Map<string, string>;
    /** The query being sent by the user */
    query: string;
  }

/**
 * An Spotfire rendering of an individual search result.
 */
export default class SpotfireSearchResult extends React.Component<SpotfireSearchResultProps> {
    static defaultProps = {
      baseUri: '',
      entityFields: new Map([['people', 'People'], ['location', 'Locations'], ['company', 'Companies']]),
      format: 'spotfire',
    };

    static displayName = 'SpotfireSearchResult';

    /**
     * Renders a <SimpleSearchResult> component for the document.
     */
    static renderer(document: SearchDocument, position: number, baseUri: string, key: string) {

        // check if it is a Spotfire tool or widget
        if (document.getFirstValue('suit.type').substring(0,8) === 'spotfire') {
            return (
                <SpotfireSearchResult document={document} position={position} baseUri={baseUri} key={key} />
            );
        }
        return null;
    }

    static contextTypes = {
        configuration: PropTypes.instanceOf(Configuration),
    };

    render() {

        // spotfireType
        const doc = this.props.document;
        const table = doc.getFirstValue(FieldNames.TABLE);
        const docTags = doc.getAllValues('tags');
        const docId = doc.getFirstValue('.id');

        // whether to show the 360 link or not..
        let show360Link = null;
        if (doc.getFirstValue('suit.type') === "spotfire-widget"){
            show360Link = "Show 360° View";
        }

        let entityFields = this.props.entityFields;
        if (this.context.configuration && this.context.configuration.state.ALL && this.context.configuration.state.ALL.entityFields) {
          // If the user specifies entity fields in the configuration, use those instead of the defaults
          entityFields = this.context.configuration.state.ALL.entityFields;
        }

        // do you want to show the document entities panel beside the Spotfire widget - comes from field property
        let showEntitiesProperty = doc.getFirstValue('spotfire.show.entities');
        let showEntities = false;
        if (showEntitiesProperty.toLowerCase() === "yes" || showEntitiesProperty.toLowerCase() === "true"){
            showEntities = true;
        }  

        // grab the query ran or written by query frames so we can extract entities from it
        let searchQuery = "";
        if (doc.signal && doc.signal.query){
            searchQuery = doc.signal.query;
        }

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
            <br style={{ clear: 'both' }} />
            <Row>
                <Col xs={showEntities ? 9 : 12} sm={showEntities ? 9 : 12}>
                <SpotfireWebPlayer document={doc} entityFields={entityFields} query={searchQuery} />
                <SearchResultTags tags={docTags} docId={docId} view360Label={show360Link} />
                </Col>
                {showEntities ? <Col xs={3} sm={3}>
                <DocumentEntityList doc={doc} entityFields={entityFields} />
                </Col> : null
                }
            </Row>
            </div>
        </div>
        );
    }

}