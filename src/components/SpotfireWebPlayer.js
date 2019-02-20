// @flow

import React from 'react';
import Configurable from './Configurable';
import SearchDocument from '../api/SearchDocument';
import FieldNames from '../api/FieldNames';

type SpotfireWebPlayerProps = {
  /** Document passed by search result */
  document: SearchDocument;
  /** query that user entered */
  query: string,
  /** Spotfire host url */
  host: string;
  /** Spotfire file path */
  file: string;
  /** Spotfire login url */
  loginUrl: string;
  /** GUID for react component */
  guid: string;
  /** Document field name that contains what type of Spotfire component this is */
  spotfireTypeField: string,
  /** Document field name that holds entity and values to send to Spotfire (only used for testing mainly or to override query) */
  spotfireEntitiesField: string; 
  /** Document field name that holds the Spotfire host url */
  suitSpotfireHostField: string,
  /** Document field name that holds the Spotfire login url */
  suitSpotfireLogInUrlField: string,
  /** Document field name that holds the Spotfire file path */
  suitSpotfireFileField: string,
  /** Document field name that holds the Spotfire tool name */
  suitSpotfireToolField: string,
  /** Path in Spotfire library for Spotfire widgets */
  spotfireWidgetHome: string,
  /** Path in Spotfire library for full Spotfire tools */
  spotfireToolHome: string,
  /** A map of the field names to the label to use for any entity fields */
  entityFields: Map<string, string>;
  /** Possible tool types for a Spotfire component */
  toolType: 'spotfire' | 'spotfire-widget' | 'spotfire-tool';
  /** Spotfire property to be set to configure Spotfire component appropriately */
  startUpProperty: string;
  /** Spotfire entity name to set for non entity matched queries */
  generalQueryName: string;
  /** Spotfire entity name to set for widget ids */
  widgetIdField: string;
  /** Spotfire consutimsation object to configure your Spotfire component */
  customizationInfo: object;
}

/**
 * Embeds a Spotfire WebPlayer using Spotfire JS library!
 */
class SpotfireWebPlayer extends React.Component<SpotfireWebPlayerProps> {

  static displayName = 'SpotfireWebPlayer';

