import React from 'react';

var LOGIN_URL = 'http://sepa-app-spl01/';
var DEFAULT_HOST = 'http://sepa-app-spl01/spotfire/wp/';
var DEFAULT_FILE = '/Projects/Data Visualisation Course/Examples';

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

    const parameters = constructFilterString(props.filters);
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

    const app = new spotfire.webPlayer.Application(props.host, customizationInfo, props.file, parameters);

    app.onError(this.errorCallback.bind(this));
    app.onClosed(this.onClosedCallback.bind(this));
    app.onOpened(this.onOpenedCallback.bind(this));
    this.app = app;
  }

  componentDidMount() {
    this.app.openDocument(this.state.guid);
  }

  componentWillUnmount() {
    if (this.app) {
      this.app.close();
    }
  }

  onOpenedCallback() {
    var _this2 = this;

    // apply any document properties passed
    if (this.props.documentProperties.length > 0) {
      this.props.documentProperties.forEach(function (documentProperty) {

        // set each property in order
        _this2.app._document.setDocumentProperty(documentProperty.name, documentProperty.value);
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