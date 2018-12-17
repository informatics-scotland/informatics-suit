// @flow
import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import SearchDocument from '../api/SearchDocument';
import FieldNames from '../api/FieldNames';
import Configurable from './Configurable';
import Configuration from './Configuration';
import DocumentEntityList from './DocumentEntityList';
import DocumentThumbnail from './DocumentThumbnail';
import DocumentType from './DocumentType';
import SpotfireWebPlayer from './SpotfireWebPlayer';
import RelevancyScore from './RelevancyScore';
import SearchResultBody from './SearchResultBody';
import SearchResultTags from './SearchResultTags';
import SearchResultTitle from './SearchResultTitle';
import Signals from '../api/Signals';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import TabPanel, { TabInfo } from './TabPanel';

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
  }
  
  type SpotfireSearchResultDefaultProps = {
    baseUri: string;
  }

/**
 * An Spotfire rendering of an individual search result.
 */
export default class SpotfireSearchResult extends React.Component<SpotfireSearchResultDefaultProps, SpotfireSearchResultProps, void> {
    static defaultProps = {
      baseUri: '',
    };

    /**
     * Renders a <SimpleSearchResult> component for the document.
     */
    static renderer(doc: SearchDocument, position: number, baseUri: string, key: string) {
    return (
        <SpotfireSearchResult document={doc} position={position} baseUri={baseUri} key={key} />
    );
    }

    static displayName = 'SpotfireSearchResult';

    static contextTypes = {
    configuration: PropTypes.instanceOf(Configuration),
    };

    render() {

        // spotfireType

        const suitTypeField = 'suit.type';
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

        // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
        const spotfireProps = {}
        spotfireProps.spotfireEntities = doc.getFirstValue(spotfireEntitiesField);
        spotfireProps.toolType = spotfireType;
        spotfireProps.entityFields = this.props.entityFields;

        // grab the query ran or written by query frames so we can extract entities from it
        let query = doc.signal.query;
        if (!query || query === ""){
        query = searcher.state.query;
        }
        spotfireProps.query = query

        // whether to show the 360 link or not..
        let show360Link = null;

        // do you want to show the document entities panel beside the Spotfire widget - comes from field property
        let showEntitiesProperty = doc.getFirstValue('spotfire.show.entities');
        let showEntities = false;
        if (showEntitiesProperty.toLowerCase() === "yes" || showEntitiesProperty.toLowerCase() === "true"){
        showEntities = true;
        }

        // get path to Spotfire dxp
        let file = doc.getFirstValue(suitSpotfireHostFile);
        if (spotfireType === "spotfire-widget"){
            file = spotfireWidgetHome + table + " Summary";
            show360Link = "Show 360° View";
            if (doc.getFirstValue(suitSpotfireIdField) != ""){
            spotfireProps.widgetFilterValue = doc.getFirstValue(doc.getFirstValue(suitSpotfireIdField));
            }
            else{
            spotfireProps.widgetFilterValue = docId;
            }
        }
        if (file) {
        spotfireProps.file = file;
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
}