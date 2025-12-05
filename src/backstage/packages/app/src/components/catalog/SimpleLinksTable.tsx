// @ts-nocheck
// TODO: remove line above and solve ts check issues in this file
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
  attribute_key?: string;
  title?: string;
}


export const CustomEntityLinksCard = (props: EntityLinksCardProps) => {
  const { cols = undefined, variant, attribute_key, title } = props;
  const { entity } = useEntity();
  const app = useApp();

  const iconResolver = (key?: string): IconComponent =>
    key ? app.getSystemIcon(key) ?? LanguageIcon : LanguageIcon;

  // Get the attribute value from metadata.attribute.url with defensive checks
  const attributeData = entity?.metadata?.[attribute_key];
  
  return (
    <InfoCard title={title} variant={variant}>
      {!attributeData || attributeData.length === 0 ? (
        <EntityLinksEmptyState />
      ) : (
        <LinksGridList
          cols={cols}
          items={attributeData.map(({ url, title: linkTitle, icon }) => ({
            text: linkTitle ?? url,
            href: url,
            Icon: iconResolver(icon),
          }))}
        />
      )}
    </InfoCard>
  );

};
