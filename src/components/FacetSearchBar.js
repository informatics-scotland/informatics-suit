// @flow
import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Configurable from './Configurable';
import SimpleQueryRequest from '../api/SimpleQueryRequest';
import SearchFacetBucket from '../api/SearchFacetBucket';

type FacetSearchBarProps = {
  /** Whether the FacetSearchBar should be shown */
  showSearchBar: boolean;
  /** A placeholder for the facet search field */
  placeholder: string;
  /** The label to show on the search button. Defaults to "Search." */
  buttonLabel: string;
  /** The name of the facet being searched */
  name: string;
  /** Callback to add a filter for this facet */
  addFacetFilter: (bucket: SearchFacetBucket) => void;
  /** Max number of matching facet values to show */
  maxValues: number;
  /** Content to show for the actual facet stuff (typically a ListFacetContents) */
  childProps: Object | null;
  /**
   * Whether the export button should be shown to allow exporting all the facet
   * values as a CSV file
   */
  showExportButton: boolean;
  /** The label for the export button */
  exportButtonLabel: string;
};

type FacetSearchBarDefaultProps = {
  placeholder: string;
  buttonLabel: string;
  name: string;
  maxValues: number;
  showSearchBar: boolean;
  showExportButton: boolean;
  exportButtonLabel: string;
};

type FacetSearchBarState = {
  query: string;
  recognizing: boolean;
  suggestions: Array<SearchFacetBucket>;
  facetValue: string;
  error: string | null;
}

/**
 * Component that wraps a Facet that allows searching for specific values for that facet,
 * as well as exporting that facet's values to a CSV
 */
class FacetSearchBar extends React.Component<FacetSearchBarDefaultProps, FacetSearchBarProps, FacetSearchBarState> {
  static contextTypes = {
    searcher: PropTypes.any,
  };

  static defaultProps: FacetSearchBarDefaultProps = {
    placeholder: 'Search facet values\u2026',
    buttonLabel: 'Search',
    name: '*',
    maxValues: 5,
    showSearchBar: false,
    showExportButton: false,
    exportButtonLabel: 'Export',
  };

  /** Generates the CSV for the Facet Value data */
  static convertArrayOfObjectsToCSV(data: Array<Map<string, Object>>, columnDelimiter: string = ',', lineDelimiter: string = '\n') {
    if (data === null || !data.length) {
      return null;
    }
    let result = '';
    // Create the header row of the CSV
    const keys = Object.keys(data[0]);
    result += keys.join(columnDelimiter);
    result += lineDelimiter;
    // Populate the CSV with data
    let colNum = 0;
    data.forEach((item) => {
      colNum = 0;
      if (keys && keys.length > 0) {
        keys.forEach((key) => {
          if (colNum > 0) {
            result += columnDelimiter;
          }
          result += item[key];
          colNum += 1;
        });
        result += lineDelimiter;
      }
    });
    return result;
  }

  constructor(props: FacetSearchBarProps) {
    super(props);
    this.state = {
      query: '',
      recognizing: false,
      suggestions: [],
      facetValue: '',
      error: null,
    };
    (this: any).doKeyPress = this.doKeyPress.bind(this);
    (this: any).doSearch = this.doSearch.bind(this);
    (this: any).queryChanged = this.queryChanged.bind(this);
    (this: any).addFilter = this.addFilter.bind(this);
    (this: any).handleSearchResults = this.handleSearchResults.bind(this);
  }

  state: FacetSearchBarState;

  /**
   * Generates a list of menu items to show for the Facet values that match the query,
   * based on values currently set on this.state.suggestions.
   */
  getSuggestionList() {
    if (!this.state.suggestions || this.state.suggestions.length === 0) {
      return null;
    }
    let suggestionsAdded = 0;
    const contents = this.state.suggestions.map((suggestion: SearchFacetBucket, index: number) => {
      let include = suggestion.displayLabel().length >= this.state.query.length;
      include = include && suggestion.displayLabel().toLowerCase().indexOf(this.state.query.toLowerCase()) !== -1;
      let returnVal = '';
      if (include && suggestionsAdded < this.props.maxValues) {
        suggestionsAdded += 1;
        returnVal = (
          <button
            className={'facet-suggestion'}
            key={suggestionsAdded}
            onClick={() => { return this.addFilter(index); }}
            style={{ width: '300px', textAlign: 'left', borderWidth: '0px', backgroundColor: '#FFFFFF' }}
          >
            <MenuItem eventKey={index} key={suggestionsAdded} onSelect={this.addFilter} tabIndex={index}>
              {`${suggestion.displayLabel()} (${suggestion.count})`}
            </MenuItem>
          </button>);
      }
      return returnVal;
    });
    if (contents.length > 0) {
      return (
        <div className={'facet-suggestion'} style={{ width: '300px', border: '1px solid #D2D2D2', passingTop: '11px' }}>
          <ul role="menu">
            {contents}
          </ul>
        </div>
      );
    }
    return null;
  }

