// @flow
import React from 'react';
import PropTypes from 'prop-types';

import Menu, { MenuItemDef } from './Menu';

type SearchProfilePickerProps = {
  /** The label to show for the menu. Defaults to "Search Profile". */
  label: string,
  /** Array of search profiles to present to users
  profiles: Array<string>;
  /** If set, then the menu will be shown at the right end of the navbar. */
  right: boolean;
}

type SearchProfilePickerDefaultProps = {
  label: string,
  profiles: Array<string>;
  right: boolean;
}

/**
 * A pop-up for choosing between the simple and advanced query language.
 */
export default class SearchProfilePicker extends React.Component<SearchProfilePickerDefaultProps, SearchProfilePickerProps, void> { // eslint-disable-line max-len
  static defaultProps = {
    initialValue: '',
    label: 'Search Profile:',
    profiles: ["All Sources", "Metals Sector Plan"] // move this to config file in future,
    right: false,
  };

  static contextTypes = {
    searcher: PropTypes.any,
  };

  static displayName = 'SearchProfilePicker';

  constructor(props: SearchProfilePickerProps) {
    super(props);
    (this: any).onSelect = this.onSelect.bind(this);
  }

  onSelect(item: MenuItemDef) {
    const searcher = this.context.searcher;
    if (searcher && searcher.state.businessCenterProfile !== item.value) {
      searcher.updateQueryProfile(item.value);
    }
  }

  render() {
    const searcher = this.context.searcher;
    let value = this.props.initialValue;
    if (searcher) {
      value = searcher.state.businessCenterProfile ? searcher.state.businessCenterProfile : searcher.props.businessCenterProfile;
    }

    const items = [];
    
    this.props.profiles.forEach(element => {
      items.push(new MenuItemDef(element, element));
    });

    const leftRight = this.props.right ? 'attivio-globalmastnavbar-right' : '';

    return (
      <div className={leftRight}>
        <Menu
          label={this.props.label}
          items={items}
          selection={value}
          onSelect={this.onSelect}
        />
      </div>
    );
  }
}
