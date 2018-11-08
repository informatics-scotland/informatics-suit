import React from 'react';
import Configurable from './Configurable';

type SpotfireWebPlayerProps = {

  host: string;
  file: string;
  loginUrl: string;
  guid: string;
  documentProperties: Array<string>;
  filters: Array<string>;
  startUpProperty: string;
  query: string;
  spotfireEntities: string;
  /** A map of the field names to the label to use for any entity fields */
  entityFields: Map<string, string>;
  toolType: 'spotfire' | 'spotfire-widget';
  widgetFilterValue: string;
  customizationInfo: object;
}

/**
 * Embeds a Spotfire WebPlayer using Spotfire JS library!
 */
class SpotfireWebPlayer extends React.Component<SpotfireWebPlayerProps> {

  static displayName = 'SpotfireWebPlayer';

  static defaultProps: SpotfireWebPlayerProps = {
    host: null,
    file: '',
    loginUrl: null,
    guid: '',
    documentProperties: [],
    filters: [],
    startUpProperty: null,
    query: null,
    spotfireEntities: null,
    entityFields: new Map(),
    toolType: 'spotfire',
    widgetFilterValue: null,
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

    this.widget = "spotfire-widget";
    this.matchEntities(this.parseSpotfireEntities(this.props.spotfireEntities));
    const parameters = "initialLoad = False; " + this.props.startUpProperty + " = '" + Math.random().toString() + "'; " + this.constructFilterString(this.filters);

    spotfire.webPlayer.createApplication(
      this.props.host,
      this.props.customizationInfo,
      this.props.file,
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

  // parse the Spotfire entities 
  parseSpotfireEntities(entities){
    // convert the spotfire entities field into JSON
    let spotfireEntityFields = [];
    if (entities != ""){
      spotfireEntityFields = JSON.parse(entities.replace(new RegExp("\&quot;", 'g'), '"'))["attivioEntities"];
    }
    return spotfireEntityFields;
  }

  matchEntities(spotfireEntityFields){

    // create array of filters
    let filters = [];
    let documentProperties = [];
    let query = this.props.query;
  
    // compare attivio entity fields with Spotfire entities to find matching filters
    if (spotfireEntityFields.length > 0){

      let countOfEntityFieldsFounds = 0;
      spotfireEntityFields.forEach((spotfireEntity) => {

      // extract value to pass based upon Spotfire type
      let spotfireValues = [];
      if (this.props.toolType === this.widget){
        spotfireValues.push(this.props.widgetFilterValue);
      }
      else if (this.props.toolType === "spotfire"){

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
      else if (this.props.toolType === this.widget){
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

    this.filters = filters;
    this.documentProperties = documentProperties;

  }
  
  // generate the required parameter string for the tool
  constructFilterString(filterObjects) {
  
    const filterString = filterObjects.reduce(function (acc, filter) {
      if (filter.table && filter.column && filter.values) {
          if (filter.values.length > 0){
            const values = filter.values.map(function (value) {
              return "\"" + value + "\"";
            });
            
            let valuesString = "{" + values.join(',') + "}";
            let filterMethod = "values";
  
            if (filter.column === "attivio_General_nometadata"){
              filterMethod = "searchPattern";
            }
            
            return acc + "SetFilter(tableName=\"" + filter.table + "\", columnName=\"" + filter.column + "\", " + filterMethod + "=" + valuesString + ");";
          }
      }
  
      return acc;
    }, '');
    return filterString;
  }

  componentDidMount(){

  }

  shouldComponentUpdate(nextProps){

    if (this.state.isLoaded !== true){
      return false;
    }

    const thingsHaveChanged = this.props.query != nextProps.query;
    //const filtersHaveChanged = JSON.stringify(this.props.filters) !== JSON.stringify(nextProps.filters);
    //const propertiesHaveChanged = JSON.stringify(this.props.documentProperties) !== JSON.stringify(nextProps.documentProperties);

    // have any filters changed?
    if (thingsHaveChanged & this.props.toolType !== this.widget){

      // build array of filters to alter
      let filtersToModify = new Map();
      let startUpProperty = this.props.startUpProperty;
      this.matchEntities(this.parseSpotfireEntities(nextProps.spotfireEntities));

      // loop filters and apply
      nextProps.filters.forEach(filter =>
      {

        // set up a filter object with the new values
        let spotfireFilter = {
					filteringSchemeName: filter.scheme,
					dataTableName: filter.table,
					dataColumnName: filter.column,
					filteringOperation: spotfire.webPlayer.filteringOperation.REPLACE,
					filterSettings: {
						includeEmpty: false,
						values: filter.values
          }
        };
        
        filtersToModify.set(spotfireFilter.dataColumnName,spotfireFilter);
      });

      // first clear existing filters
      var spotfireWebPlayer = this.app.analysisDocument;
      spotfireWebPlayer.filtering.getAllModifiedFilterColumns(spotfire.webPlayer.includedFilterSettings.NONE, function(filterColumns){ 
        console.log(filterColumns.length);
        if (filterColumns && filterColumns.length > 0){
          filterColumns.forEach(filter => {
            // check it is an attivio column (as we don't want to clear other filters)
            if (filter.dataColumnName.substring(0, 8) === "attivio_" && !filtersToModify.has(filter.dataColumnName)){
              filter.filterSettings = {
                includeEmpty: true
              }
              filter.filteringOperation = spotfire.webPlayer.filteringOperation.RESET;
              filtersToModify.set(filter.dataColumnName, filter);
            }
          });
        }

        // now loop all filters to change and apply
        for (var newFilter of filtersToModify.values()) {
          spotfireWebPlayer.filtering.setFilter(newFilter, newFilter.filteringOperation);
        };

        // change the run on open to trigger any filter actions required such as zoom map
        spotfireWebPlayer.setDocumentProperty(startUpProperty, Math.random().toString());

      });
      
    }

    // have any properties changed?
    if (thingsHaveChanged){
     nextProps.documentProperties.forEach(documentProperty => 
      {
        this.app.analysisDocument.setDocumentProperty(documentProperty.name, documentProperty.value);
      });    
    }

    return thingsHaveChanged;
    
  }

  /**
    *Spotfire callback sections for the Spotfire Javascript API
    */
  onReadyCallback(response, newApp)
  {
      const app = newApp;
      if(response.status === "OK")
      {
          // The application is ready, meaning that the api is loaded and that 
          // the analysis path is validated for the current session 
          // (anonymous or logged in user)
          console.log("OK received. Opening document...")
          app.openDocument(this.state.guid);

          app.onError(this.errorCallback.bind(this));
          app.onClosed(this.onClosedCallback.bind(this));
          app.onOpened(this.onOpenedCallback.bind(this));
          this.app = app;
      }
      else
      {
          console.log("Status not OK. " + response.status + ": " + response.message)
      }
  }

  onOpenedCallback() {

    // apply any document properties passed
    if (this.props.documentProperties.length > 0) {
      this.props.documentProperties.forEach(documentProperty => {

        // set each property in order
        this.app.analysisDocument.setDocumentProperty(documentProperty.name, documentProperty.value);
      });
    }
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
      spotfireStyle = { height: 480, display: 'block' };
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