// @flow

import React from 'react';
import Configurable from './Configurable';
import SearchDocument from '../api/SearchDocument';
import FieldNames from '../api/FieldNames';

type SpotfireWebPlayerProps = {
  document: SearchDocument;
  query: string,
  host: string;
  file: string;
  loginUrl: string;
  guid: string;
  documentProperties: Array<string>;
  filters: Array<string>;
  spotfireTypeField: string,
  spotfireEntitiesField: string; 
  suitSpotfireHostField: string,
  suitSpotfireLogInUrlField: string,
  suitSpotfireFileField: string,
  suitSpotfireIdField: string,
  spotfireWidgetHome: string,
  /** A map of the field names to the label to use for any entity fields */
  entityFields: Map<string, string>;
  toolType: 'spotfire' | 'spotfire-widget' | 'spotfire-tool';
  startUpProperty: string;
  generalFilterColumn: string;
  generalPropertyName: string;
  customizationInfo: object;
}

/**
 * Embeds a Spotfire WebPlayer using Spotfire JS library!
 */
class SpotfireWebPlayer extends React.Component<SpotfireWebPlayerProps> {

  static displayName = 'SpotfireWebPlayer';

  static defaultProps: SpotfireWebPlayerProps = {
    // properties set only to make test work
    host: 'http://sepa-app-spl01',
    loginUrl: 'http://sepa-app-spl01',
    spotfireTypeField: 'suit.type',
    suitSpotfireFileField: 'spotfire.file',
    spotfireEntitiesField: 'spotfireEntities',
    startUpProperty: 'attivioConfiguration',
    generalFilterColumn: 'General_nometadata',
    // end of properties for testing 
    /*host: null,
    loginUrl: null,
    spotfireTypeField: null,
    suitSpotfireFileField: null,
    spotfireEntitiesField: null,
    startUpProperty: null,
    generalFilterColumn: null,*/
    query: '',
    file: '',
    guid: '',
    documentProperties: [],
    filters: [],
    suitSpotfireHostField: null,
    suitSpotfireLogInUrlField: null,
    suitSpotfireIdField: null,
    spotfireWidgetHome: null,
    generalPropertyName: null,
    entityFields: new Map(),
    toolType: 'spotfire',
    customizationInfo: {
      showTopHeader: false,
      showToolBar: false,
      showExportFile: true,
      showExportVisualization: true,
      showCustomizableHeader: false,
      showPageNavigation: false,
      showStatusBar: false,
      showDodPanel: false,
      showFilterPanel: false,
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

    let toolType = this.props.toolType;
    if (doc.getFirstValue(this.props.spotfireTypeField) !== ""){
      toolType =  doc.getFirstValue(this.props.spotfireTypeField);
    }
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
    let file = doc.getFirstValue(this.props.suitSpotfireFileField);

    let parameters = "initialLoad = False; "
    if (this.props.startUpProperty && this.props.query !== ""){
      parameters += this.props.startUpProperty  + " = \"" + this.generateSpotfireJSONConfig(this.props.query) + "\"; ";
    }

    let spotfireEntities = this.getSpotfireEntities(doc);
    if (toolType === 'spotfire'){
      if (this.props.startUpProperty && this.props.spotfireEntities){
        parameters += this.props.startUpProperty + " = \"" + JSON.stringify(this.props.spotfireEntities).replace(/"/g, '\\"') + "\"; ";
      }
    }
    else if (toolType === 'spotfire-widget'){

      file = this.props.spotfireWidgetHome + table + " Summary";
      let widgetFilterValue = docId;
      if (doc.getFirstValue(this.props.suitSpotfireIdField) != ""){
        widgetFilterValue = doc.getFirstValue(doc.getFirstValue(suitSpotfireIdField));
      }

      let filtersAndProperties = this.matchEntitiesForWidget(this.parseSpotfireEntities(spotfireEntities), widgetFilterValue);
      this.filters = filtersAndProperties.filters;
      this.documentProperties = filtersAndProperties.documentProperties;
      parameters += this.constructPropertystring(this.documentProperties);
      parameters += this.constructFilterString(this.filters, this.props.generalFilterColumn);
    }

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

  // get the Spotfire entities string out of the document
  getSpotfireEntities(doc){
    // set properties to be used by this function but also to pass to the SpotfireWebPlayer react component
    let spotfireEntities = '';
    if (doc.getFirstValue(this.props.spotfireEntitiesField) !== ""){
      spotfireEntities = doc.getFirstValue(this.props.spotfireEntitiesField);
    }
    return spotfireEntities;
  }

  // parse the Spotfire entities to a JSON format
  parseSpotfireEntities(entities){
    // convert the spotfire entities field into JSON
    let spotfireEntityFields = [];
    if (typeof entities !== 'undefined' && entities != null){
      spotfireEntityFields = JSON.parse(entities.replace(new RegExp("\&quot;", 'g'), '"'))["attivioEntities"];
    }
    return spotfireEntityFields;
  }

  matchEntitiesForWidget(spotfireEntityFields, widgetFilterValue){

    // create array of filters
    let filters = [];
    let documentProperties = [];

    if (spotfireEntityFields.length > 0){
      
      spotfireEntityFields.forEach((spotfireEntity) => {

        // extract value to pass based upon Spotfire type
        let spotfireValues = [];
        spotfireValues.push(widgetFilterValue);
        // make the filter object and push it into the filters array
        filters.push({
          scheme: spotfireEntity.filterScheme,
          table: spotfireEntity.tableName,
          column: spotfireEntity.columnName,
          values: spotfireValues,
        });
      });    
    }

    return { 
      filters: filters,
      documentProperties: documentProperties
    };

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
      spotfireJson[this.props.generalFilterColumn] = query.toLowerCase();
    }

    return JSON.stringify(spotfireJson).replace(/"/g, '\\"');
  }

    // generate the required parameter string for the tool
  constructFilterString(filterObjects, generalFilterColumn) {
  
    const filterString = filterObjects.reduce(function (acc, filter) {
      if (filter.table && filter.column && filter.values) {
          if (filter.values.length > 0){
            const values = filter.values.map(function (value) {
              return "\"" + value + "\"";
            });
            
            let valuesString = "{" + values.join(',') + "}";
            let filterMethod = "values";
  
            if (filter.column === generalFilterColumn){
              filterMethod = "searchPattern";
              valuesString = "\"*" + filter.values[0].replace(" ", "*") + "*\"";
            }
            
            return acc + "SetFilter(tableName=\"" + filter.table + "\", columnName=\"" + filter.column + "\", " + filterMethod + "=" + valuesString + ");";
          }
      }
  
      return acc;
    }, '');
    return filterString;
  }

  //componentDidMount(){  }

  shouldComponentUpdate(nextProps){

    if (this.state.isLoaded !== true){
      return false;
    }

    const thingsHaveChanged = this.props.query != nextProps.query;

    // have any filters changed?
    if (thingsHaveChanged & nextProps.toolType !== 'spotfire-widget'){

      let newConfig = generateSpotfireJSONConfig(nextProps.query);

      // get the Spotfire app
      this.app.setDocumentProperty(this.props.startUpProperty, newConfig);
    
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
    //if (this.app) {
    //  this.app.close();
    //}
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