var _class, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
  // TODO: check for empty array input
  const filters = filterObjects || [{}];

  const filterString = filters.reduce((acc, filter) => {
    if (filter.table && filter.column && filter.values) {
      const values = filter.values.map(value => `"${value}"`);
      const valuesString = `{${values.join(',')}}`;
      return `${acc}SetFilter(tableName="${filter.table}", columnName="${filter.column}", values=${valuesString});`;
    }

    return acc;
  }, '');
  return filterString;
}

/**
 * Embeds a Spotfire WebPlayer using Spotfire JS library!
 */
var SpotfireWebPlayer = (_temp = _class = function (_React$Component) {
  _inherits(SpotfireWebPlayer, _React$Component);

  function SpotfireWebPlayer(props) {
    _classCallCheck(this, SpotfireWebPlayer);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = {
      msg: 'Initializing Spotfire Web Player...',
      isLoaded: false,
      isInitializing: true,
      requiresLogin: false,
      guid: props.guid || _guid()
      // filters: props.filters || [{}],
    };

    var parameters = constructFilterString(props.filters);
    var customizationInfo = new spotfire.webPlayer.Customization();
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

    var app = new spotfire.webPlayer.Application(props.host, customizationInfo, props.file, parameters);

    app.onError(_this.errorCallback.bind(_this));
    app.onClosed(_this.onClosedCallback.bind(_this));
    app.onOpened(_this.onOpenedCallback.bind(_this));
    _this.app = app;
    return _this;
  }

  SpotfireWebPlayer.prototype.componentDidMount = function componentDidMount() {
    this.app.openDocument(this.state.guid);
  };

  SpotfireWebPlayer.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.app) {
      this.app.close();
    }
  };

  SpotfireWebPlayer.prototype.onOpenedCallback = function onOpenedCallback() {
    this.setState({ msg: '', isLoaded: true, isInitializing: false });
  };

  SpotfireWebPlayer.prototype.onClosedCallback = function onClosedCallback(path) {
    this.setState({ msg: 'Document at path "' + path + '" closed.', isLoaded: false });
  };

  SpotfireWebPlayer.prototype.errorCallback = function errorCallback(errorCode, errorMessage) {
    var msg = errorCode + ': ' + errorMessage;
    var requiresLogin = false;

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
    this.setState({ msg: msg, isLoaded: false, isInitializing: false, requiresLogin: requiresLogin });
  };

  SpotfireWebPlayer.prototype.render = function render() {
    var spotfireStyle = { height: 480, display: 'none' };

    if (this.state.isLoaded || this.state.isInitializing) {
      spotfireStyle = { height: 480, display: 'block' };
    }

    var loginLink = this.state.requiresLogin ? React.createElement(
      'p',
      null,
      React.createElement(
        'a',
        { href: this.props.loginUrl, target: '_blank' },
        'Sign into Spotfire and refresh this page.'
      )
    ) : React.createElement('span', null);
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        null,
        this.state.msg
      ),
      loginLink,
      React.createElement('p', null, constructFilterString(this.props.filters)),
      React.createElement('div', { className: 'spotfireContainer', id: this.state.guid, style: spotfireStyle })
    );
  };

  return SpotfireWebPlayer;
}(React.Component), _class.displayName = 'SpotfireWebPlayer', _class.defaultProps = {
  host: DEFAULT_HOST,
  file: DEFAULT_FILE,
  loginUrl: LOGIN_URL,
  guid: '',
  filters: [{}],
  documentProperties: [{}]
}, _temp);

// TODO: move to class method?

SpotfireWebPlayer.constructFilterString = constructFilterString;
export default SpotfireWebPlayer;