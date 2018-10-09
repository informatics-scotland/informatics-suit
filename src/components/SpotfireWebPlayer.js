import React from 'react';

var LOGIN_URL = 'http://sepa-app-spl01/';
var DEFAULT_HOST = 'http://sepa-app-spl01/spotfire/wp/';
var DEFAULT_FILE = '/Projects/Data Visualisation Course/Examples';
const startUpProperty = "attivioRunOnOpen";
const customizationInfo = new spotfire.webPlayer.Customization();
customizationInfo.showTopHeader = false;
customizationInfo.showToolBar = false;
customizationInfo.showExportFile = true;
customizationInfo.showExportVisualization = true;
customizationInfo.showCustomizableHeader = false;
customizationInfo.showPageNavigation = false;
customizationInfo.showStatusBar = false;
customizationInfo.showDodPanel = false;
customizationInfo.showFilterPanel = false;
customizationInfo.showAbout = false;
customizationInfo.showAnalysisInformationTool = false;
customizationInfo.showAuthor = false;
customizationInfo.showClose = true;
customizationInfo.showHelp = true;
customizationInfo.showLogout = false;
customizationInfo.showReloadAnalysis = false;
customizationInfo.showUndoRedo = false;
customizationInfo.showAnalysisInfo = false;

function _guid() {
  function f() {
    return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  }
  return f() + f() + f() + f();
}

function constructFilterString(filterObjects) {

  const filterString = filterObjects.reduce(function (acc, filter) {
    if (filter.table && filter.column && filter.values) {
        if (filter.values.length > 0){
          const values = filter.values.map(function (value) {
            return "\"" + value + "\"";
          });
          const valuesString = "{" + values.join(',') + "}";
          return acc + "SetFilter(tableName=\"" + filter.table + "\", columnName=\"" + filter.column + "\", values=" + valuesString + ");";
        }
    }

    return acc;
  }, '');
  return filterString;
}

/**
 * Embeds a Spotfire WebPlayer using Spotfire JS library!
 */
class SpotfireWebPlayer extends React.Component<SpotfireWebPlayerProps> {

  static displayName = 'SpotfireWebPlayer';

  static defaultProps: SpotfireWebPlayerProps = {
    host: DEFAULT_HOST,
    file: DEFAULT_FILE,
    loginUrl: LOGIN_URL,
    guid: '',
    documentProperties: [],
    filters: []
  };

  constructor(props) {
    super(props);
    this.state = {
      msg: '',
      isLoaded: false,
      isInitializing: true,
      requiresLogin: false,
      guid: props.guid || _guid(),
      documentProperties: props.documentProperties || [],
      filters: props.filters || []
    };

    const parameters = "initialLoad = False; " + startUpProperty + " = '" + Math.random().toString() + "'; " + constructFilterString(props.filters);
    const app = new spotfire.webPlayer.Application(props.host, customizationInfo, props.file, parameters);

    app.onError(this.errorCallback.bind(this));
    app.onClosed(this.onClosedCallback.bind(this));
    app.onOpened(this.onOpenedCallback.bind(this));
    this.app = app;
  }

  componentDidMount() {
    this.app.openDocument(this.state.guid);
  }

  shouldComponentUpdate(nextProps){

    if (this.state.isLoaded !== true){
      return false;
    }

    const filtersHaveChanged = JSON.stringify(this.props.filters) !== JSON.stringify(nextProps.filters);
    const propertiesHaveChanged = JSON.stringify(this.props.documentProperties) !== JSON.stringify(nextProps.documentProperties);

    // have any filters changed?
    if (filtersHaveChanged){

      // first clear existing filters
      var thisWebPlayer = this.app._document;
      thisWebPlayer.filtering.getAllModifiedFilterColumns(spotfire.webPlayer.includedFilterSettings.NONE, function(filterColumns){ 
        if (filterColumns && filterColumns.length > 0){
          filterColumns.forEach(filter => {
            // check it is an attivio column (as we don't want to clear other filters)
            if (filter.dataColumnName.substring(0, 8) === "attivio_"){
              filter.filterSettings = {
                includeEmpty: true
              }
              filter.filteringOperation = spotfire.webPlayer.filteringOperation.RESET;
              thisWebPlayer.filtering.setFilter(filter, spotfire.webPlayer.filteringOperation.RESET);
            }
          });
        }
      });
      // loop filters
      nextProps.filters.forEach(filter =>
      {

        // set up a filter object with the new values
        let thisFilter = {
					filteringSchemeName: filter.scheme,
					dataTableName: filter.table,
					dataColumnName: filter.column,
					filteringOperation: spotfire.webPlayer.filteringOperation.REPLACE,
					filterSettings: {
						includeEmpty: false,
						values: filter.values
          }
        };

        // set the filter
        this.app._document.filtering.setFilter(thisFilter, spotfire.webPlayer.filteringOperation.REPLACE);
        // change the run on open to trigger any filter actions required such as zoom map
        this.app._document.setDocumentProperty(startUpProperty, Math.random().toString());
      });
    }

    // have any properties changed?
    if (propertiesHaveChanged){

      nextProps.documentProperties.forEach(documentProperty => 
      {
        this.app._document.setDocumentProperty(documentProperty.name, documentProperty.value);
      });
      
    }

    return filtersHaveChanged || propertiesHaveChanged;
    
  }

  componentWillUnmount() {
    if (this.app) {
      this.app.close();
    }
  }

  onOpenedCallback() {

    // apply any document properties passed
    if (this.props.documentProperties.length > 0) {
      this.props.documentProperties.forEach(documentProperty => {

        // set each property in order
        this.app._document.setDocumentProperty(documentProperty.name, documentProperty.value);
      });
    }
    this.setState({ msg: '', isLoaded: true, isInitializing: false });
  }

  onClosedCallback(path) {
    this.setState({ msg: `Document at path "${path}" closed.`, isLoaded: false });
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

// TODO: move to class method?
SpotfireWebPlayer.constructFilterString = constructFilterString;
export default SpotfireWebPlayer;