  /**
   * Calls the function to fire off the query, then maps the results
   * into a format ready to be written to CSV
   */
  getAllFacetValues(callback) {
    function localCallback(qr: ?QueryResponse, error: ?string) {
      if (qr) {
        const facets = qr.facets[0].buckets;
        const response = [];
        facets.forEach((facet: SearchFacetBucket) => {
          response.push({ 'Facet Value': facet.displayLabel(), 'Document Count': facet.count });
        });
        callback(response);
      } else if (error) {
        // Failed!
      }
      return [];
    }
    this.doConfiguredSearch('*', -1, localCallback, this.context.searcher);
  }

  /**
    * Handles when a user clicks on a facet value from the suggestion list.
    */
  addFilter(eventKey) {
    this.props.addFacetFilter(this.state.suggestions[eventKey]);
    this.setState({ suggestions: [], query: '' });
  }

  /**
   * Handles the results and sets the facets to state.
   */
  handleSearchResults(response: ?QueryResponse, error: ?string) {
    if (response) {
      const facets = response.facets[0].buckets;
      this.setState({ suggestions: facets });
    } else if (error) {
      // Failed!
      this.setState({
        suggestions: [],
        error,
      });
    }
  }

  /**
   * Fires off the search for the matching facet values, while respecting the query
   * and filters the user has already entered.
   */
  doConfiguredSearch(queryTerm: string, maxBuckets: number, callback, searcher) {
    if (searcher) {
      const searchTerm = searcher.state.query;
      const simpleQR = new SimpleQueryRequest();
      simpleQR.query = searchTerm;
      simpleQR.facets = [`${this.props.name}(maxBuckets=${maxBuckets})`];
      simpleQR.facetFilters = searcher.state.facetFilters;
      simpleQR.filters = [];
      if (searcher.getQueryRequest().filters && searcher.getQueryRequest().filters.length > 0) {
        Array.prototype.push.apply(simpleQR.filters, searcher.getQueryRequest().filters);
      }
      simpleQR.filters.push(`${this.props.name}:${queryTerm}`);
      simpleQR.rows = 0;
      simpleQR.queryLanguage = 'simple';
      simpleQR.workflow = searcher.getQueryRequest().workflow;

      searcher.doCustomSearch(simpleQR, callback);
    }
  }

  /**
   * Called when the user wants to search (hits enter or clicks search).
   */
  doSearch() {
    const callback = this.handleSearchResults;
    this.doConfiguredSearch(`${this.state.facetValue}*`, this.props.maxValues * 2, callback, this.context.searcher);
  }

  /**
   * Handles when the user updates the query for this facet.
   */
  queryChanged(e: Event) {
    if (e.target instanceof HTMLInputElement) {
      const newQuery = e.target.value;
      this.setState({ facetValue: newQuery, query: newQuery });
    }
  }

  /**
   * Exports all values and counts for the facet to CSV.
   */
  downloadCSV(args) {
    const callback = (data) => {
      let csv = FacetSearchBar.convertArrayOfObjectsToCSV({ data });
      if (csv === null) return;

      const filename = args.filename || `${this.props.name}_facet_values.csv`;

      if (!csv.match(/^data:text\/csv/i)) {
        csv = `data:text/csv;charset=utf-8,${csv}`;
      }
      const encodedData = encodeURI(csv);

      const link = document.createElement('a');
      link.setAttribute('href', encodedData);
      link.setAttribute('download', filename);
      link.click();
    };
    this.getAllFacetValues(callback);
  }

  /**
   * Called when a user presses a key.
   */
  doKeyPress(e: Event) {
    // If the user presses enter, do the search
    if (e.target instanceof HTMLInputElement && e.keyCode) {
      if (e.keyCode === 13) {
        this.doSearch();
      }
    }
  }

  render() {
    const additionalContent = this.props.childProps ? this.props.childProps : '';
    const containerClass = 'attivio-globalmast-search-container';
    const inputClass = 'form-control attivio-globalmast-search-input facet-search-bar';
    const query = this.state.query;
    const placeholder = this.props.placeholder;
    const suggestionList = this.getSuggestionList();
    const inputComponent = this.props.showSearchBar ? (
      <div className="attivio-globalmast-search" role="search" style={{ display: 'inline-block' }}>
        <div className="form-group">
          <input
            type="search"
            className={inputClass}
            placeholder={placeholder}
            onChange={this.queryChanged}
            onKeyDown={this.doKeyPress}
            value={query}
            style={{ minWidth: '300px' }}
          />
          <button
            type="submit"
            className="btn attivio-globalmast-search-submit"
            onClick={this.doSearch}
            style={{ height: '25px' }}
          >
            { this.props.buttonLabel }
          </button>
        </div>
        { suggestionList }
      </div>) : '';

    const buttonContent = this.props.showExportButton ? (
      <div>
        <button
          id={this.props.name}
          className="btn attivio-globalmast-search-submit"
          style={{ height: '25px', position: 'relative' }}
          href="#"
          onClick={() => { return this.downloadCSV({}); }}
        >
          { this.props.exportButtonLabel }
        </button>
      </div>) : '';

    return (
      <div className={containerClass}>
        { inputComponent }
        { additionalContent }
        { buttonContent }
      </div>
    );
  }
}

export default Configurable(FacetSearchBar);