  static defaultProps: SpotfireWebPlayerProps = {
    // properties set only to make test work
    /*host: 'http://sepa-app-spl01',
    loginUrl: 'http://sepa-app-spl01',
    spotfireTypeField: 'suit.type',
    suitSpotfireFileField: 'spotfire.file',
    suitSpotfireToolField: 'Tool'.
    spotfireEntitiesField: 'spotfireEntities',
    startUpProperty: 'attivioConfiguration',
    generalQueryName: 'General_nometadata',
    widgetIdField: 'Id',*/
    // end of properties for testing 
    host: null,
    loginUrl: null,
    spotfireTypeField: null,
    suitSpotfireFileField: null,
    suitSpotfireToolField: null,
    spotfireEntitiesField: null,
    startUpProperty: null,
    generalQueryName: null,
    widgetIdField: null, 
    query: '',
    file: '',
    guid: '',
    suitSpotfireHostField: null,
    suitSpotfireLogInUrlField: null,
    spotfireWidgetHome: null,
    spotfireToolHome: null,
    entityFields: new Map(),
    toolType: 'spotfire',
    customizationInfo: {
      showTopHeader: false,
      showToolBar: true,
      showExportFile: true,
      showExportVisualization: true,
      showCustomizableHeader: false,
      showPageNavigation: false,
      showStatusBar: true,
      showDodPanel: false,
      showFilterPanel: true,
      showAbout: false,
      showAnalysisInformationTool: false,
      showAuthor: false,
      showClose: false,
      showHelp: true,
      showLogout: false,
      showReloadAnalysis: false,
      showUndoRedo: false,
      showAnalysisInfo: false
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      msg: '',
      isLoaded: false,
      isInitializing: true,
      requiresLogin: false,
      guid: props.guid || this.generateGuid(),
      // Spotfire works from javascript calls so using the state to call the render method again (as react good practice is) does not suit
      //documentProperties: props.documentProperties || [],
      //filters: props.filters || []
    };

    const doc = this.props.document;
    const docId = doc.getFirstValue('.id');
    const table = doc.getFirstValue(FieldNames.TABLE);

    // if provided use host etc - otherwise this comes from config properties js file
    let host = this.props.host;
    if (doc.getFirstValue(this.props.suitSpotfireHostField) !== ""){
      host = doc.getFirstValue(this.props.suitSpotfireHostField);
    }

    // Only needed if you have Spotfire logins
    //let loginUrl = this.props.loginUrl;
    //if (doc.getFirstValue(this.props.suitSpotfireLogInUrlField) !== ""){
    //  loginUrl = doc.getFirstValue(this.props.suitSpotfireLogInUrlField);
    //}

    // get path to Spotfire dxp
    let file = "";

    let toolType = this.props.toolType;
    if (doc.getFirstValue(this.props.spotfireTypeField) !== ""){
      toolType =  doc.getFirstValue(this.props.spotfireTypeField);
    }

    let parameters = "initialLoad = False; ";
    // is it a full Spotfire tool
    if (toolType === 'spotfire' || toolType === 'spotfire-tool'){

      if (toolType === 'spotfire'){
        file = doc.getFirstValue(this.props.suitSpotfireFileField);
      }
      else if (toolType === 'spotfire-tool'){ // strip off title html
        file = this.props.spotfireToolHome + doc.getFirstValue(this.props.suitSpotfireToolField);
      }

      // if spotfireEntities has been set then this overrides the entities that would be derived from a query
      if (this.props.startUpProperty && this.props.spotfireEntities){
        parameters += this.props.startUpProperty + " = \"" + JSON.stringify(this.props.spotfireEntities).replace(/"/g, '\\"') + "\"; ";
      }
      else if (this.props.startUpProperty && this.props.query !== "" && this.props.query !== "*:*"){ // apply entities based upon the query
        parameters += this.props.startUpProperty  + " = \"" + this.generateSpotfireJSONConfig(this.props.query) + "\"; ";
      }
    }
    else if (toolType === 'spotfire-widget'){ // if it is a Spotfire widget used to display a non Spotfire document result
      file = this.props.spotfireWidgetHome + table + " Summary";
      let spotfireJson = {};
      spotfireJson[this.props.widgetIdField] = docId.toLowerCase();

      if (this.props.startUpProperty && this.props.widgetIdField){
        parameters += this.props.startUpProperty + " = \"" + JSON.stringify(spotfireJson).replace(/"/g, '\\"') + "\"; ";
      }

    }

    console.log("Initial config: " + parameters);
    spotfire.webPlayer.createApplication(
      host,
      this.props.customizationInfo,
      file,
      parameters,
      true,
      "7.14",
      this.onReadyCallback.bind(this),
      null 
    );

  }

  // Generate unique id for Spotfire html element
  generateGuid() {
    function f() {
      return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return f() + f() + f() + f();
  }

  generateSpotfireJSONConfig(query){

    let spotfireJson = {};

    // is the query matching an entity?
    this.props.entityFields.forEach(function (fieldLabel, fieldName) {

      let queryLower = query.toLowerCase();
      let fieldNameLower = fieldName.toLowerCase();

      if (queryLower.includes(fieldNameLower + ":")){

        // set the regex for getting the searched for values out the query frame
        let queryRegex = new RegExp(".*" + fieldNameLower + ":or\\(\"?([A-z0-9 -_]+?)\"?\\).*$", "gi");
        // this handle queries in the form of entity:value
        let queryRegex2 = new RegExp(".*" + fieldNameLower + ":([A-z0-9 -_]+?)", "gi");
        // get the values out
        let queryValues = queryLower.replace(queryRegex,'$1').replace(queryRegex2, '$1');

        // capitalise first letter for field name to match Spotfire column naming convention
        spotfireJson[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] = queryValues;
      }
    });

    if (Object.entries(spotfireJson).length === 0 && spotfireJson.constructor === Object){
      spotfireJson[this.props.generalQueryName] = "*" + query.toLowerCase().replace(" ","*") + "*";
    }

    return JSON.stringify(spotfireJson).replace(/"/g, '\\"');
  }

  //componentDidMount(){  }

  shouldComponentUpdate(nextProps){

    if (this.state.isLoaded !== true){
      return false;
    }

    const thingsHaveChanged = this.props.query != nextProps.query;

    // have any filters changed?
    if (thingsHaveChanged & nextProps.toolType !== 'spotfire-widget'){

      let newConfig = this.generateSpotfireJSONConfig(nextProps.query);
      // get the Spotfire app
      this.app.setDocumentProperty(this.props.startUpProperty, "\"" + newConfig + "\"");   
      console.log("Updating config: " + newConfig);
    }

    // always return false as we never want to rerender the component - it should always update with Spotfire js calls
    return false;
    
  }

  /**
    *Spotfire callback sections for the Spotfire Javascript API
    */
  onReadyCallback(response, newApp)
  {
      const app = newApp;
      if(typeof response !== 'undefined' && response.status === "OK")
      {
          // The application is ready, meaning that the api is loaded and that 
          // the analysis path is validated for the current session 
          // (anonymous or logged in user)
          console.log("OK received. Opening document...");
          app.openDocument(this.state.guid);

          app.onError(this.errorCallback.bind(this));
          app.onClosed(this.onClosedCallback.bind(this));
          app.onOpened(this.onOpenedCallback.bind(this));
          this.app = app.analysisDocuments[0];
      }
      else if (typeof response === 'undefined'){
        console.log("No response object received...");
      }
      else
      {
          console.log("Status not OK. " + response.status + ": " + response.message);
      }
  }

  onOpenedCallback() {
    this.setState({ msg: '', isLoaded: true, isInitializing: false });
  }

  errorCallback(errorCode, errorMessage) {
    let msg = `${errorCode}: ${errorMessage}`;
    let requiresLogin = false;

    if (errorCode === spotfire.webPlayer.errorCodes.ERROROPEN) {
      // Could be a 401 issue meaning the user needs to log in
      // console.error('Could be a 401');
      msg = 'Please sign into Spotfire';
      requiresLogin = true;
    } else if (errorCode === spotfire.webPlayer.errorCodes.ERRORINTERNAL) {
      // Could be a bad filter setting
      msg = 'Internal Spotfire error: please check the filter parameters!';
      requiresLogin = false;
    }
    console.error(errorMessage);
    this.setState({ msg, isLoaded: false, isInitializing: false, requiresLogin });
  }
  /*
  * End Spotfire callback section 
  */

  componentWillUnmount() {
    if (this.app) {
      this.app.close();
    }
  }

  onClosedCallback(path) {
    this.setState({ msg: `Document at path "${path}" closed.`, isLoaded: false });
  }

  render() {
    var spotfireStyle = { height: 480, display: 'none' };
    if (this.state.isLoaded || this.state.isInitializing) {
      spotfireStyle = { height: 480, display: 'block'};
    }
    const loginLink = this.state.requiresLogin ?
      (<p><a href={this.props.loginUrl} target="_blank">Sign into Spotfire and refresh this page.</a></p>) : (<span />);
    return (
      <div>
        <div>{this.state.msg}</div>
        {loginLink}
        <div className="spotfireContainer" id={this.state.guid} style={spotfireStyle} />
      </div>
    );
  }
}
export default Configurable(SpotfireWebPlayer);