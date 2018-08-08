import * as ls from 'app/lib/ls';
import React from 'react';
import cx from 'classnames';

import Item from 'app/components/Item';
import Icon from 'app/components/Icon';
import MasterworkCatalyst from 'app/components/MasterworkCatalyst';

import TheRealLazyLoad from 'react-lazyload';

import styles from './styles.styl';

import { setHiddenItemSet as setHiddenItemSetAction } from 'app/store/reducer';

const ITEM_TYPE_COMPONENTS = {
  exoticCatalysts: MasterworkCatalyst
};

const LAZY_LOAD = true;

const LazyLoad = LAZY_LOAD ? TheRealLazyLoad : ({ children }) => children;

export default function ItemSet({ className, setPopper, setModal, set, setHiddenItemSet }) {
  const { name, noUi, description, sections, image, hidden } = set;
  return (
    <div className={cx(className, styles.root, noUi && styles.noUi)}>
      <div className={styles.inner}>
        {!noUi && (
          <div className={styles.header} onClick={() => {ls.saveHiddenItemSets(id,!hidden); setHiddenItemSet(id, !hidden);}}>
            {image && (
              <img
                alt=""
                className={styles.headerImage}
                src={`https://www.bungie.net${image}`}
              />
            )}
            <div className={styles.headerText}>
              <div className={styles.split}>
              <div className={styles.splitMain}>
                <h3 className={styles.title}>{name}</h3>
              </div>
              <div className={styles.headerAccessory}>
                <Icon name={(hidden ? "plus" : "minus") + "-square"} />
              </div>
            </div>
              {description && <p className={styles.desc}>{description}</p>}
            </div>
          </div>
        )}

        {sections.map((section, index) => (
          <LazyLoad height={85}>
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
                          itemHash={itemHash}
                          key={itemHash}
                          extended={section.bigItems}
                          className={!section.type && styles.item}
                          setPopper={setPopper}
                          onItemClick={setModal}
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
  );
}

const mapStateToProps = () => {
  const selectedItemDefsSelector = makeSelectedItemDefsSelector();
  return (state, ownProps) => {
    return {
      inventory: inventorySelector(state),
      itemDefs: selectedItemDefsSelector(state, ownProps)
    };
  };
};

const mapDispatchToActions = {
  setHiddenItemSet: setHiddenItemSetAction
};

export default connect(mapStateToProps, mapDispatchToActions)(ItemSet);
