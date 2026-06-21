import { assets } from '../../content/catalog/assets';
import type { LifeStateV2 } from '../../game/lifeStateV2';
import { translate } from '../../i18n';

interface AssetsPanelProps {
  life: LifeStateV2;
  onBuyAsset(assetCatalogId: string): void;
  onSellAsset(ownedAssetId: string): void;
}

export function AssetsPanel({ life, onBuyAsset, onSellAsset }: AssetsPanelProps) {
  const { locale } = life;

  return (
    <section className="panel" aria-labelledby="assets-heading">
      <h2 className="panel-title" id="assets-heading">
        {label(locale, 'ui.assets', 'Assets')}
      </h2>
      <div className="panel-subsection">
        <p className="section-kicker">{label(locale, 'ui.ownedAssets', 'Owned')}</p>
        {life.assets.length === 0 ? (
          <p className="empty-text">{label(locale, 'ui.empty.noAssets', 'No assets yet')}</p>
        ) : (
          <div className="menu-list">
            {life.assets.map((ownedAsset) => {
              const asset = assets.find((item) => item.id === ownedAsset.catalogId);
              return (
                <button
                  className="menu-row action-row"
                  key={ownedAsset.id}
                  type="button"
                  onClick={() => onSellAsset(ownedAsset.id)}
                >
                  <span className="menu-icon-wrap">
                    <img aria-hidden="true" className="menu-icon" src={iconUrl(iconForCategory(asset?.category))} alt="" />
                  </span>
                  <span className="menu-copy">
                    <span className="menu-title">{asset === undefined ? ownedAsset.catalogId : translate(locale, asset.titleKey)}</span>
                    <span className="menu-subtitle">
                      {label(locale, 'ui.assetValue', 'Value')}: {formatMoney(ownedAsset.value)}
                    </span>
                  </span>
                  <span className="menu-row-price">{label(locale, 'ui.action.sell', 'Sell')}</span>
                  <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="panel-subsection">
        <p className="section-kicker">{label(locale, 'ui.availableAssets', 'Available')}</p>
        <div className="menu-list">
          {assets.map((asset) => {
            const cannotAfford = life.character.money < asset.price;
            return (
              <button
                className={`menu-row action-row${cannotAfford ? ' is-disabled' : ''}`}
                disabled={cannotAfford}
                key={asset.id}
                type="button"
                onClick={() => onBuyAsset(asset.id)}
              >
                <span className="menu-icon-wrap">
                  <img aria-hidden="true" className="menu-icon" src={iconUrl(iconForCategory(asset.category))} alt="" />
                </span>
                <span className="menu-copy">
                  <span className="menu-title">{translate(locale, asset.titleKey)}</span>
                  <span className="menu-subtitle">{summary(locale, asset.summaryKey)}</span>
                  {cannotAfford && <span className="locked-note">{translate(locale, 'ui.locked.notEnoughMoney')}</span>}
                </span>
                <span className="menu-row-price">{formatMoney(asset.price)}</span>
                <img aria-hidden="true" className="menu-chevron" src={iconUrl('material-symbols:chevron-right-rounded')} alt="" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function iconForCategory(category: (typeof assets)[number]['category'] | undefined): string {
  if (category === 'home') {
    return 'fluent-emoji-flat:house';
  }
  if (category === 'car') {
    return 'fluent-emoji-flat:automobile';
  }
  if (category === 'boat') {
    return 'fluent-emoji-flat:sailboat';
  }
  if (category === 'aircraft') {
    return 'fluent-emoji-flat:airplane';
  }
  return 'fluent-emoji-flat:gem-stone';
}

function label(locale: LifeStateV2['locale'], key: string, fallback: string): string {
  const translated = translate(locale, key);
  return translated === key ? fallback : translated;
}

function summary(locale: LifeStateV2['locale'], key: string | undefined): string {
  return key === undefined ? '' : translate(locale, key);
}

function iconUrl(icon: string): string {
  return `https://api.iconify.design/${icon}.svg`;
}

function formatMoney(value: number): string {
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
}
