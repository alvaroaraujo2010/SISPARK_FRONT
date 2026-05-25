import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { ChannelUiBlock } from '../../../../core/models/api.types';

type SummaryCardsProps = {
  activeVehicles?: number;
  availableSpots?: number;
  dailyRevenue?: number;
  monthlyDueSoon?: number;
};

type ActiveVehicleItem = {
  plate?: string;
  serviceType?: string;
  entryDate?: string;
};

@Component({
  selector: 'app-channel-ui-blocks',
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './channel-ui-blocks.html',
  styleUrl: './channel-ui-blocks.scss',
})
export class ChannelUiBlocks {
  readonly blocks = input<ChannelUiBlock[]>([]);

  protected asSummary(props: Record<string, unknown>): SummaryCardsProps {
    return props as SummaryCardsProps;
  }

  protected asVehicleItems(props: Record<string, unknown>): ActiveVehicleItem[] {
    const items = props['items'];
    return Array.isArray(items) ? (items as ActiveVehicleItem[]) : [];
  }

  protected vehicleCount(props: Record<string, unknown>): number {
    const count = props['count'];
    return typeof count === 'number' ? count : this.asVehicleItems(props).length;
  }
}
