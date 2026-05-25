import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { COLOMBIA_DATE_FORMAT, COLOMBIA_TIMEZONE } from './colombia-time';

/** Interpreta fechas de la API como UTC y las muestra en hora Colombia. */
@Pipe({
  name: 'colombiaDate',
  standalone: true,
})
export class ColombiaDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string | null {
    if (value == null || value === '') {
      return null;
    }

    const instant =
      value instanceof Date
        ? value
        : new Date(normalizeApiDateString(value));

    if (Number.isNaN(instant.getTime())) {
      return null;
    }

    return formatDate(instant, COLOMBIA_DATE_FORMAT, 'es-CO', COLOMBIA_TIMEZONE);
  }
}

export function normalizeApiDateString(value: string): string {
  const trimmed = value.trim();
  if (trimmed.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}Z`;
}
