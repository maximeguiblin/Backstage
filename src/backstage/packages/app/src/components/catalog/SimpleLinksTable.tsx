/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InfoCard, InfoCardVariants } from '@backstage/core-components';
import { IconComponent, useApp } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import LanguageIcon from '@material-ui/icons/Language';
import { EntityLinksEmptyState } from './EntityLinksEmptyState';
import { LinksGridList } from './LinksGridList';

/** @public */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** @public */
export type ColumnBreakpoints = Record<Breakpoint, number>;

/** @public */
export interface EntityLinksCardProps {
  cols?: ColumnBreakpoints | number;
  variant?: InfoCardVariants;
  filterType?: string;
}


export const CustomEntityLinksCard = (props: EntityLinksCardProps) => {
  const { cols = undefined, variant, filterType } = props;
  const { entity } = useEntity();
  const app = useApp();

  const iconResolver = (key?: string): IconComponent =>
    key ? app.getSystemIcon(key) ?? LanguageIcon : LanguageIcon;

  let links = entity?.metadata?.links;

  // Filter links by type if filterType is provided, otherwise by title
  if (filterType && links) {
    links = links.filter(link => link.type === filterType);
  }

  // Format the card title - use filterType for display if available
  const displayTitle = filterType;
  const cardTitle = displayTitle ? `List of ${displayTitle}s` : 'customEntityLinksCard.title';

  return (
    <InfoCard title={cardTitle} variant={variant}>
      {!links || links.length === 0 ? (
        <EntityLinksEmptyState />
      ) : (
        <LinksGridList
          cols={cols}
          items={links.map(({ url, title, icon }) => ({
            text: title ?? url,
            href: url,
            Icon: iconResolver(icon),
          }))}
        />
      )}
    </InfoCard>
  );
};