import { Injectable } from '@angular/core';
import Swal, { type SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  async success(title: string, text?: string): Promise<void> {
    await this.fire('success', title, text);
  }

  async error(title: string, text?: string): Promise<void> {
    await this.fire('error', title, text);
  }

  async info(title: string, text?: string): Promise<void> {
    await this.fire('info', title, text);
  }

  async confirm(options: {
    title: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    icon?: SweetAlertIcon;
  }): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon ?? 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText ?? 'Confirmar',
      cancelButtonText: options.cancelButtonText ?? 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: this.customClass(),
    });

    return result.isConfirmed;
  }

  private async fire(icon: SweetAlertIcon, title: string, text?: string): Promise<void> {
    await Swal.fire({
      icon,
      title,
      text,
      confirmButtonText: 'Aceptar',
      buttonsStyling: false,
      customClass: this.customClass(),
    });
  }

  private customClass() {
    return {
      popup: 'sispark-alert',
      title: 'sispark-alert__title',
      htmlContainer: 'sispark-alert__text',
      confirmButton: 'sispark-alert__confirm',
      cancelButton: 'sispark-alert__cancel',
    };
  }
}
