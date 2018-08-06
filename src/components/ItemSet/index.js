import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import * as ls from 'app/lib/ls';
import Item from 'app/components/NewItem';
import MasterworkCatalyst from 'app/components/MasterworkCatalyst';
import {
  makeSelectedItemDefsSelector,
  inventorySelector,
  objectiveInstancesSelector
} from 'app/store/selectors';

import LazyLoad from 'react-lazyload';

import styles from './styles.styl';

const ITEM_TYPE_COMPONENTS = {
  exoticCatalysts: MasterworkCatalyst
};

class ItemSet extends Component{
  constructor(props) {
    super(props);
    this.accordion = this.accordion.bind(this);
  }
  
  accordion(){
    const key = window.location.pathname + '-' + this.props.set.name;
    const hidden = !ls.getAccordionState(key);
    ls.saveAccordionState(key,hidden);
    this.forceUpdate();
    
    //trigger scroll event causing lazy load to load images that should now be in view
    setTimeout(()=> window.dispatchEvent(new Event('scroll')), 200);
  }
  
  render() {
    const { className, inventory, itemDefs, setPopper, setModal, set, objectiveInstances,
  objectiveDefs } = this.props;
    const { name, noUi, description, sections, image } = set;
    const hidden = ls.getAccordionState(window.location.pathname + '-' + this.props.set.name);
  return (
    <div className={cx(className, styles.root, noUi && styles.noUi)}>
      <div className={styles.inner}>
        {!noUi && (
          <div className={styles.header} onClick={this.accordion}>
            {image && (
              <img
                alt=""
                className={styles.headerImage}
                src={`https://www.bungie.net${image}`}
              />
            )}
            <div className={styles.headerText}>
            <div className={styles.accordionIcon}>{hidden ? '+' : '-'}</div>
              <h3 className={styles.title}>{name}</h3>
              {description && <p className={styles.desc}>{description}</p>}
            </div>
          </div>
        )}
    <div className={styles.panel} style={{maxHeight: hidden ? 0 : null}}>
        {sections.map((section, index) => (
          <LazyLoad>
            <div key={index} className={styles.section}>
              {!noUi && (
                <h4 className={styles.sectionName}>
                  {section.name}{' '}
                  {section.season && (
                    <span className={styles.seasonLabel}>
                      S{section.season}
                    </span>
                  )}
                </h4>
              )}

              <div className={styles.itemListWrapper}>
                {section.itemGroups.map((itemList, index2) => (
                  <div className={styles.itemList} key={index2}>
                    {itemList.map(itemHash => {
                      const ItemComponent =
                        ITEM_TYPE_COMPONENTS[section.itemType] || Item;
                      return (
                        <ItemComponent
                          objectiveInstances={objectiveInstances}
                          objectiveDefs={objectiveDefs}
                          key={itemHash}
                          className={!section.type && styles.item}
                          itemHash={itemHash}
                          item={itemDefs[itemHash]}
                          setPopper={setPopper}
                          inventoryEntry={inventory && inventory[itemHash]}
                          onItemClick={setModal}
                          extended={section.bigItems}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </LazyLoad>
        ))}
        </div>
      </div>
    </div>
  )}
}

const mapStateToProps = () => {
  const selectedItemDefsSelector = makeSelectedItemDefsSelector();
  return (state, ownProps) => {
    return {
      inventory: inventorySelector(state),
      itemDefs: selectedItemDefsSelector(state, ownProps),
      objectiveInstances: objectiveInstancesSelector(state),
      objectiveDefs: state.definitions.objectiveDefs
    };
  };
};

export default connect(mapStateToProps)(ItemSet);
