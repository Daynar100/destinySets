import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { setFilterItem, removeTrackedItem } from 'app/store/reducer';
import { fetchProfile } from 'app/store/profile';

import {
  setVendorDefs,
  setItemDefs,
  setObjectiveDefs,
  setStatDefs,
  setChecklistDefs
} from 'app/store/definitions';

import * as ls from 'app/lib/ls';
import { getDefinition } from 'app/lib/manifestData';

import Footer from 'app/components/Footer';
import Section from 'app/components/Section';
import Popper from 'app/components/Popper';
import ItemTooltip from 'app/components/ItemTooltip';
import ItemModal from 'app/components/ItemModal';
import SectionList from 'app/components/SectionList';

import { filteredSetDataSelector } from './selectors';
import { itemSourceSelector } from 'app/store/selectors';
import styles from './styles.styl';

const FETCH_INTERVAL = 30 * 1000;

class Inventory extends Component {
  state = {
    popperItemHash: null,
    popperElement: null,
    unexpectedError: false
  };

  componentDidMount() {
    this.fetchDefinitions(this.props.language);
    this.potentiallyScheduleFetchProfile();
  }

  componentWillUnmount() {
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  componentDidUpdate(oldProps) {
    const { filters, language, trackedItems } = this.props;

    if (filters !== oldProps.filters) {
      ls.saveFilters(filters);
    }

    if (language !== oldProps.language) {
      this.fetchDefinitions(language);
    }

    if (trackedItems !== oldProps.trackedItems) {
      this.potentiallyScheduleFetchProfile(this.props);
    }
  }

  potentiallyScheduleFetchProfile = (props = this.props) => {
    if (this.intervalId) {
      return;
    }

    if (props.route.refreshOnInterval || props.trackedItems.length > 0) {
      this.intervalId = window.setInterval(() => {
        props.fetchProfile();
      }, FETCH_INTERVAL);
    }
  };

  fetchDefinitions({ code: lang }) {
    const {
      setVendorDefs,
      setStatDefs,
      setItemDefs,
      setObjectiveDefs,
      setChecklistDefs
    } = this.props;

    getDefinition('DestinyVendorDefinition', lang).then(setVendorDefs);
    getDefinition('DestinyStatDefinition', lang).then(setStatDefs);
    getDefinition('DestinyObjectiveDefinition', lang).then(setObjectiveDefs);
    getDefinition('DestinyChecklistDefinition', lang).then(setChecklistDefs);

    const args = this.props.location.query.fullItemDefs
      ? ['DestinyInventoryItemDefinition', lang]
      : ['reducedCollectableInventoryItems', lang, false];

    this.itemDefsPromise = getDefinition(...args);
    this.itemDefsPromise.then(setItemDefs);
  }

  setPopper = (itemHash, element) =>
    this.setState({ itemTooltip: itemHash ? { itemHash, element } : null });

  setItemModal = itemHash => this.setState({ itemModal: itemHash });
  removeTrackedItem = item => this.props.removeTrackedItem(item.hash);

  setFilterItem = (...args) => {
    ls.clearTempFilterItemWhitelist();
    this.props.setFilterItem(...args);
  };

  render() {
    const { filters, filteredSetData, trackedItems, route } = this.props;
    const { itemTooltip, itemModal } = this.state;
    const noUi = (filteredSetData[0] || {}).noUi;

    return (
      <div className={styles.root}>
        {!noUi && (
          <SectionList
            setData={filteredSetData}
            filters={filters}
            setFilterItem={this.setFilterItem}
          />
        )}

        {route.showCollectionsPromo && (
          <div className={styles.promo}>
            <p>
              Check out the experimental Collections page for a preview of the
              items have been marked off for the upcoming Collections in
              Forsaken
            </p>

            <p>
              <Link className={styles.button} to="/collections">
                Visit Collections
              </Link>
            </p>
          </div>
        )}

        {route.isCollections && (
          <div className={styles.promo}>
            <p>
              This is an experimental preview of the items that will be marked
              off in Collections when Forsaken drops. Some items, like S3
              Faction Rally, Iron Banner, and Solstice of Heroes gear may not
              appear in the list or as collected, but they will be counted when
              Forsaken drops. For more info,{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/Bungie-net/api/issues/559#issuecomment-407541681"
              >
                see this thread
              </a>.
            </p>
          </div>
        )}

        {filteredSetData.map(({ sets, noUi, slug, name }, index) => (
          <Section
            key={index}
            name={name}
            noUi={noUi}
            sets={sets}
            slug={slug}
            setPopper={this.setPopper}
            setModal={this.setItemModal}
          />
        ))}

        <Footer />

        {itemTooltip && (
          <Popper key={itemTooltip.hash} element={itemTooltip.element}>
            <ItemTooltip itemHash={itemTooltip.itemHash} />
          </Popper>
        )}

        {trackedItems.length > 0 && (
          <div className={styles.trackedItems}>
            {trackedItems.map(hash => (
              <ItemTooltip
                key={hash}
                itemHash={hash}
                small={true}
                dismiss={this.removeTrackedItem}
              />
            ))}
          </div>
        )}

        <ItemModal
          itemHash={itemModal}
          isOpen={!!itemModal}
          onRequestClose={() => this.setItemModal(null)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    filters: state.app.filters,
    language: state.app.language,
    trackedItems: state.app.trackedItems,
    itemSource: itemSourceSelector(),
    filteredSetData: filteredSetDataSelector(state, ownProps)
  };
};

const mapDispatchToActions = {
  fetchProfile,
  setVendorDefs,
  setItemDefs,
  setObjectiveDefs,
  setChecklistDefs,
  setStatDefs,
  setFilterItem,
  removeTrackedItem
};

export default connect(mapStateToProps, mapDispatchToActions)(Inventory);
